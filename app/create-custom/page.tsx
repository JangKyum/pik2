"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { saveCustomQuestionSet, generateShareCode, getCustomQuestionSetById } from "../../lib/storage"
import type { Question, CustomQuestionSet } from "../../lib/storage"
import categoriesData from "../../data/categories.json"

export default function CreateCustomPage() {
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
  const router = useRouter()

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

    const questionSet: CustomQuestionSet = {
      id: Date.now().toString(),
      title: title.trim(),
      category, // 질문 세트 전체 카테고리 사용
      questions: questions.map((q, index) => ({
        id: `${Date.now()}_${index}`,
        category, // 질문 세트 전체 카테고리를 모든 질문에 적용
        question: q.question.trim(),
        optionA: q.optionA.trim(),
        optionB: q.optionB.trim(),
        votesA: 0,
        votesB: 0,
      })),
      isWorldCup,
      worldCupRounds: isWorldCup ? worldCupRounds : undefined,
      createdAt: new Date().toISOString(),
      shareCode: generateShareCode(),
    }

    saveCustomQuestionSet(questionSet)

    setTimeout(() => {
      router.push("/my-sets")
    }, 500)
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
            <button
              onClick={() => router.push("/")}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <span className="text-xl">←</span>
              <span>홈으로</span>
            </button>
            <h1 className="text-xl font-bold text-gray-900">질문 세트 만들기</h1>
            <div className="w-16"></div>
          </div>

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

              <div className="space-y-6">
                {questions.map((question, index) => (
                  <div key={index} className="p-4 border border-gray-200 rounded-xl">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium text-gray-700">질문 {index + 1}</span>
                      {questions.length > 3 && !isWorldCup && (
                        <button
                          onClick={() => removeQuestion(index)}
                          className="text-red-500 hover:text-red-700 text-sm transition-colors"
                        >
                          삭제
                        </button>
                      )}
                    </div>

                    <div className="space-y-3">
                      <input
                        type="text"
                        value={question.question}
                        onChange={(e) => updateQuestion(index, "question", e.target.value)}
                        placeholder="질문을 입력하세요 (예: 치킨 vs 피자)"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <input
                          type="text"
                          value={question.optionA}
                          onChange={(e) => updateQuestion(index, "optionA", e.target.value)}
                          placeholder="선택지 A (예: 치킨)"
                          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <input
                          type="text"
                          value={question.optionB}
                          onChange={(e) => updateQuestion(index, "optionB", e.target.value)}
                          placeholder="선택지 B (예: 피자)"
                          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 저장 버튼 */}
            <div className="flex justify-center">
              <button
                onClick={handleSave}
                disabled={!validateForm() || isLoading}
                className="px-8 py-3 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? "저장 중..." : "질문 세트 저장"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
