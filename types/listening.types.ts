export type ListeningDifficulty = 'easy' | 'medium' | 'hard';

export interface TimedSegment {
  id: string;
  start: number; // in seconds
  end: number;   // in seconds
  text: string;
  cleanText: string;
  words?: string[];
  vietnameseTranslation?: string;
}

export interface VideoMetadata {
  id: string;
  title: string;
  channelTitle?: string;
  thumbnailUrl?: string;
  durationSeconds?: number;
  cefrLevel?: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
  category?: string;
}

export interface CuratedPodcast {
  id: string;
  youtubeId: string;
  title: string;
  channelName: string;
  channelAvatarUrl?: string;
  thumbnailUrl: string;
  duration: string;
  cefrLevel: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
  topic: string;
  description: string;
  sampleSegments?: TimedSegment[];
}

export interface WordClozeItem {
  index: number;
  originalWord: string;
  cleanedWord: string;
  isMasked: boolean;
  userAnswer?: string;
  isCorrect?: boolean;
  hint?: {
    firstLetter: string;
    length: number;
    partOfSpeech?: string;
  };
}

export interface ChunkClozeItem {
  id: string;
  originalText: string;
  maskedChunks: {
    startWordIndex: number;
    endWordIndex: number;
    text: string;
    cleanedText: string;
    userAnswer?: string;
    isCorrect?: boolean;
    hint?: string;
  }[];
}

export type DiffTokenType = 'correct' | 'incorrect' | 'missing' | 'extra';

export interface DiffToken {
  type: DiffTokenType;
  expected?: string;
  actual?: string;
}

export interface DictationGradingResult {
  accuracyPercentage: number;
  isPassed: boolean;
  totalWords: number;
  correctWords: number;
  diffTokens: DiffToken[];
  feedback?: string;
}

export interface ConnectedSpeechTip {
  sentence: string;
  phoneticPhantoms: {
    phrase: string;
    spokenSound: string;
    ruleType: 'linking' | 'elision' | 'assimilation' | 'weak_form' | 'flap_t';
    explanation: string;
  }[];
  generalTip: string;
}

export interface ListeningSessionState {
  currentSegmentIndex: number;
  difficulty: ListeningDifficulty;
  isPlaying: boolean;
  isLooping: boolean;
  autoPauseAtEnd: boolean;
  playbackRate: number;
  currentTime: number;
  completedSegmentIds: Set<string>;
  savedWordIds: Set<string>;
}

export interface ListeningPodcastRecord {
  id: string;
  youtubeId: string;
  title: string;
  channelName?: string;
  thumbnailUrl?: string;
  duration?: string;
  cefrLevel?: string;
  topic?: string;
  audioUrl?: string;
  segments: TimedSegment[];
  createdAt?: string;
  updatedAt?: string;
}

export interface UserListeningProgressRecord {
  id?: string;
  userId?: string;
  youtubeId: string;
  difficulty: ListeningDifficulty;
  currentIndex: number;
  completedSegmentIds: string[];
  savedAnswers: Record<string, unknown>;
  isFinished: boolean;
  lastStudiedAt?: string;
}

export interface UserListeningProgressWithMeta extends UserListeningProgressRecord {
  title?: string;
  channelName?: string;
  thumbnailUrl?: string;
  totalSegments?: number;
}

