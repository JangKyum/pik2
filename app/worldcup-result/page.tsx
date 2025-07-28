"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { getCurrentSession, clearCurrentSession } from "../../lib/storage"
import { getCustomQuestionSetByIdFromDB, getQuestionSetVotesFromDB } from "../../lib/supabase-storage"
import { GameSession, CustomQuestionSet, Question } from "../../lib/storage"

interface WinnerStats {
  totalVotes: number
  totalAllVotes: number
  averagePercentage: number
  allStats: {
    question: Question
    votes: number
    totalVotes: number
    percentage: number
    isOptionA: boolean
  }[]
  originalQuestion: Question
}

export default function WorldCupResultPage() {
  const [session, setSession] = useState<GameSession | null>(null)
  const [questionSet, setQuestionSet] = useState<CustomQuestionSet | null>(null)
  const [voteStats, setVoteStats] = useState<Record<string, { votesA: number; votesB: number }>>({})
  const [winnerStats, setWinnerStats] = useState<WinnerStats | null>(null)
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

        // 투표 통계 가져오기
        const voteStats = await getQuestionSetVotesFromDB(set.id)
        
        // 테스트용 더미 데이터 추가 (실제 데이터가 없을 때)
        const testVoteStats = { ...voteStats }
        if (Object.keys(voteStats).length === 0) {
          set.questions.forEach((q, index) => {
            testVoteStats[q.id] = { votesA: Math.floor(Math.random() * 50) + 10, votesB: Math.floor(Math.random() * 50) + 10 }
          })
        }
        
        setVoteStats(testVoteStats)

        // 우승자의 투표 통계 계산
        const winner = currentSession.questions[0]
        
        if (winner && set.questions.length > 0) {
          // 우승자가 참여한 모든 대결의 통계 찾기
          const winnerStats = []
          const winnerOption = winner.optionA
          
          // 모든 투표 통계에서 우승자가 참여한 대결 찾기
          for (const [questionId, stats] of Object.entries(voteStats)) {
            // 해당 질문에서 우승자가 참여했는지 확인
            const question = set.questions.find(q => q.id === questionId.split('_').slice(0, -1).join('_'))
            if (question) {
              if (question.optionA === winnerOption) {
                // 우승자가 옵션 A인 경우
                const votesA = stats.votesA || 0
                const votesB = stats.votesB || 0
                const totalVotes = votesA + votesB
                
                if (totalVotes > 0) {
                  const percentage = Math.round((votesA / totalVotes) * 100)
                  winnerStats.push({
                    question: question,
                    votes: votesA,
                    totalVotes: totalVotes,
                    percentage: percentage,
                    isOptionA: true
                  })
                }
              } else if (question.optionB === winnerOption) {
                // 우승자가 옵션 B인 경우
                const votesA = stats.votesA || 0
                const votesB = stats.votesB || 0
                const totalVotes = votesA + votesB
                
                if (totalVotes > 0) {
                  const percentage = Math.round((votesB / totalVotes) * 100)
                  winnerStats.push({
                    question: question,
                    votes: votesB,
                    totalVotes: totalVotes,
                    percentage: percentage,
                    isOptionA: false
                  })
                }
              }
            }
          }
          
          if (winnerStats.length > 0) {
            // 모든 통계를 합산
            const totalVotes = winnerStats.reduce((sum, stat) => sum + stat.votes, 0)
            const totalAllVotes = winnerStats.reduce((sum, stat) => sum + stat.totalVotes, 0)
            const averagePercentage = Math.round((totalVotes / totalAllVotes) * 100)
            
            const winnerStatsData = {
              totalVotes: totalVotes,
              totalAllVotes: totalAllVotes,
              averagePercentage: averagePercentage,
              allStats: winnerStats,
              originalQuestion: winnerStats[0]?.question
            }
            
            setWinnerStats(winnerStatsData)
          }
        }
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
            <div className="text-center">
              <h1 className="text-xl font-bold text-gray-900">토너먼트 결과</h1>
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

              {/* 투표 통계 */}
              {winnerStats ? (
                <div className="bg-blue-50 rounded-xl p-4 mb-6">
                  <h4 className="text-sm font-medium text-blue-800 mb-2">📊 실제 투표 통계</h4>
                  <div className="text-xs text-blue-600 mb-3">
                    <strong>🏆 최종 우승자</strong>가 참여한 모든 대결의 통계입니다.<br />
                    (마지막 선택이 최종 우승자입니다)
                  </div>
                  
                  {/* 전체 통계 */}
                  <div className="flex items-center justify-between">
                    <div className="text-blue-700">
                      <span className="text-lg font-bold">{winnerStats.totalVotes}명</span> 총 선택
                    </div>
                    <div className="text-blue-700">
                      <span className="text-lg font-bold">{winnerStats.averagePercentage}%</span> 평균 선택률
                    </div>
                  </div>
                  <div className="mt-3">
                    <div className="w-full bg-blue-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${winnerStats.averagePercentage}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-gray-50 rounded-xl p-4 mb-6">
                  <h4 className="text-sm font-medium text-gray-600 mb-2">📊 투표 통계</h4>
                  <p className="text-gray-500 text-sm">
                    아직 다른 사용자들의 투표 데이터가 없습니다.<br />
                    더 많은 사람들이 이 질문을 플레이하면 통계가 표시됩니다!
                  </p>
                </div>
              )}

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
