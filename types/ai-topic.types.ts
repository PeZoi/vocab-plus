import type {
  Card,
  CardType,
  CEFRLevel,
  CollocationItem,
  CreateCardDto,
  PartOfSpeech,
  WordFamilyItem,
} from './card.types';

export interface GenerateTopicWordsRequest {
  topic: string;
  description?: string;
  cefr_levels?: CEFRLevel[];
  count?: number; // 10 - 15
}

export interface TopicGeneratedWord {
  word: string;
  ipa?: string;
  card_type: CardType;
  cefr_level?: CEFRLevel;
  part_of_speech: PartOfSpeech;
  definition: string;
  definition_en?: string;
  vietnamese_hint?: string;
  example_sentence: string;
  example_translation?: string;
  tags: string[];
  collocations?: CollocationItem[];
  word_family?: WordFamilyItem[];
  mnemonic?: string;
  is_existing?: boolean;
  existing_card_id?: string;
}

export interface GenerateTopicWordsResponse {
  topic: string;
  description?: string;
  cefr_levels?: CEFRLevel[];
  words: TopicGeneratedWord[];
}

export interface BulkCreateCardsDto {
  cards: CreateCardDto[];
}

export interface BulkCreateCardsResponse {
  success: boolean;
  message: string;
  created_count: number;
  cards: Card[];
}
