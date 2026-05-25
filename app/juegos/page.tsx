import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Navbar } from "@/components/landing/Navbar";
import { ParticlesBackground } from "@/components/landing/ParticlesBackground";
import { GameClient } from "./GameClient";
import prisma from "@/lib/prisma";
import Link from "next/link";

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
    { id: "g1", title: "Puzzledom One Line", category: "Puzzle", thumb: "https://img.gamemonetize.com/uevrcg9lfez7iipsw4z91s5inewmeso5/512x384.jpg", url: "https://html5.gamemonetize.co/uevrcg9lfez7iipsw4z91s5inewmeso5/" },
    { id: "g2", title: "Mr Fight", category: "Acción", thumb: "https://img.gamemonetize.com/df7qc4evnbkrv1w49yuscgev12p112be/512x384.jpg", url: "https://html5.gamemonetize.co/df7qc4evnbkrv1w49yuscgev12p112be/" },
    { id: "g3", title: "Sniper Mission War", category: "Disparos", thumb: "https://img.gamemonetize.com/lgrku412hrxdytv220yo4lr2ugh8sb6j/512x384.jpg", url: "https://html5.gamemonetize.co/lgrku412hrxdytv220yo4lr2ugh8sb6j/" },
    { id: "g4", title: "Toca Life Adventure", category: "Aventura", thumb: "https://img.gamemonetize.com/wl12iuserxdpc4y0b8vcjoz6alzccms5/512x384.jpg", url: "https://html5.gamemonetize.co/wl12iuserxdpc4y0b8vcjoz6alzccms5/" },
    { id: "g5", title: "Super Huggie Bros", category: "Plataformas", thumb: "https://img.gamemonetize.com/3ex0z77vqo2zz4wmellpculd54tqyowc/512x384.jpg", url: "https://html5.gamemonetize.co/3ex0z77vqo2zz4wmellpculd54tqyowc/" },
    { id: "g6", title: "Rescue Rainbow Monster", category: "Acción", thumb: "https://img.gamemonetize.com/747v6poddba7w1b1n39dihdf6tmz34gn/512x384.jpg", url: "https://html5.gamemonetize.co/747v6poddba7w1b1n39dihdf6tmz34gn/" },
    { id: "g7", title: "Hit Masters Rush", category: "Acción", thumb: "https://img.gamemonetize.com/bnwny2zvzjcwaa7lrthoje1ri364fvmg/512x384.jpg", url: "https://html5.gamemonetize.co/bnwny2zvzjcwaa7lrthoje1ri364fvmg/" },
    { id: "g8", title: "FoodHead Fighters", category: "Lucha", thumb: "https://img.gamemonetize.com/95rpyg86xtlqy4a68ahmdzbs8sgrwmfr/512x384.jpg", url: "https://html5.gamemonetize.co/95rpyg86xtlqy4a68ahmdzbs8sgrwmfr/" },
    { id: "g9", title: "Rider Online Pro", category: "Carreras", thumb: "https://img.gamemonetize.com/xqxcsqazsozjzy71jb1hn0a54dorg91d/512x384.jpg", url: "https://html5.gamemonetize.co/xqxcsqazsozjzy71jb1hn0a54dorg91d/" },
    { id: "g10", title: "Monsters Attack", category: "Estrategia", thumb: "https://img.gamemonetize.com/l5s3o2it4qyzc217qldfio11urspud5r/512x384.jpg", url: "https://html5.gamemonetize.co/l5s3o2it4qyzc217qldfio11urspud5r/" },
    { id: "g11", title: "Stickman Survive", category: "Supervivencia", thumb: "https://img.gamemonetize.com/zx1x0yknh5emq3mzop2fvbpimsxgpz9h/512x384.jpg", url: "https://html5.gamemonetize.co/zx1x0yknh5emq3mzop2fvbpimsxgpz9h/" },
    { id: "g12", title: "Scary Mad Shark", category: "Acción", thumb: "https://img.gamemonetize.com/3eo4jyqsvfweb9iw5h4l9u5qlf8si07m/512x384.jpg", url: "https://html5.gamemonetize.co/3eo4jyqsvfweb9iw5h4l9u5qlf8si07m/" },
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

        {/* NUEVA SECCIÓN DE JUEGOS PREMIUM HTML5 (DESARROLLADOS CON PHASER 3) */}
        <div className="border-t border-white/5 pt-16 mt-20 space-y-8">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-2.5 h-2.5 bg-cyan-500 rounded-full animate-pulse"></div>
              <span className="text-[10px] font-black text-cyan-400 uppercase tracking-[0.4em]">Juegos HTML5 Exclusivos</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-black text-white italic uppercase tracking-tighter">
              Nuestros Juegos <span className="text-cyan-400">Premium</span>
            </h2>
            <p className="text-slate-400 font-medium max-w-xl text-xs md:text-sm">
              Juegos interactivos a medida con sistema RPG, misiones diarias, niveles, compra de aspectos y potenciadores.
              <span className="text-emerald-400 font-bold block mt-1">¡Completa misiones y gana puntos de plataforma directamente!</span>
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
            {/* Tarjeta Runner */}
            <div className="group relative bg-slate-900/40 backdrop-blur-md border border-white/5 p-4 rounded-[2rem] hover:border-cyan-500/20 transition-all flex flex-col gap-4 shadow-xl hover:shadow-cyan-500/2">
              <div className="absolute top-0 right-12 w-16 h-[1.5px] bg-cyan-500/30"></div>
              <div className="relative aspect-[2/1] w-full rounded-2xl overflow-hidden bg-gradient-to-br from-cyan-400 via-blue-500 to-indigo-600 flex flex-col items-center justify-center text-slate-950 font-black shadow-lg">
                <span className="text-[10px] uppercase tracking-widest text-slate-950/80 font-black mb-1">CYBER</span>
                <span className="text-2xl italic tracking-tighter uppercase font-black">RUNNER</span>
              </div>
              
              <div className="flex-1 flex flex-col justify-between space-y-3">
                <div className="space-y-1.5">
                  <span className="text-[8px] bg-cyan-500/10 border border-cyan-500/25 text-cyan-400 px-2 py-0.5 rounded-full font-black uppercase tracking-widest inline-block">
                    Endless Runner
                  </span>
                  <h3 className="text-base font-black text-white italic uppercase tracking-tighter group-hover:text-cyan-400 transition-colors">
                    Cyber Runner
                  </h3>
                  <p className="text-slate-400 text-xs leading-relaxed">
                    Esquiva obstáculos a máxima velocidad, activa escudos, imanes de monedas y jetpacks para batir récords globales.
                  </p>
                </div>
                <Link 
                  href="/games/runner"
                  className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs px-4 py-2.5 rounded-xl uppercase tracking-wider italic transition-all hover:scale-105 text-center shadow-[0_0_20px_rgba(6,182,212,0.3)] block"
                >
                  Jugar Ahora
                </Link>
              </div>
            </div>

            {/* Tarjeta Puzzle */}
            <div className="group relative bg-slate-900/40 backdrop-blur-md border border-white/5 p-4 rounded-[2rem] hover:border-emerald-500/20 transition-all flex flex-col gap-4 shadow-xl hover:shadow-emerald-500/2">
              <div className="absolute top-0 right-12 w-16 h-[1.5px] bg-emerald-500/30"></div>
              <div className="relative aspect-[2/1] w-full rounded-2xl overflow-hidden bg-gradient-to-br from-emerald-400 via-teal-500 to-emerald-600 flex flex-col items-center justify-center text-slate-950 font-black shadow-lg">
                <span className="text-[10px] uppercase tracking-widest text-slate-950/80 font-black mb-1">CANDY</span>
                <span className="text-2xl italic tracking-tighter uppercase font-black">GEM</span>
              </div>
              
              <div className="flex-1 flex flex-col justify-between space-y-3">
                <div className="space-y-1.5">
                  <span className="text-[8px] bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 px-2 py-0.5 rounded-full font-black uppercase tracking-widest inline-block">
                    Match-3 Saga
                  </span>
                  <h3 className="text-base font-black text-white italic uppercase tracking-tighter group-hover:text-emerald-400 transition-colors">
                    Match-3 Puzzle
                  </h3>
                  <p className="text-slate-400 text-xs leading-relaxed">
                    Supera más de 100 niveles desafiantes. Consigue combos masivos y compra boosters especiales para estallar el tablero.
                  </p>
                </div>
                <Link 
                  href="/games/puzzle"
                  className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs px-4 py-2.5 rounded-xl uppercase tracking-wider italic transition-all hover:scale-105 text-center shadow-[0_0_20px_rgba(16,185,129,0.3)] block"
                >
                  Jugar Ahora
                </Link>
              </div>
            </div>

            {/* Tarjeta Labyrinth */}
            <div className="group relative bg-slate-900/40 backdrop-blur-md border border-white/5 p-4 rounded-[2rem] hover:border-violet-500/20 transition-all flex flex-col gap-4 shadow-xl hover:shadow-violet-500/2">
              <div className="absolute top-0 right-12 w-16 h-[1.5px] bg-violet-500/30"></div>
              <div className="relative aspect-[2/1] w-full rounded-2xl overflow-hidden bg-gradient-to-br from-cyan-500 via-violet-600 to-purple-700 flex flex-col items-center justify-center text-slate-950 font-black shadow-lg">
                <span className="text-[10px] uppercase tracking-widest text-slate-950/80 font-black mb-1">ESCAPE</span>
                <span className="text-2xl italic tracking-tighter uppercase font-black">LABYRINTH</span>
              </div>
              
              <div className="flex-1 flex flex-col justify-between space-y-3">
                <div className="space-y-1.5">
                  <span className="text-[8px] bg-violet-500/10 border border-violet-500/25 text-violet-400 px-2 py-0.5 rounded-full font-black uppercase tracking-widest inline-block">
                    Cyber Labyrinth
                  </span>
                  <h3 className="text-base font-black text-white italic uppercase tracking-tighter group-hover:text-violet-400 transition-colors">
                    Escape Labyrinth
                  </h3>
                  <p className="text-slate-400 text-xs leading-relaxed">
                    Escapa de laberintos en la oscuridad, esquiva centinelas láser y compra mapas reveladores o criogenizadores.
                  </p>
                </div>
                <Link 
                  href="/games/labyrinth"
                  className="bg-violet-500 hover:bg-violet-400 text-slate-950 font-black text-xs px-4 py-2.5 rounded-xl uppercase tracking-wider italic transition-all hover:scale-105 text-center shadow-[0_0_20px_rgba(139,92,246,0.3)] block"
                >
                  Jugar Ahora
                </Link>
              </div>
            </div>

            {/* Tarjeta Jump */}
            <div className="group relative bg-slate-900/40 backdrop-blur-md border border-white/5 p-4 rounded-[2rem] hover:border-pink-500/20 transition-all flex flex-col gap-4 shadow-xl hover:shadow-pink-500/2">
              <div className="absolute top-0 right-12 w-16 h-[1.5px] bg-pink-500/30"></div>
              <div className="relative aspect-[2/1] w-full rounded-2xl overflow-hidden bg-gradient-to-br from-pink-500 via-rose-500 to-red-600 flex flex-col items-center justify-center text-slate-950 font-black shadow-lg">
                <span className="text-[10px] uppercase tracking-widest text-slate-950/80 font-black mb-1">IMPOSSIBLE</span>
                <span className="text-2xl italic tracking-tighter uppercase font-black">JUMP</span>
              </div>
              
              <div className="flex-1 flex flex-col justify-between space-y-3">
                <div className="space-y-1.5">
                  <span className="text-[8px] bg-pink-500/10 border border-pink-500/25 text-pink-400 px-2 py-0.5 rounded-full font-black uppercase tracking-widest inline-block">
                    Hardcore Jump
                  </span>
                  <h3 className="text-base font-black text-white italic uppercase tracking-tighter group-hover:text-pink-400 transition-colors">
                    Impossible Jump
                  </h3>
                  <p className="text-slate-400 text-xs leading-relaxed">
                    Sincroniza tus saltos contra trampas de lava y picos en este desafiante platformer con gravedad invertida.
                  </p>
                </div>
                <Link 
                  href="/games/jump"
                  className="bg-pink-500 hover:bg-pink-400 text-slate-950 font-black text-xs px-4 py-2.5 rounded-xl uppercase tracking-wider italic transition-all hover:scale-105 text-center shadow-[0_0_20px_rgba(236,72,153,0.3)] block"
                >
                  Jugar Ahora
                </Link>
              </div>
            </div>

            {/* Tarjeta Roguelike */}
            <div className="group relative bg-slate-900/40 backdrop-blur-md border border-white/5 p-4 rounded-[2rem] hover:border-amber-500/20 transition-all flex flex-col gap-4 shadow-xl hover:shadow-amber-500/2">
              <div className="absolute top-0 right-12 w-16 h-[1.5px] bg-amber-500/30"></div>
              <div className="relative aspect-[2/1] w-full rounded-2xl overflow-hidden bg-gradient-to-br from-amber-400 via-orange-500 to-red-600 flex flex-col items-center justify-center text-slate-950 font-black shadow-lg">
                <span className="text-[10px] uppercase tracking-widest text-slate-950/80 font-black mb-1">MINI</span>
                <span className="text-2xl italic tracking-tighter uppercase font-black">ROGUELIKE</span>
              </div>
              
              <div className="flex-1 flex flex-col justify-between space-y-3">
                <div className="space-y-1.5">
                  <span className="text-[8px] bg-amber-500/10 border border-amber-500/25 text-amber-400 px-2 py-0.5 rounded-full font-black uppercase tracking-widest inline-block">
                    Procedural Dungeon
                  </span>
                  <h3 className="text-base font-black text-white italic uppercase tracking-tighter group-hover:text-amber-400 transition-colors">
                    Mini Roguelike
                  </h3>
                  <p className="text-slate-400 text-xs leading-relaxed">
                    Combate criaturas con espada en mano, recoge tesoros, compra mejoras en el herrero y desciende pisos.
                  </p>
                </div>
                <Link 
                  href="/games/roguelike"
                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs px-4 py-2.5 rounded-xl uppercase tracking-wider italic transition-all hover:scale-105 text-center shadow-[0_0_20px_rgba(245,158,11,0.3)] block"
                >
                  Jugar Ahora
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
