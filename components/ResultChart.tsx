import type { Question } from "../lib/storage"

interface ResultChartProps {
  question: Question
  userChoice: "A" | "B"
}

export default function ResultChart({ question, userChoice }: ResultChartProps) {
  const totalVotes = question.votesA + question.votesB
  const percentageA = totalVotes > 0 ? Math.round((question.votesA / totalVotes) * 100) : 0
  const percentageB = totalVotes > 0 ? Math.round((question.votesB / totalVotes) * 100) : 0

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">투표 결과</h2>
          <p className="text-gray-600">총 {totalVotes.toLocaleString()}명 참여</p>
        </div>

        <div className="space-y-6">
          {/* Option A */}
          <div
            className={`p-6 rounded-xl border-2 ${userChoice === "A" ? "border-blue-500 bg-blue-50" : "border-gray-200 bg-gray-50"}`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold text-sm">
                  A
                </div>
                <span className="font-semibold text-gray-900">{question.optionA}</span>
                {userChoice === "A" && (
                  <span className="px-2 py-1 bg-blue-500 text-white text-xs rounded-full font-medium">내 선택</span>
                )}
              </div>
              <span className="text-2xl font-bold text-blue-500">{percentageA}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${percentageA}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-600 mt-2">{question.votesA.toLocaleString()}명</p>
          </div>

          {/* Option B */}
          <div
            className={`p-6 rounded-xl border-2 ${userChoice === "B" ? "border-gray-900 bg-gray-100" : "border-gray-200 bg-gray-50"}`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gray-900 text-white flex items-center justify-center font-bold text-sm">
                  B
                </div>
                <span className="font-semibold text-gray-900">{question.optionB}</span>
                {userChoice === "B" && (
                  <span className="px-2 py-1 bg-gray-900 text-white text-xs rounded-full font-medium">내 선택</span>
                )}
              </div>
              <span className="text-2xl font-bold text-gray-900">{percentageB}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-gray-900 h-2 rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${percentageB}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-600 mt-2">{question.votesB.toLocaleString()}명</p>
          </div>
        </div>
      </div>
    </div>
  )
}
