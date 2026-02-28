import React, { useState, useEffect } from 'react'
import OverviewPanel from './components/OverviewPanel'
import BerthMonitoring from './components/BerthMonitoring'
import VehicleMonitoring from './components/VehicleMonitoring'
import AlertMonitoring from './components/AlertMonitoring'

function App() {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [refreshInterval, setRefreshInterval] = useState(30000) // 30秒刷新间隔

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">垃圾处理站智慧运营系统</h1>
              <p className="text-sm text-gray-500 mt-1">实时调度监控看板</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-gray-500">当前时间</p>
                <p className="text-lg font-medium text-gray-900">
                  {currentTime.toLocaleString('zh-CN')}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-600">实时更新</span>
              </div>
            </div>
          </div>
        </div>
      </header>
      
      <main className="p-6">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <OverviewPanel />
          <BerthMonitoring />
          <VehicleMonitoring />
          <AlertMonitoring />
        </div>
      </main>
    </div>
  )
}

export default App
