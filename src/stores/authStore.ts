import { create } from 'zustand';
import type { User } from '../types';
import { mockApi } from '../services/mockApi';

interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (email: string, pass: string) => Promise<void>;
    register: (email: string, pass: string, name: string) => Promise<void>;
    logout: () => Promise<void>;
    checkSession: () => Promise<void>;
}

export const useAuth = create<AuthState>((set) => ({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    login: async (email, pass) => {
        set({ isLoading: true });
        try {
            const { user } = await mockApi.auth.login(email, pass);
            set({ user, isAuthenticated: true });
        } finally {
            set({ isLoading: false });
        }
    },
    register: async (email, pass, name) => {
        set({ isLoading: true });
        try {
            const { user } = await mockApi.auth.register(email, pass, name);
            set({ user, isAuthenticated: true });
        } finally {
            set({ isLoading: false });
        }
    },
    logout: async () => {
        set({ isLoading: true });
        await mockApi.auth.logout();
        set({ user: null, isAuthenticated: false, isLoading: false });
    },
    checkSession: async () => {
        set({ isLoading: true });
        const user = await mockApi.auth.getCurrentUser();
        set({ user, isAuthenticated: !!user, isLoading: false });
    },
}));
