"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { getCustomQuestionSetByIdFromDB } from "../../../lib/supabase-storage"
import type { CustomQuestionSet } from "../../../lib/storage"
import BackButton from "../../../components/BackButton"

export default function CustomPreviewPage() {
  const [questionSet, setQuestionSet] = useState<CustomQuestionSet | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const router = useRouter()
  const params = useParams()

  useEffect(() => {
    const fetchQuestionSet = async () => {
      const id = params.id as string
      if (!id) {
        router.push("/")
        return
      }

      try {
        const set = await getCustomQuestionSetByIdFromDB(id)
        if (!set) {
          router.push("/")
          return
        }

        setQuestionSet(set)
      } catch (error) {
        console.error("Error fetching question set:", error)
        router.push("/")
      } finally {
        setIsLoading(false)
      }
    }

    fetchQuestionSet()
  }, [params.id, router])

  const handleCopyShareCode = async () => {
    if (!questionSet?.shareCode) return

    try {
      await navigator.clipboard.writeText(questionSet.shareCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy:", err)
    }
  }

  const handleStartGame = () => {
    if (!questionSet) return

    if (questionSet.isWorldCup) {
      router.push(`/worldcup-game/${questionSet.id}`)
    } else {
      router.push(`/custom-game/${questionSet.id}`)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-gray-900 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">불러오는 중...</p>
        </div>
      </div>
    )
  }

  if (!questionSet) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">질문 세트를 찾을 수 없습니다.</p>
          <button
            onClick={() => router.push("/")}
            className="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            홈으로 돌아가기
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* 헤더 */}
          <div className="flex items-center justify-between mb-8">
            <BackButton href="/my-sets">질문 세트</BackButton>
            <h1 className="text-xl font-bold text-gray-900">질문 세트 미리보기</h1>
            <div className="w-16"></div>
          </div>

          {/* 질문 세트 정보 */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 mb-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mb-4 mx-auto">
                <span className="text-2xl">{questionSet.isWorldCup ? "🏆" : "📋"}</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{questionSet.title}</h2>
              <div className="flex items-center justify-center gap-4 text-sm text-gray-600">
                <span>카테고리: {questionSet.category}</span>
                <span>•</span>
                <span>{questionSet.questions.length}개 질문</span>
                {questionSet.isWorldCup && (
                  <>
                    <span>•</span>
                    <span>{questionSet.worldCupRounds}강 토너먼트</span>
                  </>
                )}
              </div>
            </div>

            {/* 게임 모드 표시 */}
            <div className="bg-gray-50 rounded-xl p-4 mb-6">
              <div className="flex items-center justify-center gap-2">
                <span className="text-lg">{questionSet.isWorldCup ? "🏆" : "📝"}</span>
                <span className="font-medium text-gray-800">
                  {questionSet.isWorldCup ? "월드컵 토너먼트" : "일반 벨런스게임"}
                </span>
              </div>
              <p className="text-xs text-gray-600 text-center mt-2">
                {questionSet.isWorldCup
                  ? "토너먼트 방식으로 최종 우승자를 가립니다"
                  : "모든 질문에 답하고 전체 결과를 확인합니다"}
              </p>
            </div>

            {/* 공유 코드 */}
            <div className="bg-blue-50 rounded-xl p-4 mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-700">공유 코드</p>
                  <p className="text-lg font-mono font-bold text-blue-900">{questionSet.shareCode}</p>
                </div>
                <button
                  onClick={handleCopyShareCode}
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  {copied ? "복사됨!" : "복사"}
                </button>
              </div>
              <p className="text-xs text-blue-600 mt-2">
                이 코드를 공유하면 다른 사람들도 같은 질문을 플레이할 수 있습니다
              </p>
            </div>

            {/* 액션 버튼들 */}
            <div className="space-y-3">
              <button
                onClick={handleStartGame}
                className={`
                  w-full px-6 py-4 text-white font-semibold text-lg rounded-xl
                  transform transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]
                  shadow-sm hover:shadow-md
                  ${questionSet.isWorldCup ? "bg-yellow-500 hover:bg-yellow-600" : "bg-blue-500 hover:bg-blue-600"}
                `}
              >
                {questionSet.isWorldCup ? "🏆 토너먼트 시작하기" : "📝 게임 시작하기"}
              </button>

              <button
                onClick={() => router.push(`/create-custom?edit=${questionSet.id}`)}
                className="
                  w-full px-6 py-4 bg-white hover:bg-gray-50 text-gray-700 font-semibold text-lg rounded-xl
                  border border-gray-300 hover:border-gray-400
                  transform transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]
                  shadow-sm hover:shadow-md
                "
              >
                수정하기
              </button>
            </div>
          </div>

          {/* 질문 목록 */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">질문 목록</h3>
            <div className="space-y-4">
              {questionSet.questions.map((question, index) => (
                <div key={question.id} className="p-4 border border-gray-200 rounded-xl">
                  <div className="text-sm text-gray-600 mb-2">질문 {index + 1}</div>
                  <div className="font-medium text-gray-900 mb-3">{question.question}</div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg">
                      <span className="text-sm font-medium text-blue-700">A: </span>
                      <span className="text-gray-900">{question.optionA}</span>
                    </div>
                    <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg">
                      <span className="text-sm font-medium text-gray-700">B: </span>
                      <span className="text-gray-900">{question.optionB}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
