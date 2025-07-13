import type { Question } from "../lib/storage"

interface QuestionCardProps {
  question: Question
}

export default function QuestionCard({ question }: QuestionCardProps) {
  const getCategoryColor = (category: string) => {
    const colors = {
      food: "bg-orange-100 text-orange-800",
      lifestyle: "bg-purple-100 text-purple-800",
      superpower: "bg-blue-100 text-blue-800",
      time: "bg-green-100 text-green-800",
      weather: "bg-yellow-100 text-yellow-800",
      social: "bg-pink-100 text-pink-800",
      money: "bg-emerald-100 text-emerald-800",
      pet: "bg-amber-100 text-amber-800",
    }
    return colors[category as keyof typeof colors] || "bg-gray-100 text-gray-800"
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-8">
        <div className="text-center">
          <div
            className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium mb-6 md:mb-8 ${getCategoryColor(question.category)}`}
          >
            {question.category}
          </div>

          <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 leading-tight">{question.question}</h2>
        </div>
      </div>
    </div>
  )
}
