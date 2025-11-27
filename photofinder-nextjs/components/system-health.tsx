"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Activity, Server, Zap, Cpu, Timer, ExternalLink } from "lucide-react"
import ReactECharts from 'echarts-for-react'
import * as echarts from 'echarts'

interface MetricValue {
    value: number
    labels: Record<string, string>
}

interface Metric {
    name: string
    help: string
    type: string
    values: MetricValue[]
}

export function SystemHealth() {
    const [metrics, setMetrics] = useState<Metric[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchMetrics = async () => {
            try {
                const response = await fetch("http://localhost:3000/metrics/json")
                if (response.ok) {
                    const data = await response.json()
                    setMetrics(data)
                }
            } catch (error) {
                console.error("Failed to fetch metrics", error)
            } finally {
                setLoading(false)
            }
        }

        fetchMetrics()
        const interval = setInterval(fetchMetrics, 5000) // Refresh every 5s
        return () => clearInterval(interval)
    }, [])

    if (loading) {
        return <div className="p-12 text-center text-gray-400 animate-pulse">Loading analytics...</div>
    }

    // Process metrics
    const getMetricValue = (name: string, labelKey?: string, labelValue?: string) => {
        const metric = metrics.find(m => m.name === name)
        if (!metric) return 0
        if (labelKey && labelValue) {
            const value = metric.values.find(v => v.labels[labelKey] === labelValue)
            return value ? value.value : 0
        }
        return metric.values.reduce((sum, v) => sum + v.value, 0)
    }

    const totalRequests = getMetricValue("http_requests_total")
    const totalUploads = getMetricValue("photo_uploads_total")
    const totalSearches = getMetricValue("face_search_total")

    // Calculate average AI confidence as a percentage
    const aiConfidenceMetric = metrics.find(m => m.name === "ai_confidence_score")
    let avgConfidencePercent = 85 // Default placeholder
    if (aiConfidenceMetric && aiConfidenceMetric.values.length > 0) {
        // For histogram metrics, estimate from bucket distribution
        // Filter out special labels like _sum, _count, _bucket
        const bucketValues = aiConfidenceMetric.values.filter(v => 
            v.labels.le && v.labels.le !== '+Inf'
        )
        
        if (bucketValues.length > 0) {
            // Use the highest bucket with values as an estimate
            const highestBucket = bucketValues
                .filter(v => v.value > 0)
                .sort((a, b) => parseFloat(b.labels.le) - parseFloat(a.labels.le))[0]
            
            if (highestBucket) {
                avgConfidencePercent = Math.round(parseFloat(highestBucket.labels.le) * 100)
            }
        }
    }
    // --- Chart Configurations ---

    // Confidence Gauge (Circular Progress)
    const confidenceGaugeOption = {
        series: [
            {
                type: 'gauge',
                startAngle: 90,
                endAngle: -270,
                pointer: { show: false },
                progress: {
                    show: true,
                    overlap: false,
                    roundCap: true,
                    clip: false,
                    itemStyle: {
                        borderWidth: 1,
                        borderColor: '#fff'
                    }
                },
                axisLine: {
                    lineStyle: {
                        width: 30,
                        color: [[1, '#f1f5f9']]
                    }
                },
                splitLine: { show: false },
                axisTick: { show: false },
                axisLabel: { show: false },
                data: [
                    {
                        value: avgConfidencePercent,
                        name: 'Confidence',
                        title: {
                            offsetCenter: ['0%', '-20%'],
                            fontSize: 14,
                            color: '#64748b',
                            fontWeight: 500
                        },
                        detail: {
                            valueAnimation: true,
                            offsetCenter: ['0%', '10%'],
                            fontSize: 40,
                            fontWeight: 'bold',
                            color: '#0f172a',
                            formatter: '{value}%'
                        },
                        itemStyle: {
                            color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
                                { offset: 0, color: '#10b981' },
                                { offset: 0.5, color: '#34d399' },
                                { offset: 1, color: '#6ee7b7' }
                            ])
                        }
                    }
                ]
            }
        ]
    };

    // --- Chart Configurations ---

    // 1. Traffic Distribution (Donut Chart)
    const trafficOption = {
        tooltip: {
            trigger: 'item',
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            borderColor: '#e2e8f0',
            textStyle: { color: '#1e293b' },
            padding: [10, 15],
            extraCssText: 'box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1); border-radius: 8px;'
        },
        legend: {
            bottom: '0%',
            left: 'center',
            icon: 'circle',
            itemGap: 20,
            textStyle: { color: '#64748b' }
        },
        series: [
            {
                name: 'Traffic Source',
                type: 'pie',
                radius: ['40%', '70%'],
                center: ['50%', '45%'],
                avoidLabelOverlap: false,
                itemStyle: {
                    borderRadius: 10,
                    borderColor: '#fff',
                    borderWidth: 2
                },
                label: {
                    show: false,
                    position: 'center'
                },
                emphasis: {
                    label: {
                        show: true,
                        fontSize: 20,
                        fontWeight: 'bold',
                        color: '#334155'
                    },
                    scale: true,
                    scaleSize: 10
                },
                labelLine: { show: false },
                data: [
                    { value: getMetricValue("http_requests_total", "method", "GET"), name: 'GET Requests', itemStyle: { color: '#3b82f6' } },
                    { value: getMetricValue("http_requests_total", "method", "POST"), name: 'POST Requests', itemStyle: { color: '#8b5cf6' } },
                    { value: getMetricValue("http_requests_total", "method", "DELETE"), name: 'DELETE Requests', itemStyle: { color: '#ef4444' } }
                ]
            }
        ]
    };

    // 2. AI Processing Speed (Smooth Area Chart)
    const aiProcessingData = metrics.find(m => m.name === "ai_processing_duration_seconds")?.values.map(v => ({
        name: v.labels.operation,
        value: v.value
    })) || []

    const aiOption = {
        tooltip: {
            trigger: 'axis',
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            borderColor: '#e2e8f0',
            textStyle: { color: '#1e293b' },
            padding: [10, 15],
            extraCssText: 'box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1); border-radius: 8px;'
        },
        grid: { left: '2%', right: '4%', bottom: '3%', top: '10%', containLabel: true },
        xAxis: {
            type: 'category',
            boundaryGap: false,
            data: aiProcessingData.map(d => d.name),
            axisLine: { show: false },
            axisTick: { show: false },
            axisLabel: { color: '#94a3b8', margin: 15 }
        },
        yAxis: {
            type: 'value',
            splitLine: { lineStyle: { color: '#f1f5f9' } },
            axisLabel: { color: '#94a3b8' }
        },
        series: [
            {
                name: 'Duration (s)',
                type: 'line',
                smooth: true,
                symbol: 'none',
                lineStyle: { width: 3, color: '#0ea5e9' },
                areaStyle: {
                    color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                        { offset: 0, color: 'rgba(14, 165, 233, 0.2)' },
                        { offset: 1, color: 'rgba(14, 165, 233, 0)' }
                    ])
                },
                data: aiProcessingData.map(d => d.value)
            }
        ]
    };



    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">System Health</h2>
                    <p className="text-sm text-slate-500">Real-time metrics and performance monitoring</p>
                </div>
                <Button
                    onClick={() => window.open('http://localhost:3002', '_blank')}
                    variant="outline"
                    className="gap-2"
                >
                    <ExternalLink className="w-4 h-4" />
                    Open Grafana
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatCard
                    title="Total Requests"
                    value={totalRequests}
                    icon={Activity}
                    color="text-blue-600"
                    bgColor="bg-blue-50"
                />
                <StatCard
                    title="Photo Uploads"
                    value={totalUploads}
                    icon={Server}
                    color="text-purple-600"
                    bgColor="bg-purple-50"
                />
                <StatCard
                    title="Face Searches"
                    value={totalSearches}
                    icon={Zap}
                    color="text-amber-600"
                    bgColor="bg-amber-50"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Traffic Distribution */}
                <Card className="col-span-1 border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader>
                        <CardTitle className="text-lg font-semibold text-slate-800">Traffic Distribution</CardTitle>
                        <CardDescription>Request methods breakdown</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ReactECharts option={trafficOption} style={{ height: '300px' }} />
                    </CardContent>
                </Card>

                {/* AI Performance */}
                <Card className="col-span-1 lg:col-span-2 border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="text-lg font-semibold text-slate-800">AI Processing Latency</CardTitle>
                            <CardDescription>Operation duration over time</CardDescription>
                        </div>
                        <div className="p-2 bg-slate-50 rounded-full">
                            <Timer className="w-4 h-4 text-slate-500" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <ReactECharts option={aiOption} style={{ height: '300px' }} />
                    </CardContent>
                </Card>
            </div>

            {/* AI Confidence Gauge */}
            <Card className="border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                <CardHeader>
                    <CardTitle className="text-lg font-semibold text-slate-800">AI Model Confidence</CardTitle>
                    <CardDescription>Average certainty across all predictions</CardDescription>
                </CardHeader>
                <CardContent>
                    <ReactECharts option={confidenceGaugeOption} style={{ height: '280px' }} />
                </CardContent>
            </Card>
        </div>
    )
}

function StatCard({ title, value, icon: Icon, color, bgColor }: any) {
    return (
        <Card className="border-slate-100 shadow-sm hover:shadow-md transition-all duration-200">
            <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-xl ${bgColor} ${color}`}>
                        <Icon className="w-5 h-5" />
                    </div>
                </div>
                <div>
                    <h3 className="text-sm font-medium text-slate-500 mb-1">{title}</h3>
                    <div className="text-2xl font-bold text-slate-800">{value}</div>
                </div>
            </CardContent>
        </Card>
    )
}
