"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import ResultChart from "../../components/ResultChart"
import { getCurrentSession, getStoredQuestions, clearCurrentSession } from "../../lib/storage"
import type { GameSession, Question } from "../../lib/storage"
import BackButton from "../../components/BackButton"

export default function MultiResultPage() {
  const [session, setSession] = useState<GameSession | null>(null)
  const [currentResultIndex, setCurrentResultIndex] = useState(0)
  const [updatedQuestions, setUpdatedQuestions] = useState<Question[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showAllResults, setShowAllResults] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const currentSession = getCurrentSession()

    if (!currentSession || !currentSession.isCompleted) {
      router.push("/")
      return
    }

    // 업데이트된 질문 데이터 가져오기
    const storedQuestions = getStoredQuestions()
    const sessionQuestions = currentSession.questions.map((q) => {
      const updated = storedQuestions.find((sq) => sq.id === q.id)
      return updated || q
    })

    setSession(currentSession)
    setUpdatedQuestions(sessionQuestions)
    setIsLoading(false)
  }, [router])

  const handleNext = () => {
    if (!session) return

    if (currentResultIndex < session.answers.length - 1) {
      setCurrentResultIndex(currentResultIndex + 1)
    }
  }

  const handlePrevious = () => {
    if (currentResultIndex > 0) {
      setCurrentResultIndex(currentResultIndex - 1)
    }
  }

  const handleNewGame = () => {
    clearCurrentSession()
    router.push("/category-select")
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

  if (!session || !updatedQuestions.length) {
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

  const currentAnswer = session.answers[currentResultIndex]
  const currentQuestion = updatedQuestions[currentResultIndex]

  // 전체 결과 보기 모드
  if (showAllResults) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          {/* 헤더 */}
          <div className="w-full max-w-4xl mx-auto mb-8">
            <div className="flex items-center justify-between mb-4">
              <BackButton>홈으로</BackButton>
              <h1 className="text-xl font-bold text-gray-900">전체 결과</h1>
              <button
                onClick={() => setShowAllResults(false)}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm rounded-lg transition-colors"
              >
                개별 보기
              </button>
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
          </div>

          {/* 전체 결과를 한번에 표시 */}
          <div className="w-full max-w-4xl mx-auto space-y-8 mb-8">
            {session.answers.map((answer, index) => {
              const question = updatedQuestions[index]
              return (
                <div key={index} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      질문 {index + 1}: {question.question}
                    </h3>
                  </div>
                  <ResultChart question={question} userChoice={answer.choice} />
                </div>
              )
            })}
          </div>

          {/* 액션 버튼들 */}
          <div className="w-full max-w-md mx-auto space-y-3">
            <button
              onClick={handleNewGame}
              className="
                w-full px-6 py-4 bg-gray-900 hover:bg-gray-800
                text-white font-semibold text-lg rounded-xl
                transform transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]
                shadow-sm hover:shadow-md
              "
            >
              새 게임 시작
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
    )
  }

  // 기존 개별 결과 보기 모드
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center min-h-screen">
          {/* 헤더 */}
          <div className="w-full max-w-2xl mx-auto mb-8">
            <div className="flex items-center justify-between mb-4">
              <BackButton>홈으로</BackButton>
              <h1 className="text-xl font-bold text-gray-900">결과</h1>
              <button
                onClick={() => setShowAllResults(true)}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded-lg transition-colors"
              >
                전체 보기
              </button>
            </div>

            {/* 진행률 바 */}
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentResultIndex + 1) / session.answers.length) * 100}%` }}
              ></div>
            </div>
            <div className="text-center mt-2">
              <span className="text-sm text-gray-600">
                {currentResultIndex + 1} / {session.answers.length}
              </span>
            </div>
          </div>

          {/* 결과 차트 */}
          <div className="mb-8">
            <ResultChart question={currentQuestion} userChoice={currentAnswer.choice} />
          </div>

          {/* 네비게이션 버튼들 */}
          <div className="w-full max-w-md mx-auto mb-8">
            <div className="flex gap-3">
              <button
                onClick={handlePrevious}
                disabled={currentResultIndex === 0}
                className="
                  flex-1 px-4 py-3 bg-white hover:bg-gray-50 text-gray-700 font-semibold rounded-xl
                  border border-gray-300 hover:border-gray-400
                  disabled:opacity-50 disabled:cursor-not-allowed
                  transition-all duration-200
                "
              >
                이전
              </button>
              <button
                onClick={handleNext}
                disabled={currentResultIndex === session.answers.length - 1}
                className="
                  flex-1 px-4 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-xl
                  disabled:opacity-50 disabled:cursor-not-allowed
                  transition-all duration-200
                "
              >
                다음
              </button>
            </div>
          </div>

          {/* 액션 버튼들 */}
          <div className="w-full max-w-md mx-auto space-y-3">
            <button
              onClick={handleNewGame}
              className="
                w-full px-6 py-4 bg-gray-900 hover:bg-gray-800
                text-white font-semibold text-lg rounded-xl
                transform transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]
                shadow-sm hover:shadow-md
              "
            >
              새 게임 시작
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
