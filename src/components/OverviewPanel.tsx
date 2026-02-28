import React, { useState, useEffect } from 'react'
import { Truck, Package, Activity, AlertCircle, TrendingUp, Clock, BarChart3, Zap, Shield, Factory, Users, ArrowUp, ArrowDown, Minus } from 'lucide-react'
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'

interface OverviewData {
  dailyVehicles: number
  wasteTypes: {
    household: number
    construction: number
    hazardous: number
    recyclable: number
  }
  berthOccupancy: number
  containerStatus: {
    normal: number
    warning: number
    full: number
  }
  transferVehicles: {
    active: number
    total: number
  }
  disposalSites: {
    available: number
    total: number
  }
  lastUpdate: string
}

const mockData: OverviewData = {
  dailyVehicles: 156,
  wasteTypes: {
    household: 45.2,
    construction: 23.8,
    hazardous: 8.5,
    recyclable: 22.5
  },
  berthOccupancy: 72.3,
  containerStatus: {
    normal: 12,
    warning: 4,
    full: 2
  },
  transferVehicles: {
    active: 8,
    total: 12
  },
  disposalSites: {
    available: 3,
    total: 5
  },
  lastUpdate: new Date().toLocaleTimeString('zh-CN')
}

export default function OverviewPanel() {
  const [data, setData] = useState<OverviewData>(mockData)
  const [trendData, setTrendData] = useState([
    { time: '00:00', vehicles: 12, waste: 120 },
    { time: '04:00', vehicles: 8, waste: 85 },
    { time: '08:00', vehicles: 45, waste: 380 },
    { time: '12:00', vehicles: 38, waste: 420 },
    { time: '16:00', vehicles: 42, waste: 390 },
    { time: '20:00', vehicles: 28, waste: 280 },
    { time: '23:59', vehicles: 15, waste: 150 },
  ])
  const [animatedValues, setAnimatedValues] = useState({
    dailyVehicles: 0,
    berthOccupancy: 0,
    activeVehicles: 0
  })

  useEffect(() => {
    const interval = setInterval(() => {
      setData(prevData => ({
        ...prevData,
        dailyVehicles: prevData.dailyVehicles + Math.floor(Math.random() * 5) - 2,
        berthOccupancy: Math.max(0, Math.min(100, prevData.berthOccupancy + (Math.random() * 10) - 5)),
        transferVehicles: {
          ...prevData.transferVehicles,
          active: Math.max(0, Math.min(prevData.transferVehicles.total, prevData.transferVehicles.active + Math.floor(Math.random() * 3) - 1))
        },
        lastUpdate: new Date().toLocaleTimeString('zh-CN')
      }))
    }, 30000)

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const duration = 2000
    const steps = 60
    const interval = duration / steps
    
    let currentStep = 0
    const timer = setInterval(() => {
      currentStep++
      const progress = currentStep / steps
      const easeOutQuart = 1 - Math.pow(1 - progress, 4)
      
      setAnimatedValues({
        dailyVehicles: Math.floor(data.dailyVehicles * easeOutQuart),
        berthOccupancy: Math.floor(data.berthOccupancy * easeOutQuart),
        activeVehicles: Math.floor(data.transferVehicles.active * easeOutQuart)
      })
      
      if (currentStep >= steps) {
        clearInterval(timer)
      }
    }, interval)
    
    return () => clearInterval(timer)
  }, [data.dailyVehicles, data.berthOccupancy, data.transferVehicles.active])

  const wasteTypeColors = {
    household: 'bg-blue-500',
    construction: 'bg-orange-500',
    hazardous: 'bg-red-500',
    recyclable: 'bg-green-500'
  }

  const wasteTypeLabels = {
    household: '生活垃圾',
    construction: '建筑垃圾',
    hazardous: '有害垃圾',
    recyclable: '可回收垃圾'
  }

  const pieData = Object.entries(data.wasteTypes).map(([type, percentage]) => ({
    name: wasteTypeLabels[type as keyof typeof wasteTypeLabels],
    value: percentage,
    color: type === 'household' ? '#3B82F6' : type === 'construction' ? '#F97316' : type === 'hazardous' ? '#EF4444' : '#10B981'
  }))

  const containerData = [
    { name: '正常', value: data.containerStatus.normal, color: '#10B981' },
    { name: '预警', value: data.containerStatus.warning, color: '#F59E0B' },
    { name: '满箱', value: data.containerStatus.full, color: '#EF4444' }
  ]

  const radialData = [
    { name: '占用', value: data.berthOccupancy, fill: '#F97316' },
    { name: '空闲', value: 100 - data.berthOccupancy, fill: '#E5E7EB' }
  ]

  return (
    <div className="card bg-gradient-to-br from-slate-50 to-blue-50/30 border-0 shadow-xl hover:shadow-2xl transition-all duration-500">
      <div className="card-header bg-gradient-to-r from-blue-600 to-indigo-600 border-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">智慧运营总览</h2>
              <p className="text-blue-100 text-sm">实时监控数据中心</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2 bg-white/10 px-3 py-1.5 rounded-full backdrop-blur-sm">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-white text-sm font-medium">实时更新</span>
            </div>
            <div className="flex items-center text-blue-100 text-sm">
              <Clock className="w-4 h-4 mr-1" />
              {data.lastUpdate}
            </div>
          </div>
        </div>
      </div>
      
      <div className="card-body p-6">
        {/* 核心指标卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="metric-card bg-gradient-to-br from-blue-500 to-blue-600 border-0 shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300">
            <div className="flex items-center justify-between text-white">
              <div>
                <p className="text-blue-100 text-sm font-medium mb-1">当日进站车次</p>
                <p className="text-3xl font-bold">{animatedValues.dailyVehicles}</p>
                <div className="flex items-center mt-2 text-blue-100 text-xs">
                  <ArrowUp className="w-3 h-3 mr-1" />
                  较昨日 +12.5%
                </div>
              </div>
              <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm">
                <Truck className="w-8 h-8 text-white" />
              </div>
            </div>
          </div>

          <div className="metric-card bg-gradient-to-br from-orange-500 to-red-500 border-0 shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300">
            <div className="flex items-center justify-between text-white">
              <div>
                <p className="text-orange-100 text-sm font-medium mb-1">泊位占用率</p>
                <p className="text-3xl font-bold">{animatedValues.berthOccupancy}%</p>
                <div className="mt-2 w-full bg-white/30 rounded-full h-2">
                  <div 
                    className="bg-white h-2 rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${animatedValues.berthOccupancy}%` }}
                  />
                </div>
              </div>
              <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm">
                <Activity className="w-8 h-8 text-white" />
              </div>
            </div>
          </div>

          <div className="metric-card bg-gradient-to-br from-green-500 to-emerald-500 border-0 shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300">
            <div className="flex items-center justify-between text-white">
              <div>
                <p className="text-green-100 text-sm font-medium mb-1">转运车辆</p>
                <p className="text-3xl font-bold">{animatedValues.activeVehicles}/{data.transferVehicles.total}</p>
                <div className="mt-2 text-green-100 text-xs">
                  运行中 {animatedValues.activeVehicles} 辆
                </div>
              </div>
              <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm">
                <Package className="w-8 h-8 text-white" />
              </div>
            </div>
          </div>

          <div className="metric-card bg-gradient-to-br from-purple-500 to-indigo-500 border-0 shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300">
            <div className="flex items-center justify-between text-white">
              <div>
                <p className="text-purple-100 text-sm font-medium mb-1">处置场状态</p>
                <p className="text-3xl font-bold">{data.disposalSites.available}/{data.disposalSites.total}</p>
                <div className="mt-2 text-purple-100 text-xs">
                  可用 {data.disposalSites.available} 个
                </div>
              </div>
              <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm">
                <Factory className="w-8 h-8 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* 图表区域 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 趋势图 */}
          <div className="lg:col-span-2 bg-white rounded-xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                <Zap className="w-5 h-5 mr-2 text-yellow-500" />
                24小时趋势
              </h3>
              <div className="flex space-x-2">
                <div className="flex items-center text-xs text-gray-500">
                  <div className="w-3 h-3 bg-blue-500 rounded-full mr-1" />
                  进站车次
                </div>
                <div className="flex items-center text-xs text-gray-500">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-1" />
                  处理量
                </div>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="colorVehicles" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1}/>
                  </linearGradient>
                  <linearGradient id="colorWaste" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="time" stroke="#9CA3AF" fontSize={12} />
                <YAxis stroke="#9CA3AF" fontSize={12} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                  labelStyle={{ color: '#374151', fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="vehicles" stroke="#3B82F6" fillOpacity={1} fill="url(#colorVehicles)" strokeWidth={2} />
                <Area type="monotone" dataKey="waste" stroke="#10B981" fillOpacity={1} fill="url(#colorWaste)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* 泊位占用率仪表盘 */}
          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <Shield className="w-5 h-5 mr-2 text-blue-500" />
              泊位占用率
            </h3>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={radialData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  startAngle={90}
                  endAngle={-270}
                  dataKey="value"
                >
                  {radialData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <text x="50%" y="45%" textAnchor="middle" dominantBaseline="middle" className="text-3xl font-bold" fill="#374151">
                  {Math.round(data.berthOccupancy)}%
                </text>
                <text x="50%" y="60%" textAnchor="middle" dominantBaseline="middle" className="text-sm" fill="#6B7280">
                  占用率
                </text>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-500">18个泊位中</p>
              <p className="text-lg font-semibold text-gray-800">{Math.round(18 * data.berthOccupancy / 100)} 个占用</p>
            </div>
          </div>
        </div>

        {/* 底部统计 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          {/* 垃圾类型分布 */}
          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <BarChart3 className="w-5 h-5 mr-2 text-green-500" />
              各品类处理量
            </h3>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-2 gap-2 mt-4">
              {pieData.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: item.color }} />
                    <span className="text-sm text-gray-600">{item.name}</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-800">{item.value}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* 容器状态 */}
          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <Package className="w-5 h-5 mr-2 text-purple-500" />
              容器状态分布
            </h3>
            <div className="grid grid-cols-3 gap-4">
              {containerData.map((item, index) => (
                <div key={index} className="text-center group">
                  <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-3 transition-all duration-300 group-hover:scale-110 ${
                    item.color === '#10B981' ? 'bg-gradient-to-br from-green-400 to-green-500 shadow-lg' :
                    item.color === '#F59E0B' ? 'bg-gradient-to-br from-yellow-400 to-orange-500 shadow-lg' :
                    'bg-gradient-to-br from-red-400 to-red-500 shadow-lg'
                  }`}>
                    <span className="text-2xl font-bold text-white">{item.value}</span>
                  </div>
                  <p className="text-sm font-medium text-gray-700">{item.name}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {Math.round(item.value / (data.containerStatus.normal + data.containerStatus.warning + data.containerStatus.full) * 100)}%
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
