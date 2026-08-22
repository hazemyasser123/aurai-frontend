import { useEffect, useState } from "react";

type Theme = "light" | "dark";

export const useTheme = () => {
  // Check if 'dark' class is already on the HTML element (set by index.html script)
  const [theme, setTheme] = useState<Theme>(() => {
    if (
      typeof window !== "undefined" &&
      document.documentElement.classList.contains("dark")
    ) {
      return "dark";
    }
    return "light";
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      root.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  return { theme, toggleTheme };
};
