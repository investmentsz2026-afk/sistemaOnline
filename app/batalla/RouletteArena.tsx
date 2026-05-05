"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User, Coins, Play, Trophy, Users, CheckCircle2, AlertCircle, Sparkles, Plus, Swords, LogIn, XCircle, Landmark, UserPlus } from "lucide-react";
import { cn } from "@/lib/utils";
import confetti from "canvas-confetti";
import { toast } from "sonner";
import { sendFriendRequest } from "@/app/mensajes/actions";
import { getWaitingBattles, createBattle, joinBattle, getBattleParticipants, leaveBattle, resolveBattle, getUserActiveBattle } from "./actions";

interface RouletteArenaProps {
  initialBalance: number;
  initialBattles: BattleRoom[];
  currentUserId: string;
}

interface BattleRoom {
  id: string;
  creator: string;
  priceUsd: number;
  priceCoins: number;
  joinedCount: number;
  color: string;
}

const ROOM_TYPES = [
  { id: 1, name: "BRONCE", priceUsd: 0.50, priceCoins: 500, color: "from-amber-700 to-amber-900", accent: "text-amber-500" },
  { id: 2, name: "PLATA", priceUsd: 1.00, priceCoins: 1000, color: "from-slate-400 to-slate-600", accent: "text-slate-300" },
  { id: 3, name: "ORO", priceUsd: 5.00, priceCoins: 5000, color: "from-yellow-500 to-amber-600", accent: "text-yellow-400" },
  { id: 4, name: "DIAMANTE", priceUsd: 10.00, priceCoins: 10000, color: "from-cyan-500 to-blue-600", accent: "text-cyan-400" },
];

const SEGMENT_COLORS = ["#FF6B6B", "#FFD93D", "#6BCB77", "#4D96FF", "#937DC2", "#FF8B13", "#FFD700"];

