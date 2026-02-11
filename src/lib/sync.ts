import { db, Product, Sale, Purchase, Waste } from './dexie';
import axios from 'axios';

const API_BASE = '/api';

class SyncManager {
  // Get products: try server first, fallback to local
  async getProducts(storeId: number): Promise<Product[]> {
    try {
      const response = await axios.get(`${API_BASE}/products?storeId=${storeId}`);
      const serverProducts: Product[] = response.data;

      // Update local DB with server data
      await db.products.where('storeId').equals(storeId).delete();
      await db.products.bulkAdd(serverProducts.map((p) => ({ ...p, synced: true, lastSync: new Date() })));

      return serverProducts;
    } catch (error) {
      console.warn('Server unavailable, loading from local DB:', error);
      // Fallback to local DB
      return await db.products.where('storeId').equals(storeId).toArray();
    }
  }

  // Save sale: save to local immediately, then sync
  async saveSale(sale: Omit<Sale, 'id' | 'synced' | 'lastSync'>): Promise<void> {
    const localSale: Sale = {
      ...sale,
      id: Date.now(), // Temporary ID
      synced: false,
    };

    await db.sales.add(localSale);
    this.syncSale(localSale);
  }

  // Save purchase: save to local immediately, then sync
  async savePurchase(purchase: Omit<Purchase, 'id' | 'synced' | 'lastSync'>): Promise<void> {
    const localPurchase: Purchase = {
      ...purchase,
      id: Date.now(),
      synced: false,
    };

    await db.purchases.add(localPurchase);
    this.syncPurchase(localPurchase);
  }

  // Save waste: save to local immediately, then sync
  async saveWaste(waste: Omit<Waste, 'id' | 'synced' | 'lastSync'>): Promise<void> {
    const localWaste: Waste = {
      ...waste,
      id: Date.now(),
      synced: false,
    };

    await db.wastes.add(localWaste);
    this.syncWaste(localWaste);
  }

  // Sync unsynced data on app start or periodically
  async syncAll(): Promise<void> {
    const unsyncedSales = await db.sales.filter(s => !s.synced).toArray();
    const unsyncedPurchases = await db.purchases.filter(p => !p.synced).toArray();
    const unsyncedWastes = await db.wastes.filter(w => !w.synced).toArray();

    await Promise.all([
      ...unsyncedSales.map(sale => this.syncSale(sale)),
      ...unsyncedPurchases.map(purchase => this.syncPurchase(purchase)),
      ...unsyncedWastes.map(waste => this.syncWaste(waste)),
    ]);
  }

  private async syncSale(sale: Sale): Promise<void> {
    try {
      await axios.post(`${API_BASE}/operations/sales`, {
        productId: sale.productId,
        quantity: sale.quantity
      });
      await db.sales.update(sale.id, { synced: true, lastSync: new Date() });
    } catch (error) {
      console.error('Failed to sync sale:', error);
      // Keep as unsynced for later retry
    }
  }

  private async syncPurchase(purchase: Purchase): Promise<void> {
    try {
      await axios.post(`${API_BASE}/operations/purchases`, {
        productId: purchase.productId,
        quantity: purchase.quantity,
        costUnit: purchase.costUnit
      });
      await db.purchases.update(purchase.id, { synced: true, lastSync: new Date() });
    } catch (error) {
      console.error('Failed to sync purchase:', error);
    }
  }

  private async syncWaste(waste: Waste): Promise<void> {
    try {
      await axios.post(`${API_BASE}/operations/waste`, {
        productId: waste.productId,
        quantity: waste.quantity,
        reason: waste.reason
      });
      await db.wastes.update(waste.id, { synced: true, lastSync: new Date() });
    } catch (error) {
      console.error('Failed to sync waste:', error);
    }
  }
}

export const syncManager = new SyncManager();

// Sync on app start
if (typeof window !== 'undefined') {
  window.addEventListener('load', () => {
    syncManager.syncAll();
  });
}
