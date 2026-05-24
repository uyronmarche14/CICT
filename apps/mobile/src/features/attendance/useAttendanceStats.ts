import { useMemo } from 'react';
import { useAttendanceHistory } from '@/features/attendance/useAttendanceHistory';

type MonthKey = `${number}-${number}`;

export function useAttendanceStats() {
  const { data: logs, isPending, isError } = useAttendanceHistory();

  const stats = useMemo(() => {
    const successLogs = (logs ?? []).filter((log) => log.result === 'success');

    const sorted = [...successLogs].sort(
      (a, b) => new Date(a.scannedAt).getTime() - new Date(b.scannedAt).getTime()
    );

    const monthlyMap = new Map<MonthKey, number>();
    for (const log of sorted) {
      const d = new Date(log.scannedAt);
      const key: MonthKey = `${d.getFullYear()}-${d.getMonth() + 1}`;
      monthlyMap.set(key, (monthlyMap.get(key) ?? 0) + 1);
    }

    const monthly: { month: string; count: number; key: MonthKey }[] = [];
    for (const [key, count] of monthlyMap) {
      const [year, monthNum] = key.split('-').map(Number);
      const date = new Date(year, monthNum - 1);
      const label = date.toLocaleDateString('en-US', { month: 'short' });
      monthly.push({ month: label, count, key });
    }
    monthly.sort((a, b) => {
      const [ya, ma] = a.key.split('-').map(Number);
      const [yb, mb] = b.key.split('-').map(Number);
      return ya !== yb ? ya - yb : ma - mb;
    });

    const totalCheckIns = successLogs.length;

    const now = new Date();
    const semesterStart = new Date(now.getFullYear(), now.getMonth() >= 7 ? 7 : 0, 1);

    const thisSemesterCount = sorted.filter(
      (log) => new Date(log.scannedAt) >= semesterStart
    ).length;

    const sortedDesc = [...sorted].reverse();
    let currentStreak = 0;
    const checkedDates = new Set<string>();
    for (const log of sortedDesc) {
      const d = new Date(log.scannedAt);
      checkedDates.add(`${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`);
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const todayStr = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
    const yesterdayStr = `${yesterday.getFullYear()}-${yesterday.getMonth() + 1}-${yesterday.getDate()}`;

    if (checkedDates.has(todayStr) || checkedDates.has(yesterdayStr)) {
      const cursor = checkedDates.has(todayStr) ? new Date(today) : new Date(yesterday);
      while (true) {
        const key = `${cursor.getFullYear()}-${cursor.getMonth() + 1}-${cursor.getDate()}`;
        if (checkedDates.has(key)) {
          currentStreak++;
          cursor.setDate(cursor.getDate() - 1);
        } else {
          break;
        }
      }
    }

    let longestStreak = 0;
    let tempStreak = 0;
    let prevDate: Date | null = null;

    for (const log of sorted) {
      const d = new Date(log.scannedAt);
      d.setHours(0, 0, 0, 0);

      if (prevDate) {
        const diff = (d.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24);
        if (diff <= 1) {
          tempStreak++;
        } else {
          tempStreak = 1;
        }
      } else {
        tempStreak = 1;
      }

      if (tempStreak > longestStreak) longestStreak = tempStreak;
      prevDate = d;
    }

    return {
      monthly,
      currentStreak,
      longestStreak,
      totalCheckIns,
      thisSemesterCount,
      maxMonthly: Math.max(...monthly.map((m) => m.count), 1),
    };
  }, [logs]);

  return { stats, isPending, isError };
}
