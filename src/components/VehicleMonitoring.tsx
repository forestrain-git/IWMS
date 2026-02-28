import React, { useState, useEffect } from 'react'
import { Truck, Clock, MapPin, Filter, ChevronRight, TrendingUp, Package, Zap, BarChart3, Search, Activity, Navigation, Users, AlertCircle, CheckCircle, X } from 'lucide-react'
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts'

type VehicleStatus = 'queueing' | 'working' | 'completed'

interface Vehicle {
  id: string
  plateNumber: string
  vehicleType: string
  status: VehicleStatus
  wasteType: string
  arrivalTime: string
  berthNumber?: number
  weight?: number
  estimatedDuration?: number
  trajectory: Array<{
    timestamp: string
    location: string
    action: string
  }>
}

interface VehicleDetail {
  vehicle: Vehicle
  fullTrajectory: Array<{
    timestamp: string
    location: string
    action: string
    berthNumber?: number
    weight?: number
    compressionParams?: {
      pressure: number
      temperature: number
      duration: number
    }
  }>
}

const generateMockVehicles = (): Vehicle[] => {
  const statuses: VehicleStatus[] = ['queueing', 'working', 'completed']
  const vehicleTypes = ['小型货车', '中型货车', '大型货车', '专用垃圾车']
  const wasteTypes = ['生活垃圾', '建筑垃圾', '有害垃圾', '可回收垃圾']
  
  return Array.from({ length: 24 }, (_, i) => {
    const status = statuses[Math.floor(Math.random() * statuses.length)]
    const hasBerth = status === 'working'
    
    return {
      id: `vehicle-${i + 1}`,
      plateNumber: `京A${String(Math.floor(Math.random() * 100000)).padStart(5, '0')}`,
      vehicleType: vehicleTypes[Math.floor(Math.random() * vehicleTypes.length)],
      status,
      wasteType: wasteTypes[Math.floor(Math.random() * wasteTypes.length)],
      arrivalTime: new Date(Date.now() - Math.random() * 3600000).toLocaleTimeString('zh-CN'),
      berthNumber: hasBerth ? Math.floor(Math.random() * 18) + 1 : undefined,
      weight: hasBerth ? Math.floor(Math.random() * 3000) + 500 : undefined,
      estimatedDuration: hasBerth ? Math.floor(Math.random() * 30) + 10 : undefined,
      trajectory: Array.from({ length: 3 }, (_, j) => ({
        timestamp: new Date(Date.now() - (j + 1) * 600000).toLocaleTimeString('zh-CN'),
        location: ['入口', '检查站', '等待区', '泊位', '作业区'][j],
        action: ['到达', '检查', '等待', '作业', '完成'][j]
      }))
    }
  })
}

const generateFullTrajectory = () => {
  return Array.from({ length: 8 }, (_, i) => ({
    timestamp: new Date(Date.now() - (i + 1) * 900000).toLocaleTimeString('zh-CN'),
    location: ['入口', '检查站', '等待区', '泊位', '作业区', '压缩区', '转运区', '出口'][i],
    action: ['到达入口', '检查证件', '等待泊位', '开始作业', '垃圾压缩', '装车转运', '离开转运区', '完成出站'][i],
    berthNumber: i >= 3 && i <= 5 ? Math.floor(Math.random() * 18) + 1 : undefined,
    weight: i === 4 ? Math.floor(Math.random() * 3000) + 500 : undefined,
    compressionParams: i === 4 ? {
      pressure: Math.floor(Math.random() * 50) + 100,
      temperature: Math.floor(Math.random() * 30) + 80,
      duration: Math.floor(Math.random() * 60) + 30
    } : undefined
  }))
}

