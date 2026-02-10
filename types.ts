
export interface Resident {
  id: string;
  name: string;
  apartment: string;
  phone: string; // WhatsApp format: 5511999999999
}

export enum PackageStatus {
  PENDING = 'PENDING',
  DELIVERED = 'DELIVERED',
}

export interface Package {
  id: string;
  residentId: string;
  carrier: string; 
  description: string;
  receivedAt: string;
  deliveredAt?: string;
  status: PackageStatus;
  photoUrl?: string;
  porterId?: string; // Quem recebeu
}

export type Shift = 'Manhã' | 'Tarde' | 'Noite' | 'Madrugada';

export interface PorterSession {
  name: string;
  shift: Shift;
  startedAt: string;
}

export interface DashboardStats {
  totalPending: number;
  deliveredToday: number;
  totalResidents: number;
}
