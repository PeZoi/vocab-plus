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
