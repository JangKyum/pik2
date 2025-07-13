import type { Question } from "./storage"
import questionsData from "../data/questions.json"

export const getRandomQuestion = (excludeId?: string): Question => {
  const availableQuestions = questionsData.filter((q) => q.id !== excludeId)
  const randomIndex = Math.floor(Math.random() * availableQuestions.length)
  return availableQuestions[randomIndex] as Question
}

export const getQuestionById = (id: string): Question | null => {
  return (questionsData.find((q) => q.id === id) as Question) || null
}

export const getQuestionsByCategory = (category: string, count = 10): Question[] => {
  const categoryQuestions = questionsData.filter((q) => q.category === category) as Question[]

  // 셔플 함수
  const shuffled = [...categoryQuestions].sort(() => 0.5 - Math.random())

  return shuffled.slice(0, Math.min(count, shuffled.length))
}

export const getAllCategories = (): string[] => {
  const categories = new Set(questionsData.map((q) => q.category))
  return Array.from(categories)
}
