import { create } from 'zustand';
import { createClient } from '@/lib/client';

interface AIUsage {
  flashcard_generation: number;
  chat: number;
}

interface AIUsageState {
  usage: AIUsage;
  isLoading: boolean;
  error: string | null;

  fetchTodayUsage: () => Promise<void>;
  incrementUsage: (featureType: 'flashcard_generation' | 'chat') => Promise<boolean>;
  canUseFeature: (featureType: 'flashcard_generation' | 'chat', isPro: boolean) => boolean;
  getRemainingUsage: (featureType: 'flashcard_generation' | 'chat', isPro: boolean) => number;
  clearError: () => void;
}

const LIMITS = {
  flashcard_generation: 5,
  chat: 10,
};

export const useAIUsageStore = create<AIUsageState>((set, get) => ({
  usage: {
    flashcard_generation: 0,
    chat: 0,
  },
  isLoading: false,
  error: null,

  fetchTodayUsage: async () => {
    set({ isLoading: true, error: null });
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        set({ error: 'User not authenticated', isLoading: false });
        return;
      }

      const today = new Date().toISOString().split('T')[0];

      const { data, error } = await supabase
        .from('ai_usage')
        .select('*')
        .eq('user_id', user.id)
        .eq('usage_date', today);

      if (error) throw error;

      const usage: AIUsage = {
        flashcard_generation: 0,
        chat: 0,
      };

      data?.forEach((record) => {
        if (record.feature_type === 'flashcard_generation') {
          usage.flashcard_generation = record.usage_count;
        } else if (record.feature_type === 'chat') {
          usage.chat = record.usage_count;
        }
      });

      set({ usage, isLoading: false });
    } catch (error: any) {
      set({
        error: error.message ?? 'Failed to fetch usage',
        isLoading: false,
      });
    }
  },

  incrementUsage: async (featureType) => {
    try {
      const response = await fetch('/api/ai-usage/increment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ featureType }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to increment usage');
      }

      // Update local state
      set((state) => ({
        usage: {
          ...state.usage,
          [featureType]: data.count,
        },
      }));

      return true;
    } catch (error: any) {
      set({ error: error.message });
      return false;
    }
  },

  canUseFeature: (featureType, isPro) => {
    if (isPro) return true;

    const { usage } = get();
    const limit = LIMITS[featureType];
    return usage[featureType] < limit;
  },

  getRemainingUsage: (featureType, isPro) => {
    if (isPro) return Infinity;

    const { usage } = get();
    const limit = LIMITS[featureType];
    return Math.max(0, limit - usage[featureType]);
  },

  clearError: () => set({ error: null }),
}));
