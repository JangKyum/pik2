"use client"

interface ChoiceButtonProps {
  option: string
  choice: "A" | "B"
  onClick: (choice: "A" | "B") => void
  disabled?: boolean
}

export default function ChoiceButton({ option, choice, onClick, disabled }: ChoiceButtonProps) {
  const getButtonStyle = (choice: "A" | "B") => {
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
        w-full p-6 rounded-xl font-semibold text-lg
        transform transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]
        shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed
        ${getButtonStyle(choice)}
      `}
    >
      <div className="flex items-center justify-center gap-3">
        <span className="w-8 h-8 rounded-full bg-white bg-opacity-20 flex items-center justify-center font-bold">
          {choice}
        </span>
        <span>{option}</span>
      </div>
    </button>
  )
}
