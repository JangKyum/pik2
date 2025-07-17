"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import BackButton from "../../components/BackButton"

export default function ShareInputPage() {
  const [shareCode, setShareCode] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!shareCode.trim()) return

    setIsLoading(true)

    // 공유 코드 정규화 (대문자로 변환, 공백 제거)
    const normalizedCode = shareCode.trim().toUpperCase()

    setTimeout(() => {
      router.push(`/share/${normalizedCode}`)
    }, 500)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center min-h-screen">
          {/* 헤더 */}
          <div className="w-full max-w-md mx-auto mb-8">
            <div className="flex items-center justify-between">
              <BackButton>홈으로</BackButton>
              <h1 className="text-xl font-bold text-gray-900">공유 코드 입력</h1>
              <div className="w-16"></div>
            </div>
          </div>

          {/* 입력 폼 */}
          <div className="w-full max-w-md mx-auto">
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mb-4 mx-auto">
                  <span className="text-2xl">🔗</span>
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">공유 코드 입력</h2>
                <p className="text-gray-600 text-sm">친구가 공유한 6자리 코드를 입력하세요</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="shareCode" className="block text-sm font-medium text-gray-700 mb-2">
                    공유 코드
                  </label>
                  <input
                    type="text"
                    id="shareCode"
                    value={shareCode}
                    onChange={(e) => setShareCode(e.target.value.toUpperCase())}
                    placeholder="예: ABC123"
                    maxLength={6}
                    className="
                      w-full px-4 py-3 border border-gray-300 rounded-xl text-center text-lg font-mono
                      focus:ring-2 focus:ring-blue-500 focus:border-transparent
                      placeholder-gray-400
                    "
                  />
                </div>

                <button
                  type="submit"
                  disabled={!shareCode.trim() || isLoading}
                  className="
                    w-full px-6 py-4 bg-blue-500 hover:bg-blue-600
                    text-white font-semibold text-lg rounded-xl
                    transform transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]
                    shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed
                  "
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>찾는 중...</span>
                    </div>
                  ) : (
                    "질문 세트 찾기"
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
