"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // Default theme is dark. We only care if they explicitly set "light"
    if (session?.user?.id) {
      const savedSettings = localStorage.getItem(`settings_${session.user.id}`);
      if (savedSettings) {
        try {
          const parsed = JSON.parse(savedSettings);
          if (parsed.theme === "light") {
            document.documentElement.classList.add("light-theme");
            document.body.classList.add("light-theme");
          } else {
            document.documentElement.classList.remove("light-theme");
            document.body.classList.remove("light-theme");
          }
        } catch (e) {}
      }
    }
  }, [session?.user?.id]);

  // Listen for storage events (if changed in another tab or from SettingsForm)
  useEffect(() => {
    const handleStorage = () => {
      if (session?.user?.id) {
        const savedSettings = localStorage.getItem(`settings_${session.user.id}`);
        if (savedSettings) {
          try {
            const parsed = JSON.parse(savedSettings);
            if (parsed.theme === "light") {
              document.documentElement.classList.add("light-theme");
              document.body.classList.add("light-theme");
            } else {
              document.documentElement.classList.remove("light-theme");
              document.body.classList.remove("light-theme");
            }
          } catch (e) {}
        }
      }
    };
    
    // Add custom event listener for immediate updates within same tab
    window.addEventListener("themeChanged", handleStorage);
    return () => window.removeEventListener("themeChanged", handleStorage);
  }, [session?.user?.id]);

  if (!mounted) return <>{children}</>;

  return <>{children}</>;
}
