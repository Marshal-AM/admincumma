'use client'

import { useEffect, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface DashboardMetrics {
  totalFacilities: number
  newFacilities: number
  totalBookings: number
  monthlyEarnings: number
  totalEarnings: number
  earningsChange: number
}

interface StartupData {
  month: string
  labs: number
  meetingRoom: number
  trainingHalls: number
}

type ChartType = 'payouts' | 'startups' | 'comparison'

export default function DashboardPage() {
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalFacilities: 0,
    newFacilities: 0,
    totalBookings: 0,
    monthlyEarnings: 0,
    totalEarnings: 0,
    earningsChange: 0
  })

  const [startupData, setStartupData] = useState<StartupData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [chartType, setChartType] = useState<ChartType>('comparison')

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch metrics
        const metricsRes = await fetch('/api/metrics')
        const metricsData = await metricsRes.json()
        setMetrics(metricsData)

        // Fetch startup data
        const startupRes = await fetch('/api/metrics/startups')
        const startupData = await startupRes.json()
        setStartupData(startupData)
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  const renderChart = () => {
    switch (chartType) {
      case 'payouts':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={startupData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="monthlyEarnings" name="Monthly Payouts" fill="#22C55E" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )
      case 'startups':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={startupData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="totalStartups" name="Total Startups" fill="#3B82F6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )
      default:
        return (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={startupData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="labs" fill="#EAB308" radius={[4, 4, 0, 0]} />
              <Bar dataKey="meetingRoom" fill="#22C55E" radius={[4, 4, 0, 0]} />
              <Bar dataKey="trainingHalls" fill="#3B82F6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )
    }
  }

  if (isLoading) {
    return <div className="flex h-full items-center justify-center">Loading...</div>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Hello, Admin</h1>
        <p className="text-sm text-gray-500">We are glad to see you again</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <div className="rounded-lg bg-white p-6 shadow-sm">
          <div className="flex justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Facilities</p>
              <p className="mt-2 text-3xl font-semibold text-gray-900">{metrics.totalFacilities}</p>
            </div>
          </div>
        </div>

        <div className="rounded-lg bg-white p-6 shadow-sm">
          <div className="flex justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">This Month</p>
              <p className="mt-2 text-3xl font-semibold text-gray-900">{metrics.newFacilities}</p>
            </div>
          </div>
        </div>

        <div className="rounded-lg bg-white p-6 shadow-sm">
          <div className="flex justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Bookings</p>
              <p className="mt-2 text-3xl font-semibold text-gray-900">{metrics.totalBookings}</p>
            </div>
          </div>
        </div>

        <div className="rounded-lg bg-white p-6 shadow-sm">
          <div className="flex justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">This Month</p>
              <p className="mt-2 text-3xl font-semibold text-gray-900">{metrics.monthlyEarnings / 1000}k</p>
            </div>
          </div>
        </div>

        <div className="rounded-lg bg-white p-6 shadow-sm">
          <div className="flex justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Earnings</p>
              <div className="flex items-baseline gap-2">
                <p className="mt-2 text-3xl font-semibold text-gray-900">{(metrics.totalEarnings / 1000000).toFixed(1)}L</p>
                <div className="flex items-center gap-1 text-sm text-green-600">
                  <span>▲</span>
                  <span>{metrics.earningsChange.toFixed(1)}%</span>
                </div>
              </div>
            </div>
            <div className="text-xs text-gray-500">Nov 2024</div>
          </div>
        </div>
      </div>

      {/* Chart Section */}
      <div className="rounded-lg bg-white p-6 shadow-sm">
        <div className="mb-4">
          <h2 className="text-lg font-medium text-gray-900">No. Of Startups</h2>
        </div>
        
        {/* Chart Controls */}
        <div className="mb-6 flex gap-4">
          <button 
            onClick={() => setChartType('payouts')}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              chartType === 'payouts' 
                ? 'bg-black text-white' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Monthly Payouts
          </button>
          <button 
            onClick={() => setChartType('startups')}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              chartType === 'startups' 
                ? 'bg-black text-white' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            No. Of Startups
          </button>
          <button 
            onClick={() => setChartType('comparison')}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              chartType === 'comparison' 
                ? 'bg-black text-white' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Comparison
          </button>
        </div>

        {/* Chart Legend */}
        {chartType === 'comparison' && (
          <div className="mb-6 flex gap-6">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-sm bg-yellow-500"></div>
              <span className="text-sm text-gray-600">Labs</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-sm bg-green-500"></div>
              <span className="text-sm text-gray-600">Meeting Room</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-sm bg-blue-500"></div>
              <span className="text-sm text-gray-600">Training Halls</span>
            </div>
          </div>
        )}

        {/* Chart */}
        <div className="h-[400px] w-full">
          {renderChart()}
        </div>
      </div>
    </div>
  )
}
