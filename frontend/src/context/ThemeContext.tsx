import React, { createContext, useContext, useState, useEffect } from 'react';

export type ThemeMode = 'dark' | 'light' | 'emerald' | 'cyber' | 'property';

export interface ThemeOption {
  id: ThemeMode;
  name: string;
  nativeName: string;
  icon: string;
  accentColor: string;
  description: string;
}

export const THEME_OPTIONS: ThemeOption[] = [
  {
    id: 'property',
    name: 'Real Estate Green',
    nativeName: 'भूमि संपत्ति',
    icon: '🏡',
    accentColor: '#15803d',
    description: 'Premium light green theme with a realistic property feel'
  },
  {
    id: 'dark',
    name: 'Dark Midnight',
    nativeName: 'डार्क मोड',
    icon: '🌙',
    accentColor: '#0ea5e9',
    description: 'Classic deep slate & sky blue governance dark mode'
  },
  {
    id: 'light',
    name: 'Light Govt Pearl',
    nativeName: 'लाइट मोड',
    icon: '☀️',
    accentColor: '#0284c7',
    description: 'Crisp, high-clarity daylight reading mode'
  },
  {
    id: 'emerald',
    name: 'Bhoomi Emerald',
    nativeName: 'भूमि हरियाली',
    icon: '🌲',
    accentColor: '#10b981',
    description: 'Vedic green & forest agricultural revenue theme'
  },
  {
    id: 'cyber',
    name: 'Cyber Indigo',
    nativeName: 'साइबर इंडिगो',
    icon: '🌌',
    accentColor: '#8b5cf6',
    description: 'High-contrast futuristic purple & neon indigo theme'
  }
];

interface ThemeContextType {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  currentThemeInfo: ThemeOption;
  themes: ThemeOption[];
  toggleDarkMode: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem('bhoomishield_theme') as ThemeMode;
    if (saved && ['dark', 'light', 'emerald', 'cyber', 'property'].includes(saved)) {
      return saved;
    }
    return 'property'; // Default property theme
  });

  useEffect(() => {
    localStorage.setItem('bhoomishield_theme', theme);
    const root = document.documentElement;

    // Remove previous theme classes
    root.classList.remove('dark', 'light', 'theme-light', 'theme-emerald', 'theme-cyber', 'theme-property');

    if (theme === 'dark') {
      root.classList.add('dark');
    } else if (theme === 'light') {
      root.classList.add('light', 'theme-light');
    } else if (theme === 'emerald') {
      root.classList.add('dark', 'theme-emerald');
    } else if (theme === 'cyber') {
      root.classList.add('dark', 'theme-cyber');
    } else if (theme === 'property') {
      root.classList.add('light', 'theme-property');
    }
  }, [theme]);

  const setTheme = (newTheme: ThemeMode) => {
    setThemeState(newTheme);
  };

  const toggleDarkMode = () => {
    setThemeState(prev => (prev === 'dark' || prev === 'emerald' || prev === 'cyber' ? 'property' : 'dark'));
  };

  const currentThemeInfo = THEME_OPTIONS.find(t => t.id === theme) || THEME_OPTIONS[0];

  return (
    <ThemeContext.Provider value={{
      theme,
      setTheme,
      currentThemeInfo,
      themes: THEME_OPTIONS,
      toggleDarkMode
    }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
