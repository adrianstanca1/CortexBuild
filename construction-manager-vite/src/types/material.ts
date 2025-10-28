export type MaterialUnit = 'kg' | 'ton' | 'liter' | 'gallon' | 'meter' | 'foot' | 'piece' | 'box' | 'bag';

export type MaterialStatus = 'in_stock' | 'low_stock' | 'out_of_stock' | 'ordered';

export interface Material {
  id: string;
  name: string;
  description: string;
  category: string;
  unit: MaterialUnit;
  quantity: number;
  minQuantity: number;
  unitPrice: number;
  totalValue: number;
  supplier: string;
  location: string;
  status: MaterialStatus;
  lastRestocked?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface MaterialTransaction {
  id: string;
  materialId: string;
  type: 'in' | 'out';
  quantity: number;
  projectId?: string;
  userId: string;
  notes?: string;
  createdAt: Date;
}
