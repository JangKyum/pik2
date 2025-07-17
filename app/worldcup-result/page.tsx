"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { getCurrentSession, clearCurrentSession } from "../../lib/storage"
import { getCustomQuestionSetByIdFromDB } from "../../lib/supabase-storage"
import type { GameSession, CustomQuestionSet } from "../../lib/storage"

export default function WorldCupResultPage() {
  const [session, setSession] = useState<GameSession | null>(null)
  const [questionSet, setQuestionSet] = useState<CustomQuestionSet | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const fetchData = async () => {
      const currentSession = getCurrentSession()
      if (!currentSession || currentSession.type !== "worldcup" || !currentSession.isCompleted) {
        router.push("/")
        return
      }
      try {
        const set = currentSession.customSetId ? await getCustomQuestionSetByIdFromDB(currentSession.customSetId) : null
        if (!set) {
          router.push("/")
          return
        }
        setSession(currentSession)
        setQuestionSet(set)
      } catch (error) {
        console.error("Error fetching question set:", error)
        router.push("/")
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [router])

  const handlePlayAgain = () => {
    if (!questionSet) return
    clearCurrentSession()
    router.push(`/worldcup-game/${questionSet.id}`)
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

  if (!session || !questionSet || !session.questions.length) {
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

  const winner = session.questions[0]

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
              <h1 className="text-xl font-bold text-gray-900">토너먼트 결과</h1>
              <div className="w-16"></div>
            </div>
          </div>

          {/* 우승 결과 */}
          <div className="w-full max-w-2xl mx-auto mb-12">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 text-center">
              {/* 트로피 애니메이션 */}
              <div className="mb-6">
                <div className="text-8xl mb-4 animate-bounce">🏆</div>
                <div className="text-6xl mb-4">🎉</div>
              </div>

              <h2 className="text-3xl font-bold text-gray-900 mb-4">우승!</h2>

              <div className="bg-gradient-to-r from-yellow-100 to-orange-100 rounded-xl p-6 mb-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-2">{questionSet.title}</h3>
                <div className="text-2xl font-bold text-orange-600">{winner.optionA}</div>
              </div>

              <div className="text-sm text-gray-600 mb-6">
                {questionSet.worldCupRounds}강 토너먼트에서 최종 우승했습니다!
              </div>

              {/* 축하 메시지 */}
              <div className="bg-blue-50 rounded-xl p-4 mb-6">
                <p className="text-blue-800 font-medium">
                  🎊 축하합니다! 모든 대결에서 승리하여 최고의 선택을 찾았습니다!
                </p>
              </div>
            </div>
          </div>

          {/* 액션 버튼들 */}
          <div className="w-full max-w-md mx-auto space-y-3">
            <button
              onClick={handlePlayAgain}
              className="
                w-full px-6 py-4 bg-yellow-500 hover:bg-yellow-600
                text-white font-semibold text-lg rounded-xl
                transform transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]
                shadow-lg hover:shadow-xl
              "
            >
              🏆 다시 토너먼트 하기
            </button>

            <button
              onClick={() => router.push(`/custom-preview/${questionSet.id}`)}
              className="
                w-full px-6 py-4 bg-blue-500 hover:bg-blue-600
                text-white font-semibold text-lg rounded-xl
                transform transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]
                shadow-sm hover:shadow-md
              "
            >
              질문 세트로 돌아가기
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
