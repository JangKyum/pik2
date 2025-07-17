"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import ChoiceButton from "../../../components/ChoiceButton"
import { getCustomQuestionSetByIdFromDB } from "../../../lib/supabase-storage"
import { saveCurrentSession, createWorldCupBracket, getNextRoundQuestions } from "../../../lib/storage"
import type { CustomQuestionSet, GameSession, Question } from "../../../lib/storage"

export default function WorldCupGamePage() {
  const [questionSet, setQuestionSet] = useState<CustomQuestionSet | null>(null)
  const [currentRound, setCurrentRound] = useState(1)
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0)
  const [roundQuestions, setRoundQuestions] = useState<Question[]>([])
  const [winners, setWinners] = useState<Question[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [gameCompleted, setGameCompleted] = useState(false)
  const router = useRouter()
  const params = useParams()

  useEffect(() => {
    const fetchSet = async () => {
      const id = params.id as string
      if (!id) {
        router.push("/")
        return
      }
      try {
        const set = await getCustomQuestionSetByIdFromDB(id)
        if (!set || !set.isWorldCup) {
          router.push("/")
          return
        }
        // 월드컵 브라켓 생성
        const bracket = createWorldCupBracket(set.questions, set.worldCupRounds || 8)
        setQuestionSet(set)
        setRoundQuestions(bracket)
      } catch (error) {
        console.error("Error fetching question set:", error)
        router.push("/")
      } finally {
        setIsLoading(false)
      }
    }
    fetchSet()
  }, [params.id, router])

  const getRoundName = (round: number, totalRounds: number) => {
    if (round === 1) {
      if (totalRounds === 4) return "준결승"
      if (totalRounds === 8) return "8강"
      if (totalRounds === 16) return "16강"
      if (totalRounds === 32) return "32강"
    }

    const remaining = Math.ceil(roundQuestions.length / Math.pow(2, round - 1))
    if (remaining === 2) return "결승"
    if (remaining === 4) return "준결승"
    if (remaining === 8) return "8강"
    if (remaining === 16) return "16강"
    return `${remaining}강`
  }

  const handleChoice = async (choice: "A" | "B") => {
    if (!questionSet || isSubmitting || gameCompleted) return

    setIsSubmitting(true)

    const currentQuestionA = roundQuestions[currentMatchIndex * 2]
    const currentQuestionB = roundQuestions[currentMatchIndex * 2 + 1]
    const winner = choice === "A" ? currentQuestionA : currentQuestionB

    const newWinners = [...winners, winner]
    setWinners(newWinners)

    const nextMatchIndex = currentMatchIndex + 1
    const matchesInRound = Math.floor(roundQuestions.length / 2)

    setTimeout(() => {
      if (nextMatchIndex >= matchesInRound) {
        // 라운드 완료
        if (newWinners.length === 1) {
          // 토너먼트 완료
          const session: GameSession = {
            type: "worldcup",
            questions: [winner],
            currentIndex: 0,
            answers: [{ questionId: winner.id, choice: "A" }],
            isCompleted: true,
            customSetId: questionSet.id,
            worldCupRounds: questionSet.worldCupRounds,
          }

          saveCurrentSession(session)
          setGameCompleted(true)

          setTimeout(() => {
            router.push("/worldcup-result")
          }, 1000)
        } else {
          // 다음 라운드로
          const nextRoundQuestions = getNextRoundQuestions(newWinners)
          setRoundQuestions(nextRoundQuestions)
          setWinners([])
          setCurrentMatchIndex(0)
          setCurrentRound(currentRound + 1)
          setIsSubmitting(false)
        }
      } else {
        // 같은 라운드 다음 매치
        setCurrentMatchIndex(nextMatchIndex)
        setIsSubmitting(false)
      }
    }, 800)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-gray-900 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">토너먼트를 준비하는 중...</p>
        </div>
      </div>
    )
  }

  if (!questionSet || !roundQuestions.length) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">토너먼트를 찾을 수 없습니다.</p>
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

  if (gameCompleted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🏆</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">토너먼트 완료!</h2>
          <p className="text-gray-600 mb-6">결과를 확인하는 중...</p>
          <div className="w-8 h-8 border-2 border-gray-900 border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    )
  }

  const currentQuestionA = roundQuestions[currentMatchIndex * 2]
  const currentQuestionB = roundQuestions[currentMatchIndex * 2 + 1]
  const matchesInRound = Math.floor(roundQuestions.length / 2)
  const roundName = getRoundName(currentRound, questionSet.worldCupRounds || 8)

  // 가상의 매치 카드 생성
  const matchQuestion = {
    id: `match_${currentMatchIndex}`,
    category: questionSet.category,
    question: `${roundName} ${currentMatchIndex + 1}/${matchesInRound}`,
    optionA: currentQuestionA.optionA,
    optionB: currentQuestionB.optionB,
    votesA: 0,
    votesB: 0,
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col items-center justify-center min-h-screen">
          {/* 헤더 */}
          <div className="w-full max-w-4xl mx-auto mb-6">
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => router.push(`/custom-preview/${questionSet.id}`)}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <span className="text-xl">←</span>
                <span>돌아가기</span>
              </button>
              <div className="text-center">
                <h1 className="text-lg font-bold text-gray-900">{questionSet.title}</h1>
                <p className="text-sm text-gray-600">{roundName}</p>
              </div>
              <div className="w-16"></div>
            </div>

            {/* 토너먼트 진행률 */}
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                <span>매치 진행률</span>
                <span>
                  {currentMatchIndex + 1} / {matchesInRound}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-yellow-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${((currentMatchIndex + 1) / matchesInRound) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* 대결 카드 */}
          <div className="mb-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <div className="text-center">
                <div className="inline-flex items-center px-4 py-2 rounded-full bg-yellow-100 text-yellow-800 text-sm font-medium mb-3">
                  🏆 {roundName}
                </div>
                <h2 className="text-xl font-bold text-gray-900">어떤 것을 선택하시겠어요?</h2>
              </div>
            </div>
          </div>

          {/* 선택 버튼들 */}
          <div className="w-full max-w-4xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-8">
              <div className="flex-1">
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
              <ChoiceButton
                option={currentQuestionA.optionA}
                choice="A"
                onClick={handleChoice}
                disabled={isSubmitting}
              />
                </div>
            </div>

              <div className="flex justify-center md:flex-shrink-0">
                <div className="text-2xl font-bold text-gray-400 py-4">VS</div>
            </div>

              <div className="flex-1">
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
              <ChoiceButton
                option={currentQuestionB.optionB}
                choice="B"
                onClick={handleChoice}
                disabled={isSubmitting}
              />
                </div>
              </div>
            </div>
          </div>

          {isSubmitting && (
            <div className="mt-6 text-center">
              <div className="w-6 h-6 border-2 border-gray-900 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
              <p className="text-gray-600">
                {winners.length + 1 === matchesInRound && matchesInRound > 1
                  ? "다음 라운드 준비 중..."
                  : "다음 매치 준비 중..."}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
