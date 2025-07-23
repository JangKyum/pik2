"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import QuestionCard from "../../components/QuestionCard"
import ChoiceButton from "../../components/ChoiceButton"
import { getCurrentSession, saveCurrentSession, updateQuestionVotes } from "../../lib/storage"
import { updateQuestionVotesInDB } from "../../lib/supabase-storage"
import type { GameSession, Choice } from "../../lib/storage"
import BackButton from "../../components/BackButton"

export default function MultiGamePage() {
  const [session, setSession] = useState<GameSession | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const currentSession = getCurrentSession()

    if (!currentSession) {
      router.push("/")
      return
    }

    setSession(currentSession)
    setIsLoading(false)
  }, [router])

  const handleChoice = async (choice: Choice) => {
    if (!session || isSubmitting) return

    setIsSubmitting(true)

    const currentQuestion = session.questions[session.currentIndex]

    // 로컬 스토리지 투표 업데이트
    updateQuestionVotes(currentQuestion.id, choice)

    // Supabase에 투표 결과 저장 (멀티 게임용 questionSetId 사용)
    try {
      await updateQuestionVotesInDB(currentQuestion.id, "multi-game", choice)
    } catch (error) {
      console.error("Error saving vote to database:", error)
    }

    // 답변 저장
    const newAnswer = { questionId: currentQuestion.id, choice }
    const updatedAnswers = [...session.answers, newAnswer]

    // 다음 질문으로 이동 또는 완료
    const nextIndex = session.currentIndex + 1
    const isCompleted = nextIndex >= session.questions.length

    const updatedSession = {
      ...session,
      currentIndex: nextIndex,
      answers: updatedAnswers,
      isCompleted,
    }

    setSession(updatedSession)
    saveCurrentSession(updatedSession)

    setTimeout(() => {
      if (isCompleted) {
        router.push("/multi-result")
      } else {
        setIsSubmitting(false)
      }
    }, 200)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-gray-900 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">게임을 불러오는 중...</p>
        </div>
      </div>
    )
  }

  if (!session || session.currentIndex >= session.questions.length) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">게임 세션을 찾을 수 없습니다.</p>
          <BackButton>홈으로 돌아가기</BackButton>
        </div>
      </div>
    )
  }

  if (isSubmitting) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-gray-900 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">
            {session.currentIndex + 1 >= session.questions.length ? "결과를 준비하고 있습니다..." : "다음 질문을 준비하고 있습니다..."}
          </p>
        </div>
      </div>
    )
  }

  const currentQuestion = session.questions[session.currentIndex]
  const progress = ((session.currentIndex + 1) / session.questions.length) * 100

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-4 sm:py-6">
        <div className="flex flex-col items-center justify-center min-h-screen">
          {/* 헤더 */}
          <div className="w-full max-w-4xl mx-auto mb-4 sm:mb-6">
            <div className="flex items-center justify-between mb-4">
              <BackButton />
              <h1 className="text-lg sm:text-xl font-bold text-gray-900">Pik2</h1>
              <div className="text-xs sm:text-sm text-gray-600">
                {session.currentIndex + 1} / {session.questions.length}
              </div>
            </div>

            {/* 진행률 바 */}
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>

          {/* 질문 카드 */}
          <div className="mb-6 sm:mb-8 md:mb-10 w-full max-w-4xl mx-auto">
            <QuestionCard question={currentQuestion} />
          </div>

          {/* 선택 버튼들 */}
          <div className="w-full max-w-4xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-stretch gap-3 sm:gap-4 md:gap-8">
              <div className="flex-1">
                <ChoiceButton option={currentQuestion.optionA} choice="A" onClick={handleChoice} disabled={isSubmitting} />
              </div>
              
              <div className="flex justify-center md:flex-shrink-0 md:flex-col md:justify-center">
                <div className="text-xl sm:text-2xl font-bold text-gray-400 py-2 md:py-4">VS</div>
              </div>
              
              <div className="flex-1">
                <ChoiceButton option={currentQuestion.optionB} choice="B" onClick={handleChoice} disabled={isSubmitting} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
