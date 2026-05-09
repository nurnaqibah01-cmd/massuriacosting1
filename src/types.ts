export interface MaterialItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  cost: number;
}

export interface Menu {
  id: string;
  name: string;
  materials: MaterialItem[];
}

export interface LabourItem {
  id: string;
  role: string;
  staffCount: number;
  hours: number;
  ratePerHour: number;
}

export interface OverheadItem {
  id: string;
  name: string;
  cost: number;
  days?: number;
}

export interface CostingReport {
  id: string;
  title: string;
  customerName?: string;
  customerContact?: string;
  customerAddress?: string;
  pax?: number;
  eventDate?: string;
  days?: number;
  date: string;
  materials: MaterialItem[]; // legacy/fallback
  menus?: Menu[];
  labourItems?: LabourItem[];
  overheadItems?: OverheadItem[];
  totalMaterialCost: number;
  labourCost: number;
  overheadCost: number;
  totalCost: number;
  profitMarginPercent: number;
  profitAmount: number;
  sellingPrice: number;
}
