"use client"

import { useState, useEffect } from "react"
import type { Question } from "../lib/storage"
import { initializeQuestions, saveQuestions } from "../lib/storage"

export const useQuestion = () => {
  const [questions, setQuestions] = useState<Question[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const questions = initializeQuestions()
    setQuestions(questions)
    setIsLoading(false)
  }, [])

  const updateQuestion = (updatedQuestion: Question) => {
    const updatedQuestions = questions.map((q) => (q.id === updatedQuestion.id ? updatedQuestion : q))
    setQuestions(updatedQuestions)
    saveQuestions(updatedQuestions)
  }

  const getQuestion = (id: string): Question | undefined => {
    return questions.find((q) => q.id === id)
  }

  return {
    questions,
    updateQuestion,
    getQuestion,
    isLoading,
  }
}
