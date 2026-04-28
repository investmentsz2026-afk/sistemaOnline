"use client";

import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { toast } from "sonner";

interface ExportAuditButtonProps {
  data: any[];
}

export function ExportAuditButton({ data }: ExportAuditButtonProps) {
  const exportToPDF = () => {
    try {
      const doc = new jsPDF();
      
      doc.setFontSize(18);
      doc.text("Reporte de Auditoria - Empresa", 14, 22);
      doc.setFontSize(11);
      doc.setTextColor(100);
      doc.text(`Generado el: ${new Date().toLocaleString()}`, 14, 30);

      const tableData = data.map((log) => [
        log.user?.name || "Sistema",
        log.action,
        log.description,
        new Date(log.createdAt).toLocaleString(),
      ]);

      autoTable(doc, {
        startY: 40,
        head: [["Usuario", "Accion", "Descripcion", "Fecha"]],
        body: tableData,
        headStyles: { fillColor: [15, 23, 42] },
        alternateRowStyles: { fillColor: [241, 245, 249] },
      });

      doc.save(`audit-report-${Date.now()}.pdf`);
      toast.success("PDF generado con exito");
    } catch (error) {
      toast.error("Error al generar el PDF");
    }
  };

  return (
    <Button 
      variant="outline" 
      onClick={exportToPDF}
      className="border-blue-500/50 text-blue-400 hover:bg-blue-500/10"
    >
      <Download className="h-4 w-4 mr-2" />
      Exportar PDF
    </Button>
  );
}
