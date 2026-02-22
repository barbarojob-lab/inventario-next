'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'

interface Product {
  id: number
  code?: string
  name: string
  price: number
  cost: number
  qty: number
  storeId: number
  store: {
    name: string
  }
}

interface Store {
  id: number
  name: string
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [stores, setStores] = useState<Store[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [selectedStoreId, setSelectedStoreId] = useState<number | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [formData, setFormData] = useState({
    storeId: '',
    code: '',
    name: '',
    price: '',
    cost: '',
    qty: ''
  })
  const router = useRouter()

  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return
    
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return
    }
    fetchStores()
  }, [router])

  const fetchStores = async () => {
    try {
      const response = await fetch('/api/stores')
      if (response.ok) {
        const data = await response.json()
        setStores(data)
      }
    } catch (error) {
      console.error('Error fetching stores:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchProducts = useCallback(async () => {
    if (!selectedStoreId) return

    try {
      setLoading(true)
      const response = await fetch(`/api/products?storeId=${selectedStoreId}`)
      if (response.ok) {
        const data = await response.json()
        setProducts(data)
      }
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoading(false)
    }
  }, [selectedStoreId])

  useEffect(() => {
    if (stores.length > 0 && !selectedStoreId) {
      setSelectedStoreId(stores[0].id)
    }
  }, [stores, selectedStoreId])

  useEffect(() => {
    if (selectedStoreId) {
      fetchProducts()
    }
  }, [selectedStoreId, fetchProducts])

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (product.code && product.code.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const url = editingProduct ? `/api/products/${editingProduct.id}` : '/api/products'
      const method = editingProduct ? 'PUT' : 'POST'

      const dataToSend = {
        storeId: parseInt(formData.storeId),
        code: formData.code || undefined,
        name: formData.name,
        price: parseFloat(formData.price),
        cost: parseFloat(formData.cost) || 0,
        qty: parseInt(formData.qty) || 0
      }

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSend),
      })

      if (response.ok) {
        fetchProducts()
        setShowForm(false)
        setEditingProduct(null)
        resetForm()
      } else {
        const error = await response.json()
        alert(error.error || 'Error al guardar producto')
      }
    } catch (error) {
      console.error('Error saving product:', error)
      alert('Error de conexión')
    }
  }

  const resetForm = () => {
    setFormData({
      storeId: selectedStoreId?.toString() || '',
      code: '',
      name: '',
      price: '',
      cost: '',
      qty: ''
    })
  }

  const handleEdit = (product: Product) => {
    setEditingProduct(product)
    setFormData({
      storeId: product.storeId.toString(),
      code: product.code || '',
      name: product.name,
      price: product.price.toString(),
      cost: product.cost.toString(),
      qty: product.qty.toString()
    })
    setShowForm(true)
  }

  const handleDelete = async (productId: number) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este producto?')) return

    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        fetchProducts()
      } else {
        alert('Error al eliminar producto')
      }
    } catch (error) {
      console.error('Error deleting product:', error)
      alert('Error de conexión')
    }
  }

  const handleStoreChange = (storeId: number) => {
    setSelectedStoreId(storeId)
    setSearchTerm('')
  }

  if (loading && stores.length === 0) {
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
              <h1 className="text-2xl font-bold text-gray-900">Productos</h1>
            </div>
            <button
              onClick={() => {
                resetForm()
                setShowForm(true)
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
            >
              Agregar Producto
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <motion.main
        className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.6 }}
      >
        {/* Filters */}
        <motion.div
          className="mb-6 bg-white/90 backdrop-blur-sm p-6 rounded-xl shadow-xl border border-gray-200"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-semibold text-gray-800 mb-2">Tienda</label>
              <select
                value={selectedStoreId || ''}
                onChange={(e) => handleStoreChange(parseInt(e.target.value))}
                className="block w-full border-gray-300 rounded-lg shadow-sm focus:ring-slate-500 focus:border-slate-500 transition-all duration-200 bg-gray-50 hover:bg-white"
              >
                {stores.map((store) => (
                  <option key={store.id} value={store.id}>
                    {store.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-sm font-semibold text-gray-800 mb-2">Buscar</label>
              <input
                type="text"
                placeholder="Buscar por nombre o código..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full border-gray-300 rounded-lg shadow-sm focus:ring-slate-500 focus:border-slate-500 transition-all duration-200 bg-gray-50 hover:bg-white"
              />
            </div>
          </div>
        </motion.div>

        {/* Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  {editingProduct ? 'Editar Producto' : 'Agregar Nuevo Producto'}
                </h3>
                <form onSubmit={handleSubmit}>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">Tienda</label>
                    <select
                      required
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      value={formData.storeId}
                      onChange={(e) => setFormData({ ...formData, storeId: e.target.value })}
                    >
                      <option value="">Seleccionar tienda</option>
                      {stores.map((store) => (
                        <option key={store.id} value={store.id}>
                          {store.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">Código (opcional)</label>
                    <input
                      type="text"
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">Nombre</label>
                    <input
                      type="text"
                      required
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Precio</label>
                      <input
                        type="number"
                        step="0.01"
                        required
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Costo</label>
                      <input
                        type="number"
                        step="0.01"
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        value={formData.cost}
                        onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">Cantidad</label>
                    <input
                      type="number"
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      value={formData.qty}
                      onChange={(e) => setFormData({ ...formData, qty: e.target.value })}
                    />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <button
                      type="button"
                      onClick={() => {
                        setShowForm(false)
                        setEditingProduct(null)
                        resetForm()
                      }}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
                    >
                      {editingProduct ? 'Actualizar' : 'Crear'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Products Grid */}
        <div className="bg-[var(--card-bg)] shadow overflow-hidden sm:rounded-md">
          {loading ? (
            <div className="text-center py-12">
              <div className="text-lg">Cargando productos...</div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 p-4">
              {filteredProducts.map((product) => (
                <motion.div
                  key={product.id}
                  className="bg-white border border-gray-200 rounded-lg p-3 hover:shadow-lg transition-shadow duration-200"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * (filteredProducts.indexOf(product) % 12), duration: 0.3 }}
                >
                  <div className="flex flex-col h-full">
                    <div className="flex items-center mb-2">
                      <span className="text-xl mr-2">📦</span>
                      <div className="flex-1">
                        <h3 className="text-sm font-semibold text-gray-900 truncate">{product.name}</h3>
                        {product.code && (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            {product.code}
                          </span>
                        )}
                      </div>
                    </div>

                    <p className="text-xs text-gray-500 mb-2">{product.store.name}</p>

                    <div className="space-y-1 mb-3">
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-500">Precio:</span>
                        <span className="font-medium text-green-600">${product.price.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-500">Costo:</span>
                        <span className="font-medium text-blue-600">${product.cost.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-500">Stock:</span>
                        <span className={`font-medium ${product.qty > 0 ? 'text-yellow-600' : 'text-red-600'}`}>
                          {product.qty}
                        </span>
                      </div>
                    </div>

                    <div className="flex space-x-1 mt-auto">
                      <button
                        onClick={() => handleEdit(product)}
                        className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white px-2 py-1 rounded text-xs font-medium transition-colors"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="flex-1 bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-xs font-medium transition-colors"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {!loading && filteredProducts.length === 0 && (
            <div className="text-center py-12">
              <span className="text-6xl">📦</span>
              <h3 className="mt-2 text-sm font-medium text-[var(--foreground)]">No hay productos</h3>
              <p className="mt-1 text-sm text-gray-400">
                {searchTerm ? 'No se encontraron productos con esa búsqueda.' : 'Comienza agregando tu primer producto.'}
              </p>
              {!searchTerm && (
                <div className="mt-6">
                  <button
                    onClick={() => {
                      resetForm()
                      setShowForm(true)
                    }}
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                  >
                    Agregar Producto
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </motion.main>
    </div>
  )
}
