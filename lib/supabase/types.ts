export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          display_name: string | null
          target_band: number
          current_estimated_band: number | null
          weekly_speaking_goal: number
          weekly_listening_goal: number
          weekly_vocab_goal: number
          streak_days: number
          last_practice_date: string | null
          created_at: string
        }
        Insert: {
          id: string
          display_name?: string | null
          target_band?: number
          current_estimated_band?: number | null
          weekly_speaking_goal?: number
          weekly_listening_goal?: number
          weekly_vocab_goal?: number
          streak_days?: number
          last_practice_date?: string | null
          created_at?: string
        }
        Update: {
          display_name?: string | null
          target_band?: number
          current_estimated_band?: number | null
          weekly_speaking_goal?: number
          weekly_listening_goal?: number
          weekly_vocab_goal?: number
          streak_days?: number
          last_practice_date?: string | null
        }
      }
      speaking_sessions: {
        Row: {
          id: string
          user_id: string
          part: number
          level: number
          questions: Json
          responses: Json | null
          scores: Json | null
          model_answers: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          part: number
          level?: number
          questions: Json
          responses?: Json | null
          scores?: Json | null
          model_answers?: Json | null
          created_at?: string
        }
        Update: {
          level?: number
          responses?: Json | null
          scores?: Json | null
          model_answers?: Json | null
        }
      }
      personal_answers: {
        Row: {
          id: string
          user_id: string
          topic: string
          part: number
          question: string
          personal_details: Json
          model_answer: string
          upgrade_phrases: Json | null
          grammar_patterns: Json | null
          speaking_tips: Json | null
          times_practiced: number
          best_band: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          topic: string
          part: number
          question: string
          personal_details: Json
          model_answer: string
          upgrade_phrases?: Json | null
          grammar_patterns?: Json | null
          speaking_tips?: Json | null
          times_practiced?: number
          best_band?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          personal_details?: Json
          model_answer?: string
          upgrade_phrases?: Json | null
          grammar_patterns?: Json | null
          speaking_tips?: Json | null
          times_practiced?: number
          best_band?: number | null
          updated_at?: string
        }
      }
      listening_sessions: {
        Row: {
          id: string
          user_id: string
          section: number
          level: number
          script: string
          questions: Json
          user_answers: Json | null
          correct_answers: Json
          score: number | null
          band_estimate: number | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          section: number
          level?: number
          script: string
          questions: Json
          user_answers?: Json | null
          correct_answers: Json
          score?: number | null
          band_estimate?: number | null
          created_at?: string
        }
        Update: {
          user_answers?: Json | null
          score?: number | null
          band_estimate?: number | null
        }
      }
      vocabulary: {
        Row: {
          id: string
          user_id: string
          word: string
          pronunciation: string | null
          definition: string | null
          example_sentence: string | null
          part_of_speech: string | null
          ielts_topic: string | null
          source_type: string | null
          source_session_id: string | null
          srs_box: number
          next_review_date: string
          times_reviewed: number
          times_correct: number
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          word: string
          pronunciation?: string | null
          definition?: string | null
          example_sentence?: string | null
          part_of_speech?: string | null
          ielts_topic?: string | null
          source_type?: string | null
          source_session_id?: string | null
          srs_box?: number
          next_review_date?: string
          times_reviewed?: number
          times_correct?: number
          created_at?: string
        }
        Update: {
          srs_box?: number
          next_review_date?: string
          times_reviewed?: number
          times_correct?: number
        }
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
  }
}

// Convenience types
export type Profile = Database['public']['Tables']['profiles']['Row']
export type SpeakingSession = Database['public']['Tables']['speaking_sessions']['Row']
export type ListeningSession = Database['public']['Tables']['listening_sessions']['Row']
export type VocabularyWord = Database['public']['Tables']['vocabulary']['Row']
export type PersonalAnswerRow = Database['public']['Tables']['personal_answers']['Row']
