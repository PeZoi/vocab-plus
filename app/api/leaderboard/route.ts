import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { startOfWeek, format } from 'date-fns';
import type { LeagueTier, ZoneType } from '@/constants/leagues';
import { LEAGUE_TIERS_CONFIG } from '@/constants/leagues';
import type { LeaderboardUser, TierConfigItem } from '@/services/leaderboard.service';

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Chưa xác thực' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const timeframe = searchParams.get('timeframe') || 'weekly';
    const requestedTier = searchParams.get('tier') as LeagueTier | null;

    // 1. Lấy hoặc khởi tạo Rank hiện tại của người dùng trong bảng user_leagues
    let { data: userLeague } = await supabase
      .from('user_leagues')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (!userLeague) {
      const { data: createdLeague } = await supabase
        .from('user_leagues')
        .insert({
          user_id: user.id,
          league: 'unranked',
          weekly_xp: 0,
        })
        .select()
        .single();
      userLeague = createdLeague;
    }

    const currentTier: LeagueTier = (userLeague?.league as LeagueTier) || 'unranked';
    const activeTier: LeagueTier = requestedTier || currentTier;

    // 2. Lấy cấu hình điểm các bậc rank từ system_settings
    const { data: settingRow } = await supabase
      .from('system_settings')
      .select('value')
      .eq('key', 'league_tier_configs')
      .maybeSingle();

    // Fallback default config nếu chưa có
    const defaultConfigs: Record<LeagueTier, TierConfigItem> = {
      unranked: { promoteXp: 50, stayXp: 0 },
      iron: { promoteXp: 120, stayXp: 30 },
      bronze: { promoteXp: 180, stayXp: 50 },
      silver: { promoteXp: 250, stayXp: 80 },
      platinum: { promoteXp: 350, stayXp: 120 },
      emerald: { promoteXp: 480, stayXp: 180 },
      diamond: { promoteXp: 650, stayXp: 260 },
      master: { promoteXp: 850, stayXp: 380 },
      grandmaster: { promoteXp: 1100, stayXp: 550 },
      challenger: { promoteXp: 0, stayXp: 750 },
    };

    const tierConfigs: Record<LeagueTier, TierConfigItem> =
      (settingRow?.value as Record<LeagueTier, TierConfigItem>) || defaultConfigs;

    const activeTierConfig = tierConfigs[activeTier];
    const fallbackMeta = LEAGUE_TIERS_CONFIG[activeTier];

    const promoteThreshold =
      activeTierConfig?.promoteXp ?? fallbackMeta?.defaultPromoteXp ?? 200;
    const stayThreshold =
      activeTierConfig?.stayXp ?? fallbackMeta?.defaultStayXp ?? 80;

    let leaderboard: LeaderboardUser[] = [];

    if (timeframe === 'all_time') {
      const { data } = await supabase
        .from('profiles')
        .select('id, display_name, avatar_url, xp')
        .order('xp', { ascending: false })
        .limit(100);

      leaderboard = (data || []).map((u, i) => ({
        id: u.id,
        display_name: u.display_name,
        avatar_url: u.avatar_url,
        xp: u.xp || 0,
        rank: i + 1,
      }));
    } else if (timeframe === 'daily') {
      const today = format(new Date(), 'yyyy-MM-dd');
      const { data } = await supabase
        .from('user_daily_xp')
        .select('xp_earned, profiles(id, display_name, avatar_url)')
        .eq('date', today)
        .order('xp_earned', { ascending: false })
        .limit(100);

      leaderboard = (data || []).map((row, i) => {
        const p = Array.isArray(row.profiles) ? row.profiles[0] : row.profiles;
        return {
          id: p?.id || '',
          display_name: p?.display_name || 'Học viên ẩn danh',
          avatar_url: p?.avatar_url || null,
          xp: row.xp_earned,
          rank: i + 1,
        };
      });
    } else {
      // Weekly: Tính điểm tuần từ Thứ Hai đầu tuần
      const startOfWk = format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd');

      // 1. Lấy danh sách tất cả học viên thuộc activeTier
      let targetUserIds: string[] = [];

      if (activeTier === 'unranked') {
        // Những người ở bậc 'unranked':
        // Có bản ghi trong user_leagues với league = 'unranked',
        // hoặc chưa từng có bản ghi nào trong user_leagues (mặc định unranked)
        const { data: nonUnrankedUsers } = await supabase
          .from('user_leagues')
          .select('user_id')
          .neq('league', 'unranked');

        const nonUnrankedSet = new Set((nonUnrankedUsers || []).map((u) => u.user_id));

        const { data: allProfiles } = await supabase
          .from('profiles')
          .select('id');

        targetUserIds = (allProfiles || [])
          .map((p) => p.id)
          .filter((id) => !nonUnrankedSet.has(id));
      } else {
        // Với các bậc rank từ iron -> challenger:
        // CHỈ LẤY những ai CÓ bản ghi user_leagues với league = activeTier
        const { data: leagueUsers } = await supabase
          .from('user_leagues')
          .select('user_id')
          .eq('league', activeTier);

        targetUserIds = (leagueUsers || []).map((lu) => lu.user_id);
      }

      // Nếu không có học viên nào thuộc bậc rank này
      if (targetUserIds.length === 0) {
        leaderboard = [];
      } else {
        // 2. Lấy thông tin profiles của các học viên thuộc targetUserIds
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('id, display_name, avatar_url')
          .in('id', targetUserIds);

        // 3. Lấy dữ liệu XP kiếm được trong tuần này của các học viên
        const { data: weeklyXpRows } = await supabase
          .from('user_daily_xp')
          .select('user_id, xp_earned')
          .in('user_id', targetUserIds)
          .gte('date', startOfWk);

        // Gom XP theo từng user
        const userMap = new Map<
          string,
          { id: string; display_name: string | null; avatar_url: string | null; xp: number }
        >();

        // Khởi tạo thông tin profile
        (profilesData || []).forEach((p) => {
          userMap.set(p.id, {
            id: p.id,
            display_name: p.display_name,
            avatar_url: p.avatar_url,
            xp: 0,
          });
        });

        // Bổ sung user ID nếu chưa có trong profilesData
        targetUserIds.forEach((uid) => {
          if (!userMap.has(uid)) {
            userMap.set(uid, {
              id: uid,
              display_name: uid === user.id ? user.user_metadata?.full_name || 'Bạn' : 'Học viên ẩn danh',
              avatar_url: null,
              xp: 0,
            });
          }
        });

        // Cộng dồn điểm XP tuần
        (weeklyXpRows || []).forEach((row) => {
          const item = userMap.get(row.user_id);
          if (item) {
            item.xp += row.xp_earned;
          }
        });

        // Sắp xếp theo XP giảm dần
        const sortedUsers = Array.from(userMap.values())
          .sort((a, b) => b.xp - a.xp)
          .slice(0, 100);

        leaderboard = sortedUsers.map((u, i) => {
          let zone: ZoneType = 'safe';

          if (activeTier === 'challenger') {
            zone = u.xp < stayThreshold ? 'demotion' : 'safe';
          } else if (activeTier === 'unranked' || activeTier === 'iron') {
            zone = u.xp >= promoteThreshold ? 'promotion' : 'safe';
          } else {
            if (u.xp >= promoteThreshold) {
              zone = 'promotion';
            } else if (u.xp < stayThreshold) {
              zone = 'demotion';
            } else {
              zone = 'safe';
            }
          }

          return {
            ...u,
            rank: i + 1,
            is_qualified: u.xp >= promoteThreshold,
            zone,
            league: activeTier,
          };
        });
      }
    }

    const currentUserRank = leaderboard.find((u) => u.id === user.id);

    // Tính điểm XP tuần này của chính người dùng hiện tại (độc lập với activeTier đang xem)
    const startOfCurrentWeek = format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd');
    const { data: currentUserWeeklyData } = await supabase
      .from('user_daily_xp')
      .select('xp_earned')
      .eq('user_id', user.id)
      .gte('date', startOfCurrentWeek);

    const userWeekly = (currentUserWeeklyData || []).reduce(
      (sum, row) => sum + (row.xp_earned || 0),
      0
    );

    return NextResponse.json({
      leaderboard,
      currentUser: currentUserRank || null,
      currentTier,
      promoteThreshold,
      stayThreshold,
      userWeeklyXp: userWeekly,
      tierConfigs,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Lỗi hệ thống';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
