'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'

interface Stats {
  totalStores: number
  totalProducts: number
  totalSales: number
  totalPurchases: number
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats>({
    totalStores: 0,
    totalProducts: 0,
    totalSales: 0,
    totalPurchases: 0
  })
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    fetchStats()
  }, [router])

  const fetchStats = async () => {
    try {
      const [storesRes, productsRes, salesRes, purchasesRes] = await Promise.all([
        fetch('/api/stores'),
        fetch('/api/products'),
        fetch('/api/operations/sales'),
        fetch('/api/operations/purchases')
      ])

      const stores = await storesRes.json()
      const products = await productsRes.json()
      const sales = await salesRes.json()
      const purchases = await purchasesRes.json()

      setStats({
        totalStores: Array.isArray(stores) ? stores.length : 0,
        totalProducts: Array.isArray(products) ? products.length : 0,
        totalSales: Array.isArray(sales) ? sales.length : 0,
        totalPurchases: Array.isArray(purchases) ? purchases.length : 0
      })
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
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
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">Sistema de Inventario</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">Bienvenido</span>
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

      {/* Main Content */}
      <motion.main
        className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.6 }}
      >
        {/* Stats Cards */}
        <motion.div
          className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: {
                staggerChildren: 0.15
              }
            }
          }}
        >
          <motion.div
            className="bg-white/90 backdrop-blur-sm overflow-hidden shadow-xl rounded-xl border border-gray-200 hover:shadow-2xl transition-all duration-300"
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0 }
            }}
            whileHover={{ scale: 1.02 }}
          >
            <div className="p-5 bg-gradient-to-br from-white to-gray-50">
              <div className="flex items-center">
                <motion.div
                  className="flex-shrink-0 w-12 h-12 bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg flex items-center justify-center shadow-lg"
                  whileHover={{ scale: 1.1 }}
                >
                  <motion.span
                    className="text-white text-lg"
                    animate={{ rotate: [0, 5, -5, 0] }}
                    transition={{ duration: 4, repeat: Infinity, repeatDelay: 3 }}
                  >
                    🏪
                  </motion.span>
                </motion.div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-600 truncate">Tiendas</dt>
                    <dd className="text-2xl font-bold text-gray-900">{stats.totalStores}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            className="bg-white/90 backdrop-blur-sm overflow-hidden shadow-xl rounded-xl border border-gray-200 hover:shadow-2xl transition-all duration-300"
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0 }
            }}
            whileHover={{ scale: 1.02 }}
          >
            <div className="p-5 bg-gradient-to-br from-white to-gray-50">
              <div className="flex items-center">
                <motion.div
                  className="flex-shrink-0 w-12 h-12 bg-gradient-to-r from-green-600 to-green-800 rounded-lg flex items-center justify-center shadow-lg"
                  whileHover={{ scale: 1.1 }}
                >
                  <motion.span
                    className="text-white text-lg"
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 3, repeat: Infinity, repeatDelay: 4 }}
                  >
                    📦
                  </motion.span>
                </motion.div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-600 truncate">Productos</dt>
                    <dd className="text-2xl font-bold text-gray-900">{stats.totalProducts}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            className="bg-white/90 backdrop-blur-sm overflow-hidden shadow-xl rounded-xl border border-gray-200 hover:shadow-2xl transition-all duration-300"
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0 }
            }}
            whileHover={{ scale: 1.02 }}
          >
            <div className="p-5 bg-gradient-to-br from-white to-gray-50">
              <div className="flex items-center">
                <motion.div
                  className="flex-shrink-0 w-12 h-12 bg-gradient-to-r from-amber-600 to-orange-700 rounded-lg flex items-center justify-center shadow-lg"
                  whileHover={{ scale: 1.1 }}
                >
                  <motion.span
                    className="text-white text-lg"
                    animate={{
                      rotate: [0, -10, 10, 0],
                      scale: [1, 1.05, 1]
                    }}
                    transition={{ duration: 5, repeat: Infinity, repeatDelay: 2 }}
                  >
                    💰
                  </motion.span>
                </motion.div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-600 truncate">Ventas</dt>
                    <dd className="text-2xl font-bold text-gray-900">{stats.totalSales}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            className="bg-white/90 backdrop-blur-sm overflow-hidden shadow-xl rounded-xl border border-gray-200 hover:shadow-2xl transition-all duration-300"
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0 }
            }}
            whileHover={{ scale: 1.02 }}
          >
            <div className="p-5 bg-gradient-to-br from-white to-gray-50">
              <div className="flex items-center">
                <motion.div
                  className="flex-shrink-0 w-12 h-12 bg-gradient-to-r from-slate-600 to-slate-800 rounded-lg flex items-center justify-center shadow-lg"
                  whileHover={{ scale: 1.1 }}
                >
                  <motion.span
                    className="text-white text-lg"
                    animate={{ y: [0, -2, 0] }}
                    transition={{ duration: 3, repeat: Infinity, repeatDelay: 3 }}
                  >
                    🛒
                  </motion.span>
                </motion.div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-600 truncate">Compras</dt>
                    <dd className="text-2xl font-bold text-gray-900">{stats.totalPurchases}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Navigation Cards */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <Link href="/stores" className="block">
            <div className="bg-white overflow-hidden shadow rounded-lg hover:shadow-lg transition-shadow">
              <div className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <span className="text-3xl">🏪</span>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900">Tiendas</h3>
                    <p className="text-sm text-gray-500">Gestionar tiendas y ubicaciones</p>
                  </div>
                </div>
              </div>
            </div>
          </Link>

          <Link href="/products" className="block">
            <div className="bg-white overflow-hidden shadow rounded-lg hover:shadow-lg transition-shadow">
              <div className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <span className="text-3xl">📦</span>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900">Productos</h3>
                    <p className="text-sm text-gray-500">Administrar inventario de productos</p>
                  </div>
                </div>
              </div>
            </div>
          </Link>

          <Link href="/operations" className="block">
            <div className="bg-white overflow-hidden shadow rounded-lg hover:shadow-lg transition-shadow">
              <div className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <span className="text-3xl">🔧</span>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900">Operaciones</h3>
                    <p className="text-sm text-gray-500">Merma, ventas, compras y salarios</p>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        </div>
      </motion.main>
    </div>
  )
}
