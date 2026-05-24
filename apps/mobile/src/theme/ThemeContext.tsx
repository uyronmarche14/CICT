import { createContext, useContext, useEffect, useState, PropsWithChildren } from 'react';
import { useColorScheme } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { colors as lightColors, darkColors } from '@/theme/tokens';

const THEME_KEY = 'cict_mobile_theme_preference';

type ThemePreference = 'system' | 'light' | 'dark';

type ThemeContextValue = {
  isDark: boolean;
  colors: typeof lightColors;
  preference: ThemePreference;
  setPreference: (pref: ThemePreference) => void;
  toggleDark: () => void;
};

const ThemeContext = createContext<ThemeContextValue>({
  isDark: false,
  colors: lightColors,
  preference: 'system',
  setPreference: () => {},
  toggleDark: () => {},
});

async function loadPreference(): Promise<ThemePreference> {
  try {
    const stored = await SecureStore.getItemAsync(THEME_KEY);
    if (stored === 'light' || stored === 'dark' || stored === 'system') {
      return stored;
    }
  } catch {}
  return 'system';
}

async function savePreference(pref: ThemePreference) {
  try {
    await SecureStore.setItemAsync(THEME_KEY, pref);
  } catch {}
}

export function ThemeProvider({ children }: PropsWithChildren) {
  const systemScheme = useColorScheme();
  const [preference, setPreferenceState] = useState<ThemePreference>('system');
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    loadPreference().then((pref) => {
      setPreferenceState(pref);
      setLoaded(true);
    });
  }, []);

  const isDark = preference === 'system' ? systemScheme === 'dark' : preference === 'dark';

  const setPreference = (pref: ThemePreference) => {
    setPreferenceState(pref);
    savePreference(pref);
  };

  const toggleDark = () => {
    const next = isDark ? 'light' : 'dark';
    setPreference(next);
  };

  if (!loaded) {
    return <>{children}</>;
  }

  return (
    <ThemeContext.Provider
      value={{
        isDark,
        colors: isDark ? darkColors : lightColors,
        preference,
        setPreference,
        toggleDark,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
