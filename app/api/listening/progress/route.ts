import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { ListeningDifficulty } from '@/types/listening.types';

export async function GET(req: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Chưa đăng nhập' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const youtubeId = searchParams.get('youtubeId');
    const difficulty = searchParams.get('difficulty') as ListeningDifficulty | null;

    if (youtubeId && difficulty) {
      const { data, error } = await supabase
        .from('user_listening_progress')
        .select('*')
        .eq('user_id', user.id)
        .eq('youtube_id', youtubeId)
        .eq('difficulty', difficulty)
        .maybeSingle();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      if (!data) {
        return NextResponse.json({ success: true, progress: null });
      }

      const formattedProgress = {
        id: data.id,
        userId: data.user_id,
        youtubeId: data.youtube_id,
        difficulty: data.difficulty,
        currentIndex: data.current_index ?? 0,
        completedSegmentIds: data.completed_segment_ids ?? [],
        savedAnswers: data.saved_answers ?? {},
        isFinished: data.is_finished ?? false,
        lastStudiedAt: data.last_studied_at,
      };

      return NextResponse.json({ success: true, progress: formattedProgress });
    }

    // Nếu không truyền query params cụ thể, lấy tất cả tiến độ gần đây của user kèm metadata podcast
    const { data: progressList, error } = await supabase
      .from('user_listening_progress')
      .select('*')
      .eq('user_id', user.id)
      .order('last_studied_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!progressList || progressList.length === 0) {
      return NextResponse.json({ success: true, list: [] });
    }

    // Lấy thông tin podcast từ listening_podcasts
    const youtubeIds = Array.from(new Set(progressList.map((p) => p.youtube_id)));
    const { data: podcasts } = await supabase
      .from('listening_podcasts')
      .select('youtube_id, title, channel_name, thumbnail_url, segments')
      .in('youtube_id', youtubeIds);

    const podcastMap = new Map((podcasts || []).map((p) => [p.youtube_id, p]));

    const enrichedList = progressList.map((p) => {
      const podcast = podcastMap.get(p.youtube_id);

      const title = podcast?.title || 'Bài luyện nghe YouTube';
      const channelName = podcast?.channel_name || 'YouTube Creator';
      const thumbnailUrl =
        podcast?.thumbnail_url ||
        `https://img.youtube.com/vi/${p.youtube_id}/hqdefault.jpg`;
      const totalSegments = Array.isArray(podcast?.segments)
        ? podcast.segments.length
        : (p.completed_segment_ids?.length || 0);

      return {
        id: p.id,
        userId: p.user_id,
        youtubeId: p.youtube_id,
        difficulty: p.difficulty,
        currentIndex: p.current_index ?? 0,
        completedSegmentIds: p.completed_segment_ids ?? [],
        savedAnswers: p.saved_answers ?? {},
        isFinished: p.is_finished ?? false,
        lastStudiedAt: p.last_studied_at,
        title,
        channelName,
        thumbnailUrl,
        totalSegments,
      };
    });

    return NextResponse.json({ success: true, list: enrichedList });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Lỗi lấy tiến độ nghe';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Chưa đăng nhập' }, { status: 401 });
    }

    const body = await req.json();
    const {
      youtubeId,
      difficulty,
      currentIndex = 0,
      completedSegmentIds = [],
      savedAnswers = {},
      isFinished = false,
    } = body;

    if (!youtubeId || !difficulty) {
      return NextResponse.json(
        { error: 'Thiếu tham số youtubeId hoặc difficulty' },
        { status: 400 }
      );
    }

    // Upsert tiến độ học vào DB (không cộng XP hay streak theo yêu cầu)
    const { data, error } = await supabase
      .from('user_listening_progress')
      .upsert(
        {
          user_id: user.id,
          youtube_id: youtubeId,
          difficulty,
          current_index: currentIndex,
          completed_segment_ids: completedSegmentIds,
          saved_answers: savedAnswers,
          is_finished: isFinished,
          last_studied_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: 'user_id,youtube_id,difficulty',
        }
      )
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      progress: data,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Lỗi lưu tiến độ nghe';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Chưa đăng nhập' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const clearAll = searchParams.get('clearAll') === 'true';
    const youtubeId = searchParams.get('youtubeId');
    const difficulty = searchParams.get('difficulty') as ListeningDifficulty | null;

    if (clearAll) {
      const { error } = await supabase
        .from('user_listening_progress')
        .delete()
        .eq('user_id', user.id);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ success: true, message: 'Đã xóa toàn bộ lịch sử nghe' });
    }

    if (!youtubeId) {
      return NextResponse.json(
        { error: 'Thiếu tham số youtubeId hoặc clearAll' },
        { status: 400 }
      );
    }

    let query = supabase
      .from('user_listening_progress')
      .delete()
      .eq('user_id', user.id)
      .eq('youtube_id', youtubeId);

    if (difficulty) {
      query = query.eq('difficulty', difficulty);
    }

    const { error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Đã xóa bài nghe thành công' });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Lỗi xóa tiến độ nghe';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

