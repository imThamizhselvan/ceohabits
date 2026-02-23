export type AchievementRarity = 'common' | 'rare' | 'epic' | 'legendary';

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  condition_type: string;
  condition_value: number;
  xp_reward: number;
  rarity: AchievementRarity;
}

export interface UserAchievement {
  id: string;
  user_id: string;
  achievement_id: string;
  earned_at: string;
  achievement?: Achievement;
}

export interface Level {
  level: number;
  name: string;
  xpRequired: number;
  icon: string;
  color: string;
}

export interface XPProgress {
  current: number;
  needed: number;
  percentage: number;
}
