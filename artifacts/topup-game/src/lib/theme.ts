export const THEMES: Record<string, { primary: string; secondary: string; label: string; color: string }> = {
  gaming:  { primary: "180 100% 50%",  secondary: "300 100% 50%", label: "Gaming (Cyan)",  color: "#00ffff" },
  purple:  { primary: "270 100% 62%",  secondary: "300 100% 50%", label: "Purple",          color: "#8b5cf6" },
  orange:  { primary: "25 100% 55%",   secondary: "300 100% 50%", label: "Orange",          color: "#f97316" },
  green:   { primary: "145 80% 42%",   secondary: "180 100% 50%", label: "Green",           color: "#22c55e" },
  red:     { primary: "0 90% 55%",     secondary: "25 100% 55%",  label: "Red",             color: "#ef4444" },
};

export function applyTheme(theme: string) {
  const t = THEMES[theme] ?? THEMES.gaming;
  document.documentElement.style.setProperty("--primary", t.primary);
  document.documentElement.style.setProperty("--secondary", t.secondary);
  try { localStorage.setItem("store_theme", theme); } catch {}
}
