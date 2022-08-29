import { useState, useEffect } from 'react';
import useLocalStorageState from 'use-local-storage-state';

export type Theme = 'dark' | 'light' | 'os';

export const useTheme = () => useLocalStorageState<Theme>('theme');

const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

export const useThemeClass = () => {
  const [theme] = useTheme();
  const [themeClass, setThemeClass] = useState<'dark' | 'light' | undefined>();

  useEffect(() => {
    if (theme === 'os') {
      setThemeClass(darkModeMediaQuery.matches ? 'dark' : 'light');
    } else {
      setThemeClass(theme);
    }

    const listener = (e: MediaQueryListEvent) => {
      if (theme === 'os') {
        setThemeClass(e.matches ? 'dark' : 'light');
      }
    };

    darkModeMediaQuery.addEventListener('change', listener);

    return () => darkModeMediaQuery.removeEventListener('change', listener);
  }, [theme]);

  return themeClass;
};
