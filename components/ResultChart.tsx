import type { Question, Choice } from "../lib/storage"

interface ResultChartProps {
  question: Question
  userChoice: Choice
}

export default function ResultChart({ question, userChoice }: ResultChartProps) {
  const totalVotes = question.votesA + question.votesB
  const percentageA = totalVotes > 0 ? Math.round((question.votesA / totalVotes) * 100) : 0
  const percentageB = totalVotes > 0 ? Math.round((question.votesB / totalVotes) * 100) : 0

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center break-words leading-relaxed">
          {question.question}
        </h3>

        <div className="space-y-4">
          {/* A 선택지 */}
          <div className="relative">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-gray-900">A. {question.optionA}</span>
              <span className="text-sm font-semibold text-blue-600">{percentageA}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className={`h-3 rounded-full transition-all duration-500 ${
                  userChoice === "A" ? "bg-blue-500" : "bg-blue-400"
                }`}
                style={{ width: `${percentageA}%` }}
              ></div>
            </div>
            <div className="text-xs text-gray-500 mt-1">{question.votesA}명 선택</div>
            {userChoice === "A" && (
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                ✓
              </div>
            )}
          </div>

          {/* B 선택지 */}
          <div className="relative">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-gray-900">B. {question.optionB}</span>
              <span className="text-sm font-semibold text-gray-600">{percentageB}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className={`h-3 rounded-full transition-all duration-500 ${
                  userChoice === "B" ? "bg-gray-900" : "bg-gray-400"
                }`}
                style={{ width: `${percentageB}%` }}
              ></div>
            </div>
            <div className="text-xs text-gray-500 mt-1">{question.votesB}명 선택</div>
            {userChoice === "B" && (
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-gray-900 text-white rounded-full flex items-center justify-center text-xs font-bold">
                ✓
              </div>
            )}
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-200 text-center">
          <p className="text-sm text-gray-600">
            총 <span className="font-semibold">{totalVotes}</span>명이 참여했습니다
          </p>
        </div>
      </div>
    </div>
  )
}
