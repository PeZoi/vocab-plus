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

export type CardType = 'word' | 'phrasal_verb' | 'idiom';
export type SourceType = 'manual' | 'imported' | 'ai_generated' | 'admin_curated';

export interface CardWithProgress extends Card {
  user_card?: UserCard | null;
}

export interface SenseItem {
  part_of_speech: PartOfSpeech;
  definition: string;
  vietnamese_hint?: string;
  example_sentence: string;
  selected?: boolean;
}

export interface AIWordAnalysisResponse {
  word: string;
  original_word?: string;
  is_corrected?: boolean;
  ipa?: string;
  card_type: CardType;
  senses: SenseItem[];
  mnemonic?: string;
  collocations?: string[];
  word_family?: { form_word: string; part_of_speech: string }[];
}

export interface CreateCardDto {
  word: string;
  ipa?: string | null;
  definition: string;
  example_sentence?: string | null;
  part_of_speech?: PartOfSpeech | null;
  card_type?: CardType;
  source_type?: SourceType;
  sense_number?: number;
  image_url?: string | null;
  audio_url?: string | null;
  mnemonic?: string | null;
}
