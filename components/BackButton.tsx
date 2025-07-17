"use client"

import { useRouter } from "next/navigation"

interface BackButtonProps {
  className?: string
  children?: React.ReactNode
  href?: string
}

export default function BackButton({ className = "", children, href = "/" }: BackButtonProps) {
  const router = useRouter()

  return (
    <button
      onClick={() => router.push(href)}
      className={`
        flex items-center gap-2 text-gray-600 hover:text-gray-900 
        transition-colors font-medium
        ${className}
      `}
    >
      <div className="w-6 h-6 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors">
        <svg 
          width="12" 
          height="12" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        >
          <path d="m15 18-6-6 6-6"/>
        </svg>
      </div>
      {children || <span>홈으로</span>}
    </button>
  )
} 