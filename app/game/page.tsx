"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import QuestionCard from "../../components/QuestionCard"
import ChoiceButton from "../../components/ChoiceButton"
import { getCurrentQuestion, updateQuestionVotes, setLastChoice } from "../../lib/storage"
import { getQuestionById } from "../../lib/getRandomQuestion"
import type { Question } from "../../lib/storage"
import BackButton from "../../components/BackButton"

export default function GamePage() {
  const [question, setQuestion] = useState<Question | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const currentQuestion = getCurrentQuestion()

    if (!currentQuestion) {
      router.push("/")
      return
    }

    setQuestion(currentQuestion)
    setIsLoading(false)
  }, [router])

  const handleChoice = async (choice: "A" | "B") => {
    if (!question || isSubmitting) return

    setIsSubmitting(true)

    // 투표 업데이트
    updateQuestionVotes(question.id, choice)
    setLastChoice(choice)

    // 결과 페이지로 이동
    setTimeout(() => {
      router.push("/result")
    }, 800)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-gray-900 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">질문을 불러오는 중...</p>
        </div>
      </div>
    )
  }

  if (!question) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">질문을 찾을 수 없습니다.</p>
          <BackButton>홈으로 돌아가기</BackButton>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col items-center justify-center min-h-screen">
          {/* 헤더 */}
          <div className="w-full max-w-4xl mx-auto mb-6">
            <div className="flex items-center justify-between">
              <BackButton />
              <h1 className="text-xl font-bold text-gray-900">Pik2</h1>
              <div className="w-16"></div>
            </div>
          </div>

          {/* 질문 카드 */}
          <div className="mb-8 md:mb-10">
            <QuestionCard question={question} />
          </div>

          {/* 선택 버튼들 */}
          <div className="w-full max-w-4xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-8">
              <div className="flex-1">
            <ChoiceButton option={question.optionA} choice="A" onClick={handleChoice} disabled={isSubmitting} />
              </div>
              
              <div className="flex justify-center md:flex-shrink-0">
                <div className="text-2xl font-bold text-gray-400 py-4">VS</div>
              </div>
              
              <div className="flex-1">
            <ChoiceButton option={question.optionB} choice="B" onClick={handleChoice} disabled={isSubmitting} />
              </div>
            </div>
          </div>

          {isSubmitting && (
            <div className="mt-6 text-center">
              <div className="w-6 h-6 border-2 border-gray-900 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
              <p className="text-gray-600">투표 중...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
