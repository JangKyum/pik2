"use client"
import { useRouter } from "next/navigation"

export default function HomePage() {
  const router = useRouter()

  const handleRandomGame = () => {
    router.push("/category-select")
  }

  const handleCreateCustom = () => {
    router.push("/create-custom")
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center min-h-screen text-center">
          {/* 로고 및 제목 */}
          <div className="mb-16">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mb-8 mx-auto">
              <span className="text-3xl font-bold text-white">P2</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-4">Pik2</h1>
            <p className="text-xl text-gray-600 font-medium">Balance Game</p>
          </div>

          {/* 설명 */}
          <div className="mb-12 max-w-md">
            <p className="text-gray-700 text-lg leading-relaxed">
              두 가지 선택지 중 하나를 선택하고
              <br />
              다른 사람들의 선택을 확인해보세요
            </p>
          </div>

          {/* 게임 모드 선택 버튼들 */}
          <div className="w-full max-w-md space-y-4">
            <button
              onClick={handleRandomGame}
              className="
                w-full px-8 py-6 bg-blue-500 hover:bg-blue-600 
                text-white font-semibold text-lg rounded-xl
                transform transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]
                shadow-lg hover:shadow-xl
              "
            >
              <div className="flex items-center justify-center gap-3">
                <span className="text-2xl">🎲</span>
                <div className="text-left">
                  <div className="font-bold">랜덤 질문 시작하기</div>
                  <div className="text-sm opacity-90">카테고리별 10개 질문</div>
                </div>
              </div>
            </button>

            <button
              onClick={handleCreateCustom}
              className="
                w-full px-8 py-6 bg-gray-900 hover:bg-gray-800 
                text-white font-semibold text-lg rounded-xl
                transform transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]
                shadow-lg hover:shadow-xl
              "
            >
              <div className="flex items-center justify-center gap-3">
                <span className="text-2xl">✏️</span>
                <div className="text-left">
                  <div className="font-bold">질문 직접 만들기</div>
                  <div className="text-sm opacity-90">나만의 질문 세트 생성</div>
                </div>
              </div>
            </button>
          </div>

          {/* 추가 링크 */}
          <div className="mt-8 space-y-2">
            <button
              onClick={() => router.push("/my-sets")}
              className="block text-gray-600 hover:text-gray-900 transition-colors text-sm underline"
            >
              내가 만든 질문 세트 보기
            </button>
            <button
              onClick={() => router.push("/share-input")}
              className="block text-gray-600 hover:text-gray-900 transition-colors text-sm underline"
            >
              공유 코드로 질문 세트 찾기
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
