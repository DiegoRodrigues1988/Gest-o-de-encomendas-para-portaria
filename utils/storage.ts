
import { Resident, Package, PorterSession } from '../types';

const RESIDENTS_KEY = 'smart_porter_residents';
const PACKAGES_KEY = 'smart_porter_packages';
const SESSION_KEY = 'smart_porter_active_session';

export const saveResidents = (residents: Resident[]) => {
  localStorage.setItem(RESIDENTS_KEY, JSON.stringify(residents));
};

export const getResidents = (): Resident[] => {
  const data = localStorage.getItem(RESIDENTS_KEY);
  return data ? JSON.parse(data) : [];
};

export const savePackages = (packages: Package[]) => {
  localStorage.setItem(PACKAGES_KEY, JSON.stringify(packages));
};

export const getPackages = (): Package[] => {
  const data = localStorage.getItem(PACKAGES_KEY);
  return data ? JSON.parse(data) : [];
};

export const saveSession = (session: PorterSession | null) => {
  if (session) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  } else {
    localStorage.removeItem(SESSION_KEY);
  }
};

export const getSession = (): PorterSession | null => {
  const data = localStorage.getItem(SESSION_KEY);
  return data ? JSON.parse(data) : null;
};

// Funções para "Salvar no HD" (Exportar arquivo)
export const exportDataToHD = () => {
  const data = {
    residents: getResidents(),
    packages: getPackages(),
    exportedAt: new Date().toISOString()
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `backup_portaria_${new Date().toLocaleDateString('pt-BR').replace(/\//g, '-')}.json`;
  link.click();
  URL.revokeObjectURL(url);
};

export const importDataFromHD = (file: File): Promise<void> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target?.result as string);
        if (json.residents) saveResidents(json.residents);
        if (json.packages) savePackages(json.packages);
        resolve();
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = () => reject(new Error("Falha ao ler o arquivo."));
    reader.readAsText(file);
  });
};
