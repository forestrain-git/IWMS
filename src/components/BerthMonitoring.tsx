import React, { useState, useEffect } from 'react'
import { MapPin, Truck, Package, Clock, AlertCircle, ChevronRight, Zap, Shield, Activity, BarChart3, Filter, Search, X, CheckCircle, AlertTriangle, TrendingUp } from 'lucide-react'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

type BerthStatus = 'idle' | 'occupied' | 'cleaning'

interface Berth {
  id: string
  number: number
  zone: string
  status: BerthStatus
  currentVehicle?: {
    plateNumber: string
    vehicleType: string
    arrivalTime: string
    estimatedDuration: number
  }
  dailyProcessed: number
  totalWeight: number
}

interface BerthDetail {
  berth: Berth
  history: Array<{
    plateNumber: string
    arrivalTime: string
    departureTime: string
    weight: number
    compressionRatio: number
  }>
}

const generateMockBerths = (): Berth[] => {
  const zones = ['A区', 'B区', 'C区']
  const statuses: BerthStatus[] = ['idle', 'occupied', 'cleaning']
  const vehicleTypes = ['小型货车', '中型货车', '大型货车', '专用垃圾车']
  
  return Array.from({ length: 18 }, (_, i) => {
    const status = statuses[Math.floor(Math.random() * statuses.length)]
    const hasVehicle = status === 'occupied'
    
    return {
      id: `berth-${i + 1}`,
      number: i + 1,
      zone: zones[Math.floor(i / 6)],
      status,
      currentVehicle: hasVehicle ? {
        plateNumber: `京A${String(Math.floor(Math.random() * 100000)).padStart(5, '0')}`,
        vehicleType: vehicleTypes[Math.floor(Math.random() * vehicleTypes.length)],
        arrivalTime: new Date(Date.now() - Math.random() * 3600000).toLocaleTimeString('zh-CN'),
        estimatedDuration: Math.floor(Math.random() * 30) + 10
      } : undefined,
      dailyProcessed: Math.floor(Math.random() * 50) + 10,
      totalWeight: Math.floor(Math.random() * 5000) + 1000
    }
  })
}

const generateMockHistory = () => {
  return Array.from({ length: 5 }, (_, i) => ({
    plateNumber: `京A${String(Math.floor(Math.random() * 100000)).padStart(5, '0')}`,
    arrivalTime: new Date(Date.now() - (i + 1) * 3600000).toLocaleTimeString('zh-CN'),
    departureTime: new Date(Date.now() - i * 3600000 + 1800000).toLocaleTimeString('zh-CN'),
    weight: Math.floor(Math.random() * 3000) + 500,
    compressionRatio: Math.floor(Math.random() * 30) + 70
  }))
}

