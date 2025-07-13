"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { getCustomQuestionSets } from "../../../lib/storage"
import type { CustomQuestionSet } from "../../../lib/storage"

export default function SharePage() {
  const [questionSet, setQuestionSet] = useState<CustomQuestionSet | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const router = useRouter()
  const params = useParams()

  useEffect(() => {
    const shareCode = params.code as string
    if (!shareCode) {
      router.push("/")
      return
    }

    // 공유 코드로 질문 세트 찾기
    const allSets = getCustomQuestionSets()
    const foundSet = allSets.find((set) => set.shareCode === shareCode.toUpperCase())

    if (foundSet) {
      setQuestionSet(foundSet)
    } else {
      setNotFound(true)
    }

    setIsLoading(false)
  }, [params.code, router])

  const handleStartGame = () => {
    if (!questionSet) return
    router.push(`/custom-game/${questionSet.id}`)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-gray-900 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">질문 세트를 찾는 중...</p>
        </div>
      </div>
    )
  }

  if (notFound) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🔍</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">질문 세트를 찾을 수 없어요</h2>
          <p className="text-gray-600 mb-6">공유 코드가 올바른지 확인해주세요</p>
          <button
            onClick={() => router.push("/")}
            className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-xl transition-colors"
          >
            홈으로 돌아가기
          </button>
        </div>
      </div>
    )
  }

  if (!questionSet) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">오류가 발생했습니다.</p>
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* 헤더 */}
          <div className="flex items-center justify-between mb-8">
            <button
              onClick={() => router.push("/")}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <span className="text-xl">←</span>
              <span>홈으로</span>
            </button>
            <h1 className="text-xl font-bold text-gray-900">공유된 질문 세트</h1>
            <div className="w-16"></div>
          </div>

          {/* 질문 세트 정보 */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 mb-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mb-4 mx-auto">
                <span className="text-2xl">🎯</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{questionSet.title}</h2>
              <div className="flex items-center justify-center gap-4 text-sm text-gray-600">
                <span>카테고리: {questionSet.category}</span>
                <span>•</span>
                <span>{questionSet.questions.length}개 질문</span>
                {questionSet.isWorldCup && (
                  <>
                    <span>•</span>
                    <span>{questionSet.worldCupRounds}강 토너먼트</span>
                  </>
                )}
              </div>
            </div>

            <div className="bg-blue-50 rounded-xl p-4 mb-6">
              <p className="text-sm text-blue-800 text-center">
                <span className="font-semibold">공유 코드:</span> {questionSet.shareCode}
              </p>
            </div>

            {/* 액션 버튼 */}
            <button
              onClick={handleStartGame}
              className="
                w-full px-6 py-4 bg-blue-500 hover:bg-blue-600
                text-white font-semibold text-lg rounded-xl
                transform transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]
                shadow-sm hover:shadow-md
              "
            >
              게임 시작하기
            </button>
          </div>

          {/* 질문 미리보기 */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">질문 미리보기</h3>
            <div className="space-y-3">
              {questionSet.questions.slice(0, 3).map((question, index) => (
                <div key={question.id} className="p-3 border border-gray-200 rounded-lg">
                  <div className="text-sm text-gray-600 mb-1">질문 {index + 1}</div>
                  <div className="font-medium text-gray-900 text-sm">{question.question}</div>
                </div>
              ))}
              {questionSet.questions.length > 3 && (
                <div className="text-center text-sm text-gray-500 py-2">
                  ... 그리고 {questionSet.questions.length - 3}개의 질문이 더 있어요
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
