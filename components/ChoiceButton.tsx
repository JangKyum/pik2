"use client"

import type { Choice } from "../lib/storage"

interface ChoiceButtonProps {
  option: string
  choice: Choice
  onClick: (choice: Choice) => void
  disabled?: boolean
}

export default function ChoiceButton({ option, choice, onClick, disabled }: ChoiceButtonProps) {
  const getButtonStyle = (choice: Choice) => {
    if (choice === "A") {
      return "bg-blue-500 hover:bg-blue-600 text-white"
    }
    return "bg-gray-900 hover:bg-gray-800 text-white"
  }

  return (
    <button
      onClick={() => onClick(choice)}
      disabled={disabled}
      className={`
        w-full p-4 sm:p-6 rounded-xl font-semibold text-base sm:text-lg
        transform transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]
        shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed
        min-h-[80px] sm:min-h-[100px] md:min-h-[120px]
        ${getButtonStyle(choice)}
      `}
    >
      <div className="flex items-start gap-2 sm:gap-3 h-full">
        <span className="flex-shrink-0 w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-white bg-opacity-20 flex items-center justify-center font-bold text-sm sm:text-base mt-1">
          {choice}
        </span>
        <div className="flex-1 flex items-center justify-center min-w-0">
          <span 
            className="text-center leading-relaxed"
            style={{
              wordBreak: 'break-word',
              wordWrap: 'break-word',
              overflowWrap: 'break-word',
              hyphens: 'auto'
            }}
          >
            {option}
          </span>
        </div>
      </div>
    </button>
  )
}
