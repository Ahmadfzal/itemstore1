import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { applyTheme } from "@/lib/theme";

export type StoreSettings = {
  storeName: string;
  whatsappNumber: string;
  storeTheme: string;
  packageUnit: string;
  categories: string[];
  units: string[];
  heroStatus: string;
  heroTitle1: string;
  heroTitle2: string;
  heroSubtitle: string;
  heroBgImage: string | null;
};

export type SettingsContextType = {
  settings: StoreSettings;
  setSettings: (s: StoreSettings) => void;
};

const DEFAULT_CATEGORIES = ["Starter", "Popular", "Premium"];
const DEFAULT_UNITS = ["Diamond", "Chip", "Pulsa", "Kredit", "Koin", "Token", "UC", "Voucher"];

const DEFAULT_SETTINGS: StoreSettings = {
  storeName: "Game Store",
  whatsappNumber: "",
  storeTheme: "gaming",
  packageUnit: "Diamond",
  categories: DEFAULT_CATEGORIES,
  units: DEFAULT_UNITS,
  heroStatus: "SYSTEM ONLINE",
  heroTitle1: "POWER UP",
  heroTitle2: "YOUR GAME",
  heroSubtitle: "Instant delivery, secure payments, and the best rates across the multiverse. Select your package and dominate the leaderboard.",
  heroBgImage: null,
};

const SettingsContext = createContext<SettingsContextType>({
  settings: DEFAULT_SETTINGS,
  setSettings: () => {},
});

function parseJsonArray(raw: unknown, fallback: string[]): string[] {
  try {
    const parsed = JSON.parse(raw as string);
    return Array.isArray(parsed) && parsed.length ? parsed : fallback;
  } catch {
    return fallback;
  }
}

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettingsState] = useState<StoreSettings>(() => {
    try {
      const cached = localStorage.getItem("store_theme");
      if (cached) applyTheme(cached);
    } catch {}
    return DEFAULT_SETTINGS;
  });

  const setSettings = (s: StoreSettings) => {
    setSettingsState(s);
    applyTheme(s.storeTheme);
  };

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((data: any) => {
        setSettingsState({
          storeName: data.storeName ?? "Game Store",
          whatsappNumber: data.whatsappNumber ?? "",
          storeTheme: data.storeTheme ?? "gaming",
          packageUnit: data.packageUnit ?? "Diamond",
          categories: parseJsonArray(data.categories, DEFAULT_CATEGORIES),
          units: parseJsonArray(data.units, DEFAULT_UNITS),
          heroStatus: data.heroStatus ?? "SYSTEM ONLINE",
          heroTitle1: data.heroTitle1 ?? "POWER UP",
          heroTitle2: data.heroTitle2 ?? "YOUR GAME",
          heroSubtitle: data.heroSubtitle ?? DEFAULT_SETTINGS.heroSubtitle,
          heroBgImage: data.heroBgImage ?? null,
        });
        applyTheme(data.storeTheme ?? "gaming");
      })
      .catch(() => {});
  }, []);

  return (
    <SettingsContext.Provider value={{ settings, setSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}

export const useSettings = () => useContext(SettingsContext);
