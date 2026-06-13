import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Language = 'en' | 'ar';
type Theme = 'light' | 'dark';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  avatar?: string | null;
}

interface AppState {
  language: Language;
  theme: Theme;
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  setLanguage: (lang: Language) => void;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  login: (user: User, token: string) => void;
  logout: () => void;
  setUser: (user: User) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      language: 'en',
      theme: 'light',
      user: null,
      token: null,
      isAuthenticated: false,
      setLanguage: (lang) => set({ language: lang }),
      setTheme: (theme) => {
        set({ theme });
        if (theme === 'dark') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      },
      toggleTheme: () => {
        const newTheme = get().theme === 'light' ? 'dark' : 'light';
        get().setTheme(newTheme);
      },
      login: (user, token) => set({ user, token, isAuthenticated: true }),
      logout: () => set({ user: null, token: null, isAuthenticated: false }),
      setUser: (user) => set({ user }),
    }),
    {
      name: 'herbs-admin-storage',
    }
  )
);
