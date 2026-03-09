import  { createContext, useState, useEffect, useContext } from "react";
const ThemeContext = createContext();
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Check for saved theme preference - Use 'theme' for Orbit
    const savedTheme = localStorage.getItem("theme"); // Changed from 'africwords-theme'

    if (savedTheme) {
      setIsDarkMode(savedTheme === "dark");
    } else {
      // Check system preference
      const prefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)",
      ).matches;
      setIsDarkMode(prefersDark);
    }
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    // Update HTML class
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark"); // Changed from 'africwords-theme'
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light"); // Changed from 'africwords-theme'
    }

    // Force a reflow to ensure styles apply immediately
    document.documentElement.style.animation = "none";
    setTimeout(() => {
      document.documentElement.style.animation = "";
    }, 10);
  }, [isDarkMode, mounted]);

  const toggleTheme = () => {
    setIsDarkMode((prev) => !prev);
  };

  const setTheme = (theme) => {
    setIsDarkMode(theme === "dark");
  };

  const value = {
    isDarkMode,
    toggleTheme,
    setTheme,
    mounted,
  };
  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};
