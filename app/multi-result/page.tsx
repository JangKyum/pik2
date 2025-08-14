"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { getCurrentSession, getStoredQuestions, clearCurrentSession } from "../../lib/storage"
import { getMultiGameQuestionVotesFromDB } from "../../lib/supabase-storage"
import type { GameSession, Question } from "../../lib/storage"
import categoriesData from "../../data/categories.json"
import BackButton from "../../components/BackButton"

export default function MultiResultPage() {
  const [session, setSession] = useState<GameSession | null>(null)
  const [updatedQuestions, setUpdatedQuestions] = useState<Question[]>([])
  const [voteStats, setVoteStats] = useState<Record<string, { votesA: number; votesB: number }>>({})
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const fetchData = async () => {
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

      // 멀티 게임에서 각 질문의 전체 투표 통계 가져오기
      try {
        const questionIds = sessionQuestions.map(q => q.id)
        const voteStats = await getMultiGameQuestionVotesFromDB(questionIds)
        setVoteStats(voteStats)
      } catch (error) {
        // 406 오류는 무시 (기능에는 영향 없음)
        console.log("Vote stats not available, using default values")
      }

      setIsLoading(false)
    }

    fetchData()
  }, [router])

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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* 헤더 */}
          <div className="flex items-center justify-between mb-8">
            <BackButton>
              홈으로
            </BackButton>
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900">멀티 게임 결과</h1>
              <p className="text-sm text-gray-600">
                {session.category && session.category !== "other" 
                  ? `${categoriesData.find(cat => cat.id === session.category)?.name || session.category} 카테고리` 
                  : "전체 결과"}
              </p>
            </div>
            <div className="w-16"></div>
          </div>

          {/* 요약 통계 */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">🎉 게임 완료!</h3>
            <p className="text-center text-gray-600 mb-6">모든 질문에 답변하셨습니다.</p>
            
            {/* 전체 통계 */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{session.answers.length}</div>
                <div className="text-sm text-blue-800">총 질문 수</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {session.answers.filter(a => a.choice === "A").length}
                </div>
                <div className="text-sm text-green-800">A 선택</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {session.answers.filter(a => a.choice === "B").length}
                </div>
                <div className="text-sm text-purple-800">B 선택</div>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">
                  {Math.round((session.answers.filter(a => a.choice === "A").length / session.answers.length) * 100)}%
                </div>
                <div className="text-sm text-orange-800">A 선택 비율</div>
              </div>
            </div>
          </div>

          {/* 전체 결과를 한번에 표시 */}
          <div className="space-y-6 mb-12">
            <h2 className="text-xl font-semibold text-gray-900 text-center mb-6">나의 모든 선택</h2>

            <div className="grid gap-6">
              {session.answers.map((answer, index) => {
                const question = updatedQuestions[index]
                const isChoiceA = answer.choice === "A"

                return (
                  <div key={answer.questionId} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-start gap-4">
                      {/* 질문 번호 */}
                      <div className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                        {index + 1}
                      </div>

                      {/* 질문 내용 */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 break-words leading-relaxed">{question.question}</h3>

                        {/* 선택지들 */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div
                            className={`
                            p-4 rounded-lg border-2 transition-all duration-200
                            ${isChoiceA ? "border-blue-500 bg-blue-50" : "border-gray-200 bg-gray-50"}
                          `}
                          >
                            <div className="flex items-start gap-3">
                              <div
                                className={`
                                flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold
                                ${isChoiceA ? "bg-blue-500 text-white" : "bg-gray-300 text-gray-600"}
                              `}
                              >
                                A
                              </div>
                              <div className="flex-1 min-w-0">
                                <span className={`font-medium ${isChoiceA ? "text-blue-900" : "text-gray-700"} break-words`}>
                                  {question.optionA}
                                </span>
                              </div>
                              {isChoiceA && (
                                <span className="flex-shrink-0 ml-2 px-2 py-1 bg-blue-500 text-white text-xs rounded-full font-medium whitespace-nowrap">
                                  내 선택
                                </span>
                              )}
                            </div>
                            {/* A 선택 통계 */}
                            <div className="mt-3 pt-3 border-t border-gray-200">
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-gray-600">선택 비율</span>
                                <span className="font-medium text-blue-600">
                                  {(() => {
                                    const questionVotes = voteStats[question.id] || { votesA: 0, votesB: 0 }
                                    return questionVotes.votesA + questionVotes.votesB > 0 
                                      ? Math.round((questionVotes.votesA / (questionVotes.votesA + questionVotes.votesB)) * 100) 
                                      : 0
                                  })()}%
                                </span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                                <div 
                                  className="bg-blue-500 h-1.5 rounded-full transition-all duration-500"
                                  style={{ 
                                    width: `${(() => {
                                      const questionVotes = voteStats[question.id] || { votesA: 0, votesB: 0 }
                                      return questionVotes.votesA + questionVotes.votesB > 0 
                                        ? (questionVotes.votesA / (questionVotes.votesA + questionVotes.votesB)) * 100 
                                        : 0
                                    })()}%` 
                                  }}
                                ></div>
                              </div>
                              <div className="text-xs text-gray-500 mt-1">
                                {(voteStats[question.id] || { votesA: 0 }).votesA}명 선택
                              </div>
                            </div>
                          </div>

                          <div
                            className={`
                            p-4 rounded-lg border-2 transition-all duration-200
                            ${!isChoiceA ? "border-gray-900 bg-gray-100" : "border-gray-200 bg-gray-50"}
                          `}
                          >
                            <div className="flex items-start gap-3">
                              <div
                                className={`
                                flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold
                                ${!isChoiceA ? "bg-gray-900 text-white" : "bg-gray-300 text-gray-600"}
                              `}
                              >
                                B
                              </div>
                              <div className="flex-1 min-w-0">
                                <span className={`font-medium ${!isChoiceA ? "text-gray-900" : "text-gray-700"} break-words`}>
                                  {question.optionB}
                                </span>
                              </div>
                              {!isChoiceA && (
                                <span className="flex-shrink-0 ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded-full font-medium whitespace-nowrap">
                                  내 선택
                                </span>
                              )}
                            </div>
                            {/* B 선택 통계 */}
                            <div className="mt-3 pt-3 border-t border-gray-200">
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-gray-600">선택 비율</span>
                                <span className="font-medium text-gray-600">
                                  {(() => {
                                    const questionVotes = voteStats[question.id] || { votesA: 0, votesB: 0 }
                                    return questionVotes.votesA + questionVotes.votesB > 0 
                                      ? Math.round((questionVotes.votesB / (questionVotes.votesA + questionVotes.votesB)) * 100) 
                                      : 0
                                  })()}%
                                </span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                                <div 
                                  className="bg-gray-900 h-1.5 rounded-full transition-all duration-500"
                                  style={{ 
                                    width: `${(() => {
                                      const questionVotes = voteStats[question.id] || { votesA: 0, votesB: 0 }
                                      return questionVotes.votesA + questionVotes.votesB > 0 
                                        ? (questionVotes.votesB / (questionVotes.votesA + questionVotes.votesB)) * 100 
                                        : 0
                                    })()}%` 
                                  }}
                                ></div>
                              </div>
                              <div className="text-xs text-gray-500 mt-1">
                                {(voteStats[question.id] || { votesB: 0 }).votesB}명 선택
                              </div>
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
              onClick={handleNewGame}
              className="
                flex-1 px-6 py-4 bg-gray-900 hover:bg-gray-800
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
                flex-1 px-6 py-4 bg-white hover:bg-gray-50 text-gray-700 font-semibold text-lg rounded-xl
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
