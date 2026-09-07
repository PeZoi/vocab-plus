export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      ai_provider_configs: {
        Row: {
          api_key: string | null
          created_at: string | null
          display_name: string | null
          id: string
          is_active: boolean | null
          is_default: boolean | null
          model: string
          provider_name: string
          updated_at: string | null
        }
        Insert: {
          api_key?: string | null
          created_at?: string | null
          display_name?: string | null
          id?: string
          is_active?: boolean | null
          is_default?: boolean | null
          model: string
          provider_name: string
          updated_at?: string | null
        }
        Update: {
          api_key?: string | null
          created_at?: string | null
          display_name?: string | null
          id?: string
          is_active?: boolean | null
          is_default?: boolean | null
          model?: string
          provider_name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      cards: {
        Row: {
          audio_url: string | null
          card_type: string | null
          cefr_level: string | null
          collocations: Json | null
          created_at: string | null
          definition: string
          definition_en: string | null
          example_sentence: string | null
          example_translation: string | null
          id: string
          image_url: string | null
          ipa: string | null
          mnemonic: string | null
          owner_id: string | null
          part_of_speech: string | null
          sense_number: number | null
          source_type: string | null
          tags: string[] | null
          word: string
          word_family: Json | null
        }
        Insert: {
          audio_url?: string | null
          card_type?: string | null
          cefr_level?: string | null
          collocations?: Json | null
          created_at?: string | null
          definition: string
          definition_en?: string | null
          example_sentence?: string | null
          example_translation?: string | null
          id?: string
          image_url?: string | null
          ipa?: string | null
          mnemonic?: string | null
          owner_id?: string | null
          part_of_speech?: string | null
          sense_number?: number | null
          source_type?: string | null
          tags?: string[] | null
          word: string
          word_family?: Json | null
        }
        Update: {
          audio_url?: string | null
          card_type?: string | null
          cefr_level?: string | null
          collocations?: Json | null
          created_at?: string | null
          definition?: string
          definition_en?: string | null
          example_sentence?: string | null
          example_translation?: string | null
          id?: string
          image_url?: string | null
          ipa?: string | null
          mnemonic?: string | null
          owner_id?: string | null
          part_of_speech?: string | null
          sense_number?: number | null
          source_type?: string | null
          tags?: string[] | null
          word?: string
          word_family?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "cards_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      collection_cards: {
        Row: {
          added_at: string
          card_id: string
          collection_id: string
          display_order: number
          id: string
        }
        Insert: {
          added_at?: string
          card_id: string
          collection_id: string
          display_order?: number
          id?: string
        }
        Update: {
          added_at?: string
          card_id?: string
          collection_id?: string
          display_order?: number
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "collection_cards_card_id_fkey"
            columns: ["card_id"]
            isOneToOne: false
            referencedRelation: "cards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "collection_cards_collection_id_fkey"
            columns: ["collection_id"]
            isOneToOne: false
            referencedRelation: "collections"
            referencedColumns: ["id"]
          },
        ]
      }
      collection_likes: {
        Row: {
          collection_id: string
          created_at: string
          user_id: string
        }
        Insert: {
          collection_id: string
          created_at?: string
          user_id: string
        }
        Update: {
          collection_id?: string
          created_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "collection_likes_collection_id_fkey"
            columns: ["collection_id"]
            isOneToOne: false
            referencedRelation: "collections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "collection_likes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      collections: {
        Row: {
          category: string
          cover_image: string | null
          created_at: string
          creator_id: string
          description: string | null
          fork_count: number
          id: string
          is_public: boolean
          likes_count: number
          tags: string[]
          title: string
          updated_at: string
        }
        Insert: {
          category?: string
          cover_image?: string | null
          created_at?: string
          creator_id: string
          description?: string | null
          fork_count?: number
          id?: string
          is_public?: boolean
          likes_count?: number
          tags?: string[]
          title: string
          updated_at?: string
        }
        Update: {
          category?: string
          cover_image?: string | null
          created_at?: string
          creator_id?: string
          description?: string | null
          fork_count?: number
          id?: string
          is_public?: boolean
          likes_count?: number
          tags?: string[]
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "collections_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      imported_texts: {
        Row: {
          created_at: string | null
          detected_words: Json | null
          id: string
          raw_text: string
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          detected_words?: Json | null
          id?: string
          raw_text: string
          title?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          detected_words?: Json | null
          id?: string
          raw_text?: string
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "imported_texts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          display_name: string | null
          golden_hours: Json | null
          id: string
          role: string | null
          telegram_chat_id: number | null
          timezone: string | null
          xp: number | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          display_name?: string | null
          golden_hours?: Json | null
          id: string
          role?: string | null
          telegram_chat_id?: number | null
          timezone?: string | null
          xp?: number | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          display_name?: string | null
          golden_hours?: Json | null
          id?: string
          role?: string | null
          telegram_chat_id?: number | null
          timezone?: string | null
          xp?: number | null
        }
        Relationships: []
      }
      review_logs: {
        Row: {
          card_id: string | null
          id: number
          rating: number | null
          response_ms: number | null
          reviewed_at: string | null
          user_id: string | null
        }
        Insert: {
          card_id?: string | null
          id?: never
          rating?: number | null
          response_ms?: number | null
          reviewed_at?: string | null
          user_id?: string | null
        }
        Update: {
          card_id?: string | null
          id?: never
          rating?: number | null
          response_ms?: number | null
          reviewed_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "review_logs_card_id_fkey"
            columns: ["card_id"]
            isOneToOne: false
            referencedRelation: "cards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "review_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_cards: {
        Row: {
          card_id: string | null
          difficulty: number | null
          due_at: string | null
          id: string
          is_leech: boolean | null
          lapse_count: number | null
          review_count: number | null
          stability: number | null
          state: string | null
          user_id: string | null
        }
        Insert: {
          card_id?: string | null
          difficulty?: number | null
          due_at?: string | null
          id?: string
          is_leech?: boolean | null
          lapse_count?: number | null
          review_count?: number | null
          stability?: number | null
          state?: string | null
          user_id?: string | null
        }
        Update: {
          card_id?: string | null
          difficulty?: number | null
          due_at?: string | null
          id?: string
          is_leech?: boolean | null
          lapse_count?: number | null
          review_count?: number | null
          stability?: number | null
          state?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_cards_card_id_fkey"
            columns: ["card_id"]
            isOneToOne: false
            referencedRelation: "cards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_cards_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_collections: {
        Row: {
          collection_id: string
          id: string
          is_pinned: boolean
          saved_at: string
          user_id: string
        }
        Insert: {
          collection_id: string
          id?: string
          is_pinned?: boolean
          saved_at?: string
          user_id: string
        }
        Update: {
          collection_id?: string
          id?: string
          is_pinned?: boolean
          saved_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_collections_collection_id_fkey"
            columns: ["collection_id"]
            isOneToOne: false
            referencedRelation: "collections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_collections_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_admin: { Args: never; Returns: boolean }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
