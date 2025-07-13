"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { getCustomQuestionSets } from "../../lib/storage"
import type { CustomQuestionSet } from "../../lib/storage"

export default function MySetsPage() {
  const [questionSets, setQuestionSets] = useState<CustomQuestionSet[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const sets = getCustomQuestionSets()
    setQuestionSets(sets)
    setIsLoading(false)
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-gray-900 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">불러오는 중...</p>
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
            <h1 className="text-xl font-bold text-gray-900">내가 만든 질문 세트</h1>
            <div className="w-16"></div>
          </div>

          {questionSets.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📝</div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">아직 만든 질문 세트가 없어요</h2>
              <p className="text-gray-600 mb-6">나만의 벨런스게임을 만들어보세요!</p>
              <button
                onClick={() => router.push("/create-custom")}
                className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-xl transition-colors"
              >
                질문 세트 만들기
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {questionSets.map((set) => (
                <div
                  key={set.id}
                  className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => router.push(`/custom-preview/${set.id}`)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{set.title}</h3>
                      <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                        <span>카테고리: {set.category}</span>
                        <span>•</span>
                        <span>{set.questions.length}개 질문</span>
                        {set.isWorldCup && (
                          <>
                            <span>•</span>
                            <span>{set.worldCupRounds}강 토너먼트</span>
                          </>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full font-medium">
                          {set.shareCode}
                        </span>
                        <span className="text-xs text-gray-500">{new Date(set.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="text-2xl">{set.isWorldCup ? "🏆" : "📋"}</div>
                  </div>
                </div>
              ))}

              <button
                onClick={() => router.push("/create-custom")}
                className="
                  w-full px-6 py-4 bg-blue-500 hover:bg-blue-600
                  text-white font-semibold text-lg rounded-xl
                  transform transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]
                  shadow-sm hover:shadow-md
                "
              >
                새 질문 세트 만들기
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
