import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authApi } from '@/lib/api';
import { toast } from 'sonner';

export function useAuth() {
  const queryClient = useQueryClient();

  // No authentication needed - all requests use test_token_123
  // Try to get user info from API, but don't require it
  const { data: user, isLoading } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => authApi.getCurrentUser().catch(() => null),
    retry: false,
    throwOnError: false,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  const loginMutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
      toast.success('Login successful');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Login failed');
    },
  });

  const registerMutation = useMutation({
    mutationFn: authApi.register,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
      toast.success('Registration successful');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Registration failed');
    },
  });

  const logoutMutation = useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      queryClient.setQueryData(['currentUser'], null);
      toast.success('Logged out successfully');
    },
  });

  return {
    user: (user as any)?.data,
    isLoading,
    // Always authenticated - all requests use test_token_123
    isAuthenticated: true,
    login: (data: Parameters<typeof loginMutation.mutate>[0], options?: Parameters<typeof loginMutation.mutate>[1]) => {
      loginMutation.mutate(data, {
        ...options,
        onSuccess: (result, variables, context) => {
          queryClient.invalidateQueries({ queryKey: ['currentUser'] });
          toast.success('Вход выполнен успешно');
          options?.onSuccess?.(result, variables, context);
        },
        onError: (error, variables, context) => {
          toast.error(error.message || 'Ошибка входа');
          options?.onError?.(error, variables, context);
        },
      });
    },
    register: (data: Parameters<typeof registerMutation.mutate>[0], options?: Parameters<typeof registerMutation.mutate>[1]) => {
      registerMutation.mutate(data, {
        ...options,
        onSuccess: (result, variables, context) => {
          queryClient.invalidateQueries({ queryKey: ['currentUser'] });
          toast.success('Регистрация выполнена успешно');
          options?.onSuccess?.(result, variables, context);
        },
        onError: (error, variables, context) => {
          toast.error(error.message || 'Ошибка регистрации');
          options?.onError?.(error, variables, context);
        },
      });
    },
    logout: (options?: Parameters<typeof logoutMutation.mutate>[0]) => {
      logoutMutation.mutate(undefined, {
        ...options,
        onSuccess: (result, variables, context) => {
          queryClient.setQueryData(['currentUser'], null);
          toast.success('Выход выполнен успешно');
          options?.onSuccess?.(result, variables, context);
        },
      });
    },
    isLoginLoading: loginMutation.isPending,
    isRegisterLoading: registerMutation.isPending,
  };
}

export function useProfile() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: () => authApi.getProfile(),
  });

  const updateMutation = useMutation({
    mutationFn: authApi.updateProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
      toast.success('Profile updated');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Update failed');
    },
  });

  return {
    profile: (data as any)?.data,
    isLoading,
    updateProfile: updateMutation.mutate,
    isUpdating: updateMutation.isPending,
  };
}
