import type { CardWithProgress } from './card.types';

export type CollectionCategory =
  | 'ielts'
  | 'toeic'
  | 'toefl'
  | 'daily_communication'
  | 'business'
  | 'academic'
  | 'travel'
  | 'slang_idioms'
  | 'other';

export interface CollectionCreator {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
}

export interface Collection {
  id: string;
  creator_id: string;
  title: string;
  description: string | null;
  cover_image: string | null;
  category: CollectionCategory;
  is_public: boolean;
  tags: string[];
  fork_count: number;
  likes_count: number;
  created_at: string;
  updated_at: string;
  card_count?: number;
  is_saved?: boolean;
  is_liked?: boolean;
  is_owner?: boolean;
  creator?: CollectionCreator;
}

export interface CollectionWithCards extends Collection {
  cards: CardWithProgress[];
}

export interface CreateCollectionDto {
  title: string;
  description?: string | null;
  cover_image?: string | null;
  category?: CollectionCategory;
  is_public?: boolean;
  tags?: string[];
  card_ids?: string[];
}

export interface UpdateCollectionDto {
  title?: string;
  description?: string | null;
  cover_image?: string | null;
  category?: CollectionCategory;
  is_public?: boolean;
  tags?: string[];
}

export interface CollectionFilterParams {
  tab?: 'my' | 'community';
  category?: CollectionCategory | 'all';
  search?: string;
  sort_by?: 'popular' | 'newest' | 'card_count' | 'alpha';
}

export interface DuplicateForkItem {
  source_card_id: string;
  source_word: string;
  source_pos: string | null;
  source_definition: string;
  matched_card_id: string;
  matched_word: string;
  matched_pos: string | null;
  matched_definition: string;
  similarity: number; // 0 - 100
}

export interface AnalyzeForkResult {
  has_duplicates: boolean;
  threshold: number;
  total_cards: number;
  new_cards_count: number;
  duplicates_count: number;
  duplicate_items: DuplicateForkItem[];
  new_card_ids: string[];
}

export interface ForkCollectionOptions {
  selected_card_ids?: string[];
}

export interface ForkResult {
  success: boolean;
  message: string;
  collection: Collection;
  cards_cloned: number;
  cards_skipped?: number;
}

