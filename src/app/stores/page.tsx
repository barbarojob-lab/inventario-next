'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'

interface Store {
  id: number
  name: string
  location?: string
}

export default function StoresPage() {
  const [stores, setStores] = useState<Store[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingStore, setEditingStore] = useState<Store | null>(null)
  const [formData, setFormData] = useState({ name: '', location: '' })
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const url = editingStore ? `/api/stores/${editingStore.id}` : '/api/stores'
      const method = editingStore ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        fetchStores()
        setShowForm(false)
        setEditingStore(null)
        setFormData({ name: '', location: '' })
      } else {
        const error = await response.json()
        alert(error.error || 'Error al guardar tienda')
      }
    } catch (error) {
      console.error('Error saving store:', error)
      alert('Error de conexión')
    }
  }

  const handleEdit = (store: Store) => {
    setEditingStore(store)
    setFormData({ name: store.name, location: store.location || '' })
    setShowForm(true)
  }

  const handleDelete = async (storeId: number) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta tienda?')) return

    try {
      const response = await fetch(`/api/stores/${storeId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        fetchStores()
      } else {
        alert('Error al eliminar tienda')
      }
    } catch (error) {
      console.error('Error deleting store:', error)
      alert('Error de conexión')
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    router.push('/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Cargando...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <button
                onClick={() => router.push('/dashboard')}
                className="mr-4 text-gray-600 hover:text-gray-900"
              >
                ← Volver
              </button>
              <h1 className="text-2xl font-bold text-gray-900">Tiendas</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowForm(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Nueva Tienda
              </button>
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {showForm && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  {editingStore ? 'Editar Tienda' : 'Nueva Tienda'}
                </h3>
                <form onSubmit={handleSubmit}>
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
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">Ubicación (opcional)</label>
                    <input
                      type="text"
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <button
                      type="button"
                      onClick={() => {
                        setShowForm(false)
                        setEditingStore(null)
                        setFormData({ name: '', location: '' })
                      }}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
                    >
                      {editingStore ? 'Actualizar' : 'Crear'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {stores.map((store, index) => (
            <motion.div
              key={store.id}
              className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-shadow duration-200"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index, duration: 0.3 }}
            >
              <div className="flex items-center mb-3">
                <span className="text-3xl mr-3">🏪</span>
                <div>
                  <h3 className="font-semibold text-gray-900">{store.name}</h3>
                  {store.location && (
                    <p className="text-sm text-gray-500">{store.location}</p>
                  )}
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleEdit(store)}
                  className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1.5 rounded text-sm font-medium transition-colors"
                >
                  Editar
                </button>
                <button
                  onClick={() => handleDelete(store.id)}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded text-sm font-medium transition-colors"
                >
                  Eliminar
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {!loading && stores.length === 0 && (
          <div className="text-center py-12">
            <span className="text-6xl">🏪</span>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No hay tiendas</h3>
            <p className="mt-1 text-sm text-gray-500">Comienza agregando tu primera tienda.</p>
            <div className="mt-6">
              <button
                onClick={() => setShowForm(true)}
                className="inline-flex items-center px-4 py-2 border border-sm font-medium rounded-md text-white bg-transparent shadow-sm text-blue-600 hover:bg-blue-700"
              >
                Agregar Tienda
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
