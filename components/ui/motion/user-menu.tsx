"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  LogOut, 
  Settings, 
  User, 
  Shield, 
  Bell,
  ChevronDown
} from "lucide-react";
import { signOut } from "next-auth/react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuGroup,
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { LoginOverlay } from "./login-overlay";

interface UserMenuProps {
  user: {
    name?: string | null;
    email?: string | null;
    role?: string;
  };
  showName?: boolean;
}

export const UserMenu = ({ user, showName = true }: UserMenuProps) => {
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleSignOut = async () => {
    setIsLoggingOut(true);
    // Wait for animation
    setTimeout(() => {
      signOut({ callbackUrl: "/" });
    }, 2000);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger className="flex items-center gap-4 group cursor-pointer outline-none bg-transparent border-0 p-0 text-left">
          {showName && (
            <div className="text-right hidden sm:block">
              <p className="text-sm font-black text-white leading-none uppercase tracking-tight group-hover:text-cyan-400 transition-colors">
                {user.name || "Usuario"}
              </p>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">
                {user.role || "CLIENT"}
              </p>
            </div>
          )}
          
          {/* Animated Profile Ring */}
          <div className="relative">
            {/* Glowing/Rotating Ring */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              className="absolute -inset-1 rounded-full bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 opacity-40 group-hover:opacity-100 blur-[2px] transition-opacity"
            />
            
            <div className="relative w-10 h-10 rounded-full bg-[#020617] border border-white/10 flex items-center justify-center overflow-hidden group-hover:scale-105 transition-transform">
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-blue-600/10" />
              <User className="h-5 w-5 text-cyan-400 relative z-10" />
            </div>
            
            {/* Status Indicator */}
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-[#020617]" />
          </div>
        </DropdownMenuTrigger>
        
        <DropdownMenuContent className="w-64 bg-[#0b0e14]/95 backdrop-blur-xl border-white/5 rounded-2xl p-2 shadow-2xl z-[150]" align="end">
          <div className="p-4">
            <div className="flex flex-col space-y-1">
              <p className="text-xs font-black text-white uppercase tracking-widest">{user.name}</p>
              <p className="text-[10px] font-bold text-slate-500 lowercase tracking-tight">{user.email}</p>
            </div>
          </div>
          <DropdownMenuSeparator className="bg-white/5" />
          <DropdownMenuGroup>
            <DropdownMenuItem 
              className="flex items-center gap-3 p-3 rounded-xl cursor-pointer outline-none transition-all group"
              onClick={() => window.location.href = '/perfil'}
            >
              <User className="h-4 w-4 text-slate-400 group-focus:text-cyan-400 transition-colors" />
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-300 group-focus:text-white transition-colors">Ver Perfil</span>
            </DropdownMenuItem>
            <DropdownMenuItem 
              className="flex items-center gap-3 p-3 rounded-xl cursor-pointer outline-none transition-all group"
              onClick={() => window.location.href = '/configuracion'}
            >
              <Settings className="h-4 w-4 text-slate-400 group-focus:text-blue-400 transition-colors" />
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-300 group-focus:text-white transition-colors">Configuración</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="flex items-center gap-3 p-3 rounded-xl cursor-pointer outline-none transition-all group">
              <Shield className="h-4 w-4 text-slate-400 group-focus:text-indigo-400 transition-colors" />
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-300 group-focus:text-white transition-colors">Seguridad</span>
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator className="bg-white/5" />
          <DropdownMenuItem 
            onClick={handleSignOut}
            variant="destructive"
            className="flex items-center gap-3 p-3 rounded-xl cursor-pointer outline-none transition-all group"
          >
            <LogOut className="h-4 w-4 transition-all group-hover:rotate-12" />
            <span className="text-[10px] font-black uppercase tracking-widest transition-colors">Cerrar Sesión</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <LoginOverlay 
        isVisible={isLoggingOut} 
        status="closing" 
        message="Cerrando Sesión" 
      />
    </>
  );
};
