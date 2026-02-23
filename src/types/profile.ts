export interface Profile {
  id: string;
  username: string | null;
  avatar_url: string | null;
  xp: number;
  level: number;
  created_at: string;
  updated_at: string;
}
