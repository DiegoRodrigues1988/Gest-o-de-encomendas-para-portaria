
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import { Package, Resident, PackageStatus } from "../types";

export const generatePackageReport = (packages: Package[], residents: Resident[]) => {
  const doc = new jsPDF();
  
  // Cabeçalho
  doc.setFontSize(20);
  doc.setTextColor(79, 70, 229); // Indigo 600
  doc.text("Relatório de Encomendas - Portaria Inteligente", 14, 22);
  
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, 14, 30);
  doc.text("-------------------------------------------------------------------------------------------------", 14, 35);

  const tableRows = packages.map(pkg => {
    const resident = residents.find(r => r.id === pkg.residentId);
    return [
      pkg.status === PackageStatus.PENDING ? "PENDENTE" : "ENTREGUE",
      resident ? `${resident.name} (${resident.apartment})` : "Desconhecido",
      pkg.carrier,
      pkg.description,
      new Date(pkg.receivedAt).toLocaleString('pt-BR'),
      pkg.deliveredAt ? new Date(pkg.deliveredAt).toLocaleString('pt-BR') : "---",
      pkg.porterId || "Sistema"
    ];
  });

  (doc as any).autoTable({
    startY: 40,
    head: [['Status', 'Morador', 'Transportadora', 'Descrição', 'Recebimento', 'Entrega', 'Porteiro']],
    body: tableRows,
    headStyles: { fillColor: [79, 70, 229] },
    alternateRowStyles: { fillColor: [245, 247, 250] },
    margin: { top: 40 },
    theme: 'striped'
  });

  doc.save(`relatorio_encomendas_${new Date().toISOString().split('T')[0]}.pdf`);
};
