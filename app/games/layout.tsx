import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Zona de Juegos Premium HTML5 | Gana Jugando",
  description: "Diviértete con nuestros juegos premium HTML5 desarrollados en Phaser 3 y gana puntos canjeables por dinero.",
};

export default async function GamesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-[#020617] text-white relative selection:bg-cyan-500/30 overflow-x-hidden antialiased">
      {children}
    </div>
  );
}
