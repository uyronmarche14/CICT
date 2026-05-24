import { useMemo } from 'react';
import { useAttendanceHistory } from '@/features/attendance/useAttendanceHistory';

export function useAttendanceStreak() {
  const attendanceQuery = useAttendanceHistory();

  const streak = useMemo(() => {
    const logs = attendanceQuery.data ?? [];
    const successLogs = logs.filter((log) => log.result === 'success');

    const totalCheckIns = successLogs.length;

    const sorted = [...successLogs].sort(
      (a, b) => new Date(b.scannedAt).getTime() - new Date(a.scannedAt).getTime()
    );

    let consecutive = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < sorted.length; i++) {
      const scanDate = new Date(sorted[i].scannedAt);
      scanDate.setHours(0, 0, 0, 0);

      const diffDays = Math.round(
        (today.getTime() - scanDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (i === 0 && diffDays > 1) {
        break;
      }

      if (i === 0) {
        consecutive = 1;
        continue;
      }

      const prevDate = new Date(sorted[i - 1].scannedAt);
      prevDate.setHours(0, 0, 0, 0);

      const gapDays = Math.round(
        (prevDate.getTime() - scanDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (gapDays <= 1) {
        consecutive++;
      } else {
        break;
      }
    }

    return { consecutive, totalCheckIns };
  }, [attendanceQuery.data]);

  return streak;
}
