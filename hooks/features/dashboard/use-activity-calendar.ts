'use client';

import { useMemo, useState } from 'react';
import type { ActivityHistoryItem, ActivitySummary } from '@/types/review.types';
import {
  addDays,
  differenceInCalendarDays,
  endOfWeek,
  format,
  startOfWeek,
  subWeeks,
} from 'date-fns';
import { vi } from 'date-fns/locale';

export interface ActivityCellData {
  date: string;
  dateObj: Date;
  dayOfWeek: number;
  count: number;
  xp: number;
  level: number;
  isToday: boolean;
  isFuture: boolean;
}

export interface HoveredCellData {
  date: string;
  formattedDate: string;
  count: number;
  xp: number;
  level: number;
  x: number;
  y: number;
}

interface UseActivityCalendarParams {
  activityHistory?: ActivityHistoryItem[];
  activitySummary?: ActivitySummary;
}

export function useActivityCalendar({
  activityHistory = [],
  activitySummary,
}: UseActivityCalendarParams) {
  const [hoveredCell, setHoveredCell] = useState<HoveredCellData | null>(null);

  // Map tra cứu nhanh lịch sử theo ngày YYYY-MM-DD
  const activityMap = useMemo(() => {
    const map = new Map<string, ActivityHistoryItem>();
    activityHistory.forEach((item) => {
      map.set(item.date, item);
    });
    return map;
  }, [activityHistory]);

  // Tính toán ma trận 52 tuần kết thúc tại Chủ nhật tuần này
  const { weeks, monthLabels, totalReviews, activeDays } = useMemo(() => {
    const now = new Date();
    const endSunday = endOfWeek(now, { weekStartsOn: 1 });
    const startMonday = startOfWeek(subWeeks(endSunday, 51), { weekStartsOn: 1 });

    const totalDays = differenceInCalendarDays(endSunday, startMonday) + 1;
    const computedWeeks: ActivityCellData[][] = [];
    let reviewsSum = 0;
    let daysWithActivity = 0;
    const todayStr = format(now, 'yyyy-MM-dd');

    let currentWeek: ActivityCellData[] = [];

    for (let i = 0; i < totalDays; i++) {
      const dayDate = addDays(startMonday, i);
      const dateStr = format(dayDate, 'yyyy-MM-dd');
      const dayOfWeek = (dayDate.getDay() + 6) % 7; // Thứ 2 = 0, CN = 6

      const item = activityMap.get(dateStr);
      const count = item?.count || 0;
      const xp = item?.xp || 0;
      let level = item?.level || 0;

      if (level === 0 && (count > 0 || xp > 0)) {
        if (count >= 20 || xp >= 150) level = 4;
        else if (count >= 10 || xp >= 80) level = 3;
        else if (count >= 5 || xp >= 30) level = 2;
        else level = 1;
      }

      if (count > 0 || xp > 0) {
        reviewsSum += count;
        daysWithActivity++;
      }

      const isToday = dateStr === todayStr;
      const isFuture = dateStr > todayStr;

      currentWeek.push({
        date: dateStr,
        dateObj: dayDate,
        dayOfWeek,
        count,
        xp,
        level: isFuture ? 0 : level,
        isToday,
        isFuture,
      });

      if (currentWeek.length === 7) {
        computedWeeks.push(currentWeek);
        currentWeek = [];
      }
    }

    if (currentWeek.length > 0) {
      computedWeeks.push(currentWeek);
    }

    // Xác định vị trí nhãn tháng (Th1 - Th12) tối ưu, không bị đè chữ
    // Đặt nhãn tại tuần chứa ngày mùng 1 của tháng, với khoảng cách tối thiểu >= 3 tuần
    const months: Array<{ weekIndex: number; label: string }> = [];
    let lastAddedMonth = -1;
    let lastAddedWeekIdx = -10;

    computedWeeks.forEach((week, wIdx) => {
      const firstDayOfWeek = week[0]?.dateObj;
      if (!firstDayOfWeek) return;

      // Tìm ngày mùng 1 của tháng nằm trong tuần này
      const firstOfMonthInWeek = week.find((day) => day.dateObj.getDate() === 1);
      const targetMonth = firstOfMonthInWeek
        ? firstOfMonthInWeek.dateObj.getMonth()
        : (wIdx === 0 && firstDayOfWeek.getDate() <= 7 ? firstDayOfWeek.getMonth() : -1);

      if (targetMonth !== -1 && targetMonth !== lastAddedMonth) {
        // Đảm bảo khoảng cách tối thiểu giữa 2 nhãn tháng >= 3 tuần để tránh đè chữ
        if (wIdx - lastAddedWeekIdx >= 3) {
          months.push({
            weekIndex: wIdx,
            label: `Th${targetMonth + 1}`,
          });
          lastAddedMonth = targetMonth;
          lastAddedWeekIdx = wIdx;
        } else if (lastAddedWeekIdx === 0 && wIdx <= 2) {
          // Nếu tuần 0 quá sát ngày đầu tháng mới, thay thế nhãn tuần 0 bằng tháng mới
          months.pop();
          months.push({
            weekIndex: wIdx,
            label: `Th${targetMonth + 1}`,
          });
          lastAddedMonth = targetMonth;
          lastAddedWeekIdx = wIdx;
        }
      }
    });

    return {
      weeks: computedWeeks,
      monthLabels: months,
      totalReviews: activitySummary?.total_reviews_year ?? reviewsSum,
      activeDays: activitySummary?.total_active_days ?? daysWithActivity,
    };
  }, [activityMap, activitySummary]);

  // Màu sắc cấp độ theo phong cách GitHub Emerald Green (Thích ứng Light & Dark Mode)
  const getCellColorClass = (level: number, isFuture: boolean): string => {
    if (isFuture) {
      return 'bg-slate-200/50 dark:bg-white/[0.02] border-slate-200/60 dark:border-white/[0.04] opacity-40 cursor-default';
    }
    switch (level) {
      case 1:
        return 'bg-emerald-200 border-emerald-300/80 text-emerald-800 dark:bg-emerald-950/80 dark:border-emerald-800/40 dark:text-emerald-400 hover:border-emerald-500 hover:shadow-xs';
      case 2:
        return 'bg-emerald-400 border-emerald-500/80 text-emerald-950 dark:bg-emerald-800 dark:border-emerald-700/60 dark:text-emerald-300 hover:border-emerald-400 hover:shadow-xs';
      case 3:
        return 'bg-emerald-500 border-emerald-600 text-white dark:bg-emerald-600 dark:border-emerald-500/80 dark:text-white hover:border-emerald-400 hover:shadow-sm';
      case 4:
        return 'bg-emerald-600 border-emerald-700 text-white shadow-[0_0_8px_rgba(16,185,129,0.3)] dark:bg-emerald-400 dark:border-emerald-300 dark:shadow-[0_0_8px_rgba(52,211,153,0.4)] hover:scale-125';
      default:
        return 'bg-slate-100 border-slate-200/80 hover:border-slate-300 dark:bg-white/[0.04] dark:border-white/[0.05] dark:hover:border-white/20';
    }
  };

  const handleMouseEnter = (
    e: React.MouseEvent<HTMLDivElement>,
    cell: ActivityCellData
  ) => {
    if (cell.isFuture) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const formatted = format(cell.dateObj, "EEEE, 'ngày' dd/MM/yyyy", { locale: vi });
    setHoveredCell({
      date: cell.date,
      formattedDate: formatted.charAt(0).toUpperCase() + formatted.slice(1),
      count: cell.count,
      xp: cell.xp,
      level: cell.level,
      x: rect.left + rect.width / 2,
      y: rect.top,
    });
  };

  const handleMouseLeave = () => {
    setHoveredCell(null);
  };

  return {
    weeks,
    monthLabels,
    totalReviews,
    activeDays,
    hoveredCell,
    getCellColorClass,
    handleMouseEnter,
    handleMouseLeave,
  };
}
