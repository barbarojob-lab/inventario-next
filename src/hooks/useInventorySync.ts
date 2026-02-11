import { useState, useEffect, useCallback } from 'react';
import { syncManager } from '@/lib/sync';
import { Product, Sale, Purchase, Waste } from '@/lib/dexie';

export function useInventorySync(storeId: number) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load products
  const loadProducts = useCallback(async () => {
    try {
      setLoading(true);
      const data = await syncManager.getProducts(storeId);
      setProducts(data);
      setError(null);
    } catch (err) {
      setError('Failed to load products');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [storeId]);

  // Save sale
  const saveSale = useCallback(async (sale: Omit<Sale, 'id' | 'synced' | 'lastSync'>) => {
    try {
      await syncManager.saveSale(sale);
      // Optionally refresh products if needed
      await loadProducts();
    } catch (err) {
      setError('Failed to save sale');
      console.error(err);
      throw err;
    }
  }, [loadProducts]);

  // Save purchase
  const savePurchase = useCallback(async (purchase: Omit<Purchase, 'id' | 'synced' | 'lastSync'>) => {
    try {
      await syncManager.savePurchase(purchase);
      await loadProducts();
    } catch (err) {
      setError('Failed to save purchase');
      console.error(err);
      throw err;
    }
  }, [loadProducts]);

  // Save waste
  const saveWaste = useCallback(async (waste: Omit<Waste, 'id' | 'synced' | 'lastSync'>) => {
    try {
      await syncManager.saveWaste(waste);
      await loadProducts();
    } catch (err) {
      setError('Failed to save waste');
      console.error(err);
      throw err;
    }
  }, [loadProducts]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  return {
    products,
    loading,
    error,
    loadProducts,
    saveSale,
    savePurchase,
    saveWaste,
  };
}
