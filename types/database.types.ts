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
      daily_quests: {
        Row: {
          created_at: string
          date: string
          id: string
          is_completed: boolean
          progress: number
          quest_type: Database["public"]["Enums"]["quest_type"]
          reward_xp: number
          target: number
          title: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          date: string
          id?: string
          is_completed?: boolean
          progress?: number
          quest_type: Database["public"]["Enums"]["quest_type"]
          reward_xp?: number
          target: number
          title?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          date?: string
          id?: string
          is_completed?: boolean
          progress?: number
          quest_type?: Database["public"]["Enums"]["quest_type"]
          reward_xp?: number
          target?: number
          title?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "daily_quests_user_id_fkey"
            columns: ["user_id"]
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
      league_seasons: {
        Row: {
          created_at: string
          end_date: string
          id: string
          reset_at: string
          reset_by: string | null
          season_number: number
          start_date: string
          title: string
          top_podium: Json
          total_participants: number
        }
        Insert: {
          created_at?: string
          end_date: string
          id?: string
          reset_at?: string
          reset_by?: string | null
          season_number?: number
          start_date: string
          title: string
          top_podium?: Json
          total_participants?: number
        }
        Update: {
          created_at?: string
          end_date?: string
          id?: string
          reset_at?: string
          reset_by?: string | null
          season_number?: number
          start_date?: string
          title?: string
          top_podium?: Json
          total_participants?: number
        }
        Relationships: []
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
          telegram_last_notified_at: string | null
          telegram_last_notified_milestone: number | null
          telegram_notifications_enabled: boolean | null
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
          telegram_last_notified_at?: string | null
          telegram_last_notified_milestone?: number | null
          telegram_notifications_enabled?: boolean | null
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
          telegram_last_notified_at?: string | null
          telegram_last_notified_milestone?: number | null
          telegram_notifications_enabled?: boolean | null
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
      system_settings: {
        Row: {
          description: string | null
          key: string
          updated_at: string
          updated_by: string | null
          value: Json
        }
        Insert: {
          description?: string | null
          key: string
          updated_at?: string
          updated_by?: string | null
          value: Json
        }
        Update: {
          description?: string | null
          key?: string
          updated_at?: string
          updated_by?: string | null
          value?: Json
        }
        Relationships: []
      }
      telegram_link_tokens: {
        Row: {
          created_at: string
          expires_at: string
          id: string
          token: string
          user_id: string
        }
        Insert: {
          created_at?: string
          expires_at: string
          id?: string
          token: string
          user_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string
          id?: string
          token?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "telegram_link_tokens_user_id_fkey"
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
      user_daily_xp: {
        Row: {
          created_at: string
          date: string
          id: string
          updated_at: string
          user_id: string
          xp_earned: number
        }
        Insert: {
          created_at?: string
          date: string
          id?: string
          updated_at?: string
          user_id: string
          xp_earned?: number
        }
        Update: {
          created_at?: string
          date?: string
          id?: string
          updated_at?: string
          user_id?: string
          xp_earned?: number
        }
        Relationships: [
          {
            foreignKeyName: "user_daily_xp_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_leagues: {
        Row: {
          created_at: string
          last_season_rank: number | null
          league: Database["public"]["Enums"]["league_tier"]
          updated_at: string
          user_id: string
          weekly_xp: number
        }
        Insert: {
          created_at?: string
          last_season_rank?: number | null
          league?: Database["public"]["Enums"]["league_tier"]
          updated_at?: string
          user_id: string
          weekly_xp?: number
        }
        Update: {
          created_at?: string
          last_season_rank?: number | null
          league?: Database["public"]["Enums"]["league_tier"]
          updated_at?: string
          user_id?: string
          weekly_xp?: number
        }
        Relationships: [
          {
            foreignKeyName: "user_leagues_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_season_history: {
        Row: {
          created_at: string
          id: string
          league_tier: Database["public"]["Enums"]["league_tier"]
          rank_position: number
          season_id: string
          user_id: string
          weekly_xp: number
          zone: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          league_tier?: Database["public"]["Enums"]["league_tier"]
          rank_position: number
          season_id: string
          user_id: string
          weekly_xp?: number
          zone?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          league_tier?: Database["public"]["Enums"]["league_tier"]
          rank_position?: number
          season_id?: string
          user_id?: string
          weekly_xp?: number
          zone?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_season_history_season_id_fkey"
            columns: ["season_id"]
            isOneToOne: false
            referencedRelation: "league_seasons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_season_history_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_streaks: {
        Row: {
          created_at: string
          current_streak: number
          freezes_available: number
          last_active_date: string | null
          longest_streak: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_streak?: number
          freezes_available?: number
          last_active_date?: string | null
          longest_streak?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_streak?: number
          freezes_available?: number
          last_active_date?: string | null
          longest_streak?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_streaks_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
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
      admin_delete_cron_job: { Args: { p_jobname: string }; Returns: Json }
      admin_get_cron_jobs: { Args: Record<PropertyKey, never>; Returns: Json }
      admin_get_cron_run_details: {
        Args: { p_jobid?: number; p_status?: string; p_limit?: number }
        Returns: Json
      }
      admin_reset_all_leagues: { Args: { p_admin_id?: string }; Returns: Json }
      admin_save_cron_job: {
        Args: {
          p_jobname: string
          p_schedule: string
          p_command: string
          p_active?: boolean
        }
        Returns: Json
      }
      admin_toggle_cron_job: {
        Args: { p_jobid: number; p_active: boolean }
        Returns: Json
      }
      admin_trigger_cron_job: { Args: { p_jobname: string }; Returns: Json }
      admin_update_rank_reset_schedule: {
        Args: {
          p_day_of_week: number
          p_enabled: boolean
          p_time: string
          p_timezone?: string
        }
        Returns: Json
      }
      cron_get_telegram_due_reminders: {
        Args: Record<PropertyKey, never>
        Returns: {
          user_id: string
          display_name: string | null
          telegram_chat_id: number
          telegram_last_notified_milestone: number
          telegram_last_notified_at: string | null
          total_due: number
          sample_word: string | null
          sample_ipa: string | null
          sample_definition: string | null
        }[]
      }
      cron_update_telegram_last_notified: {
        Args: {
          p_user_id: string
          p_milestone: number
          p_notified_at?: string
        }
        Returns: undefined
      }
      is_admin: { Args: never; Returns: boolean }
      is_card_in_public_collection: {
        Args: { card_id_param: string }
        Returns: boolean
      }
      link_telegram_chat: {
        Args: { p_chat_id: number; p_token: string }
        Returns: Json
      }
      log_telegram_notification: {
        Args: {
          p_user_id: string
          p_chat_id: number
          p_title: string
          p_message: string
          p_type?: string
          p_status?: string
          p_error_message?: string | null
          p_metadata?: Json
        }
        Returns: string
      }
      send_telegram_due_reminders: {
        Args: { p_bot_token?: string }
        Returns: Json
      }
      settle_weekly_leagues: { Args: never; Returns: Json }
      unlink_telegram_chat: { Args: { p_chat_id: number }; Returns: Json }
    }
    Enums: {
      league_tier:
        | "unranked"
        | "iron"
        | "bronze"
        | "silver"
        | "platinum"
        | "emerald"
        | "diamond"
        | "master"
        | "grandmaster"
        | "challenger"
      quest_type: "review_cards" | "learn_new" | "accuracy" | "earn_xp"
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
    Enums: {
      league_tier: [
        "unranked",
        "iron",
        "bronze",
        "silver",
        "platinum",
        "emerald",
        "diamond",
        "master",
        "grandmaster",
        "challenger",
      ],
      quest_type: ["review_cards", "learn_new", "accuracy", "earn_xp"],
    },
  },
} as const
