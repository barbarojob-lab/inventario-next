'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'


interface Product {
  id: number
  name: string
  price: number
  qty: number
  store: { name: string }
}

interface Sale {
  id: number
  productId: number
  product: { name: string }
  quantity: number
  total: number
  date: string
}

interface Purchase {
  id: number
  productId: number
  product: { name: string }
  quantity: number
  costUnit: number
  total: number
  date: string
}





interface Store {
  id: number
  name: string
  location?: string
}

export default function OperationsPage() {
  const [activeTab, setActiveTab] = useState('sales')
  const [products, setProducts] = useState<Product[]>([])
  const [sales, setSales] = useState<Sale[]>([])
  const [purchases, setPurchases] = useState<Purchase[]>([])
  const [stores, setStores] = useState<Store[]>([])
  const [selectedStoreId, setSelectedStoreId] = useState('')

  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    fetchAllData()
  }, [])

  useEffect(() => {
    if (selectedStoreId) {
      fetchOperationsData()
    }
  }, [selectedStoreId])

  const fetchAllData = async () => {
    try {
      const [productsRes, storesRes, wastesRes, employeesRes] = await Promise.all([
        fetch('/api/products'),
        fetch('/api/stores'),
        fetch('/api/operations/waste'),
        fetch('/api/employees') // Assuming this API exists
      ])

      if (productsRes.ok) setProducts(await productsRes.json())
      if (storesRes.ok) setStores(await storesRes.json())
      // wastes is not used in current implementation
      if (wastesRes.ok) await wastesRes.json()
      // employees is not used in current implementation
      if (employeesRes.ok) await employeesRes.json()
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchOperationsData = async () => {
    if (!selectedStoreId) return

    try {
      const [salesRes, purchasesRes] = await Promise.all([
        fetch(`/api/operations/sales?storeId=${selectedStoreId}`),
        fetch(`/api/operations/purchases?storeId=${selectedStoreId}`)
      ])

      if (salesRes.ok) setSales(await salesRes.json())
      if (purchasesRes.ok) setPurchases(await purchasesRes.json())
    } catch (error) {
      console.error('Error fetching operations data:', error)
    }
  }

  const tabs = [
    { id: 'sales', label: 'Ventas', icon: '💰' },
    { id: 'purchases', label: 'Compras', icon: '🛒' },
    { id: 'waste', label: 'Merma', icon: '🗑️' },
    { id: 'salaries', label: 'Salarios', icon: '💼' }
  ]

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Cargando...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <button
                onClick={() => router.push('/dashboard')}
                className="mr-4 text-gray-600 hover:text-gray-900"
              >
                ← Volver al Dashboard
              </button>
              <h1 className="text-2xl font-bold text-gray-900">Operaciones</h1>
            </div>
            <div className="flex items-center">
              <label htmlFor="store-select" className="mr-2 text-sm font-medium text-gray-700">
                Tienda:
              </label>
              <select
                id="store-select"
                value={selectedStoreId}
                onChange={(e) => setSelectedStoreId(e.target.value)}
                className="border-gray-300 rounded-md text-sm"
              >
                <option value="">Seleccionar tienda</option>
                {stores.map((store) => (
                  <option key={store.id} value={store.id}>
                    {store.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white shadow rounded-lg p-6">
          {activeTab === 'sales' && <SalesTab sales={sales} products={products} selectedStoreId={selectedStoreId} onUpdate={fetchOperationsData} />}
          {activeTab === 'purchases' && <PurchasesTab purchases={purchases} products={products} selectedStoreId={selectedStoreId} onUpdate={fetchOperationsData} />}
          {activeTab === 'waste' && <WasteTab onUpdate={fetchAllData} />}
          {activeTab === 'salaries' && <SalariesTab onUpdate={fetchAllData} />}
        </div>
      </main>
    </div>
  )
}

function SalesTab({ sales, products, selectedStoreId, onUpdate }: { sales: Sale[], products: Product[], selectedStoreId: string, onUpdate: () => void }) {
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({ productId: '', quantity: '' })
  const [loading, setLoading] = useState(false)

  const selectedProduct = products.find(p => p.id === parseInt(formData.productId))
  const maxQuantity = selectedProduct ? selectedProduct.qty : 0
  const totalPrice = selectedProduct ? selectedProduct.price * parseInt(formData.quantity || '0') : 0

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/operations/sales', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId: parseInt(formData.productId),
          quantity: parseInt(formData.quantity)
        }),
      })

      if (response.ok) {
        setShowForm(false)
        setFormData({ productId: '', quantity: '' })
        onUpdate()
      } else {
        const error = await response.json()
        alert(error.error || 'Error al crear venta')
      }
    } catch (error) {
      console.error('Error creating sale:', error)
      alert('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-medium text-gray-900">Ventas</h2>
        <button
          onClick={() => setShowForm(true)}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium"
        >
          Nueva Venta
        </button>
      </div>

      {/* Sales List */}
      <div className="space-y-4">
        {sales.map((sale) => (
          <div key={sale.id} className="border rounded-lg p-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-medium">{sale.product.name}</h3>
                <p className="text-sm text-gray-600">Cantidad: {sale.quantity} | Total: ${sale.total}</p>
                <p className="text-xs text-gray-500">{new Date(sale.date).toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-96">
            <h3 className="text-lg font-medium mb-4">Nueva Venta</h3>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Producto</label>
                <select
                  required
                  className="mt-1 block w-full border-gray-300 rounded-md"
                  value={formData.productId}
                  onChange={(e) => setFormData({ ...formData, productId: e.target.value, quantity: '' })}
                >
                  <option value="">Seleccionar producto</option>
                  {products.filter(product => selectedStoreId ? product.storeId === parseInt(selectedStoreId) : true).map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name} - ${product.price} (Stock: {product.qty})
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Cantidad</label>
                <input
                  type="number"
                  min="1"
                  max={maxQuantity}
                  required
                  className="mt-1 block w-full border-gray-300 rounded-md"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                />
                {selectedProduct && (
                  <p className="text-xs text-gray-500 mt-1">Stock disponible: {maxQuantity}</p>
                )}
              </div>
              {selectedProduct && formData.quantity && (
                <div className="mb-4 p-3 bg-gray-50 rounded-md">
                  <p className="text-sm text-gray-700">
                    <strong>Total: ${totalPrice.toFixed(2)}</strong>
                  </p>
                </div>
              )}
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading || !selectedProduct || parseInt(formData.quantity) > maxQuantity}
                  className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md disabled:opacity-50"
                >
                  {loading ? 'Creando...' : 'Crear Venta'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

function PurchasesTab({ purchases, products, selectedStoreId, onUpdate }: { purchases: Purchase[], products: Product[], selectedStoreId: string, onUpdate: () => void }) {
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({ productId: '', quantity: '', costUnit: '' })
  const [loading, setLoading] = useState(false)

  const totalCost = parseFloat(formData.costUnit || '0') * parseInt(formData.quantity || '0')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/operations/purchases', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId: parseInt(formData.productId),
          quantity: parseInt(formData.quantity),
          costUnit: parseFloat(formData.costUnit)
        }),
      })

      if (response.ok) {
        setShowForm(false)
        setFormData({ productId: '', quantity: '', costUnit: '' })
        onUpdate()
      } else {
        const error = await response.json()
        alert(error.error || 'Error al crear compra')
      }
    } catch (error) {
      console.error('Error creating purchase:', error)
      alert('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-medium text-gray-900">Compras</h2>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
        >
          Nueva Compra
        </button>
      </div>

      {/* Purchases Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {purchases.map((purchase) => (
          <motion.div
            key={purchase.id}
            className="bg-white border border-gray-200 rounded-lg p-3 hover:shadow-lg transition-shadow duration-200"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * (purchases.indexOf(purchase) % 12), duration: 0.3 }}
          >
            <div className="flex items-center mb-2">
              <span className="text-xl mr-2">🛒</span>
              <div>
                <h3 className="font-semibold text-gray-900 text-sm truncate">{purchase.product.name}</h3>
                <p className="text-xs text-gray-500">{new Date(purchase.date).toLocaleDateString()}</p>
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">Cantidad:</span>
                <span className="font-medium text-blue-600">{purchase.quantity}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">Costo unitario:</span>
                <span className="font-medium text-yellow-600">${purchase.costUnit.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">Total:</span>
                <span className="font-medium text-green-600">${purchase.total.toFixed(2)}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-96">
            <h3 className="text-lg font-medium mb-4">Nueva Compra</h3>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Producto</label>
                <select
                  required
                  className="mt-1 block w-full border-gray-300 rounded-md"
                  value={formData.productId}
                  onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
                >
                  <option value="">Seleccionar producto</option>
                  {products.filter(product => selectedStoreId ? product.storeId === parseInt(selectedStoreId) : true).map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name} - Tienda: {product.store.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Cantidad</label>
                <input
                  type="number"
                  min="1"
                  required
                  className="mt-1 block w-full border-gray-300 rounded-md"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Costo Unitario</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  className="mt-1 block w-full border-gray-300 rounded-md"
                  value={formData.costUnit}
                  onChange={(e) => setFormData({ ...formData, costUnit: e.target.value })}
                />
              </div>
              {formData.quantity && formData.costUnit && (
                <div className="mb-4 p-3 bg-gray-50 rounded-md">
                  <p className="text-sm text-gray-700">
                    <strong>Total: ${totalCost.toFixed(2)}</strong>
                  </p>
                </div>
              )}
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md disabled:opacity-50"
                >
                  {loading ? 'Creando...' : 'Crear Compra'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

function WasteTab({ onUpdate }: { onUpdate: () => void }) {
  // onUpdate is not used in placeholder implementation
  return (
    <div>
      <h2 className="text-lg font-medium text-gray-900 mb-4">Merma</h2>
      <p className="text-gray-600">Funcionalidad de merma próximamente...</p>
    </div>
  )
}

function SalariesTab({ onUpdate }: { onUpdate: () => void }) {
  // onUpdate is not used in placeholder implementation
  return (
    <div>
      <h2 className="text-lg font-medium text-gray-900 mb-4">Salarios</h2>
      <p className="text-gray-600">Funcionalidad de salarios próximamente...</p>
    </div>
  )
}
