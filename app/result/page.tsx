"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import ResultChart from "../../components/ResultChart"
import { getCurrentQuestion, getLastChoice, setCurrentQuestion, getStoredQuestions } from "../../lib/storage"
import { getRandomQuestion } from "../../lib/getRandomQuestion"
import type { Question } from "../../lib/storage"

export default function ResultPage() {
  const [question, setQuestion] = useState<Question | null>(null)
  const [userChoice, setUserChoice] = useState<"A" | "B" | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingNext, setIsLoadingNext] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const currentQuestionId = getCurrentQuestion()
    const lastChoice = getLastChoice()

    if (!currentQuestionId || !lastChoice) {
      router.push("/")
      return
    }

    // 저장된 질문들에서 현재 질문 찾기 (업데이트된 투표 수 포함)
    const storedQuestions = getStoredQuestions()
    const updatedQuestion = storedQuestions.find((q) => q.id === currentQuestionId)

    if (!updatedQuestion) {
      router.push("/")
      return
    }

    setQuestion(updatedQuestion)
    setUserChoice(lastChoice)
    setIsLoading(false)
  }, [router])

  const handleNextQuestion = () => {
    if (!question) return

    setIsLoadingNext(true)

    // 새로운 랜덤 질문 선택 (현재 질문 제외)
    const nextQuestion = getRandomQuestion(question.id)
    setCurrentQuestion(nextQuestion.id)

    setTimeout(() => {
      router.push("/game")
    }, 500)
  }

  const handleGoHome = () => {
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

  if (!question || !userChoice) {
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
        <div className="flex flex-col items-center justify-center min-h-screen">
          {/* 헤더 */}
          <div className="w-full max-w-2xl mx-auto mb-8">
            <div className="flex items-center justify-between">
              <button
                onClick={handleGoHome}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <span className="text-xl">←</span>
                <span>홈으로</span>
              </button>
              <h1 className="text-xl font-bold text-gray-900">Pik2</h1>
              <div className="w-16"></div>
            </div>
          </div>

          {/* 결과 차트 */}
          <div className="mb-12">
            <ResultChart question={question} userChoice={userChoice} />
          </div>

          {/* 액션 버튼들 */}
          <div className="w-full max-w-md mx-auto space-y-3">
            <button
              onClick={handleNextQuestion}
              disabled={isLoadingNext}
              className="
                w-full px-6 py-4 bg-gray-900 hover:bg-gray-800
                text-white font-semibold text-lg rounded-xl
                transform transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]
                shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed
              "
            >
              {isLoadingNext ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Loading...</span>
                </div>
              ) : (
                "다음 질문"
              )}
            </button>

            <button
              onClick={handleGoHome}
              className="
                w-full px-6 py-4 bg-white hover:bg-gray-50 text-gray-700 font-semibold text-lg rounded-xl
                border border-gray-300 hover:border-gray-400
                transform transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]
                shadow-sm hover:shadow-md
              "
            >
              홈으로 돌아가기
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
