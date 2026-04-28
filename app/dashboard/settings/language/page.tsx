import { Globe, Languages, MapPin, Clock } from "lucide-react";
import { SettingsHeader } from "@/components/admin/settings-header";

export default function LanguageSettingsPage() {
  const languages = [
    { code: "es", name: "Español", flag: "🇪🇸", active: true },
    { code: "en", name: "English", flag: "🇺🇸", active: false },
    { code: "pt", name: "Português", flag: "🇧🇷", active: false },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <SettingsHeader 
        title="Región e Idioma" 
        subtitle="Configura tu ubicación, zona horaria e idioma de preferencia."
        colorClass="text-emerald-400"
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Language List */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white dark:bg-[#0b0e14]/80 backdrop-blur-xl border border-slate-200 dark:border-white/5 rounded-[2.5rem] p-8 md:p-10 shadow-sm dark:shadow-none transition-colors duration-300">
            <h3 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em] mb-8 flex items-center gap-2">
              <Languages className="w-3 h-3" /> Idioma del Sistema
            </h3>
            
            <div className="space-y-4">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  className={`w-full p-6 rounded-[1.5rem] border flex items-center justify-between transition-all ${
                    lang.active 
                      ? "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-500/30 dark:border-emerald-500/50" 
                      : "bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/5 hover:bg-slate-100 dark:hover:bg-white/10"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <span className="text-2xl">{lang.flag}</span>
                    <span className={`text-sm font-black uppercase tracking-widest ${lang.active ? "text-slate-900 dark:text-white" : "text-slate-500"}`}>
                      {lang.name}
                    </span>
                  </div>
                  {lang.active && (
                    <div className="px-3 py-1 bg-emerald-500 text-[8px] font-black text-white uppercase rounded-full shadow-sm">Actual</div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Timezone & Region */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-[#0b0e14]/80 backdrop-blur-xl border border-slate-200 dark:border-white/5 rounded-[2rem] p-6 shadow-sm dark:shadow-none transition-colors duration-300">
            <h3 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
              <Clock className="w-3 h-3" /> Zona Horaria
            </h3>
            <div className="p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/5">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">GMT-5</p>
              <p className="text-sm font-bold text-slate-900 dark:text-white mt-1 uppercase tracking-tight">América/Lima</p>
            </div>
          </div>

          <div className="bg-white dark:bg-[#0b0e14]/80 backdrop-blur-xl border border-slate-200 dark:border-white/5 rounded-[2rem] p-6 shadow-sm dark:shadow-none transition-colors duration-300">
            <h3 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
              <MapPin className="w-3 h-3" /> Ubicación
            </h3>
            <div className="p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/5">
              <p className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-tight">Perú</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
