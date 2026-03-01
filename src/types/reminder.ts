export interface Reminder {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  reminder_date: string;  // 'YYYY-MM-DD'
  reminder_time: string;  // 'HH:MM:SS'
  is_dismissed: boolean;
  created_at: string;
}
