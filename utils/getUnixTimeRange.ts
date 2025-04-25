export type TimeRangeType = "today" | "this_week" | "this_month";

export function getUnixTimeRange(type: TimeRangeType): {
  start_time: number;
  end_time: number;
} {
  const now = new Date();
  const end = Math.floor(now.getTime() / 1000); // 現在時刻のUnix時間（秒）

  let start: number;

  switch (type) {
    case "today": {
      const startOfDay = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate()
      );
      start = Math.floor(startOfDay.getTime() / 1000);
      break;
    }
    case "this_week": {
      const day = now.getDay(); // 0(日)〜6(土)
      const diff = now.getDate() - day + (day === 0 ? -6 : 1); // 月曜始まり
      const startOfWeek = new Date(now.setDate(diff));
      startOfWeek.setHours(0, 0, 0, 0);
      start = Math.floor(startOfWeek.getTime() / 1000);
      break;
    }
    case "this_month": {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      start = Math.floor(startOfMonth.getTime() / 1000);
      break;
    }
    default:
      start = end - 60 * 60 * 24; // fallback: 過去24時間
  }

  return {
    start_time: start,
    end_time: end,
  };
}
