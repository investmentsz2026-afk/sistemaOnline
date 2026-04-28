"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Sidebar } from "@/components/sidebar";
import { 
  Sheet, 
  SheetContent, 
  SheetTrigger,
  SheetTitle,
  SheetDescription
} from "@/components/ui/sheet";

export function MobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger className="p-2 text-slate-400 hover:text-white transition-colors outline-none">
          <Menu className="h-6 w-6" />
        </SheetTrigger>
        <SheetContent side="left" className="p-0 border-r-white/5 bg-[#020617] w-72">
          <SheetTitle className="sr-only">Menú de Navegación</SheetTitle>
          <SheetDescription className="sr-only">
            Navega por las diferentes secciones del dashboard administrativo.
          </SheetDescription>
          <Sidebar onSelect={() => setOpen(false)} />
        </SheetContent>
      </Sheet>
    </div>
  );
}
