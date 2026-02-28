import React, { useState, useEffect } from 'react'
import { AlertTriangle, AlertCircle, Info, Clock, CheckCircle, XCircle, Filter, Search, X, Bell, Shield, Zap, Activity, TrendingUp, Users, AlertOctagon, MapPin } from 'lucide-react'
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts'

type AlertLevel = 'general' | 'moderate' | 'severe'
type AlertStatus = 'pending' | 'processing' | 'resolved'

interface Alert {
  id: string
  title: string
  description: string
  level: AlertLevel
  status: AlertStatus
  type: string
  location?: string
  timestamp: string
  assignee?: string
  resolvedAt?: string
  resolution?: string
}

const generateMockAlerts = (): Alert[] => {
  const alertTypes = [
    '泊位拥堵预警',
    '设备故障预警', 
    '容器满箱预警',
    '末端处置场容量预警',
    '车辆超时预警',
    '系统异常预警'
  ]
  
  const levels: AlertLevel[] = ['general', 'moderate', 'severe']
  const statuses: AlertStatus[] = ['pending', 'processing', 'resolved']
  const locations = ['A区', 'B区', 'C区', '泊位#1-6', '泊位#7-12', '泊位#13-18', '转运车辆', '处置场']
  const assignees = ['张三', '李四', '王五', '赵六', '系统自动']
  
  return Array.from({ length: 15 }, (_, i) => {
    const level = levels[Math.floor(Math.random() * levels.length)]
    const status = statuses[Math.floor(Math.random() * statuses.length)]
    const isResolved = status === 'resolved'
    
    return {
      id: `alert-${i + 1}`,
      title: alertTypes[Math.floor(Math.random() * alertTypes.length)],
      description: `详细描述预警信息内容，包括具体情况和影响范围`,
      level,
      status,
      type: alertTypes[Math.floor(Math.random() * alertTypes.length)],
      location: locations[Math.floor(Math.random() * locations.length)],
      timestamp: new Date(Date.now() - Math.random() * 86400000).toLocaleString('zh-CN'),
      assignee: assignees[Math.floor(Math.random() * assignees.length)],
      resolvedAt: isResolved ? new Date(Date.now() - Math.random() * 3600000).toLocaleString('zh-CN') : undefined,
      resolution: isResolved ? '问题已解决，系统恢复正常运行' : undefined
    }
  })
}