export const RouletteArena = ({ initialBalance, initialBattles, currentUserId }: RouletteArenaProps) => {
  const [balance, setBalance] = useState(initialBalance);
  const [selectedRoomType, setSelectedRoomType] = useState(ROOM_TYPES[0]);
  const [activeRooms, setActiveRooms] = useState<BattleRoom[]>(initialBattles);
  const [currentRoom, setCurrentRoom] = useState<BattleRoom | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [winner, setWinner] = useState<number | null>(null);
  const [joinedPlayers, setJoinedPlayers] = useState<{name: string, id: string, isUser: boolean, userId?: string}[]>([]);
  const [showWinnerModal, setShowWinnerModal] = useState(false);
  const [showLuckMessage, setShowLuckMessage] = useState(false);
  const [showJackpotMessage, setShowJackpotMessage] = useState(false);
  const [errorModal, setErrorModal] = useState<{show: boolean, amountUsd: number} | null>(null);
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  const [accumulatedPool, setAccumulatedPool] = useState(0);

  // Reconexión automática al montar
  useEffect(() => {
    const checkActive = async () => {
      const res = await getUserActiveBattle();
      if (res.success && res.battle) {
        setCurrentRoom(res.battle as BattleRoom);
      }
    };
    checkActive();
  }, []);

  // Refrescar salas reales periódicamente
  useEffect(() => {
    const interval = setInterval(async () => {
      if (isSpinning || currentRoom) return;
      const res = await getWaitingBattles();
      if (res.success && res.battles) {
        setActiveRooms(res.battles);
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [isSpinning, currentRoom]);

  // Sincronizar participantes y estado de la batalla
  useEffect(() => {
    if (!currentRoom || isSpinning) return;
    const syncParticipants = async () => {
      const res = await getBattleParticipants(currentRoom.id);
      if (res.success && (res as any).participants) {
        setJoinedPlayers((res as any).participants.map((p: any) => ({
          ...p,
          isUser: p.userId === currentUserId
        })));
        
        // Sincronizar el pozo acumulado real de la DB
        if ((res as any).accumulated !== undefined) {
          setAccumulatedPool((res as any).accumulated);
        }
        
        // Si el servidor ya marcó la batalla como COMPLETED (porque otro le dio a girar)
        if ((res as any).status === "COMPLETED" && !isSpinning && !winner) {
          handleVisualSpin((res as any).winnerIndex, (res as any).winnerName, false);
        }
      } else if ((res as any).error === "Batalla no encontrada") {
        setCurrentRoom(null);
        setJoinedPlayers([]);
      }
    };

    const interval = setInterval(syncParticipants, 3000);
    return () => clearInterval(interval);
  }, [currentRoom, isSpinning, winner]);

  // Protección contra salida accidental
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (currentRoom && !isSpinning) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [currentRoom, isSpinning]);

  const handleVisualSpin = (targetWinnerIdx: number, winnerName: string, isJackpot: boolean) => {
    if (isSpinning) return;
    setIsSpinning(true);
    
    const segmentAngle = 360 / 7;
    // Rotar 15 vueltas + el ángulo necesario para el ganador
    const extraRotation = 360 - (targetWinnerIdx * segmentAngle);
    const totalRotation = rotation + (360 * 15) + extraRotation;
    
    setRotation(totalRotation);

    setTimeout(() => {
      setIsSpinning(false);
      
      if (isJackpot) {
        // CAYÓ EN ACUMULADO
        setShowJackpotMessage(true);
        setTimeout(() => {
          setShowJackpotMessage(false);
          // Permitir girar de nuevo (el estado ya está listo)
        }, 4000);
      } else {
        // CAYÓ EN UN JUGADOR
        setWinner(targetWinnerIdx);
        confetti({ particleCount: 200, spread: 90, origin: { y: 0.6 } });

        const totalPrize = (currentRoom?.priceCoins || 0) * 6 + accumulatedPool;

        setTimeout(() => {
          setShowWinnerModal(true);
          if (joinedPlayers[targetWinnerIdx]?.isUser) {
            setBalance(prev => prev + totalPrize);
          }
        }, 1000);

        setTimeout(() => {
          setShowWinnerModal(false);
          setJoinedPlayers([]);
          setCurrentRoom(null);
          setWinner(null);
          setAccumulatedPool(0);
        }, 8000);
      }
    }, 7000);
  };

  const handleStartSpin = async () => {
    if (joinedPlayers.length < 6 || !currentRoom || isSpinning) return;
    
    setShowLuckMessage(true);
    const res = await resolveBattle(currentRoom.id);
    
    setTimeout(() => {
      setShowLuckMessage(false);
      if (res.success) {
        handleVisualSpin((res as any).winnerIndex, (res as any).winnerName, (res as any).isJackpot);
      } else {
        toast.error((res as any).error || "Error al iniciar el giro");
      }
    }, 2000);
  };

  const handleCreateRoom = async () => {
    if (balance < selectedRoomType.priceCoins && selectedRoomType.priceUsd > 0) {
      setErrorModal({ show: true, amountUsd: selectedRoomType.priceUsd });
      return;
    }

    const res = await createBattle(selectedRoomType.priceUsd, selectedRoomType.priceCoins);
    if (res.success) {
      if (selectedRoomType.priceUsd > 0) setBalance(prev => prev - selectedRoomType.priceCoins);
      
      const battleId = (res as any).battleId;
      setCurrentRoom({
        id: battleId, 
        creator: "TÚ", 
        priceUsd: selectedRoomType.priceUsd,
        priceCoins: selectedRoomType.priceCoins, 
        joinedCount: 1, 
        color: selectedRoomType.color
      });
      setJoinedPlayers([{ name: "TÚ", id: "YOU", isUser: true, userId: currentUserId }]);
      toast.success("Sala creada. Esperando oponentes...");
    } else {
      toast.error((res as any).error || "No se pudo crear la sala");
    }
  };

  const handleJoinRoom = async (room: BattleRoom) => {
    if (balance < room.priceCoins && room.priceUsd > 0) {
      setErrorModal({ show: true, amountUsd: room.priceUsd });
      return;
    }

    const res = await joinBattle(room.id);
    if (res.success) {
      if (room.priceUsd > 0) setBalance(prev => prev - room.priceCoins);
      setCurrentRoom(room);
      if ((res as any).participants) {
        setJoinedPlayers((res as any).participants.map((p: any) => ({
          ...p,
          isUser: p.userId === currentUserId
        })));
      }
      toast.success("¡Te has unido a la batalla!");
    } else {
      toast.error((res as any).error || "No se pudo unir a la sala");
    }
  };

  const handleLeaveRoom = async () => {
    if (!currentRoom || isSpinning) return;
    const res = await leaveBattle(currentRoom.id);
    if (res.success) {
      if (currentRoom.priceUsd > 0) setBalance(prev => prev + currentRoom.priceCoins);
      setCurrentRoom(null);
      setJoinedPlayers([]);
      setShowLeaveConfirm(false);
      toast.info((res as any).roomClosed ? "Sala cerrada y dinero devuelto" : "Has salido de la sala");
    } else {
      toast.error((res as any).error || "No se pudo salir de la sala");
    }
  };

  const handleAddFriend = async (playerId: string) => {
    if (playerId === "YOU" || playerId.length !== 6) return;
    const res = await sendFriendRequest(playerId);
    if (res.success) toast.success("¡Solicitud de amistad enviada!");
    else toast.error((res as any).error);
  };

  return (
    <div className="space-y-12 pb-32">
      {/* MODALES DE ERROR Y ÉXITO */}
      <AnimatePresence>
        {errorModal?.show && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[300] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md">
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className="bg-[#0b0e14] border border-red-500/30 rounded-[3rem] p-10 max-w-md w-full text-center shadow-2xl">
              <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6"><XCircle className="w-10 h-10 text-red-500" /></div>
              <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter mb-4">Saldo Insuficiente</h2>
              <p className="text-slate-400 font-medium mb-8">Necesitas <span className="text-red-500 font-bold">${errorModal.amountUsd.toFixed(2)} USD</span> para entrar.</p>
              <button onClick={() => setErrorModal(null)} className="w-full py-5 rounded-2xl bg-red-500 text-white font-black uppercase tracking-widest">ACEPTAR</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showLuckMessage && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[300] flex flex-col items-center justify-center bg-black/80 backdrop-blur-lg p-6 text-center">
            <motion.div initial={{ scale: 0.5 }} animate={{ scale: 1 }} exit={{ scale: 1.5 }} className="flex flex-col items-center">
              <Sparkles className="w-12 h-12 md:w-20 md:h-20 text-yellow-400 mb-4 animate-pulse" />
              <h2 className="text-4xl md:text-8xl font-black text-white italic tracking-tighter uppercase leading-none">¡Buena Suerte!</h2>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showWinnerModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[300] bg-[#050a1f]/95 backdrop-blur-3xl flex flex-col items-center justify-center p-6 text-center">
            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="space-y-6 max-w-full">
              <div className="w-16 h-16 md:w-24 md:h-24 bg-yellow-500 rounded-full flex items-center justify-center mx-auto shadow-[0_0_50px_rgba(234,179,8,0.5)]">
                <Trophy className="w-8 h-8 md:w-12 md:h-12 text-yellow-950" />
              </div>
              <h2 className="text-[10px] md:text-sm font-black text-yellow-500 uppercase tracking-[0.3em] md:tracking-[0.5em]">BATALLA TERMINADA</h2>
              <div className="text-3xl md:text-7xl font-black text-white tracking-tighter uppercase break-words px-4 leading-tight">{winner !== null && joinedPlayers[winner]?.name}</div>
              <div className="text-xl md:text-3xl font-black text-emerald-400 italic">GANÓ ${( (currentRoom?.priceUsd || 0) * 6 + (accumulatedPool / 1000) ).toFixed(2)} USD</div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {!currentRoom && (
        <div className="bg-white/5 border border-white/10 rounded-[3rem] p-8 md:p-10 backdrop-blur-xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="space-y-2">
              <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter">Crear Nueva Batalla</h2>
              <p className="text-slate-500 text-sm font-medium">Elige tu apuesta e inicia una sala para que otros se unan.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              {ROOM_TYPES.map((type) => (
                <button key={type.id} onClick={() => setSelectedRoomType(type)} className={cn("px-6 py-4 rounded-2xl border-2 transition-all font-black text-sm", selectedRoomType.id === type.id ? "bg-white/10 border-white/20 text-white shadow-xl scale-105" : "bg-black/20 border-white/5 text-slate-500 opacity-60")}>${type.priceUsd.toFixed(2)}</button>
              ))}
            </div>
            <button onClick={handleCreateRoom} className="px-8 py-5 rounded-[2rem] bg-gradient-to-r from-red-500 to-orange-600 text-white font-black uppercase tracking-widest hover:scale-105 shadow-2xl flex items-center gap-3"><Plus className="w-5 h-5" /> INICIAR SALA</button>
          </div>
        </div>
      )}

      {/* MODAL DE CONFIRMACIÓN PARA SALIR */}
      <AnimatePresence>
        {showLeaveConfirm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[400] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md">
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className="bg-[#0b0e14] border border-white/10 rounded-[3rem] p-10 max-w-md w-full text-center shadow-2xl">
              <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6"><AlertCircle className="w-10 h-10 text-red-500" /></div>
              <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter mb-4">¿Abandonar Sala?</h2>
              <p className="text-slate-400 font-medium mb-8">Si sales ahora, podrías perder tu lugar en la batalla.</p>
              <div className="grid grid-cols-2 gap-4">
                <button onClick={() => setShowLeaveConfirm(false)} className="py-4 rounded-2xl bg-white/5 border border-white/10 text-white font-black uppercase tracking-widest hover:bg-white/10 transition-colors">CANCELAR</button>
                <button onClick={handleLeaveRoom} className="py-4 rounded-2xl bg-red-500 text-white font-black uppercase tracking-widest hover:bg-red-600 transition-colors">SÍ, SALIR</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {currentRoom && (
        <div className="bg-[#0b0e14]/60 border border-white/5 rounded-[4rem] pt-32 pb-10 px-6 md:p-16 backdrop-blur-3xl relative shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-500">
          
          <div className="absolute top-6 left-0 right-0 md:left-auto md:right-8 z-30 flex flex-col items-center md:items-end gap-1 px-6">
            <div className="px-3 py-1 bg-yellow-500 rounded-full flex items-center gap-2 shadow-lg shadow-yellow-500/20">
              <Landmark className="w-3 h-3 text-yellow-950" />
              <span className="text-[9px] font-black text-yellow-950 uppercase tracking-widest">Pozo Acumulado</span>
            </div>
            <div className="text-2xl md:text-3xl font-black text-white italic tracking-tighter">${(accumulatedPool / 1000).toFixed(2)}</div>
          </div>

          <div className="flex flex-col lg:flex-row items-center gap-12 md:gap-24">
            <div className="relative w-full max-w-[340px] md:max-w-[480px] aspect-square flex-shrink-0">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-40">
                <motion.div animate={isSpinning ? { rotate: [-5, 5, -5], y: [0, 2, 0] } : {}} transition={{ duration: 0.1, repeat: Infinity }} className="w-12 h-14 bg-white shadow-2xl flex items-center justify-center" style={{ clipPath: "polygon(0% 0%, 100% 0%, 50% 100%)" }}>
                  <div className="w-8 h-10 bg-gradient-to-b from-red-500 to-red-700" style={{ clipPath: "polygon(0% 0%, 100% 0%, 50% 100%)" }} />
                </motion.div>
              </div>
              
              <motion.div animate={{ rotate: rotation }} transition={{ duration: 7, ease: [0.2, 0, 0, 1] }} className="w-full h-full rounded-full border-[10px] md:border-[15px] border-white/10 relative overflow-hidden shadow-2xl bg-[#0b0e14]" style={{ background: `conic-gradient(from ${360 / 7 / -2 - 90}deg, ${SEGMENT_COLORS[0]} 0deg 51.4deg, ${SEGMENT_COLORS[1]} 51.4deg 102.8deg, ${SEGMENT_COLORS[2]} 102.8deg 154.2deg, ${SEGMENT_COLORS[3]} 154.2deg 205.7deg, ${SEGMENT_COLORS[4]} 205.7deg 257.1deg, ${SEGMENT_COLORS[5]} 257.1deg 308.5deg, ${SEGMENT_COLORS[6]} 308.5deg 360deg)` }}>
                {[...Array(7)].map((_, i) => (
                  <div key={i} className="absolute top-0 left-1/2 w-full h-[35%] flex flex-col items-center justify-center pt-2" style={{ transform: `translateX(-50%) rotate(${i * (360/7)}deg)`, transformOrigin: "50% 143%" }}>
                    <span className={cn("font-black text-[10px] md:text-[18px] uppercase tracking-tighter [writing-mode:vertical-rl] rotate-180 drop-shadow-sm max-h-[85%] overflow-hidden text-center leading-none", i === 6 ? "text-yellow-950" : "text-slate-900")}>{i === 6 ? "ACUMULADO" : (joinedPlayers[i] ? `${joinedPlayers[i].name}` : "VACÍO")}</span>
                  </div>
                ))}
              </motion.div>
              
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 md:w-32 md:h-32 rounded-full bg-white border-[8px] md:border-[12px] border-[#0b0e14] flex items-center justify-center shadow-2xl z-20"><Coins className="w-10 h-10 md:w-16 md:h-16 text-yellow-500" /></div>
            </div>

            <div className="flex-1 w-full space-y-6">
              <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8">
                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Premio Total</h3>
                <div className="text-5xl md:text-7xl font-black text-white tracking-tighter italic">${(currentRoom.priceUsd * 6).toFixed(2)}</div>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-6 space-y-4">
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Sala ({joinedPlayers.length}/6)</h4>
                <div className="space-y-2">
                  {joinedPlayers.map((player, i) => (
                    <div key={i} className={cn("flex items-center justify-between p-4 rounded-2xl border", player.isUser ? "bg-cyan-500/10 border-cyan-500/30" : "bg-white/5 border-white/5")}>
                      <div className="flex items-center gap-4"><div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-[10px] font-black text-white">{player.name[0]}</div><span className="text-xs font-black text-white uppercase">{player.name}</span></div>
                      <div className="flex items-center gap-2">
                        {!player.isUser && <button onClick={() => handleAddFriend(player.id)} className="p-2 bg-white/5 hover:bg-cyan-500 hover:text-slate-950 rounded-lg transition-all"><UserPlus className="w-4 h-4" /></button>}
                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                      </div>
                    </div>
                  ))}
                </div>
                {!isSpinning && <button onClick={() => setShowLeaveConfirm(true)} className="w-full py-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-500 text-[10px] font-black uppercase tracking-widest border border-red-500/20">ABANDONAR SALA</button>}
              </div>
              
              <div className="w-full">
                {joinedPlayers.length === 6 ? (
                  currentRoom.creator === "TÚ" ? (
                    <button onClick={handleStartSpin} disabled={isSpinning} className="w-full py-7 rounded-[2.5rem] bg-gradient-to-r from-yellow-400 to-orange-500 text-yellow-950 font-black text-xl uppercase tracking-[0.3em] shadow-2xl animate-pulse">🚀 GIRAR RULETA</button>
                  ) : (
                    <button disabled className="w-full py-7 rounded-[2.5rem] bg-indigo-500/20 text-indigo-400 font-black text-xl uppercase tracking-[0.2em] cursor-wait">ESPERANDO AL CREADOR...</button>
                  )
                ) : (
                  <button disabled className="w-full py-7 rounded-[2.5rem] bg-slate-800 text-slate-500 font-black text-xl uppercase tracking-[0.2em] opacity-50 cursor-not-allowed">ESPERANDO JUGADORES...</button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {!currentRoom && (
        <div className="space-y-6 px-2">
          <div className="flex items-center gap-3"><Swords className="w-6 h-6 text-red-500" /><h2 className="text-3xl font-black text-white uppercase italic tracking-tighter">Batallas en Espera</h2></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeRooms.map((room) => (
              <motion.div key={room.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white/5 border border-white/10 rounded-[2.5rem] p-6 hover:bg-white/[0.08] transition-all group">
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-3"><div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-white font-black text-sm">{room.creator[0]}</div><div><div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Creada por</div><div className="text-xs font-bold text-white uppercase">{room.creator}</div></div></div>
                  <div className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full"><span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">{room.joinedCount}/6 Jugadores</span></div>
                </div>
                <div className="flex items-end justify-between">
                  <div><div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Apuesta Requerida</div><div className="text-3xl font-black text-white tracking-tighter">${room.priceUsd.toFixed(2)}</div></div>
                  <button onClick={() => handleJoinRoom(room)} className="px-6 py-3 rounded-2xl bg-white text-slate-950 font-black text-[10px] uppercase tracking-widest transition-all flex items-center gap-2"><LogIn className="w-4 h-4" /> UNIRSE</button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
