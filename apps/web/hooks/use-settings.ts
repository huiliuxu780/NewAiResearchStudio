import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';
import {
  getAllSettings,
  getSettingsByCategory,
  updateSettingsByCategory,
  testNotification,
  type AllSettings,
  type CompanySettings,
  type AiDefaultSettings,
  type NotificationSettings,
  type SystemSettings,
} from '@/lib/api/settings';

// ==================== All Settings ====================

export function useAllSettings() {
  return useSWR<AllSettings>('settings-all', getAllSettings, {
    revalidateOnFocus: false,
  });
}

// ==================== Category Settings ====================

export function useSettingsByCategory(category: string | null) {
  return useSWR(category ? `settings-${category}` : null, () => {
    if (!category) throw new Error('Category is required');
    return getSettingsByCategory(category as 'company' | 'ai_defaults' | 'notifications' | 'system');
  }, {
    revalidateOnFocus: false,
  });
}

// ==================== Specific Category Hooks ====================

export function useCompanySettings() {
  const { data, isLoading, error, mutate } = useSettingsByCategory('company');
  const { trigger, isMutating } = useSWRMutation(
    'settings-update-company',
    async (_key: string, { arg }: { arg: CompanySettings }) => {
      return updateSettingsByCategory('company', arg);
    }
  );

  return {
    data: data as CompanySettings | undefined,
    isLoading,
    error,
    mutate,
    update: trigger,
    isSaving: isMutating,
  };
}

export function useAiDefaultSettings() {
  const { data, isLoading, error, mutate } = useSettingsByCategory('ai_defaults');
  const { trigger, isMutating } = useSWRMutation(
    'settings-update-ai_defaults',
    async (_key: string, { arg }: { arg: AiDefaultSettings }) => {
      return updateSettingsByCategory('ai_defaults', arg);
    }
  );

  return {
    data: data as AiDefaultSettings | undefined,
    isLoading,
    error,
    mutate,
    update: trigger,
    isSaving: isMutating,
  };
}

export function useNotificationSettings() {
  const { data, isLoading, error, mutate } = useSettingsByCategory('notifications');
  const { trigger, isMutating } = useSWRMutation(
    'settings-update-notifications',
    async (_key: string, { arg }: { arg: NotificationSettings }) => {
      return updateSettingsByCategory('notifications', arg);
    }
  );

  return {
    data: data as NotificationSettings | undefined,
    isLoading,
    error,
    mutate,
    update: trigger,
    isSaving: isMutating,
  };
}

export function useSystemSettings() {
  const { data, isLoading, error, mutate } = useSettingsByCategory('system');
  const { trigger, isMutating } = useSWRMutation(
    'settings-update-system',
    async (_key: string, { arg }: { arg: SystemSettings }) => {
      return updateSettingsByCategory('system', arg);
    }
  );

  return {
    data: data as SystemSettings | undefined,
    isLoading,
    error,
    mutate,
    update: trigger,
    isSaving: isMutating,
  };
}

// ==================== Test Notification ====================

export function useTestNotification() {
  return useSWRMutation('settings-test-notification', async () => {
    return testNotification();
  });
}
