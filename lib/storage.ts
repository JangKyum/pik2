export interface Question {
  id: string
  category: string
  question: string
  optionA: string
  optionB: string
  votesA: number
  votesB: number
}

export type Choice = "A" | "B"

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
  answers: Array<{ questionId: string; choice: Choice }>
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

export const updateQuestionVotes = (questionId: string, choice: Choice) => {
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
  // 월드컵 모드에서는 각 질문의 A, B 선택지를 개별 질문으로 변환
  const individuals: Question[] = []
  
  questions.forEach((q, index) => {
    // optionA를 개별 질문으로 변환
    individuals.push({
      id: `${q.id}_A`,
      category: q.category,
      question: q.optionA, // 캐릭터/옵션 이름이 질문이 됨
      optionA: q.optionA,
      optionB: q.optionA, // 동일하게 설정 (실제로는 사용하지 않음)
      votesA: 0,
      votesB: 0
    })
    
    // optionB를 개별 질문으로 변환
    individuals.push({
      id: `${q.id}_B`,
      category: q.category,
      question: q.optionB, // 캐릭터/옵션 이름이 질문이 됨
      optionA: q.optionB,
      optionB: q.optionB, // 동일하게 설정 (실제로는 사용하지 않음)
      votesA: 0,
      votesB: 0
    })
  })
  
  // 개별 캐릭터들을 셔플
  const shuffled = shuffleArray(individuals)
  
  // 필요한 수만큼 선택 (보통 individuals.length와 rounds가 같아야 함)
  if (shuffled.length < rounds) {
    // 질문이 부족하면 중복해서 사용
    const needed = rounds - shuffled.length
    for (let i = 0; i < needed; i++) {
      shuffled.push(shuffled[i % shuffled.length])
    }
  }
  
  return shuffled.slice(0, rounds)
}

export function getNextRoundQuestions(winners: Question[]): Question[] {
  // 승자들은 순서대로 다음 라운드에 진출 (셔플하지 않음)
  // 토너먼트 브라켓 순서 유지
  return winners
}

// 공유 코드 생성
export const generateShareCode = (): string => {
  return Math.random().toString(36).substring(2, 8).toUpperCase()
}

// 현재 질문 관련 함수들
export const getCurrentQuestion = (): Question | null => {
  const session = getCurrentSession()
  if (!session || session.currentIndex >= session.questions.length) {
    return null
  }
  return session.questions[session.currentIndex]
}

export const setCurrentQuestion = (questionId: string) => {
  const session = getCurrentSession()
  if (session) {
    const questionIndex = session.questions.findIndex(q => q.id === questionId)
    if (questionIndex !== -1) {
      session.currentIndex = questionIndex
      saveCurrentSession(session)
    }
  }
}

// 마지막 선택 관련 함수들
export const getLastChoice = (): Choice | null => {
  if (typeof window === "undefined") return null
  const stored = localStorage.getItem("pik2-last-choice")
  return stored as Choice | null
}

export const setLastChoice = (choice: Choice) => {
  if (typeof window === "undefined") return
  localStorage.setItem("pik2-last-choice", choice)
}
