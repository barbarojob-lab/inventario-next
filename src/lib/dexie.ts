import Dexie, { Table } from 'dexie';

export interface Product {
  id: number;
  storeId: number;
  code?: string;
  name: string;
  price: number;
  cost: number;
  qty: number;
  synced: boolean;
  lastSync?: Date;
}

export interface Sale {
  id: number;
  productId: number;
  quantity: number;
  total: number;
  costUnit: number;
  profitTotal: number;
  date: Date;
  synced: boolean;
  lastSync?: Date;
}

export interface Purchase {
  id: number;
  productId: number;
  quantity: number;
  costUnit: number;
  total: number;
  date: Date;
  synced: boolean;
  lastSync?: Date;
}

export interface Waste {
  id: number;
  productId: number;
  quantity: number;
  reason?: string;
  date: Date;
  synced: boolean;
  lastSync?: Date;
}

export class InventoryDB extends Dexie {
  products!: Table<Product>;
  sales!: Table<Sale>;
  purchases!: Table<Purchase>;
  wastes!: Table<Waste>;

  constructor() {
    super('InventoryDB');
    this.version(1).stores({
      products: '++id, storeId, name, synced',
      sales: '++id, productId, date, synced',
      purchases: '++id, productId, date, synced',
      wastes: '++id, productId, date, synced',
    });
  }
}

export const db = new InventoryDB();
