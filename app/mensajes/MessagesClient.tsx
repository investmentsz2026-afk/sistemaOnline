"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Users, 
  Search, 
  UserPlus, 
  MessageSquare, 
  Send, 
  Image as ImageIcon, 
  MoreVertical,
  Check,
  X,
  UserCircle,
  Hash,
  ArrowLeft,
  AlertTriangle,
  Gift
} from "lucide-react";
import { cn } from "@/lib/utils";
import { sendFriendRequest, respondToFriendRequest, sendMessage, getOrCreateConversation, deleteConversation, getGifts, sendGift, initGifts } from "./actions";
import { toast } from "sonner";

interface MessagesClientProps {
  initialFriends: any[];
  initialPending: any[];
  initialConversations: any[];
  currentUser: any;
}

export function MessagesClient({ 
  initialFriends, 
  initialPending, 
  initialConversations,
  currentUser 
}: MessagesClientProps) {
  const [activeTab, setActiveTab] = useState<"chats" | "friends" | "pending">("chats");
  const [selectedConv, setSelectedConv] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState("");
  const [searchId, setSearchId] = useState("");
  const [isMobileView, setIsMobileView] = useState(false);
  const [isAddingFriend, setIsAddingFriend] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isGiftModalOpen, setIsGiftModalOpen] = useState(false);
  const [availableGifts, setAvailableGifts] = useState<any[]>([]);

  const fetchGifts = async () => {
    // Inicializar si es necesario (solo para pruebas)
    await initGifts();
    const gifts = await getGifts();
    setAvailableGifts(gifts);
  };

  const handleSendGift = async (gift: any) => {
    if (!selectedConv) return;
    
    setIsGiftModalOpen(false);
    const res = await sendGift(selectedConv.id, gift.id);
    
    if (res.success) {
      toast.success(`¡Enviaste un ${gift.name}!`);
      // El mensaje se cargará automáticamente por el polling
    } else {
      toast.error(res.error || "Error al enviar regalo");
    }
  };

  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, selectedConv]);

  const handleAddFriend = async () => {
    if (searchId.length !== 6) {
      toast.error("El Player ID debe ser de 6 dígitos");
      return;
    }
    const res = await sendFriendRequest(searchId);
    if (res.success) {
      toast.success("Solicitud enviada correctamente");
      setSearchId("");
      setIsAddingFriend(false);
    } else {
      toast.error(res.error);
    }
  };

  const handleRespond = async (id: string, status: "ACCEPTED" | "REJECTED") => {
    const res = await respondToFriendRequest(id, status);
    if (res.success) {
      toast.success(status === "ACCEPTED" ? "Amistad aceptada" : "Solicitud rechazada");
    }
  };

  const [conversations, setConversations] = useState(initialConversations);
  const [participants, setParticipants] = useState<any[]>([]);

  const selectConversation = (conv: any) => {
    setSelectedConv(conv);
    setMessages(conv.messages || []);
    setParticipants(conv.participants || []);
    setIsMobileView(true);
    markAsRead(conv.id);
  };

  const markAsRead = async (convId: string) => {
    try {
      await fetch(`/api/messages/read?conversationId=${convId}`, { method: "PUT" });
    } catch (err) {
      console.error("Error marking as read:", err);
    }
  };

  const startChatWithFriend = async (friendId: string) => {
    try {
      const conv = await getOrCreateConversation(friendId);
      if (conv) {
        // Actualizar lista local si es nueva
        setConversations(prev => {
          if (prev.find(c => c.id === conv.id)) return prev;
          return [conv, ...prev];
        });
        setSelectedConv(conv);
        const anyConv = conv as any;
        setMessages(anyConv.messages || []);
        setParticipants(anyConv.participants || []);
        setActiveTab("chats");
        setIsMobileView(true);
      }
    } catch (error) {
      toast.error("No se pudo iniciar el chat");
    }
  };

  // Polling para la lista de conversaciones y el chat activo (Cada 5s)
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const res = await fetch("/api/conversations");
        if (res.ok) {
          const data = await res.json();
          setConversations(data);
          
          // Si hay una conversación seleccionada, actualizar mensajes y presencia
          if (selectedConv) {
            const updated = data.find((c: any) => c.id === selectedConv.id);
            if (updated) {
              setMessages(updated.messages);
              setParticipants(updated.participants);
              // Si estamos en este chat, avisar al servidor que los vimos
              markAsRead(selectedConv.id);
            }
          }
        }
      } catch (err) {
        console.error("Error en polling global:", err);
      }
    };

    const interval = setInterval(fetchAllData, 5000);
    return () => clearInterval(interval);
  }, [selectedConv]);

  const getPresenceStatus = (lastSeen: any) => {
    if (!lastSeen) return "Desconectado";
    const last = new Date(lastSeen);
    if (isNaN(last.getTime())) return "Desconectado";
    
    const now = new Date();
    const diffMs = now.getTime() - last.getTime();
    const diffMin = Math.floor(diffMs / 60000);

    if (diffMin < 1) return "En línea";
    return "Desconectado";
  };

  const otherUserPresence = () => {
    const other = participants.find(p => p.userId !== currentUser.id)?.user;
    if (!other) return "Desconectado";
    return getPresenceStatus(other.lastSeen);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("La imagen es demasiado pesada (máx 5MB)");
        return;
      }
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const cancelImage = () => {
    setSelectedFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
  };

  const handleSendMessage = async () => {
    if (!inputText.trim() && !selectedFile) return;
    
    let imageUrl = "";
    if (selectedFile) {
      imageUrl = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(selectedFile);
      });
    }

    const currentText = inputText;
    const currentImg = imageUrl;
    
    setInputText("");
    cancelImage();

    // Optimistic update
    const tempMsg = {
      id: Date.now().toString(),
      text: currentText,
      imageUrl: currentImg,
      senderId: currentUser.id,
      createdAt: new Date().toISOString(),
      isRead: false
    };
    setMessages(prev => [...prev, tempMsg]);

    try {
      await sendMessage(selectedConv.id, currentText, currentImg);
    } catch (error) {
      toast.error("Error al enviar el mensaje táctico");
    }
  };

  const handleDeleteChat = async () => {
    if (!selectedConv) return;

    const res = await deleteConversation(selectedConv.id);
    if (res.success) {
      toast.success("Conversación eliminada");
      setConversations(prev => prev.filter(c => c.id !== selectedConv.id));
      setSelectedConv(null);
      setIsMenuOpen(false);
      setShowDeleteConfirm(false);
      setIsMobileView(false); // Volver a la lista en móviles
    } else {
      toast.error(res.error || "No se pudo eliminar");
    }
  };

  return (
    <div className="w-full h-full max-w-7xl mx-auto flex gap-4 p-4">
      {/* Sidebar - Lista de Conversaciones/Amigos */}
      <aside className={cn(
        "w-full md:w-80 lg:w-96 flex flex-col gap-4 transition-all duration-300",
        isMobileView && "hidden md:flex"
      )}>
        {/* User Info Header */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center">
              <UserCircle className="text-cyan-400 w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-black uppercase text-white">{currentUser.name}</p>
              <p className="text-[10px] font-bold text-cyan-400 flex items-center gap-0.5">
                <Hash className="w-2.5 h-2.5" /> {currentUser.playerId || "------"}
              </p>
            </div>
          </div>
          <button 
            onClick={() => setIsAddingFriend(true)}
            className="p-2 bg-cyan-500 text-slate-950 rounded-lg hover:scale-110 transition-transform"
          >
            <UserPlus className="w-4 h-4" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex bg-black/40 p-1 rounded-xl border border-white/5">
          {[
            { id: "chats", icon: MessageSquare, label: "Chats" },
            { id: "friends", icon: Users, label: "Amigos" },
            { id: "pending", icon: UserPlus, label: "Solicitudes", count: initialPending.length }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all relative overflow-hidden",
                activeTab === tab.id ? "bg-cyan-500 text-slate-950 shadow-[0_0_20px_rgba(34,211,238,0.4)]" : "text-slate-500 hover:text-white"
              )}
            >
              <tab.icon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{tab.label}</span>
              {tab.count ? (
                <motion.span 
                  initial={{ scale: 0 }} animate={{ scale: 1 }}
                  className="bg-red-500 text-white w-4 h-4 rounded-full text-[8px] flex items-center justify-center animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.5)]"
                >
                  {tab.count}
                </motion.span>
              ) : null}
            </button>
          ))}
        </div>

        {/* List Content */}
        <div className="flex-1 bg-black/20 rounded-2xl border border-white/5 overflow-y-auto custom-scrollbar">
          <AnimatePresence mode="wait">
            {activeTab === "chats" && (
              <motion.div 
                initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}
                className="p-2 space-y-2"
              >
                {conversations.length === 0 ? (
                  <div className="py-20 text-center opacity-30">
                    <MessageSquare className="w-10 h-10 mx-auto mb-2" />
                    <p className="text-[10px] font-black uppercase">Sin chats activos</p>
                  </div>
                ) : (
                  conversations.map((conv: any) => {
                    const otherUser = conv.participants.find((p: any) => p.userId !== currentUser.id)?.user;
                    const unreadCount = conv._count?.messages || 0;
                    const lastMsg = conv.messages[conv.messages.length - 1];

                    return (
                      <button
                        key={conv.id}
                        onClick={() => selectConversation(conv)}
                        className={cn(
                          "w-full p-4 rounded-xl flex items-center gap-4 transition-all group relative",
                          selectedConv?.id === conv.id ? "bg-cyan-500/10 border border-cyan-500/20" : "hover:bg-white/5 border border-transparent"
                        )}
                      >
                        <div className="relative">
                          <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden">
                            {otherUser?.image ? <img src={otherUser.image} /> : <UserCircle className="text-slate-500" />}
                          </div>
                          {getPresenceStatus(otherUser?.lastSeen) === "En línea" && (
                            <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 border-[3px] border-[#050a1f] rounded-full shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                          )}
                        </div>
                        <div className="flex-1 text-left overflow-hidden">
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-sm font-black text-white uppercase italic truncate">{otherUser?.name}</p>
                            {unreadCount > 0 && (
                              <span className="bg-cyan-500 text-slate-950 text-[10px] font-black px-1.5 py-0.5 rounded-full shadow-[0_0_15px_rgba(34,211,238,0.6)] animate-pulse">
                                {unreadCount}
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-slate-500 truncate font-medium italic">
                            {lastMsg?.text || (lastMsg?.imageUrl ? "📷 Envió una foto" : "Inicia una conversación...")}
                          </p>
                        </div>
                      </button>
                    );
                  })
                )}
              </motion.div>
            )}

            {activeTab === "friends" && (
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="p-2 space-y-2"
              >
                {initialFriends.map((friend) => (
                  <div key={friend.id} className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between group">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center overflow-hidden">
                        {friend.image ? <img src={friend.image} /> : <UserCircle className="text-slate-500" />}
                      </div>
                      <div>
                        <p className="text-sm font-black text-white uppercase italic">{friend.name}</p>
                        <p className="text-[9px] font-bold text-slate-500 flex items-center gap-0.5 uppercase tracking-widest">
                          <Check className="w-3 h-3 text-emerald-500" /> Amigo
                        </p>
                      </div>
                    </div>
                    <button 
                      onClick={async () => {
                        const conv = await getOrCreateConversation(friend.id);
                        if (conv) {
                          selectConversation(conv);
                          setActiveTab("chats");
                        }
                      }}
                      className="p-3 bg-cyan-500/10 text-cyan-400 rounded-xl hover:bg-cyan-500 hover:text-slate-950 transition-all shadow-lg"
                    >
                      <MessageSquare className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </motion.div>
            )}

            {activeTab === "pending" && (
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="p-2 space-y-2"
              >
                {initialPending.map((req) => (
                  <div key={req.id} className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/10 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center">
                        <UserPlus className="text-amber-500" />
                      </div>
                      <div>
                        <p className="text-sm font-black text-white uppercase italic">{req.sender.name}</p>
                        <p className="text-[9px] font-bold text-amber-500 uppercase tracking-widest">Solicitud recibida</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleRespond(req.id, "ACCEPTED")}
                        className="p-2 bg-emerald-500 text-slate-950 rounded-lg hover:scale-110 transition-transform"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleRespond(req.id, "REJECTED")}
                        className="p-2 bg-red-500 text-white rounded-lg hover:scale-110 transition-transform"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </aside>

      {/* Main Chat Window */}
      <main className={cn(
        "flex-1 flex flex-col bg-white/[0.02] border border-white/10 rounded-[2.5rem] overflow-hidden relative",
        !isMobileView && "hidden md:flex"
      )}>
        {selectedConv ? (
          <>
            {/* Chat Header */}
            <header className="p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => setIsMobileView(false)}
                  className="md:hidden p-2 text-slate-500 hover:text-white"
                >
                  <ArrowLeft />
                </button>
                <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-black">
                  {selectedConv.participants.find((p: any) => p.userId !== currentUser.id)?.user.name[0]}
                </div>
                <div>
                  <h3 className="text-lg font-black text-white uppercase italic tracking-tight">
                    {selectedConv.participants.find((p: any) => p.userId !== currentUser.id)?.user.name}
                  </h3>
                  <div className="flex items-center gap-2">
                    <div className={cn(
                      "w-2 h-2 rounded-full",
                      otherUserPresence() === "En línea" ? "bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "bg-slate-600"
                    )} />
                    <span className={cn(
                      "text-[10px] font-bold uppercase tracking-widest",
                      otherUserPresence() === "En línea" ? "text-emerald-500" : "text-slate-500"
                    )}>
                      {otherUserPresence()}
                    </span>
                  </div>
                </div>
              </div>
              <div className="relative">
                <button 
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className={cn(
                    "p-2 rounded-xl transition-all",
                    isMenuOpen ? "bg-white/10 text-white" : "text-slate-500 hover:text-white"
                  )}
                >
                  <MoreVertical className="w-5 h-5" />
                </button>

                <AnimatePresence>
                  {isMenuOpen && (
                    <>
                      <motion.div 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        onClick={() => setIsMenuOpen(false)}
                        className="fixed inset-0 z-40"
                      />
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.9, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 10 }}
                        className="absolute right-0 mt-2 w-48 bg-[#0b0e14] border border-white/10 rounded-2xl p-2 shadow-2xl z-50 overflow-hidden"
                      >
                        <button 
                          onClick={() => {
                            setIsMenuOpen(false);
                            setShowDeleteConfirm(true);
                          }}
                          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-black uppercase text-red-500 hover:bg-red-500/10 transition-all group"
                        >
                          <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center group-hover:bg-red-500/20 transition-all">
                            <X className="w-4 h-4" />
                          </div>
                          Eliminar Chat
                        </button>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            </header>

            {/* Messages Area */}
            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 custom-scrollbar bg-black/10"
            >
              {messages.length === 0 && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="py-10 text-center"
                >
                  <div className="inline-block px-6 py-2 bg-cyan-500/10 border border-cyan-500/20 rounded-full">
                    <p className="text-[10px] font-black text-cyan-400 uppercase tracking-[0.3em] italic">
                      ¡CONEXIÓN ESTABLECIDA! AHORA PUEDEN CHATEAR Y JUGAR JUNTOS.
                    </p>
                  </div>
                </motion.div>
              )}
              {messages.map((msg) => {
                const isMe = msg.senderId === currentUser.id;
                return (
                  <motion.div
                    initial={{ opacity: 0, x: isMe ? 20 : -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    key={msg.id}
                    className={cn(
                      "flex flex-col max-w-[80%]",
                      isMe ? "ml-auto items-end" : "mr-auto items-start"
                    )}
                  >
                    <div className={cn(
                      "px-4 py-3 rounded-2xl text-sm font-medium shadow-lg relative min-w-[80px] overflow-hidden",
                      isMe ? "bg-cyan-600 text-white rounded-tr-none shadow-cyan-900/20" : "bg-white/5 text-slate-200 border border-white/10 rounded-tl-none shadow-black/20"
                    )}>
                      {msg.imageUrl && (
                        <div className="mb-2 -mx-1 -mt-1 rounded-xl overflow-hidden border border-white/10 bg-black/20">
                          <img src={msg.imageUrl} alt="" className="w-full max-h-60 object-cover hover:scale-105 transition-transform duration-500 cursor-pointer" />
                        </div>
                      )}
                      {msg.text && <p>{msg.text}</p>}
                      
                      {/* STATUS CHECKS (Solo para mis mensajes) */}
                      {isMe && (
                        <div className="absolute bottom-1 right-2 flex items-center">
                          {msg.isRead ? (
                            <div className="flex -space-x-1">
                              <Check className="w-2.5 h-2.5 text-cyan-300" />
                              <Check className="w-2.5 h-2.5 text-cyan-300" />
                            </div>
                          ) : (
                            <Check className="w-2.5 h-2.5 text-white/40" />
                          )}
                        </div>
                      )}
                    </div>
                    <span className="text-[8px] font-bold text-slate-600 mt-1 uppercase tracking-widest px-1">
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </motion.div>
                );
              })}
            </div>

            {/* Input Area */}
            <footer className="p-3 md:p-6 bg-white/[0.01] border-t border-white/5">
              {/* Image Preview */}
              {previewUrl && (
                <div className="mb-4 relative inline-block">
                  <div className="w-32 h-32 rounded-2xl overflow-hidden border-2 border-cyan-500/50 shadow-[0_0_20px_rgba(6,182,212,0.3)]">
                    <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                  <button 
                    onClick={cancelImage}
                    className="absolute -top-2 -right-2 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-red-600 transition-colors z-10"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              <div className="flex items-center gap-2 md:gap-4 bg-[#0b0e14] border border-white/10 rounded-2xl p-2 pl-4">
                <input 
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  accept="image/*"
                  className="hidden"
                />
                <button 
                  onClick={() => {
                    fetchGifts();
                    setIsGiftModalOpen(true);
                  }}
                  className={cn(
                    "text-slate-500 hover:text-amber-400 transition-colors shrink-0",
                    isGiftModalOpen && "text-amber-400"
                  )}
                >
                  <Gift className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className={cn(
                    "text-slate-500 hover:text-cyan-400 transition-colors shrink-0",
                    selectedFile && "text-cyan-400"
                  )}
                >
                  <ImageIcon className="w-5 h-5" />
                </button>
                <input 
                  type="text" 
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                  placeholder="Escribe un mensaje de guerra..."
                  className="flex-1 bg-transparent border-none text-sm font-medium text-white focus:ring-0 placeholder:text-slate-600 py-2"
                />
                <button 
                  onClick={handleSendMessage}
                  disabled={!inputText.trim() && !selectedFile}
                  className={cn(
                    "bg-cyan-500 text-slate-950 p-3 rounded-xl hover:scale-110 active:scale-95 transition-all shadow-lg shadow-cyan-500/20 shrink-0",
                    (!inputText.trim() && !selectedFile) && "opacity-50 grayscale cursor-not-allowed"
                  )}
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </footer>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
            <div className="w-24 h-24 rounded-[2rem] bg-white/5 border border-white/10 flex items-center justify-center mb-6">
              <MessageSquare className="w-12 h-12 text-slate-700" />
            </div>
            <h3 className="text-2xl font-black text-white uppercase italic mb-2">Centro de Comando</h3>
            <p className="text-slate-500 max-w-xs text-sm font-medium">
              Selecciona a un camarada de armas para iniciar una conversación táctica.
            </p>
          </div>
        )}
      </main>

      {/* Modal Global: Agregar Amigo (Encima de todo) */}
      <AnimatePresence>
        {isAddingFriend && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsAddingFriend(false)}
              className="absolute inset-0 bg-[#050a1f]/80 backdrop-blur-xl"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }} 
              animate={{ scale: 1, opacity: 1, y: 0 }} 
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-lg bg-[#0b0e14] border border-white/10 rounded-[2.5rem] p-8 md:p-12 shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden"
            >
              {/* Efecto de Luz de Fondo */}
              <div className="absolute -top-24 -right-24 w-48 h-48 bg-cyan-500/10 blur-[80px] rounded-full" />
              
              <div className="relative z-10 flex flex-col items-center text-center">
                <div className="w-20 h-20 bg-cyan-500/10 border border-cyan-500/20 rounded-3xl flex items-center justify-center text-cyan-400 mb-8 shadow-inner">
                  <UserPlus className="w-10 h-10" />
                </div>
                
                <h3 className="text-3xl font-black text-white uppercase italic tracking-tighter mb-4">Reclutar Aliado</h3>
                <p className="text-slate-400 text-sm font-medium mb-10 max-w-xs">
                  Ingresa el <span className="text-cyan-400 font-bold">Player ID</span> de tu compañero para iniciar la conexión.
                </p>
                
                <div className="w-full relative mb-10 group">
                  <div className="absolute left-6 top-1/2 -translate-y-1/2 flex items-center gap-2">
                    <Hash className="w-5 h-5 text-cyan-500" />
                  </div>
                  <input 
                    type="text" 
                    maxLength={6}
                    value={searchId}
                    onChange={(e) => setSearchId(e.target.value.replace(/\D/g, ""))}
                    placeholder="000000"
                    className="w-full h-20 bg-white/5 border-2 border-white/5 rounded-3xl pl-16 text-4xl font-black tracking-[0.3em] text-white focus:border-cyan-500 focus:bg-cyan-500/5 transition-all text-center placeholder:text-slate-800"
                  />
                </div>

                <div className="flex flex-col sm:flex-row w-full gap-4">
                  <button 
                    onClick={() => setIsAddingFriend(false)}
                    className="flex-1 order-2 sm:order-1 py-5 bg-white/5 border border-white/10 rounded-2xl text-xs font-black uppercase tracking-widest text-slate-400 hover:text-white hover:bg-white/10 transition-all"
                  >
                    Cancelar Operación
                  </button>
                  <button 
                    onClick={handleAddFriend}
                    className="flex-1 order-1 sm:order-2 py-5 bg-cyan-500 rounded-2xl text-xs font-black uppercase tracking-widest text-slate-950 shadow-[0_0_30px_rgba(34,211,238,0.3)] hover:scale-105 active:scale-95 transition-all"
                  >
                    Enviar Solicitud
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal de Confirmación Moderno: Eliminar Chat */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowDeleteConfirm(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }} 
              animate={{ scale: 1, opacity: 1, y: 0 }} 
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-sm bg-[#0b0e14] border border-white/10 rounded-[2rem] p-8 shadow-2xl text-center overflow-hidden"
            >
              {/* Luz de Advertencia */}
              <div className="absolute -top-12 -left-12 w-32 h-32 bg-red-500/10 blur-[50px] rounded-full" />
              
              <div className="relative z-10">
                <div className="w-16 h-16 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center justify-center text-red-500 mx-auto mb-6">
                  <AlertTriangle className="w-8 h-8" />
                </div>
                
                <h3 className="text-xl font-black text-white uppercase italic mb-3">¿Eliminar Operación?</h3>
                <p className="text-slate-400 text-xs font-medium mb-8 leading-relaxed">
                  Estás a punto de borrar todo el historial táctico con este usuario. Esta acción es irreversible.
                </p>
                
                <div className="flex flex-col gap-3">
                  <button 
                    onClick={handleDeleteChat}
                    className="w-full py-4 bg-red-500 rounded-xl text-xs font-black uppercase tracking-widest text-white shadow-[0_0_20px_rgba(239,68,68,0.2)] hover:scale-105 active:scale-95 transition-all"
                  >
                    Confirmar Eliminación
                  </button>
                  <button 
                    onClick={() => setShowDeleteConfirm(false)}
                    className="w-full py-4 bg-white/5 border border-white/10 rounded-xl text-xs font-black uppercase tracking-widest text-slate-400 hover:text-white hover:bg-white/10 transition-all"
                  >
                    Abortar Acción
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal de Regalos Tácticos */}
      <AnimatePresence>
        {isGiftModalOpen && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsGiftModalOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }} 
              animate={{ scale: 1, opacity: 1, y: 0 }} 
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-md bg-[#0b0e14] border border-white/10 rounded-[2.5rem] p-8 shadow-2xl overflow-hidden"
            >
              <div className="absolute -top-12 -left-12 w-32 h-32 bg-amber-500/10 blur-[50px] rounded-full" />
              
              <div className="relative z-10">
                <header className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
                      <Gift className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-white uppercase italic">Battle Gifts</h3>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Apoya a tus aliados</p>
                    </div>
                  </div>
                  <button onClick={() => setIsGiftModalOpen(false)} className="text-slate-500 hover:text-white">
                    <X className="w-6 h-6" />
                  </button>
                </header>

                <div className="grid grid-cols-2 gap-4">
                  {availableGifts.map((gift) => (
                    <button
                      key={gift.id}
                      onClick={() => handleSendGift(gift)}
                      className="group p-4 bg-white/5 border border-white/5 rounded-2xl hover:border-amber-500/30 hover:bg-amber-500/5 transition-all text-center"
                    >
                      <span className="text-4xl mb-3 block group-hover:scale-125 transition-transform duration-300">
                        {gift.icon}
                      </span>
                      <p className="text-[10px] font-black text-white uppercase mb-1">{gift.name}</p>
                      <p className="text-xs font-bold text-amber-500">${gift.price.toFixed(2)}</p>
                    </button>
                  ))}
                </div>

                <p className="mt-8 text-[9px] font-medium text-slate-600 text-center uppercase tracking-widest leading-relaxed">
                  Las donaciones incluyen una comisión táctica del 40% <br /> para el mantenimiento de la plataforma.
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
