"use client";

import { useEffect } from "react";

export default function Home() {
  useEffect(() => {
    // Forzamos la redirección a nivel de navegador para romper cualquier cache
    window.location.href = "/login";
  }, []);

  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
}
