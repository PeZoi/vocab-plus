export interface PexelsPhotoSrc {
  original: string;
  large2x: string;
  large: string;
  medium: string;
  small: string;
  portrait: string;
  landscape: string;
  tiny: string;
}

export interface PexelsPhoto {
  id: number;
  width: number;
  height: number;
  url: string;
  photographer: string;
  photographer_url: string;
  photographer_id: number;
  avg_color: string;
  src: PexelsPhotoSrc;
  alt: string;
}

export interface CuratedPhotoItem {
  id: number;
  url: string;
  photographer: string;
  photographer_url: string;
  medium_url: string;
  thumbnail_url: string;
  alt: string;
}

export interface ImageSearchResponse {
  query: string;
  total_results: number;
  photos: CuratedPhotoItem[];
}
