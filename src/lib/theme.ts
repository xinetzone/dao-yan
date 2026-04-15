export function getStoredTheme(): "light" | "dark" {
  try {
    return (localStorage.getItem("theme") as "light" | "dark") || "light";
  } catch {
    return "light";
  }
}

export function applyTheme(theme: "light" | "dark") {
  const root = document.documentElement;
  if (theme === "dark") {
    root.classList.add("dark");
  } else {
    root.classList.remove("dark");
  }
  try {
    localStorage.setItem("theme", theme);
  } catch { /* ignore */ }
}

export function initTheme() {
  applyTheme(getStoredTheme());
}