export default function VehicleMonitoring() {
  const [vehicles, setVehicles] = useState<Vehicle[]>(generateMockVehicles())
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleDetail | null>(null)
  const [statusFilter, setStatusFilter] = useState<VehicleStatus | 'all'>('all')
  const [wasteTypeFilter, setWasteTypeFilter] = useState<string>('全部')
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [animatedStats, setAnimatedStats] = useState({
    queueing: 0,
    working: 0,
    completed: 0,
    totalProcessed: 0
  })
  const [trendData, setTrendData] = useState([
    { time: '00:00', queueing: 3, working: 2, completed: 8 },
    { time: '04:00', queueing: 1, working: 1, completed: 4 },
    { time: '08:00', queueing: 8, working: 6, completed: 15 },
    { time: '12:00', queueing: 12, working: 8, completed: 22 },
    { time: '16:00', queueing: 10, working: 7, completed: 18 },
    { time: '20:00', queueing: 6, working: 4, completed: 12 },
    { time: '23:59', queueing: 2, working: 1, completed: 5 },
  ])

  useEffect(() => {
    const interval = setInterval(() => {
      setVehicles(prev => prev.map(vehicle => {
        const random = Math.random()
        if (random < 0.05) {
          const statusTransitions: Record<VehicleStatus, VehicleStatus> = {
            'queueing': 'working',
            'working': 'completed',
            'completed': 'queueing'
          }
          return { ...vehicle, status: statusTransitions[vehicle.status] }
        }
        return vehicle
      }))
    }, 20000)

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const stats = vehicles.reduce((acc, vehicle) => {
      acc[vehicle.status]++
      if (vehicle.status === 'completed') {
        acc.totalProcessed++
      }
      return acc
    }, { queueing: 0, working: 0, completed: 0, totalProcessed: 0 } as any)

    const duration = 1500
    const steps = 30
    const interval = duration / steps
    
    let currentStep = 0
    const timer = setInterval(() => {
      currentStep++
      const progress = currentStep / steps
      const easeOutQuart = 1 - Math.pow(1 - progress, 4)
      
      setAnimatedStats({
        queueing: Math.floor(stats.queueing * easeOutQuart),
        working: Math.floor(stats.working * easeOutQuart),
        completed: Math.floor(stats.completed * easeOutQuart),
        totalProcessed: Math.floor(stats.totalProcessed * easeOutQuart)
      })
      
      if (currentStep >= steps) {
        clearInterval(timer)
      }
    }, interval)
    
    return () => clearInterval(timer)
  }, [vehicles])

  const getStatusColor = (status: VehicleStatus) => {
    switch (status) {
      case 'queueing': return 'bg-yellow-100 text-yellow-800'
      case 'working': return 'bg-blue-100 text-blue-800'
      case 'completed': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: VehicleStatus) => {
    switch (status) {
      case 'queueing': return '排队'
      case 'working': return '作业'
      case 'completed': return '完成'
      default: return '未知'
    }
  }

  const filteredVehicles = vehicles.filter(vehicle => {
    const statusMatch = statusFilter === 'all' || vehicle.status === statusFilter
    const typeMatch = wasteTypeFilter === '全部' || vehicle.wasteType === wasteTypeFilter
    return statusMatch && typeMatch
  })

  const wasteTypes = ['全部', '生活垃圾', '建筑垃圾', '有害垃圾', '可回收垃圾']
  const statusOptions: Array<VehicleStatus | 'all'> = ['all', 'queueing', 'working', 'completed']

  const handleVehicleClick = (vehicle: Vehicle) => {
    setSelectedVehicle({
      vehicle,
      fullTrajectory: generateFullTrajectory()
    })
  }

  return (
    <div className="card bg-gradient-to-br from-slate-50 to-orange-50/30 border-0 shadow-xl hover:shadow-2xl transition-all duration-500">
      <div className="card-header bg-gradient-to-r from-orange-600 to-red-600 border-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
              <Truck className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">车辆监控中心</h2>
              <p className="text-orange-100 text-sm">24辆车辆实时调度追踪</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2 bg-white/10 px-3 py-1.5 rounded-full backdrop-blur-sm">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-white text-sm font-medium">实时追踪</span>
            </div>
          </div>
        </div>
      </div>

      <div className="card-body p-6">
        {/* 统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl p-4 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-100 text-sm">排队车辆</p>
                <p className="text-2xl font-bold">{animatedStats.queueing}</p>
              </div>
              <AlertCircle className="w-8 h-8 text-yellow-200" />
            </div>
          </div>
          <div className="bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl p-4 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">作业车辆</p>
                <p className="text-2xl font-bold">{animatedStats.working}</p>
              </div>
              <Activity className="w-8 h-8 text-blue-200" />
            </div>
          </div>
          <div className="bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl p-4 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">已完成</p>
                <p className="text-2xl font-bold">{animatedStats.completed}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-200" />
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
            <Zap className="w-5 h-5 mr-2 text-orange-500" />
            24小时车辆调度趋势
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={trendData}>
              <defs>
                <linearGradient id="colorQueueing" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#F59E0B" stopOpacity={0.1}/>
                </linearGradient>
                <linearGradient id="colorWorking" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1}/>
                </linearGradient>
                <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="time" stroke="#9CA3AF" fontSize={12} />
              <YAxis stroke="#9CA3AF" fontSize={12} />
              <Tooltip 
                contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', border: '1px solid #e5e7eb', borderRadius: '8px' }}
              />
              <Area type="monotone" dataKey="queueing" stroke="#F59E0B" fillOpacity={1} fill="url(#colorQueueing)" strokeWidth={2} />
              <Area type="monotone" dataKey="working" stroke="#3B82F6" fillOpacity={1} fill="url(#colorWorking)" strokeWidth={2} />
              <Area type="monotone" dataKey="completed" stroke="#10B981" fillOpacity={1} fill="url(#colorCompleted)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* 搜索和筛选 */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="搜索车牌号..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent w-full"
            />
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600">状态:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as VehicleStatus | 'all')}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                {statusOptions.map(option => (
                  <option key={option} value={option}>
                    {option === 'all' ? '全部' : option === 'queueing' ? '排队' : option === 'working' ? '作业' : '完成'}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">品类:</span>
              <select
                value={wasteTypeFilter}
                onChange={(e) => setWasteTypeFilter(e.target.value)}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                {wasteTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* 车辆列表 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredVehicles
            .filter(vehicle => searchTerm === '' || vehicle.plateNumber.toLowerCase().includes(searchTerm.toLowerCase()))
            .map(vehicle => (
            <div
              key={vehicle.id}
              onClick={() => handleVehicleClick(vehicle)}
              className="bg-white rounded-xl p-4 shadow-lg border border-gray-100 hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 cursor-pointer"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <Truck className="w-5 h-5 text-orange-500" />
                  <span className="font-semibold text-gray-900">{vehicle.plateNumber}</span>
                </div>
                <span className={`status-badge ${getStatusColor(vehicle.status)}`}>
                  {getStatusText(vehicle.status)}
                </span>
              </div>

              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center">
                  <Package className="w-4 h-4 mr-2" />
                  {vehicle.vehicleType}
                </div>
                <div className="flex items-center">
                  <MapPin className="w-4 h-4 mr-2" />
                  {vehicle.wasteType}
                </div>
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-2" />
                  {vehicle.arrivalTime}
                </div>
                {vehicle.berthNumber && (
                  <div className="flex items-center">
                    <Navigation className="w-4 h-4 mr-2" />
                    泊位 #{vehicle.berthNumber}
                  </div>
                )}
              </div>

              <div className="mt-3 pt-3 border-t border-gray-100">
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>预计时长: {vehicle.estimatedDuration || 0}分钟</span>
                  {vehicle.weight && <span>重量: {vehicle.weight}kg</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 详情弹窗 */}
      {selectedVehicle && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-4xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900 flex items-center">
                <Truck className="w-6 h-6 mr-2 text-orange-500" />
                {selectedVehicle.vehicle.plateNumber} 调度轨迹
              </h3>
              <button
                onClick={() => setSelectedVehicle(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* 车辆信息 */}
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3">车辆信息</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">车牌号:</span>
                      <span className="font-medium">{selectedVehicle.vehicle.plateNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">车型:</span>
                      <span className="font-medium">{selectedVehicle.vehicle.vehicleType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">垃圾类型:</span>
                      <span className="font-medium">{selectedVehicle.vehicle.wasteType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">当前状态:</span>
                      <span className={`status-badge ${getStatusColor(selectedVehicle.vehicle.status)}`}>
                        {getStatusText(selectedVehicle.vehicle.status)}
                      </span>
                    </div>
                  </div>
                </div>

                {selectedVehicle.vehicle.berthNumber && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-3">作业信息</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">泊位号:</span>
                        <span className="font-medium">#{selectedVehicle.vehicle.berthNumber}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">重量:</span>
                        <span className="font-medium">{selectedVehicle.vehicle.weight}kg</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">预计时长:</span>
                        <span className="font-medium">{selectedVehicle.vehicle.estimatedDuration}分钟</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* 完整轨迹 */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-3">完整调度轨迹</h4>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {selectedVehicle.fullTrajectory.map((point, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <div className="flex-shrink-0 w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center">
                        <span className="text-xs font-medium text-orange-600">{index + 1}</span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-gray-900">{point.action}</p>
                          <p className="text-xs text-gray-500">{point.timestamp}</p>
                        </div>
                        <p className="text-sm text-gray-600">{point.location}</p>
                        {point.berthNumber && (
                          <p className="text-xs text-gray-500">泊位 #{point.berthNumber}</p>
                        )}
                        {point.weight && (
                          <p className="text-xs text-gray-500">重量: {point.weight}kg</p>
                        )}
                        {point.compressionParams && (
                          <div className="mt-1 p-2 bg-white rounded text-xs">
                            <p className="text-gray-600">压缩参数:</p>
                            <div className="grid grid-cols-3 gap-2 mt-1">
                              <span>压力: {point.compressionParams.pressure}MPa</span>
                              <span>温度: {point.compressionParams.temperature}°C</span>
                              <span>时长: {point.compressionParams.duration}s</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
