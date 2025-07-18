import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// 환경 변수 검증
if (!supabaseUrl) {
  throw new Error('NEXT_PUBLIC_SUPABASE_URL is required')
}

if (!supabaseAnonKey) {
  throw new Error('NEXT_PUBLIC_SUPABASE_ANON_KEY is required')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// 데이터베이스 테이블 타입 정의
export interface Database {
  public: {
    Tables: {
      custom_question_sets: {
        Row: {
          id: string
          title: string
          category: string
          questions: any // JSON 형태로 저장
          is_world_cup: boolean
          world_cup_rounds?: number
          created_at: string
          share_code: string
          user_id?: string // 향후 사용자 인증을 위해
        }
        Insert: {
          id?: string
          title: string
          category: string
          questions: any
          is_world_cup: boolean
          world_cup_rounds?: number
          created_at?: string
          share_code: string
          user_id?: string
        }
        Update: {
          id?: string
          title?: string
          category?: string
          questions?: any
          is_world_cup?: boolean
          world_cup_rounds?: number
          created_at?: string
          share_code?: string
          user_id?: string
        }
      }
      question_votes: {
        Row: {
          id: string
          question_id: string
          question_set_id: string
          votes_a: number
          votes_b: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          question_id: string
          question_set_id: string
          votes_a?: number
          votes_b?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          question_id?: string
          question_set_id?: string
          votes_a?: number
          votes_b?: number
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}

// 타입이 지정된 Supabase 클라이언트
export const typedSupabase = createClient<Database>(supabaseUrl, supabaseAnonKey) 