export default function BerthMonitoring() {
  const [berths, setBerths] = useState<Berth[]>(generateMockBerths())
  const [selectedBerth, setSelectedBerth] = useState<BerthDetail | null>(null)
  const [selectedZone, setSelectedZone] = useState<string>('全部')
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [animatedStats, setAnimatedStats] = useState({
    occupied: 0,
    idle: 0,
    cleaning: 0,
    totalProcessed: 0
  })
  const [trendData, setTrendData] = useState([
    { time: '00:00', occupied: 3, processed: 45 },
    { time: '04:00', occupied: 1, processed: 12 },
    { time: '08:00', occupied: 12, processed: 89 },
    { time: '12:00', occupied: 15, processed: 124 },
    { time: '16:00', occupied: 13, processed: 98 },
    { time: '20:00', occupied: 8, processed: 67 },
    { time: '23:59', occupied: 2, processed: 23 },
  ])

  useEffect(() => {
    const interval = setInterval(() => {
      setBerths(prevBerths => 
        prevBerths.map(berth => {
          const random = Math.random()
          if (berth.status === 'occupied' && random > 0.8) {
            return { ...berth, status: 'cleaning', currentVehicle: undefined }
          }
          if (berth.status === 'cleaning' && random > 0.7) {
            return { 
              ...berth, 
              status: 'idle',
              dailyProcessed: berth.dailyProcessed + 1,
              totalWeight: berth.totalWeight + Math.random() * 500 + 200
            }
          }
          if (berth.status === 'idle' && random > 0.9) {
            const vehicleTypes = ['小型货车', '中型货车', '大型货车', '专用垃圾车']
            return {
              ...berth,
              status: 'occupied',
              currentVehicle: {
                plateNumber: `京A${String(Math.floor(Math.random() * 100000)).padStart(5, '0')}`,
                vehicleType: vehicleTypes[Math.floor(Math.random() * vehicleTypes.length)],
                arrivalTime: new Date().toLocaleTimeString('zh-CN'),
                estimatedDuration: Math.floor(Math.random() * 30) + 10
              }
            }
          }
          return berth
        })
      )
    }, 20000)

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const stats = berths.reduce((acc, berth) => {
      acc[berth.status]++
      acc.totalProcessed += berth.dailyProcessed
      return acc
    }, { occupied: 0, idle: 0, cleaning: 0, totalProcessed: 0 } as any)

    const duration = 1500
    const steps = 30
    const interval = duration / steps
    
    let currentStep = 0
    const timer = setInterval(() => {
      currentStep++
      const progress = currentStep / steps
      const easeOutQuart = 1 - Math.pow(1 - progress, 4)
      
      setAnimatedStats({
        occupied: Math.floor(stats.occupied * easeOutQuart),
        idle: Math.floor(stats.idle * easeOutQuart),
        cleaning: Math.floor(stats.cleaning * easeOutQuart),
        totalProcessed: Math.floor(stats.totalProcessed * easeOutQuart)
      })
      
      if (currentStep >= steps) {
        clearInterval(timer)
      }
    }, interval)
    
    return () => clearInterval(timer)
  }, [berths])

  const getStatusColor = (status: BerthStatus) => {
    switch (status) {
      case 'idle': return 'bg-green-100 text-green-800'
      case 'occupied': return 'bg-blue-100 text-blue-800'
      case 'cleaning': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: BerthStatus) => {
    switch (status) {
      case 'idle': return '空闲'
      case 'occupied': return '占用'
      case 'cleaning': return '待清理'
      default: return '未知'
    }
  }

  const filteredBerths = selectedZone === '全部' 
    ? berths 
    : berths.filter(berth => berth.zone === selectedZone)

  const zones = ['全部', 'A区', 'B区', 'C区']
  const statusCounts = {
    idle: berths.filter(b => b.status === 'idle').length,
    occupied: berths.filter(b => b.status === 'occupied').length,
    cleaning: berths.filter(b => b.status === 'cleaning').length
  }

  const handleBerthClick = (berth: Berth) => {
    setSelectedBerth({
      berth,
      history: generateMockHistory()
    })
  }

  return (
    <div className="card bg-gradient-to-br from-slate-50 to-green-50/30 border-0 shadow-xl hover:shadow-2xl transition-all duration-500">
      <div className="card-header bg-gradient-to-r from-green-600 to-emerald-600 border-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
              <MapPin className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">泊位监控中心</h2>
              <p className="text-green-100 text-sm">18个泊位实时状态监控</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2 bg-white/10 px-3 py-1.5 rounded-full backdrop-blur-sm">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-white text-sm font-medium">实时监控</span>
            </div>
          </div>
        </div>
      </div>

      <div className="card-body p-6">
        {/* 统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl p-4 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">空闲泊位</p>
                <p className="text-2xl font-bold">{animatedStats.idle}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-200" />
            </div>
          </div>
          <div className="bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl p-4 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">占用泊位</p>
                <p className="text-2xl font-bold">{animatedStats.occupied}</p>
              </div>
              <Truck className="w-8 h-8 text-blue-200" />
            </div>
          </div>
          <div className="bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl p-4 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-100 text-sm">待清理</p>
                <p className="text-2xl font-bold">{animatedStats.cleaning}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-yellow-200" />
            </div>
          </div>
          <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl p-4 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">今日处理</p>
                <p className="text-2xl font-bold">{animatedStats.totalProcessed}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-200" />
            </div>
          </div>
        </div>

        {/* 趋势图表 */}
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <Activity className="w-5 h-5 mr-2 text-blue-500" />
            24小时泊位占用趋势
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="time" stroke="#9CA3AF" fontSize={12} />
              <YAxis stroke="#9CA3AF" fontSize={12} />
              <Tooltip 
                contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', border: '1px solid #e5e7eb', borderRadius: '8px' }}
              />
              <Line type="monotone" dataKey="occupied" stroke="#3B82F6" strokeWidth={2} dot={{ fill: '#3B82F6' }} />
              <Line type="monotone" dataKey="processed" stroke="#10B981" strokeWidth={2} dot={{ fill: '#10B981' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* 搜索和筛选 */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="搜索泊位号..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent w-full"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-600">区域筛选:</span>
            {zones.map(zone => (
              <button
                key={zone}
                onClick={() => setSelectedZone(zone)}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                  selectedZone === zone
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {zone}
              </button>
            ))}
          </div>
        </div>

        {/* 泊位网格 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredBerths
            .filter(berth => searchTerm === '' || berth.number.toString().includes(searchTerm))
            .map(berth => (
            <div
              key={berth.id}
              onClick={() => handleBerthClick(berth)}
              className="bg-white rounded-xl p-4 shadow-lg border border-gray-100 hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 cursor-pointer"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-900 bg-gray-100 px-2 py-1 rounded">{berth.zone}</span>
                  <span className="text-lg font-bold text-gray-900">#{berth.number}</span>
                </div>
                <span className={`status-badge ${getStatusColor(berth.status)}`}>
                  {getStatusText(berth.status)}
                </span>
              </div>

              {berth.currentVehicle ? (
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-gray-600">
                    <Truck className="w-4 h-4 mr-1" />
                    {berth.currentVehicle.plateNumber}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Package className="w-4 h-4 mr-1" />
                    {berth.currentVehicle.vehicleType}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Clock className="w-4 h-4 mr-1" />
                    {berth.currentVehicle.arrivalTime}
                  </div>
                </div>
              ) : (
                <div className="text-center py-4 text-gray-400">
                  <MapPin className="w-8 h-8 mx-auto mb-2" />
                  <p className="text-sm">等待车辆</p>
                </div>
              )}

              <div className="mt-3 pt-3 border-t border-gray-100">
                <div className="flex justify-between text-xs text-gray-500">
                  <span>今日处理: {berth.dailyProcessed}车次</span>
                  <span>总重: {berth.totalWeight.toFixed(0)}kg</span>
                </div>
              </div>
            </div>
          ))}
        </div>
        {selectedBerth && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {selectedBerth.berth.zone} #{selectedBerth.berth.number} 详细信息
                  </h3>
                  <button
                    onClick={() => setSelectedBerth(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ×
                  </button>
                </div>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-2 gap-6 mb-6">
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-3">当前状态</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">状态</span>
                        <span className={`status-badge ${getStatusColor(selectedBerth.berth.status)}`}>
                          {getStatusText(selectedBerth.berth.status)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">今日处理</span>
                        <span className="text-sm font-medium">{selectedBerth.berth.dailyProcessed} 车次</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">累计重量</span>
                        <span className="text-sm font-medium">{selectedBerth.berth.totalWeight.toLocaleString()} kg</span>
                      </div>
                    </div>
                  </div>

                  {selectedBerth.berth.currentVehicle && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-3">当前车辆</h4>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-500">车牌号</span>
                          <span className="text-sm font-medium">{selectedBerth.berth.currentVehicle.plateNumber}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-500">车辆类型</span>
                          <span className="text-sm font-medium">{selectedBerth.berth.currentVehicle.vehicleType}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-500">到达时间</span>
                          <span className="text-sm font-medium">{selectedBerth.berth.currentVehicle.arrivalTime}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-500">预计时长</span>
                          <span className="text-sm font-medium">{selectedBerth.berth.currentVehicle.estimatedDuration} 分钟</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-3">处理记录</h4>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            车牌号
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            到达时间
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            离开时间
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            重量(kg)
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            压缩比
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {selectedBerth.history.map((record, index) => (
                          <tr key={index}>
                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                              {record.plateNumber}
                            </td>
                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                              {record.arrivalTime}
                            </td>
                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                              {record.departureTime}
                            </td>
                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                              {record.weight.toLocaleString()}
                            </td>
                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                              {record.compressionRatio}%
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
