"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { getQuestionsByCategory } from "../../lib/getRandomQuestion"
import { saveCurrentSession } from "../../lib/storage"
import categoriesData from "../../data/categories.json"

export default function CategorySelectPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleStartGame = () => {
    if (!selectedCategory) return

    setIsLoading(true)

    // 카테고리별 10개 질문 가져오기
    const questions = getQuestionsByCategory(selectedCategory, 10)

    // 게임 세션 생성
    const session = {
      type: "random" as const,
      category: selectedCategory,
      questions,
      currentIndex: 0,
      answers: [],
      isCompleted: false,
    }

    saveCurrentSession(session)

    setTimeout(() => {
      router.push("/multi-game")
    }, 500)
  }

  const getCategoryColor = (color: string) => {
    const colors = {
      orange: "from-orange-400 to-orange-600",
      purple: "from-purple-400 to-purple-600",
      blue: "from-blue-400 to-blue-600",
      green: "from-green-400 to-green-600",
      yellow: "from-yellow-400 to-yellow-600",
      pink: "from-pink-400 to-pink-600",
      emerald: "from-emerald-400 to-emerald-600",
      amber: "from-amber-400 to-amber-600",
      rose: "from-rose-400 to-rose-600",
      indigo: "from-indigo-400 to-indigo-600",
      gray: "from-gray-400 to-gray-600",
    }
    return colors[color as keyof typeof colors] || "from-gray-400 to-gray-600"
  }

  // "기타" 카테고리 제외 (랜덤 게임에서는 사용하지 않음)
  const availableCategories = categoriesData.filter((cat) => cat.id !== "other")

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
            <h1 className="text-xl font-bold text-gray-900">카테고리 선택</h1>
            <div className="w-16"></div>
          </div>

          {/* 설명 */}
          <div className="text-center mb-8">
            <p className="text-gray-600">
              원하는 카테고리를 선택하면 해당 카테고리의
              <br />
              <strong>10개 질문</strong>을 연속으로 진행합니다
            </p>
          </div>

          {/* 카테고리 그리드 */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
            {availableCategories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`
                  p-6 rounded-xl border-2 transition-all duration-200
                  ${
                    selectedCategory === category.id
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 bg-white hover:border-gray-300"
                  }
                `}
              >
                <div className="text-center">
                  <div className="text-3xl mb-2">{category.emoji}</div>
                  <div className="font-semibold text-gray-900">{category.name}</div>
                </div>
              </button>
            ))}
          </div>

          {/* 시작 버튼 */}
          <button
            onClick={handleStartGame}
            disabled={!selectedCategory || isLoading}
            className="
              w-full px-8 py-4 bg-blue-500 hover:bg-blue-600 
              text-white font-semibold text-lg rounded-xl
              transform transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]
              shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed
            "
          >
            {isLoading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>준비 중...</span>
              </div>
            ) : (
              "게임 시작하기"
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