export default function AlertMonitoring() {
  const [alerts, setAlerts] = useState<Alert[]>(generateMockAlerts())
  const [levelFilter, setLevelFilter] = useState<AlertLevel | 'all'>('all')
  const [statusFilter, setStatusFilter] = useState<AlertStatus | 'all'>('all')
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [animatedStats, setAnimatedStats] = useState({
    pending: 0,
    processing: 0,
    resolved: 0,
    total: 0
  })
  const [trendData, setTrendData] = useState([
    { time: '00:00', general: 2, moderate: 1, severe: 0 },
    { time: '04:00', general: 1, moderate: 0, severe: 0 },
    { time: '08:00', general: 5, moderate: 3, severe: 1 },
    { time: '12:00', general: 8, moderate: 4, severe: 2 },
    { time: '16:00', general: 6, moderate: 3, severe: 1 },
    { time: '20:00', general: 4, moderate: 2, severe: 0 },
    { time: '23:59', general: 2, moderate: 1, severe: 0 },
  ])

  useEffect(() => {
    const interval = setInterval(() => {
      setAlerts(prev => {
        const random = Math.random()
        if (random < 0.1) {
          const newAlert: Alert = {
            id: `alert-${Date.now()}`,
            title: '新预警信息',
            description: '系统检测到新的预警情况',
            level: ['general', 'moderate', 'severe'][Math.floor(Math.random() * 3)] as AlertLevel,
            status: 'pending',
            type: '系统自动预警',
            location: ['A区', 'B区', 'C区'][Math.floor(Math.random() * 3)],
            timestamp: new Date().toLocaleString('zh-CN')
          }
          return [newAlert, ...prev.slice(0, 14)]
        }
        return prev
      })
    }, 45000)

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const stats = alerts.reduce((acc, alert) => {
      acc[alert.status]++
      acc.total++
      return acc
    }, { pending: 0, processing: 0, resolved: 0, total: 0 } as any)

    const duration = 1500
    const steps = 30
    const interval = duration / steps
    
    let currentStep = 0
    const timer = setInterval(() => {
      currentStep++
      const progress = currentStep / steps
      const easeOutQuart = 1 - Math.pow(1 - progress, 4)
      
      setAnimatedStats({
        pending: Math.floor(stats.pending * easeOutQuart),
        processing: Math.floor(stats.processing * easeOutQuart),
        resolved: Math.floor(stats.resolved * easeOutQuart),
        total: Math.floor(stats.total * easeOutQuart)
      })
      
      if (currentStep >= steps) {
        clearInterval(timer)
      }
    }, interval)
    
    return () => clearInterval(timer)
  }, [alerts])

  const getLevelColor = (level: AlertLevel) => {
    switch (level) {
      case 'general': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'moderate': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'severe': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getLevelText = (level: AlertLevel) => {
    switch (level) {
      case 'general': return '一般'
      case 'moderate': return '较重'
      case 'severe': return '严重'
      default: return '未知'
    }
  }

  const getLevelIcon = (level: AlertLevel) => {
    switch (level) {
      case 'general': return <Info className="w-4 h-4" />
      case 'moderate': return <AlertCircle className="w-4 h-4" />
      case 'severe': return <AlertTriangle className="w-4 h-4" />
      default: return <Info className="w-4 h-4" />
    }
  }

  const getStatusColor = (status: AlertStatus) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'processing': return 'bg-blue-100 text-blue-800'
      case 'resolved': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: AlertStatus) => {
    switch (status) {
      case 'pending': return '未处理'
      case 'processing': return '处理中'
      case 'resolved': return '已处理'
      default: return '未知'
    }
  }

  const getStatusIcon = (status: AlertStatus) => {
    switch (status) {
      case 'pending': return <Clock className="w-3 h-3" />
      case 'processing': return <AlertCircle className="w-3 h-3" />
      case 'resolved': return <CheckCircle className="w-3 h-3" />
      default: return <Clock className="w-3 h-3" />
    }
  }

  const filteredAlerts = alerts.filter(alert => {
    const levelMatch = levelFilter === 'all' || alert.level === levelFilter
    const statusMatch = statusFilter === 'all' || alert.status === statusFilter
    return levelMatch && statusMatch
  })

  const levelOptions: Array<AlertLevel | 'all'> = ['all', 'general', 'moderate', 'severe']
  const statusOptions: Array<AlertStatus | 'all'> = ['all', 'pending', 'processing', 'resolved']

  return (
    <div className="card bg-gradient-to-br from-slate-50 to-red-50/30 border-0 shadow-xl hover:shadow-2xl transition-all duration-500">
      <div className="card-header bg-gradient-to-r from-red-600 to-pink-600 border-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
              <AlertTriangle className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">预警监控中心</h2>
              <p className="text-red-100 text-sm">多级预警实时处理跟踪</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2 bg-white/10 px-3 py-1.5 rounded-full backdrop-blur-sm">
              <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
              <span className="text-white text-sm font-medium">实时预警</span>
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
                <p className="text-yellow-100 text-sm">未处理</p>
                <p className="text-2xl font-bold">{animatedStats.pending}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-200" />
            </div>
          </div>
          <div className="bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl p-4 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">处理中</p>
                <p className="text-2xl font-bold">{animatedStats.processing}</p>
              </div>
              <AlertCircle className="w-8 h-8 text-blue-200" />
            </div>
          </div>
          <div className="bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl p-4 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">已处理</p>
                <p className="text-2xl font-bold">{animatedStats.resolved}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-200" />
            </div>
          </div>
          <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl p-4 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">总预警</p>
                <p className="text-2xl font-bold">{animatedStats.total}</p>
              </div>
              <Bell className="w-8 h-8 text-purple-200" />
            </div>
          </div>
        </div>

        {/* 趋势图表 */}
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <Zap className="w-5 h-5 mr-2 text-red-500" />
            24小时预警趋势
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={trendData}>
              <defs>
                <linearGradient id="colorGeneral" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#F59E0B" stopOpacity={0.1}/>
                </linearGradient>
                <linearGradient id="colorModerate" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#F97316" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#F97316" stopOpacity={0.1}/>
                </linearGradient>
                <linearGradient id="colorSevere" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#EF4444" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#EF4444" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="time" stroke="#9CA3AF" fontSize={12} />
              <YAxis stroke="#9CA3AF" fontSize={12} />
              <Tooltip 
                contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', border: '1px solid #e5e7eb', borderRadius: '8px' }}
              />
              <Area type="monotone" dataKey="general" stroke="#F59E0B" fillOpacity={1} fill="url(#colorGeneral)" strokeWidth={2} />
              <Area type="monotone" dataKey="moderate" stroke="#F97316" fillOpacity={1} fill="url(#colorModerate)" strokeWidth={2} />
              <Area type="monotone" dataKey="severe" stroke="#EF4444" fillOpacity={1} fill="url(#colorSevere)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* 搜索和筛选 */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="搜索预警信息..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent w-full"
            />
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600">等级:</span>
              <select
                value={levelFilter}
                onChange={(e) => setLevelFilter(e.target.value as AlertLevel | 'all')}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
                {levelOptions.map(option => (
                  <option key={option} value={option}>
                    {option === 'all' ? '全部' : option === 'general' ? '一般' : option === 'moderate' ? '较重' : '严重'}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">状态:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as AlertStatus | 'all')}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
                {statusOptions.map(option => (
                  <option key={option} value={option}>
                    {option === 'all' ? '全部' : option === 'pending' ? '未处理' : option === 'processing' ? '处理中' : '已处理'}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* 预警列表 */}
        <div className="space-y-4">
          {filteredAlerts
            .filter(alert => searchTerm === '' || 
              alert.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
              alert.description.toLowerCase().includes(searchTerm.toLowerCase())
            )
            .map(alert => (
            <div
              key={alert.id}
              className={`border rounded-lg p-4 shadow-md hover:shadow-lg transition-all duration-300 ${getLevelColor(alert.level)}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-1">
                    {getLevelIcon(alert.level)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{alert.title}</h3>
                      <span className={`status-badge ${getLevelColor(alert.level)}`}>
                        {getLevelText(alert.level)}
                      </span>
                      <span className={`status-badge ${getStatusColor(alert.status)}`}>
                        {getStatusText(alert.status)}
                      </span>
                    </div>
                    <p className="text-gray-600 mb-3">{alert.description}</p>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 mr-1" />
                        {alert.location}
                      </div>
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        {alert.timestamp}
                      </div>
                      {alert.assignee && (
                        <div className="flex items-center">
                          <Users className="w-4 h-4 mr-1" />
                          负责人: {alert.assignee}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {alert.status === 'resolved' && alert.resolution && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center text-green-600">
                      <CheckCircle className="w-4 h-4 mr-1" />
                      <span className="font-medium">已解决</span>
                    </div>
                    <div className="text-gray-500">
                      解决时间: {alert.resolvedAt}
                    </div>
                  </div>
                  <p className="text-gray-600 mt-2">{alert.resolution}</p>
                </div>
              )}

              {alert.status === 'processing' && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center text-blue-600 text-sm">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    <span className="font-medium">正在处理中...</span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
