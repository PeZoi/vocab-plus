import { createClient } from '@/lib/supabase/server';
import { format, differenceInDays } from 'date-fns';
import type { QuestTemplate, QuestType } from '@/types/quest.types';

export async function awardXp(
  userId: string,
  xpAmount: number,
  source: string = 'review',
  options?: { skipStreak?: boolean }
): Promise<number> {
  const supabase = await createClient();
  const today = new Date();
  const dateStr = format(today, 'yyyy-MM-dd');

  // 1. Lấy thông tin cần thiết
  const [
    { data: settings },
    { data: dailyXpRow },
    { data: profile }
  ] = await Promise.all([
    supabase.from('system_settings').select('value').eq('key', 'daily_xp_cap').maybeSingle(),
    supabase.from('user_daily_xp').select('xp_earned').eq('user_id', userId).eq('date', dateStr).maybeSingle(),
    supabase.from('profiles').select('xp').eq('id', userId).single()
  ]);

  const dailyCap = (settings?.value as number) || 500;
  const currentTodayXp = dailyXpRow?.xp_earned || 0;

  // 2. Tính toán lượng XP thực tế nhận được (không vượt quá giới hạn nếu từ học thông thường)
  // Lưu ý: Thưởng từ hoàn thành nhiệm vụ (quest_reward) có thể vượt cap hoặc tính theo chính sách
  let actualXpToAdd = xpAmount;
  if (source !== 'quest_reward' && currentTodayXp + actualXpToAdd > dailyCap) {
    actualXpToAdd = Math.max(0, dailyCap - currentTodayXp);
  }

  if (actualXpToAdd > 0) {
    // 3. Cập nhật user_daily_xp
    const { error: upsertDailyError } = await supabase.from('user_daily_xp').upsert({
      user_id: userId,
      date: dateStr,
      xp_earned: currentTodayXp + actualXpToAdd,
      updated_at: new Date().toISOString()
    }, { onConflict: 'user_id,date' });

    if (upsertDailyError) {
      console.error('Lỗi cập nhật user_daily_xp:', upsertDailyError);
    }

    // 4. Cập nhật profiles.xp
    if (profile) {
      await supabase.from('profiles').update({
        xp: (profile.xp || 0) + actualXpToAdd
      }).eq('id', userId);
    }
    
    // 5. Cập nhật Streak (CHỈ kích hoạt khi làm bài kiểm tra hoặc hoạt động chính thức, KHÔNG kích hoạt khi chỉ lướt flashcard preview)
    if (!options?.skipStreak && source !== 'preview') {
      await updateStreak(userId, today);
    }

    // 6. Cập nhật tiến độ nhiệm vụ tích lũy XP (tránh đệ quy khi source = 'quest_reward')
    if (source !== 'quest_reward') {
      await incrementQuestProgress(userId, 'earn_xp', actualXpToAdd);
    }
  }

  return actualXpToAdd;
}

export async function updateStreak(userId: string, activeDate: Date) {
  const supabase = await createClient();
  const dateStr = format(activeDate, 'yyyy-MM-dd');

  const { data: streak } = await supabase
    .from('user_streaks')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (!streak) {
    // Tạo mới
    await supabase.from('user_streaks').insert({
      user_id: userId,
      current_streak: 1,
      longest_streak: 1,
      freezes_available: 0,
      last_active_date: dateStr
    });
    return;
  }

  if (streak.last_active_date === dateStr) {
    // Đã tính streak hôm nay rồi
    return;
  }

  // Tính số ngày chênh lệch giữa hôm nay và lần học cuối
  const lastDate = streak.last_active_date ? new Date(streak.last_active_date) : null;
  let newStreak = streak.current_streak;
  let freezes = streak.freezes_available;

  if (lastDate) {
    const diffDays = differenceInDays(activeDate, lastDate);
    
    if (diffDays === 1) {
      // Học liên tục
      newStreak += 1;
    } else if (diffDays > 1) {
      // Bị gián đoạn, kiểm tra freeze
      const missedDays = diffDays - 1;
      if (freezes >= missedDays) {
        // Đủ băng để bảo vệ
        freezes -= missedDays;
        newStreak += 1; // Vẫn tăng streak cho ngày hôm nay
      } else {
        // Mất streak
        newStreak = 1;
      }
    }
  } else {
    newStreak = 1;
  }

  const newLongest = Math.max(newStreak, streak.longest_streak);

  await supabase.from('user_streaks').update({
    current_streak: newStreak,
    longest_streak: newLongest,
    freezes_available: freezes,
    last_active_date: dateStr,
    updated_at: new Date().toISOString()
  }).eq('user_id', userId);
}

