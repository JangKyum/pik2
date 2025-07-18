"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { generateShareCode } from "../../lib/storage"
import { saveCustomQuestionSetHybrid, getCustomQuestionSetByIdFromDB } from "../../lib/supabase-storage"
import type { Question, CustomQuestionSet } from "../../lib/storage"
import categoriesData from "../../data/categories.json"
import BackButton from "../../components/BackButton"

function CreateCustomContent() {
  const [title, setTitle] = useState("")
  const [category, setCategory] = useState("other") // 질문 세트 전체 카테고리
  const [isWorldCup, setIsWorldCup] = useState(false)
  const [worldCupRounds, setWorldCupRounds] = useState(8)
  const [questions, setQuestions] = useState<Omit<Question, "id" | "votesA" | "votesB">[]>([
    { category: "other", question: "", optionA: "", optionB: "" },
    { category: "other", question: "", optionA: "", optionB: "" },
    { category: "other", question: "", optionA: "", optionB: "" },
  ])
  const [isLoading, setIsLoading] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "success" | "error">("idle")
  const router = useRouter()
  const searchParams = useSearchParams()

  // URL에서 edit 파라미터 확인
  useEffect(() => {
    const editId = searchParams.get('edit')
    if (editId) {
      setIsEditing(true)
      setEditingId(editId)
      loadExistingQuestionSet(editId)
    }
  }, [searchParams])

  // 기존 질문 세트 정보 저장 (수정 시 사용)
  const [originalQuestionSet, setOriginalQuestionSet] = useState<CustomQuestionSet | null>(null)

  // 기존 질문 세트 로드
  const loadExistingQuestionSet = async (id: string) => {
    try {
      console.log('Loading question set with ID:', id) // 디버깅용
      const questionSet = await getCustomQuestionSetByIdFromDB(id)
      console.log('Loaded question set:', questionSet) // 디버깅용
      
      if (questionSet) {
        setOriginalQuestionSet(questionSet) // 원본 데이터 저장
        setTitle(questionSet.title)
        setCategory(questionSet.category)
        setIsWorldCup(questionSet.isWorldCup)
        if (questionSet.worldCupRounds) {
          setWorldCupRounds(questionSet.worldCupRounds)
        }
        
        // 질문 데이터 변환 (votesA, votesB 제거)
        const questionsWithoutVotes = questionSet.questions.map(q => ({
          category: q.category,
          question: q.question,
          optionA: q.optionA,
          optionB: q.optionB
        }))
        setQuestions(questionsWithoutVotes)
        console.log('Set form data for editing') // 디버깅용
      } else {
        console.log('Question set not found') // 디버깅용
      }
    } catch (error) {
      console.error("Error loading question set:", error)
    }
  }

  // 월드컵 모드 토글 시 질문 수 조정
  const handleWorldCupToggle = (checked: boolean) => {
    setIsWorldCup(checked)
    if (checked) {
      // 월드컵 모드 활성화 시 선택된 라운드 수만큼 질문 생성
      generateQuestionsForRounds(worldCupRounds)
    } else {
      // 월드컵 모드 비활성화 시 기본 3개 질문으로 초기화
      setQuestions([
        { category: "other", question: "", optionA: "", optionB: "" },
        { category: "other", question: "", optionA: "", optionB: "" },
        { category: "other", question: "", optionA: "", optionB: "" },
      ])
    }
  }

  // 라운드 수 변경 시 질문 수 조정
  const handleRoundsChange = (rounds: number) => {
    setWorldCupRounds(rounds)
    if (isWorldCup) {
      generateQuestionsForRounds(rounds)
    }
  }

  // 선택된 라운드 수에 맞게 질문 생성
  const generateQuestionsForRounds = (rounds: number) => {
    const newQuestions = Array(rounds).fill(null).map(() => ({
      category: "other",
      question: "",
      optionA: "",
      optionB: ""
    }))
    setQuestions(newQuestions)
  }

  const addQuestion = () => {
    if (questions.length < 50 && !isWorldCup) {
      setQuestions([...questions, { category: "other", question: "", optionA: "", optionB: "" }])
    }
  }

  const removeQuestion = (index: number) => {
    if (questions.length > 3 && !isWorldCup) {
      setQuestions(questions.filter((_, i) => i !== index))
    }
  }

  const updateQuestion = (index: number, field: keyof (typeof questions)[0], value: string) => {
    const updated = [...questions]
    updated[index] = { ...updated[index], [field]: value }
    setQuestions(updated)
  }

  const validateForm = () => {
    if (!title.trim()) return false
    return questions.every((q) => q.question.trim() && q.optionA.trim() && q.optionB.trim())
  }

  const handleSave = async () => {
    if (!validateForm()) return

    setIsLoading(true)
    setSaveStatus("saving")

    const questionSet: CustomQuestionSet = {
      id: isEditing && editingId ? editingId : Date.now().toString(),
      title: title.trim(),
      category, // 질문 세트 전체 카테고리 사용
      questions: questions.map((q, index) => ({
        id: isEditing && editingId ? `${editingId}_${index}` : `${Date.now()}_${index}`,
        category, // 질문 세트 전체 카테고리를 모든 질문에 적용
        question: q.question.trim(),
        optionA: q.optionA.trim(),
        optionB: q.optionB.trim(),
        votesA: 0,
        votesB: 0,
      })),
      isWorldCup,
      worldCupRounds: isWorldCup ? worldCupRounds : undefined,
      createdAt: isEditing && originalQuestionSet ? originalQuestionSet.createdAt : new Date().toISOString(),
      shareCode: isEditing && originalQuestionSet ? originalQuestionSet.shareCode : generateShareCode(),
    }

    console.log('Saving question set:', questionSet) // 디버깅용

    try {
      const success = await saveCustomQuestionSetHybrid(questionSet)
      
      if (success) {
        setSaveStatus("success")
        setTimeout(() => {
          router.push("/my-sets")
        }, 1000)
      } else {
        setSaveStatus("error")
        setTimeout(() => {
          setSaveStatus("idle")
        }, 3000)
      }
    } catch (error) {
      console.error("Error saving question set:", error)
      setSaveStatus("error")
      setTimeout(() => {
        setSaveStatus("idle")
      }, 3000)
    } finally {
      setIsLoading(false)
    }
  }

  const getCategoryInfo = (categoryId: string) => {
    return categoriesData.find(cat => cat.id === categoryId) || categoriesData.find(cat => cat.id === "other")!
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* 헤더 */}
          <div className="flex items-center justify-between mb-8">
            <BackButton />
            <h1 className="text-xl font-bold text-gray-900">
              {isEditing ? "질문 세트 수정하기" : "질문 세트 만들기"}
            </h1>
            <div className="w-16"></div>
          </div>

          {/* 저장 상태 알림 */}
          {saveStatus === "saving" && (
            <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-blue-800">질문 세트를 저장하고 있습니다...</span>
              </div>
            </div>
          )}

          {saveStatus === "success" && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-3">
                <span className="text-green-600 text-xl">✓</span>
                <span className="text-green-800">질문 세트가 성공적으로 저장되었습니다!</span>
              </div>
            </div>
          )}

          {saveStatus === "error" && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-3">
                <span className="text-red-600 text-xl">⚠</span>
                <span className="text-red-800">저장 중 오류가 발생했습니다. 다시 시도해주세요.</span>
              </div>
            </div>
          )}

          <div className="space-y-8">
            {/* 기본 정보 */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">기본 정보</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">질문 세트 제목</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="예: 나만의 음식 벨런스게임"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">카테고리</label>
                  <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
                    {categoriesData.map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setCategory(cat.id)}
                        className={`
                          p-3 rounded-lg border-2 transition-all duration-200 text-center
                          ${
                            category === cat.id
                              ? "border-blue-500 bg-blue-50"
                              : "border-gray-200 bg-white hover:border-gray-300"
                          }
                        `}
                      >
                        <div className="text-lg mb-1">{cat.emoji}</div>
                        <div className="text-xs font-medium text-gray-700">{cat.name}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* 게임 모드 */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">게임 모드</h2>

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="worldcup"
                    checked={isWorldCup}
                    onChange={(e) => handleWorldCupToggle(e.target.checked)}
                    className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <div className="flex-1">
                    <label htmlFor="worldcup" className="text-sm font-medium text-gray-700">
                      월드컵 토너먼트 모드
                    </label>
                    <p className="text-xs text-gray-500 mt-1">
                      질문들이 토너먼트 형식으로 진행됩니다
                    </p>
                  </div>
                </div>

                {isWorldCup && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-sm font-medium text-gray-700 mb-3">토너먼트 라운드 수</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          {[4, 8, 16, 32].map((rounds) => (
                        <button
                              key={rounds}
                              type="button"
                              onClick={() => handleRoundsChange(rounds)}
                          className={`
                                p-3 rounded-lg border-2 transition-all duration-200 text-center
                            ${
                                  worldCupRounds === rounds
                                    ? "border-blue-500 bg-blue-500 text-white"
                                    : "border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50 text-gray-700"
                            }
                          `}
                        >
                              <div className="font-semibold">{rounds}강</div>
                              <div className="text-xs mt-1">{rounds}개 질문</div>
                        </button>
                      ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 질문 목록 */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  질문 목록 ({questions.length}/{isWorldCup ? worldCupRounds : 50})
                </h2>
                {!isWorldCup && (
                <button
                  onClick={addQuestion}
                  disabled={questions.length >= 50}
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  질문 추가
                </button>
                )}
              </div>

              {isWorldCup && (
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>월드컵 모드:</strong> {worldCupRounds}강 토너먼트를 위해 {worldCupRounds}개의 질문이 필요합니다.
                  </p>
                </div>
              )}

              <div className="space-y-4">
                {questions.map((question, index) => (
                  <div key={index} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-medium text-gray-700">질문 {index + 1}</h3>
                      {!isWorldCup && questions.length > 3 && (
                        <button
                          onClick={() => removeQuestion(index)}
                          className="text-red-500 hover:text-red-700 text-sm"
                        >
                          삭제
                        </button>
                      )}
                    </div>

                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">질문</label>
                      <input
                        type="text"
                        value={question.question}
                        onChange={(e) => updateQuestion(index, "question", e.target.value)}
                          placeholder="예: 어떤 음식을 더 좋아하나요?"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">선택지 A</label>
                        <input
                          type="text"
                          value={question.optionA}
                          onChange={(e) => updateQuestion(index, "optionA", e.target.value)}
                            placeholder="예: 피자"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">선택지 B</label>
                        <input
                          type="text"
                          value={question.optionB}
                          onChange={(e) => updateQuestion(index, "optionB", e.target.value)}
                            placeholder="예: 햄버거"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 저장 버튼 */}
            <div className="flex gap-3">
              <button
                onClick={() => router.push("/")}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors"
              >
                취소
              </button>
            <button
              onClick={handleSave}
                disabled={!validateForm() || isLoading}
                className="flex-1 px-6 py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white font-semibold rounded-xl transition-colors"
            >
                {isLoading ? "저장 중..." : (isEditing ? "수정 완료" : "질문 세트 저장")}
              </button>
                </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function CreateCustomPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-gray-900 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">불러오는 중...</p>
        </div>
      </div>
    }>
      <CreateCustomContent />
    </Suspense>
  )
}
