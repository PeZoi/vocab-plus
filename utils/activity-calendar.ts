import { differenceInDays, differenceInCalendarDays, format, parseISO, startOfDay, subDays } from 'date-fns';
import type { ActivityHistoryItem, ActivitySummary } from '@/types/review.types';

export interface ActivityCalendarInput {
  yearlyLogs?: { reviewed_at: string | null }[] | null;
  yearlyDailyXp?: { date: string | null; xp_earned: number | null }[] | null;
  streakRecord?: {
    current_streak?: number;
    longest_streak?: number;
    last_active_date?: string | null;
    freezes_available?: number;
  } | null;
  now?: Date;
}

export interface ActivityCalendarResult {
  completedDatesSet: Set<string>;
  reviewCountsByDate: Map<string, number>;
  xpByDate: Map<string, number>;
  streak_days: number;
  longest_streak: number;
  has_reviewed_today: boolean;
  activity_history: ActivityHistoryItem[];
  activity_summary: ActivitySummary;
}

/**
 * Hàm tính toán tập trung cho biểu đồ nhiệt Heatmap 52 tuần & chỉ số chuỗi hoạt động
 */
export function buildActivityCalendarData({
  yearlyLogs = [],
  yearlyDailyXp = [],
  streakRecord,
  now = new Date(),
}: ActivityCalendarInput): ActivityCalendarResult {
  const completedDatesSet = new Set<string>();

  // 1. Thu thập ngày có XP
  (yearlyDailyXp || []).forEach((x) => {
    if (x.date && (x.xp_earned || 0) > 0) {
      completedDatesSet.add(x.date);
    }
  });

  // 2. Thu thập ngày có review logs
  (yearlyLogs || []).forEach((l) => {
    if (l.reviewed_at) {
      const d = format(parseISO(l.reviewed_at), 'yyyy-MM-dd');
      completedDatesSet.add(d);
    }
  });

  // 3. Ngày hoạt động gần nhất từ streak record
  if (streakRecord?.last_active_date) {
    completedDatesSet.add(streakRecord.last_active_date);
  }

  // 4. Đếm số review theo ngày
  const reviewCountsByDate = new Map<string, number>();
  (yearlyLogs || []).forEach((l) => {
    if (l.reviewed_at) {
      const d = format(parseISO(l.reviewed_at), 'yyyy-MM-dd');
      reviewCountsByDate.set(d, (reviewCountsByDate.get(d) || 0) + 1);
    }
  });

  // 5. Điểm XP theo ngày
  const xpByDate = new Map<string, number>();
  (yearlyDailyXp || []).forEach((x) => {
    if (x.date) {
      xpByDate.set(x.date, x.xp_earned || 0);
    }
  });

  // Ước tính XP tối thiểu nếu ngày có review mà chưa có bản ghi daily_xp
  reviewCountsByDate.forEach((cnt, d) => {
    if (!xpByDate.has(d) || (xpByDate.get(d) || 0) === 0) {
      xpByDate.set(d, cnt * 10);
    }
  });

  // 6. Tính chuỗi streak hiện tại
  const todayStr = format(now, 'yyyy-MM-dd');
  const yesterdayStr = format(subDays(now, 1), 'yyyy-MM-dd');
  const has_reviewed_today = completedDatesSet.has(todayStr);

  let streak_days = 0;
  if (completedDatesSet.has(todayStr)) {
    let checkDate = now;
    while (completedDatesSet.has(format(checkDate, 'yyyy-MM-dd'))) {
      streak_days++;
      checkDate = subDays(checkDate, 1);
    }
  } else if (completedDatesSet.has(yesterdayStr)) {
    let checkDate = subDays(now, 1);
    while (completedDatesSet.has(format(checkDate, 'yyyy-MM-dd'))) {
      streak_days++;
      checkDate = subDays(checkDate, 1);
    }
  } else {
    streak_days = 0;
  }

  // Kết hợp với bản ghi user_streaks (kể cả bảo vệ đóng băng streak nếu có)
  if (streakRecord) {
    const lastActive = streakRecord.last_active_date;
    if (lastActive) {
      const lastDate = parseISO(lastActive);
      const diffDays = differenceInDays(startOfDay(now), startOfDay(lastDate));
      const missedDays = diffDays - 1;
      const freezes = streakRecord.freezes_available || 0;

      if (freezes >= missedDays && missedDays > 0) {
        streak_days = Math.max(streak_days, streakRecord.current_streak || 0);
      } else if (diffDays <= 1 && streak_days > 0) {
        streak_days = Math.max(streak_days, streakRecord.current_streak || 0);
      } else if (diffDays > 1 && (!freezes || freezes < missedDays)) {
        streak_days = 0;
      }
    }
  }

  // 7. Tính kỷ lục chuỗi liên tục (longest consecutive streak)
  const sortedDates = Array.from(completedDatesSet).sort();
  let maxConsecutiveStreak = 0;
  let curConsecutive = 0;
  let prevConsecutiveDate: Date | null = null;

  for (const dStr of sortedDates) {
    const d = parseISO(dStr);
    if (!prevConsecutiveDate) {
      curConsecutive = 1;
    } else {
      const diff = differenceInCalendarDays(d, prevConsecutiveDate);
      if (diff === 1) {
        curConsecutive++;
      } else if (diff > 1) {
        curConsecutive = 1;
      }
    }
    prevConsecutiveDate = d;
    if (curConsecutive > maxConsecutiveStreak) {
      maxConsecutiveStreak = curConsecutive;
    }
  }

  const longest_streak = Math.max(
    streakRecord?.longest_streak || 0,
    maxConsecutiveStreak,
    streak_days
  );

  // 8. Tạo 365 ngày cho Heatmap 52 tuần
  const totalDaysToShow = 365;
  const activity_history: ActivityHistoryItem[] = [];
  let totalReviewsYear = 0;
  let activeDaysCount = 0;

  for (let i = totalDaysToShow; i >= 0; i--) {
    const d = subDays(now, i);
    const dStr = format(d, 'yyyy-MM-dd');
    const isCompletedDay = completedDatesSet.has(dStr);
    const count = isCompletedDay ? (reviewCountsByDate.get(dStr) || 0) : 0;
    const xp = xpByDate.get(dStr) || 0;

    if (isCompletedDay) {
      activeDaysCount++;
    }
    totalReviewsYear += count;

    let level = 0;
    if (isCompletedDay) {
      if (count >= 20 || xp >= 150) level = 4;
      else if (count >= 10 || xp >= 80) level = 3;
      else if (count >= 5 || xp >= 30) level = 2;
      else level = 1;
    }

    activity_history.push({
      date: dStr,
      count,
      xp,
      level,
    });
  }

  const activity_summary: ActivitySummary = {
    total_reviews_year: totalReviewsYear,
    total_active_days: activeDaysCount,
    current_streak: streak_days,
    longest_streak,
  };

  return {
    completedDatesSet,
    reviewCountsByDate,
    xpByDate,
    streak_days,
    longest_streak,
    has_reviewed_today,
    activity_history,
    activity_summary,
  };
}
