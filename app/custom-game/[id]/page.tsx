"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import QuestionCard from "../../../components/QuestionCard"
import ChoiceButton from "../../../components/ChoiceButton"
import BackButton from "../../../components/BackButton"
import { getCustomQuestionSetByIdFromDB } from "../../../lib/supabase-storage"
import { saveCurrentSession } from "../../../lib/storage"
import type { CustomQuestionSet, GameSession } from "../../../lib/storage"

export default function CustomGamePage() {
  const [questionSet, setQuestionSet] = useState<CustomQuestionSet | null>(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<Array<{ questionId: string; choice: "A" | "B" }>>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
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

  const handleChoice = async (choice: "A" | "B") => {
    if (!questionSet || isSubmitting) return

    setIsSubmitting(true)

    const currentQuestion = questionSet.questions[currentIndex]
    const newAnswer = { questionId: currentQuestion.id, choice }
    const updatedAnswers = [...answers, newAnswer]

    setAnswers(updatedAnswers)

    // 다음 질문으로 이동 또는 완료
    const nextIndex = currentIndex + 1
    const isCompleted = nextIndex >= questionSet.questions.length

    if (isCompleted) {
      // 게임 세션 저장
      const session: GameSession = {
        type: "custom",
        questions: questionSet.questions,
        currentIndex: nextIndex,
        answers: updatedAnswers,
        isCompleted: true,
        customSetId: questionSet.id,
      }

      saveCurrentSession(session)

      setTimeout(() => {
        router.push("/custom-result")
      }, 300)
    } else {
      setCurrentIndex(nextIndex)
      setTimeout(() => {
        setIsSubmitting(false)
      }, 200)
    }
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

  if (!questionSet || currentIndex >= questionSet.questions.length) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">게임을 찾을 수 없습니다.</p>
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

  const currentQuestion = questionSet.questions[currentIndex]
  const progress = ((currentIndex + 1) / questionSet.questions.length) * 100

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col items-center justify-center min-h-screen">
          {/* 헤더 */}
          <div className="w-full max-w-4xl mx-auto mb-6">
            <div className="flex items-center justify-between mb-4">
              <BackButton href={`/custom-preview/${questionSet.id}`}>
                돌아가기
              </BackButton>
              <div className="text-center">
                <h1 className="text-lg font-bold text-gray-900">{questionSet.title}</h1>
                <p className="text-sm text-gray-600">
                  {currentIndex + 1} / {questionSet.questions.length}
                </p>
              </div>
              <div className="w-16"></div>
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
          <div className="mb-8 md:mb-10">
            <QuestionCard question={currentQuestion} />
          </div>

          {/* 선택 버튼들 */}
          <div className="w-full max-w-4xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-8">
              <div className="flex-1">
            <ChoiceButton option={currentQuestion.optionA} choice="A" onClick={handleChoice} disabled={isSubmitting} />
              </div>
              
              <div className="flex justify-center md:flex-shrink-0">
                <div className="text-2xl font-bold text-gray-400 py-4">VS</div>
              </div>
              
              <div className="flex-1">
            <ChoiceButton option={currentQuestion.optionB} choice="B" onClick={handleChoice} disabled={isSubmitting} />
              </div>
            </div>
          </div>

          {isSubmitting && (
            <div className="mt-6 text-center">
              <div className="w-6 h-6 border-2 border-gray-900 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
              <p className="text-gray-600">
                {currentIndex + 1 >= questionSet.questions.length ? "결과 준비 중..." : "다음 질문 준비 중..."}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
