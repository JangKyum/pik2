import type { Question } from "../lib/storage"
import categoriesData from "../data/categories.json"

interface QuestionCardProps {
  question: Question
}

export default function QuestionCard({ question }: QuestionCardProps) {
  const getCategoryInfo = (categoryId: string) => {
    const category = categoriesData.find((cat) => cat.id === categoryId)
    return category || { name: categoryId, emoji: "📝", color: "gray" }
  }

  const categoryInfo = getCategoryInfo(question.category)

  return (
    <div className="w-full">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-6 md:p-8">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs sm:text-sm font-medium mb-4 sm:mb-6 md:mb-8 bg-gray-100 text-gray-700 shadow-sm">
            <span className="text-base sm:text-lg">{categoryInfo.emoji}</span>
            <span>{categoryInfo.name}</span>
          </div>

          <h2 
            className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 leading-relaxed"
            style={{
              wordBreak: 'break-word',
              wordWrap: 'break-word',
              overflowWrap: 'break-word',
              hyphens: 'auto'
            }}
          >
            {question.question}
          </h2>
        </div>
      </div>
    </div>
  )
}
