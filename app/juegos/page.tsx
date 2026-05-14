import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Navbar } from "@/components/landing/Navbar";
import { ParticlesBackground } from "@/components/landing/ParticlesBackground";
import { GameClient } from "./GameClient";
import prisma from "@/lib/prisma";

export const metadata = {
  title: "Zona de Juegos | Gana Jugando",
};

export default async function JuegosPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { points: true }
  });

  // Lista de juegos populares de GameMonetize (URLs Reales HTML5)
  const games = [
    { id: "g1", title: "Puzzledom One Line", category: "Puzzle", thumb: "https://gamemonetize.com/token/puzzledom-one-line.png", url: "https://html5.gamemonetize.co/uevrcg9lfez7iipsw4z91s5inewmeso5/" },
    { id: "g2", title: "Mr Fight", category: "Acción", thumb: "https://gamemonetize.com/token/mr-fight.png", url: "https://html5.gamemonetize.co/df7qc4evnbkrv1w49yuscgev12p112be/" },
    { id: "g3", title: "Sniper Mission War", category: "Disparos", thumb: "https://gamemonetize.com/token/sniper-mission-war.png", url: "https://html5.gamemonetize.co/lgrku412hrxdytv220yo4lr2ugh8sb6j/" },
    { id: "g4", title: "Toca Life Adventure", category: "Aventura", thumb: "https://gamemonetize.com/token/toca-life-adventure.png", url: "https://html5.gamemonetize.co/wl12iuserxdpc4y0b8vcjoz6alzccms5/" },
    { id: "g5", title: "Super Huggie Bros", category: "Plataformas", thumb: "https://gamemonetize.com/token/super-huggie-bros.png", url: "https://html5.gamemonetize.co/3ex0z77vqo2zz4wmellpculd54tqyowc/" },
    { id: "g6", title: "Rescue Rainbow Monster", category: "Acción", thumb: "https://gamemonetize.com/token/rescue-from-rainbow-monster-online.png", url: "https://html5.gamemonetize.co/747v6poddba7w1b1n39dihdf6tmz34gn/" },
    { id: "g7", title: "Hit Masters Rush", category: "Acción", thumb: "https://gamemonetize.com/token/hit-masters-rush.png", url: "https://html5.gamemonetize.co/bnwny2zvzjcwaa7lrthoje1ri364fvmg/" },
    { id: "g8", title: "FoodHead Fighters", category: "Lucha", thumb: "https://gamemonetize.com/token/foodhead-fighters.png", url: "https://html5.gamemonetize.co/95rpyg86xtlqy4a68ahmdzbs8sgrwmfr/" },
    { id: "g9", title: "Rider Online Pro", category: "Carreras", thumb: "https://gamemonetize.com/token/rider-online-pro.png", url: "https://html5.gamemonetize.co/xqxcsqazsozjzy71jb1hn0a54dorg91d/" },
    { id: "g10", title: "Monsters Attack", category: "Estrategia", thumb: "https://gamemonetize.com/token/monsters-attack-impostor-squad.png", url: "https://html5.gamemonetize.co/l5s3o2it4qyzc217qldfio11urspud5r/" },
    { id: "g11", title: "Stickman Survive", category: "Supervivencia", thumb: "https://gamemonetize.com/token/stickman-night-survive.png", url: "https://html5.gamemonetize.co/zx1x0yknh5emq3mzop2fvbpimsxgpz9h/" },
    { id: "g12", title: "Scary Mad Shark", category: "Acción", thumb: "https://gamemonetize.com/token/scary-mad-shark.png", url: "https://html5.gamemonetize.co/3eo4jyqsvfweb9iw5h4l9u5qlf8si07m/" },
  ];

  return (
    <main className="min-h-screen bg-[#020617] relative overflow-hidden">
      <ParticlesBackground />
      <Navbar />

      <div className="relative z-10 pt-32 pb-20 px-6 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
              <span className="text-[10px] font-black text-cyan-400 uppercase tracking-[0.4em]">Arena de Combate</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-black text-white italic uppercase tracking-tighter">
              Zona de <span className="text-cyan-400">Juegos</span>
            </h1>
            <p className="text-slate-400 font-medium max-w-xl">
              Elige tu juego favorito, diviértete y acumula puntos por cada minuto de acción. 
              <span className="text-emerald-400 font-bold block mt-1">¡Gana +10 Puntos cada 5 minutos de juego!</span>
            </p>
          </div>
          
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-[2rem] flex items-center gap-6">
            <div className="text-right">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Tus Puntos</p>
              <p className="text-2xl font-black text-white italic tabular-nums">{user?.points || 0}</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 flex items-center justify-center">
              <div className="w-6 h-6 text-cyan-400 font-black">P</div>
            </div>
          </div>
        </div>

        <GameClient initialGames={games} />
      </div>
    </main>
  );
}
