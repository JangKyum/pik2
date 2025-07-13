"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { getCurrentSession, getCustomQuestionSetById, clearCurrentSession } from "../../lib/storage"
import type { GameSession, CustomQuestionSet } from "../../lib/storage"

export default function CustomResultPage() {
  const [session, setSession] = useState<GameSession | null>(null)
  const [questionSet, setQuestionSet] = useState<CustomQuestionSet | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const currentSession = getCurrentSession()

    if (!currentSession || currentSession.type !== "custom" || !currentSession.isCompleted) {
      router.push("/")
      return
    }

    const set = currentSession.customSetId ? getCustomQuestionSetById(currentSession.customSetId) : null
    if (!set) {
      router.push("/")
      return
    }

    setSession(currentSession)
    setQuestionSet(set)
    setIsLoading(false)
  }, [router])

  const handlePlayAgain = () => {
    if (!questionSet) return
    clearCurrentSession()
    router.push(`/custom-game/${questionSet.id}`)
  }

  const handleGoHome = () => {
    clearCurrentSession()
    router.push("/")
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-gray-900 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">결과를 불러오는 중...</p>
        </div>
      </div>
    )
  }

  if (!session || !questionSet) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">결과를 찾을 수 없습니다.</p>
          <button
            onClick={handleGoHome}
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
        <div className="max-w-4xl mx-auto">
          {/* 헤더 */}
          <div className="flex items-center justify-between mb-8">
            <button
              onClick={handleGoHome}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <span className="text-xl">←</span>
              <span>홈으로</span>
            </button>
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900">{questionSet.title}</h1>
              <p className="text-sm text-gray-600">전체 결과</p>
            </div>
            <div className="w-16"></div>
          </div>

          {/* 요약 통계 */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">🎉 게임 완료!</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-xl">
                <div className="text-2xl font-bold text-blue-600">
                  {session.answers.filter((a) => a.choice === "A").length}
                </div>
                <div className="text-sm text-blue-800">A 선택</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-xl">
                <div className="text-2xl font-bold text-gray-600">
                  {session.answers.filter((a) => a.choice === "B").length}
                </div>
                <div className="text-sm text-gray-800">B 선택</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-xl">
                <div className="text-2xl font-bold text-green-600">{session.answers.length}</div>
                <div className="text-sm text-green-800">총 질문</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-xl">
                <div className="text-2xl font-bold text-purple-600">100%</div>
                <div className="text-sm text-purple-800">완료율</div>
              </div>
            </div>
          </div>

          {/* 전체 결과를 한번에 표시 */}
          <div className="space-y-6 mb-12">
            <h2 className="text-xl font-semibold text-gray-900 text-center mb-6">나의 모든 선택</h2>

            <div className="grid gap-6">
              {session.answers.map((answer, index) => {
                const question = session.questions[index]
                const isChoiceA = answer.choice === "A"

                return (
                  <div key={answer.questionId} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-start gap-4">
                      {/* 질문 번호 */}
                      <div className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                        {index + 1}
                      </div>

                      {/* 질문 내용 */}
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">{question.question}</h3>

                        {/* 선택지들 */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div
                            className={`
                            p-4 rounded-lg border-2 transition-all duration-200
                            ${isChoiceA ? "border-blue-500 bg-blue-50" : "border-gray-200 bg-gray-50"}
                          `}
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className={`
                                w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold
                                ${isChoiceA ? "bg-blue-500 text-white" : "bg-gray-300 text-gray-600"}
                              `}
                              >
                                A
                              </div>
                              <span className={`font-medium ${isChoiceA ? "text-blue-900" : "text-gray-700"}`}>
                                {question.optionA}
                              </span>
                              {isChoiceA && (
                                <span className="ml-auto px-2 py-1 bg-blue-500 text-white text-xs rounded-full font-medium">
                                  내 선택
                                </span>
                              )}
                            </div>
                          </div>

                          <div
                            className={`
                            p-4 rounded-lg border-2 transition-all duration-200
                            ${!isChoiceA ? "border-gray-900 bg-gray-100" : "border-gray-200 bg-gray-50"}
                          `}
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className={`
                                w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold
                                ${!isChoiceA ? "bg-gray-900 text-white" : "bg-gray-300 text-gray-600"}
                              `}
                              >
                                B
                              </div>
                              <span className={`font-medium ${!isChoiceA ? "text-gray-900" : "text-gray-700"}`}>
                                {question.optionB}
                              </span>
                              {!isChoiceA && (
                                <span className="ml-auto px-2 py-1 bg-gray-900 text-white text-xs rounded-full font-medium">
                                  내 선택
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* 액션 버튼들 */}
          <div className="flex flex-col md:flex-row gap-4 max-w-md mx-auto">
            <button
              onClick={handlePlayAgain}
              className="
                flex-1 px-6 py-4 bg-gray-900 hover:bg-gray-800
                text-white font-semibold text-lg rounded-xl
                transform transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]
                shadow-sm hover:shadow-md
              "
            >
              다시 플레이
            </button>

            <button
              onClick={() => router.push(`/custom-preview/${questionSet.id}`)}
              className="
                flex-1 px-6 py-4 bg-blue-500 hover:bg-blue-600
                text-white font-semibold text-lg rounded-xl
                transform transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]
                shadow-sm hover:shadow-md
              "
            >
              질문 세트로
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