/**
 * Đảm bảo người dùng có danh sách nhiệm vụ cho ngày hôm nay.
 * Nếu chưa có, tự động nạp từ system_settings (daily_quest_templates).
 */
export async function ensureDailyQuests(userId: string) {
  const supabase = await createClient();
  const today = new Date();
  const dateStr = format(today, 'yyyy-MM-dd');

  // Lấy các quest của user ngày hôm nay
  const { data: existingQuests } = await supabase
    .from('daily_quests')
    .select('*')
    .eq('user_id', userId)
    .eq('date', dateStr)
    .order('created_at', { ascending: true });

  if (existingQuests && existingQuests.length > 0) {
    return existingQuests;
  }

  // Nếu chưa có, lấy từ system_settings
  const { data: templateSetting } = await supabase
    .from('system_settings')
    .select('value')
    .eq('key', 'daily_quest_templates')
    .maybeSingle();

  let templates: QuestTemplate[] = (templateSetting?.value as QuestTemplate[]) || [];
  if (!Array.isArray(templates) || templates.length === 0) {
    templates = [
      {
        id: 'quest_review_30',
        quest_type: 'review_cards',
        title: 'Hoàn thành 30 thẻ ôn tập',
        target: 30,
        reward_xp: 25,
        is_active: true,
      },
      {
        id: 'quest_learn_10',
        quest_type: 'learn_new',
        title: 'Học 10 từ vựng mới',
        target: 10,
        reward_xp: 30,
        is_active: true,
      },
      {
        id: 'quest_earn_100',
        quest_type: 'earn_xp',
        title: 'Đạt 100 XP trong ngày',
        target: 100,
        reward_xp: 20,
        is_active: true,
      },
    ];
  }

  // Lọc chỉ những template active
  const activeTemplates = templates.filter((t) => t.is_active !== false);

  if (activeTemplates.length === 0) {
    return [];
  }

  const rowsToInsert = activeTemplates.map((t) => ({
    user_id: userId,
    date: dateStr,
    quest_type: t.quest_type,
    title: t.title,
    target: t.target,
    progress: 0,
    is_completed: false,
    reward_xp: t.reward_xp,
  }));

  const { data: insertedQuests } = await supabase
    .from('daily_quests')
    .insert(rowsToInsert)
    .select()
    .order('created_at', { ascending: true });

  return insertedQuests || [];
}

/**
 * Tăng tiến độ cho nhiệm vụ theo loại hành vi và tự động trao thưởng nếu hoàn thành
 */
export async function incrementQuestProgress(
  userId: string,
  questType: QuestType,
  amount: number = 1
) {
  if (amount <= 0) return;
  const supabase = await createClient();
  const today = new Date();
  const dateStr = format(today, 'yyyy-MM-dd');

  // Đảm bảo quests đã được khởi tạo
  await ensureDailyQuests(userId);

  // Tìm quests chưa hoàn thành của quest_type này trong hôm nay
  const { data: quests } = await supabase
    .from('daily_quests')
    .select('*')
    .eq('user_id', userId)
    .eq('date', dateStr)
    .eq('quest_type', questType)
    .eq('is_completed', false);

  if (!quests || quests.length === 0) return;

  for (const quest of quests) {
    const newProgress = Math.min(quest.target, (quest.progress || 0) + amount);
    const isCompleted = newProgress >= quest.target;

    await supabase
      .from('daily_quests')
      .update({
        progress: newProgress,
        is_completed: isCompleted,
        updated_at: new Date().toISOString(),
      })
      .eq('id', quest.id);

    if (isCompleted && quest.reward_xp > 0) {
      // Thưởng XP khi hoàn thành quest (source = 'quest_reward')
      await awardXp(userId, quest.reward_xp, 'quest_reward');
    }
  }
}

