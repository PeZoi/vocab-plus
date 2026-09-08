import type { Tables } from './database.types';

export type Card = Tables<'cards'>;
export type UserCard = Tables<'user_cards'>;

export type PartOfSpeech =
  | 'noun'
  | 'verb'
  | 'adjective'
  | 'adverb'
  | 'preposition'
  | 'conjunction'
  | 'pronoun'
  | 'interjection';

export type CEFRLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

export type CardType = 'word' | 'phrasal_verb' | 'idiom';
export type SourceType = 'manual' | 'imported' | 'ai_generated' | 'admin_curated';
export type FSRSState = 'all' | 'new' | 'learning' | 'review' | 'relearning' | 'leech';
export type VocabSortOption =
  | 'created_desc'
  | 'created_asc'
  | 'due_asc'
  | 'due_desc'
  | 'difficulty_desc'
  | 'stability_desc'
  | 'alpha_asc'
  | 'alpha_desc';

export interface CardWithProgress extends Card {
  user_card?: UserCard | null;
  is_owner?: boolean;
}

export interface SenseItem {
  part_of_speech: PartOfSpeech;
  definition: string;
  definition_en?: string;
  vietnamese_hint?: string;
  example_sentence: string;
  example_translation?: string;
  tags?: string[];
  selected?: boolean;
}

export interface CollocationItem {
  phrase: string;
  meaning?: string;
  example?: string;
}

export interface WordFamilyItem {
  word: string;
  part_of_speech: string;
  meaning?: string;
  example?: string;
}

export interface AIWordAnalysisResponse {
  word: string;
  original_word?: string;
  is_corrected?: boolean;
  ipa?: string;
  card_type: CardType;
  cefr_level?: CEFRLevel;
  tags?: string[];
  senses: SenseItem[];
  mnemonic?: string;
  collocations?: CollocationItem[];
  word_family?: WordFamilyItem[];
  context_translation?: string;
}

export interface CreateCardDto {
  word: string;
  ipa?: string | null;
  definition: string;
  definition_en?: string | null;
  example_sentence?: string | null;
  example_translation?: string | null;
  part_of_speech?: PartOfSpeech | null;
  card_type?: CardType;
  source_type?: SourceType;
  sense_number?: number;
  cefr_level?: CEFRLevel | null;
  tags?: string[] | null;
  image_url?: string | null;
  audio_url?: string | null;
  mnemonic?: string | null;
  collocations?: CollocationItem[] | null;
  word_family?: WordFamilyItem[] | null;
  force?: boolean;
}

export interface UpdateCardDto {
  word?: string;
  ipa?: string | null;
  definition?: string;
  definition_en?: string | null;
  example_sentence?: string | null;
  example_translation?: string | null;
  part_of_speech?: PartOfSpeech | null;
  card_type?: CardType;
  cefr_level?: CEFRLevel | null;
  tags?: string[] | null;
  image_url?: string | null;
  audio_url?: string | null;
  mnemonic?: string | null;
  collocations?: CollocationItem[] | null;
  word_family?: WordFamilyItem[] | null;
}

export interface CardFilterParams {
  search?: string;
  cefr_level?: CEFRLevel | 'all';
  tag?: string | 'all';
  state?: FSRSState;
  part_of_speech?: PartOfSpeech | 'all';
  sort_by?: VocabSortOption;
}
