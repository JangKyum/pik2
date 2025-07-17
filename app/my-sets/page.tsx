"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { getCustomQuestionSetsHybrid, deleteCustomQuestionSetFromDB } from "../../lib/supabase-storage"
import type { CustomQuestionSet } from "../../lib/storage"
import BackButton from "../../components/BackButton"

export default function MySetsPage() {
  const [questionSets, setQuestionSets] = useState<CustomQuestionSet[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [deleteStatus, setDeleteStatus] = useState<{ [key: string]: "idle" | "deleting" | "success" | "error" }>({})
  const router = useRouter()

  useEffect(() => {
    loadQuestionSets()
  }, [])

  const loadQuestionSets = async () => {
    setIsLoading(true)
    try {
      const sets = await getCustomQuestionSetsHybrid()
      setQuestionSets(sets)
    } catch (error) {
      console.error("Error loading question sets:", error)
      setQuestionSets([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("정말로 이 질문 세트를 삭제하시겠습니까?")) return

    setDeleteStatus(prev => ({ ...prev, [id]: "deleting" }))

    try {
      const success = await deleteCustomQuestionSetFromDB(id)
      
      if (success) {
        setDeleteStatus(prev => ({ ...prev, [id]: "success" }))
        // 목록에서 제거
        setQuestionSets(prev => prev.filter(set => set.id !== id))
        
        setTimeout(() => {
          setDeleteStatus(prev => {
            const newStatus = { ...prev }
            delete newStatus[id]
            return newStatus
          })
        }, 2000)
      } else {
        setDeleteStatus(prev => ({ ...prev, [id]: "error" }))
        setTimeout(() => {
          setDeleteStatus(prev => {
            const newStatus = { ...prev }
            delete newStatus[id]
            return newStatus
          })
        }, 3000)
      }
    } catch (error) {
      console.error("Error deleting question set:", error)
      setDeleteStatus(prev => ({ ...prev, [id]: "error" }))
      setTimeout(() => {
        setDeleteStatus(prev => {
          const newStatus = { ...prev }
          delete newStatus[id]
          return newStatus
        })
      }, 3000)
    }
  }

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
            <BackButton />
            <h1 className="text-xl font-bold text-gray-900">질문 세트</h1>
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
                  className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div 
                      className="flex-1 cursor-pointer"
                      onClick={() => router.push(`/custom-preview/${set.id}`)}
                    >
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
                    
                    <div className="flex items-center gap-2">
                      <div className="text-2xl">{set.isWorldCup ? "🏆" : "📋"}</div>
                      
                      {/* 삭제 버튼 */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDelete(set.id)
                        }}
                        disabled={deleteStatus[set.id] === "deleting"}
                        className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                        title="삭제"
                      >
                        {deleteStatus[set.id] === "deleting" ? (
                          <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          "🗑️"
                        )}
                      </button>
                    </div>
                  </div>

                  {/* 삭제 상태 알림 */}
                  {deleteStatus[set.id] === "success" && (
                    <div className="mt-3 p-2 bg-green-50 border border-green-200 rounded-lg">
                      <span className="text-green-800 text-sm">질문 세트가 삭제되었습니다.</span>
                    </div>
                  )}

                  {deleteStatus[set.id] === "error" && (
                    <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded-lg">
                      <span className="text-red-800 text-sm">삭제 중 오류가 발생했습니다.</span>
                    </div>
                  )}
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
