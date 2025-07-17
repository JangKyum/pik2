export interface Question {
  id: string
  category: string
  question: string
  optionA: string
  optionB: string
  votesA: number
  votesB: number
}

export interface CustomQuestionSet {
  id: string
  title: string
  category: string
  questions: Question[]
  isWorldCup: boolean
  worldCupRounds?: number
  createdAt: string
  shareCode?: string
}

export interface GameSession {
  type: "random" | "custom" | "worldcup"
  category?: string
  questions: Question[]
  currentIndex: number
  answers: Array<{ questionId: string; choice: "A" | "B" }>
  isCompleted: boolean
  customSetId?: string
  // 월드컵 관련 필드
  worldCupRounds?: number
  currentRound?: number
  roundQuestions?: Question[]
  winners?: Question[]
}

export interface WorldCupMatch {
  round: number
  matchIndex: number
  questionA: Question
  questionB: Question
}

// 초기 질문 데이터 임포트
import initialQuestionsData from "../data/questions.json"

export const getStoredQuestions = (): Question[] => {
  if (typeof window === "undefined") return []

  const stored = localStorage.getItem("pik2-questions")
  if (stored) {
    return JSON.parse(stored)
  }
  return []
}

export const saveQuestions = (questions: Question[]) => {
  if (typeof window === "undefined") return
  localStorage.setItem("pik2-questions", JSON.stringify(questions))
}

export const updateQuestionVotes = (questionId: string, choice: "A" | "B") => {
  const questions = getStoredQuestions()
  const questionIndex = questions.findIndex((q) => q.id === questionId)

  if (questionIndex !== -1) {
    if (choice === "A") {
      questions[questionIndex].votesA += 1
    } else {
      questions[questionIndex].votesB += 1
    }
    saveQuestions(questions)
  }
}

// 초기 데이터 로드 함수
export const initializeQuestions = () => {
  const stored = getStoredQuestions()
  if (stored.length === 0) {
    // 초기 데이터 로드
    saveQuestions(initialQuestionsData as Question[])
    return initialQuestionsData as Question[]
  }
  return stored
}

// 게임 세션 관리
export const getCurrentSession = (): GameSession | null => {
  if (typeof window === "undefined") return null
  const stored = localStorage.getItem("pik2-current-session")
  return stored ? JSON.parse(stored) : null
}

export const saveCurrentSession = (session: GameSession) => {
  if (typeof window === "undefined") return
  localStorage.setItem("pik2-current-session", JSON.stringify(session))
}

export const clearCurrentSession = () => {
  if (typeof window === "undefined") return
  localStorage.removeItem("pik2-current-session")
}

// 월드컵 토너먼트 관련 함수들
export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

export function createWorldCupBracket(questions: Question[], rounds: number): Question[] {
  const shuffled = shuffleArray(questions)
  return shuffled.slice(0, rounds)
}

export function getNextRoundQuestions(winners: Question[]): Question[] {
  return shuffleArray(winners)
}

// 공유 코드 생성
export const generateShareCode = (): string => {
  return Math.random().toString(36).substring(2, 8).toUpperCase()
}
