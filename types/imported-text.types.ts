export interface DetectedWord {
  word: string;
  lemma?: string;
  frequency: number;
  is_known: boolean;
  known_card_id?: string;
  cefr_level?: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2' | null;
  definition_en?: string;
  definition?: string;
  context_sentence?: string;
}

export interface ReadingStats {
  total_words: number;
  unique_words: number;
  known_words?: number;
  new_words?: number;
  reading_time_minutes: number;
}

export interface QuickSaveWordResult {
  card: import('@/types/card.types').CardWithProgress;
  is_already_saved: boolean;
  message: string;
}


export interface ImportedText {
  id: string;
  user_id: string;
  title: string;
  raw_text: string;
  detected_words: DetectedWord[];
  created_at: string;
  updated_at: string;
}

export interface CreateImportedTextDto {
  title: string;
  raw_text: string;
  detected_words?: DetectedWord[];
}

export interface ExtractWordsRequest {
  raw_text: string;
}

export interface ExtractWordsResponse {
  words: DetectedWord[];
  stats: ReadingStats;
}

export interface QuickSaveWordDto {
  word: string;
  context_sentence?: string;
  article_title?: string;
}

export interface GenerateStoryRequest {
  level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
  genre?: string;
  topic?: string;
  target_words?: string[];
}

export interface GenerateStoryResponse {
  title: string;
  text: string;
  used_words: string[];
}

