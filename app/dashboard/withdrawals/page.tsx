import { Metadata } from "next";
import { WithdrawalTable } from "./WithdrawalTable";
import prisma from "@/lib/prisma";
import { 
  DollarSign, 
  Clock, 
  CheckCircle2, 
  AlertCircle 
} from "lucide-react";

export const metadata: Metadata = {
  title: "Gestión de Retiros | Battle Coins Admin",
  description: "Panel de control para el departamento de pagos.",
};

export default async function WithdrawalsPage() {
  // Verificación de seguridad para evitar el crash si el cliente está en caché
  if (!(prisma as any).withdrawal) {
    console.error("EROR: El modelo 'withdrawal' no se encuentra en Prisma. Modelos disponibles:", Object.keys(prisma));
    return (
      <div className="p-10 text-white bg-red-500/10 border border-red-500/20 rounded-2xl">
        <h2 className="text-xl font-bold mb-2">Error de Sincronización</h2>
        <p>El modelo de Retiros no ha sido cargado correctamente. Por favor, reinicia el comando <strong>npm run dev</strong> para aplicar los cambios.</p>
      </div>
    );
  }

  // Obtenemos los datos reales de la base de datos
  const withdrawals = await (prisma as any).withdrawal.findMany({
    include: {
      user: {
        select: {
          name: true,
          email: true,
          image: true
        }
      }
    },
    orderBy: {
      createdAt: "desc"
    }
  });

  // Estadísticas rápidas
  const pendingCount = withdrawals.filter(w => w.status === "PENDING").length;
  const completedCount = withdrawals.filter(w => w.status === "COMPLETED").length;
  const totalAmount = withdrawals
    .filter(w => w.status === "COMPLETED")
    .reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-black tracking-tight text-white uppercase italic">Gestión de Cobros</h2>
          <p className="text-slate-500 text-sm font-medium">
            Administra y procesa las solicitudes de retiro de los usuarios.
          </p>
        </div>
      </div>

      {/* Tarjetas de Estadísticas */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="bg-[#0b0e14] border border-white/5 p-6 rounded-2xl shadow-xl">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-yellow-500/10 rounded-xl text-yellow-500">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Pendientes</p>
              <h3 className="text-2xl font-black text-white italic">{pendingCount}</h3>
            </div>
          </div>
        </div>
        
        <div className="bg-[#0b0e14] border border-white/5 p-6 rounded-2xl shadow-xl">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-500">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Completados</p>
              <h3 className="text-2xl font-black text-white italic">{completedCount}</h3>
            </div>
          </div>
        </div>

        <div className="bg-[#0b0e14] border border-white/5 p-6 rounded-2xl shadow-xl lg:col-span-2">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-cyan-500/10 rounded-xl text-cyan-500">
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Total Pagado (Histórico)</p>
              <h3 className="text-2xl font-black text-white italic">${totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })} USD</h3>
            </div>
          </div>
        </div>
      </div>

      {/* Tabla de Cobros */}
      <div className="bg-[#0b0e14] border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
        <WithdrawalTable data={JSON.parse(JSON.stringify(withdrawals))} />
      </div>
    </div>
  );
}
