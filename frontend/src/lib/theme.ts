
const getThemeKey = (userId: string) =>
  `cisco-nexus-preferences-${userId}`;

export type ThemePreferences = {
  darkMode: boolean;
  notifications: boolean;
};

export function applyTheme(darkMode: boolean) {
  document.documentElement.classList.toggle("dark-mode", darkMode);
  document.documentElement.style.colorScheme = darkMode
    ? "dark"
    : "light";
}

export function loadSavedTheme(userId: string) {
  try {
    const saved = localStorage.getItem(getThemeKey(userId));

    if (!saved) {
      applyTheme(false);
      return;
    }

    const preferences = JSON.parse(saved) as Partial<ThemePreferences>;
    applyTheme(preferences.darkMode === true);
  } catch {
    applyTheme(false);
  }
}

export function saveThemePreference(
  userId: string,
  darkMode: boolean
) {
  try {
    const key = getThemeKey(userId);
    const saved = localStorage.getItem(key);

    let preferences: Partial<ThemePreferences> = {};

    if (saved) {
      try {
        preferences = JSON.parse(saved) as Partial<ThemePreferences>;
      } catch {
        preferences = {};
      }
    }

    localStorage.setItem(
      key,
      JSON.stringify({
        ...preferences,
        darkMode,
      })
    );
  } catch (error) {
    console.error("Unable to save theme preference:", error);
  }

  applyTheme(darkMode);
}
