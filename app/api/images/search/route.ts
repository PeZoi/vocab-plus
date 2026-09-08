import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { CuratedPhotoItem, ImageSearchResponse, PexelsPhoto } from '@/types/image.types';

export const maxDuration = 30;

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Chưa xác thực người dùng' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query')?.trim();
    const perPage = Math.min(Math.max(Number(searchParams.get('per_page') || '6'), 1), 15);

    if (!query) {
      return NextResponse.json({ error: 'Từ khóa tìm kiếm ảnh là bắt buộc' }, { status: 400 });
    }

    const apiKey = process.env.PEXELS_API_KEY;
    if (!apiKey) {
      console.warn('PEXELS_API_KEY chưa được cấu hình');
      return NextResponse.json<ImageSearchResponse>({
        query,
        total_results: 0,
        photos: [],
      });
    }

    // Gọi Pexels API
    const pexelsUrl = `https://api.pexels.com/v1/search?query=${encodeURIComponent(
      query
    )}&per_page=${perPage}&orientation=landscape`;

    const response = await fetch(pexelsUrl, {
      headers: {
        Authorization: apiKey,
      },
      next: { revalidate: 3600 }, // Cache 1 giờ để tiết kiệm quota Pexels
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('Pexels API error:', response.status, errText);
      return NextResponse.json<ImageSearchResponse>({
        query,
        total_results: 0,
        photos: [],
      });
    }

    const data = await response.json();
    const photos: CuratedPhotoItem[] = (data.photos || []).map((photo: PexelsPhoto) => ({
      id: photo.id,
      url: photo.url,
      photographer: photo.photographer,
      photographer_url: photo.photographer_url,
      medium_url: photo.src.medium || photo.src.landscape || photo.src.original,
      thumbnail_url: photo.src.tiny || photo.src.small || photo.src.medium,
      alt: photo.alt || query,
    }));

    return NextResponse.json<ImageSearchResponse>({
      query,
      total_results: data.total_results || photos.length,
      photos,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Lỗi máy chủ khi tìm kiếm ảnh';
    console.error('Image search route error:', err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
