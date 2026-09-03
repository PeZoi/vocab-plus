export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      ai_provider_configs: {
        Row: {
          api_key: string | null;
          created_at: string | null;
          display_name: string | null;
          id: string;
          is_active: boolean | null;
          is_default: boolean | null;
          model: string;
          provider_name: string;
          updated_at: string | null;
        };
        Insert: {
          api_key?: string | null;
          created_at?: string | null;
          display_name?: string | null;
          id?: string;
          is_active?: boolean | null;
          is_default?: boolean | null;
          model: string;
          provider_name: string;
          updated_at?: string | null;
        };
        Update: {
          api_key?: string | null;
          created_at?: string | null;
          display_name?: string | null;
          id?: string;
          is_active?: boolean | null;
          is_default?: boolean | null;
          model?: string;
          provider_name?: string;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      cards: {
        Row: {
          audio_url: string | null;
          card_type: string | null;
          created_at: string | null;
          definition: string;
          example_sentence: string | null;
          id: string;
          image_url: string | null;
          ipa: string | null;
          mnemonic: string | null;
          owner_id: string | null;
          part_of_speech: string | null;
          sense_number: number | null;
          source_type: string | null;
          word: string;
        };
        Insert: {
          audio_url?: string | null;
          card_type?: string | null;
          created_at?: string | null;
          definition: string;
          example_sentence?: string | null;
          id?: string;
          image_url?: string | null;
          ipa?: string | null;
          mnemonic?: string | null;
          owner_id?: string | null;
          part_of_speech?: string | null;
          sense_number?: number | null;
          source_type?: string | null;
          word: string;
        };
        Update: {
          audio_url?: string | null;
          card_type?: string | null;
          created_at?: string | null;
          definition?: string;
          example_sentence?: string | null;
          id?: string;
          image_url?: string | null;
          ipa?: string | null;
          mnemonic?: string | null;
          owner_id?: string | null;
          part_of_speech?: string | null;
          sense_number?: number | null;
          source_type?: string | null;
          word?: string;
        };
        Relationships: [
          {
            foreignKeyName: "cards_owner_id_fkey";
            columns: ["owner_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      profiles: {
        Row: {
          avatar_url: string | null;
          created_at: string | null;
          display_name: string | null;
          golden_hours: Json | null;
          id: string;
          role: string | null;
          telegram_chat_id: number | null;
          timezone: string | null;
          xp: number | null;
        };
        Insert: {
          avatar_url?: string | null;
          created_at?: string | null;
          display_name?: string | null;
          golden_hours?: Json | null;
          id: string;
          role?: string | null;
          telegram_chat_id?: number | null;
          timezone?: string | null;
          xp?: number | null;
        };
        Update: {
          avatar_url?: string | null;
          created_at?: string | null;
          display_name?: string | null;
          golden_hours?: Json | null;
          id?: string;
          role?: string | null;
          telegram_chat_id?: number | null;
          timezone?: string | null;
          xp?: number | null;
        };
        Relationships: [];
      };
      review_logs: {
        Row: {
          card_id: string | null;
          id: number;
          rating: number | null;
          response_ms: number | null;
          reviewed_at: string | null;
          user_id: string | null;
        };
        Insert: {
          card_id?: string | null;
          id?: never;
          rating?: number | null;
          response_ms?: number | null;
          reviewed_at?: string | null;
          user_id?: string | null;
        };
        Update: {
          card_id?: string | null;
          id?: never;
          rating?: number | null;
          response_ms?: number | null;
          reviewed_at?: string | null;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "review_logs_card_id_fkey";
            columns: ["card_id"];
            isOneToOne: false;
            referencedRelation: "cards";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "review_logs_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      user_cards: {
        Row: {
          card_id: string | null;
          difficulty: number | null;
          due_at: string | null;
          id: string;
          is_leech: boolean | null;
          lapse_count: number | null;
          review_count: number | null;
          stability: number | null;
          state: string | null;
          user_id: string | null;
        };
        Insert: {
          card_id?: string | null;
          difficulty?: number | null;
          due_at?: string | null;
          id?: string;
          is_leech?: boolean | null;
          lapse_count?: number | null;
          review_count?: number | null;
          stability?: number | null;
          state?: string | null;
          user_id?: string | null;
        };
        Update: {
          card_id?: string | null;
          difficulty?: number | null;
          due_at?: string | null;
          id?: string;
          is_leech?: boolean | null;
          lapse_count?: number | null;
          review_count?: number | null;
          stability?: number | null;
          state?: string | null;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "user_cards_card_id_fkey";
            columns: ["card_id"];
            isOneToOne: false;
            referencedRelation: "cards";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "user_cards_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row'];
export type TablesInsert<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert'];
export type TablesUpdate<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update'];
