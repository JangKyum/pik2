import { typedSupabase } from './supabase'
import type { CustomQuestionSet, Question } from './storage'

// Supabase에서 커스텀 질문 세트 목록 가져오기
export const getCustomQuestionSetsFromDB = async (): Promise<CustomQuestionSet[]> => {
  try {
    const { data, error } = await typedSupabase
      .from('custom_question_sets')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching custom question sets:', error)
      return []
    }

    return data?.map((row) => ({
      id: row.id,
      title: row.title,
      category: row.category,
      questions: row.questions,
      isWorldCup: row.is_world_cup,
      worldCupRounds: row.world_cup_rounds,
      createdAt: row.created_at,
      shareCode: row.share_code,
    })) || []
  } catch (error) {
    console.error('Error fetching custom question sets:', error)
    return []
  }
}

// Supabase에 커스텀 질문 세트 저장
export const saveCustomQuestionSetToDB = async (questionSet: CustomQuestionSet): Promise<boolean> => {
  try {
    const { error } = await typedSupabase
      .from('custom_question_sets')
      .insert({
        id: questionSet.id,
        title: questionSet.title,
        category: questionSet.category,
        questions: questionSet.questions,
        is_world_cup: questionSet.isWorldCup,
        world_cup_rounds: questionSet.worldCupRounds,
        created_at: questionSet.createdAt,
        share_code: questionSet.shareCode || '',
      })

    if (error) {
      console.error('Error saving custom question set:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Error saving custom question set:', error)
    return false
  }
}

// Supabase에서 특정 커스텀 질문 세트 가져오기
export const getCustomQuestionSetByIdFromDB = async (id: string): Promise<CustomQuestionSet | null> => {
  try {
    const { data, error } = await typedSupabase
      .from('custom_question_sets')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      console.error('Error fetching custom question set:', error)
      return null
    }

    if (!data) return null

    return {
      id: data.id,
      title: data.title,
      category: data.category,
      questions: data.questions,
      isWorldCup: data.is_world_cup,
      worldCupRounds: data.world_cup_rounds,
      createdAt: data.created_at,
      shareCode: data.share_code,
    }
  } catch (error) {
    console.error('Error fetching custom question set:', error)
    return null
  }
}

// Supabase에서 커스텀 질문 세트 삭제
export const deleteCustomQuestionSetFromDB = async (id: string): Promise<boolean> => {
  try {
    const { error } = await typedSupabase
      .from('custom_question_sets')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting custom question set:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Error deleting custom question set:', error)
    return false
  }
}

// 로컬 스토리지에서 Supabase로 마이그레이션
export const migrateLocalToSupabase = async (): Promise<boolean> => {
  try {
    // 로컬 스토리지에서 데이터 가져오기
    const localSets = localStorage.getItem('pik2-custom-sets')
    if (!localSets) return true

    const localData: CustomQuestionSet[] = JSON.parse(localSets)
    
    // 각 로컬 데이터를 Supabase에 저장
    for (const set of localData) {
      const success = await saveCustomQuestionSetToDB(set)
      if (!success) {
        console.error(`Failed to migrate set: ${set.id}`)
        return false
      }
    }

    // 마이그레이션 완료 후 로컬 데이터 삭제
    localStorage.removeItem('pik2-custom-sets')
    return true
  } catch (error) {
    console.error('Error during migration:', error)
    return false
  }
}

// 하이브리드 접근 방식: Supabase 실패 시 로컬 스토리지로 폴백
export const getCustomQuestionSetsHybrid = async (): Promise<CustomQuestionSet[]> => {
  try {
    // 먼저 Supabase에서 시도
    const dbSets = await getCustomQuestionSetsFromDB()
    if (dbSets.length > 0) {
      return dbSets
    }

    // Supabase에 데이터가 없으면 로컬 스토리지에서 가져오기
    const localSets = localStorage.getItem('pik2-custom-sets')
    if (localSets) {
      const localData: CustomQuestionSet[] = JSON.parse(localSets)
      // 로컬 데이터를 Supabase로 마이그레이션 시도
      await migrateLocalToSupabase()
      return localData
    }

    return []
  } catch (error) {
    console.error('Error in hybrid approach:', error)
    // 에러 발생 시 로컬 스토리지로 폴백
    const localSets = localStorage.getItem('pik2-custom-sets')
    return localSets ? JSON.parse(localSets) : []
  }
}

export const saveCustomQuestionSetHybrid = async (questionSet: CustomQuestionSet): Promise<boolean> => {
  try {
    // Supabase에 저장 시도
    const dbSuccess = await saveCustomQuestionSetToDB(questionSet)
    
    if (dbSuccess) {
      // 성공하면 로컬 스토리지도 업데이트
      const sets = JSON.parse(localStorage.getItem('pik2-custom-sets') || '[]')
      const existingIndex = sets.findIndex((s: CustomQuestionSet) => s.id === questionSet.id)
      
      if (existingIndex !== -1) {
        sets[existingIndex] = questionSet
      } else {
        sets.push(questionSet)
      }
      
      localStorage.setItem('pik2-custom-sets', JSON.stringify(sets))
      return true
    }

    // Supabase 실패 시 로컬 스토리지에만 저장
    const sets = JSON.parse(localStorage.getItem('pik2-custom-sets') || '[]')
    const existingIndex = sets.findIndex((s: CustomQuestionSet) => s.id === questionSet.id)
    
    if (existingIndex !== -1) {
      sets[existingIndex] = questionSet
    } else {
      sets.push(questionSet)
    }
    
    localStorage.setItem('pik2-custom-sets', JSON.stringify(sets))
    return true
  } catch (error) {
    console.error('Error saving question set:', error)
    return false
  }
} 