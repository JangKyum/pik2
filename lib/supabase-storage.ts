import { typedSupabase } from './supabase'
import type { CustomQuestionSet, Question, Choice } from './storage'

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

// Supabase에서 커스텀 질문 세트 업데이트
export const updateCustomQuestionSetInDB = async (questionSet: CustomQuestionSet): Promise<boolean> => {
  try {
    const { error } = await typedSupabase
      .from('custom_question_sets')
      .update({
        title: questionSet.title,
        category: questionSet.category,
        questions: questionSet.questions,
        is_world_cup: questionSet.isWorldCup,
        world_cup_rounds: questionSet.worldCupRounds,
        share_code: questionSet.shareCode || '',
      })
      .eq('id', questionSet.id)

    if (error) {
      console.error('Error updating custom question set:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Error updating custom question set:', error)
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
    // 먼저 기존 질문 세트가 있는지 확인
    const existingSet = await getCustomQuestionSetByIdFromDB(questionSet.id)
    
    let dbSuccess = false
    
    if (existingSet) {
      // 기존 질문 세트가 있으면 업데이트
      dbSuccess = await updateCustomQuestionSetInDB(questionSet)
    } else {
      // 기존 질문 세트가 없으면 새로 생성
      dbSuccess = await saveCustomQuestionSetToDB(questionSet)
    }
    
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

// 투표 통계 가져오기
export const getQuestionVotesFromDB = async (questionId: string): Promise<{ votesA: number; votesB: number }> => {
  try {
    const { data, error } = await typedSupabase
      .from('question_votes')
      .select('votes_a, votes_b')
      .eq('question_id', questionId)
      .single()

    if (error) {
      console.error('Error fetching question votes:', error)
      return { votesA: 0, votesB: 0 }
    }

    return {
      votesA: data?.votes_a || 0,
      votesB: data?.votes_b || 0
    }
  } catch (error) {
    console.error('Error fetching question votes:', error)
    return { votesA: 0, votesB: 0 }
  }
}

// 투표 업데이트 (UPSERT)
export const updateQuestionVotesInDB = async (
  questionId: string, 
  questionSetId: string, 
  choice: Choice
): Promise<boolean> => {
  try {
    // 기존 데이터 확인을 위해 더 안전한 방식 사용
    const { data: existingVotes, error: selectError } = await typedSupabase
      .from('question_votes')
      .select('votes_a, votes_b')
      .eq('question_id', questionId)
      .eq('question_set_id', questionSetId)

    if (selectError) {
      // 406 오류는 무시 (기능에는 영향 없음)
      // console.error('Error checking existing vote:', selectError)
    }

    const existingVote = existingVotes && existingVotes.length > 0 ? existingVotes[0] : null
    let newVotesA = 0
    let newVotesB = 0

    if (existingVote) {
      // 기존 데이터가 있으면 업데이트
      newVotesA = existingVote.votes_a + (choice === "A" ? 1 : 0)
      newVotesB = existingVote.votes_b + (choice === "B" ? 1 : 0)

      const { error: updateError } = await typedSupabase
        .from('question_votes')
        .update({
          votes_a: newVotesA,
          votes_b: newVotesB,
          updated_at: new Date().toISOString()
        })
        .eq('question_id', questionId)
        .eq('question_set_id', questionSetId)

      if (updateError) {
        console.error('Error updating question votes:', updateError)
        return false
      }
    } else {
      // 기존 데이터가 없으면 새로 생성
      newVotesA = choice === "A" ? 1 : 0
      newVotesB = choice === "B" ? 1 : 0

      const { error: insertError } = await typedSupabase
        .from('question_votes')
        .insert({
          question_id: questionId,
          question_set_id: questionSetId,
          votes_a: newVotesA,
          votes_b: newVotesB,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })

      if (insertError) {
        console.error('Error creating question votes:', insertError)
        return false
      }
    }

    return true
  } catch (error) {
    console.error('Error updating question votes:', error)
    return false
  }
}

// 질문 세트의 모든 질문에 대한 투표 통계 가져오기
export const getQuestionSetVotesFromDB = async (questionSetId: string): Promise<Record<string, { votesA: number; votesB: number }>> => {
  try {
    const { data, error } = await typedSupabase
      .from('question_votes')
      .select('question_id, votes_a, votes_b')
      .eq('question_set_id', questionSetId)

    if (error) {
      console.error('Error fetching question set votes:', error)
      return {}
    }

    const votesMap: Record<string, { votesA: number; votesB: number }> = {}
    data?.forEach(vote => {
      votesMap[vote.question_id] = {
        votesA: vote.votes_a,
        votesB: vote.votes_b
      }
    })

    return votesMap
  } catch (error) {
    console.error('Error fetching question set votes:', error)
    return {}
  }
}

// 멀티 게임에서 각 질문의 전체 투표 통계 가져오기 (모든 멀티 게임 세션 집계)
export const getMultiGameQuestionVotesFromDB = async (questionIds: string[]): Promise<Record<string, { votesA: number; votesB: number }>> => {
  try {
    // 입력 검증
    if (!questionIds || questionIds.length === 0) {
      return {}
    }

    // 먼저 모든 멀티 게임 투표 데이터를 가져오기
    const { data, error } = await typedSupabase
      .from('question_votes')
      .select('question_id, votes_a, votes_b')
      .like('question_set_id', 'multi-%')

    if (error) {
      console.error('Error fetching multi-game question votes:', error)
      return {}
    }

    const votesMap: Record<string, { votesA: number; votesB: number }> = {}
    
    // 각 질문별로 모든 멀티 게임 세션의 투표를 집계
    questionIds.forEach(questionId => {
      const questionVotes = data?.filter(vote => vote.question_id === questionId) || []
      
      const totalVotesA = questionVotes.reduce((sum, vote) => sum + (vote.votes_a || 0), 0)
      const totalVotesB = questionVotes.reduce((sum, vote) => sum + (vote.votes_b || 0), 0)
      
      votesMap[questionId] = {
        votesA: totalVotesA,
        votesB: totalVotesB
      }
    })

    return votesMap
  } catch (error) {
    console.error('Error fetching multi-game question votes:', error)
    return {}
  }
} 