"use client"

import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts"
import { Plus, Eye, Edit, AlertCircle } from "lucide-react"

interface Event {
  id: string
  name: string
  date: string
  status: "upcoming" | "active" | "completed"
  photoCount: number
  optInRate: number
}

const chartData = [
  { name: "Mon", optIn: 65, optOut: 35, searches: 45 },
  { name: "Tue", optIn: 72, optOut: 28, searches: 52 },
  { name: "Wed", optIn: 68, optOut: 32, searches: 48 },
  { name: "Thu", optIn: 75, optOut: 25, searches: 61 },
  { name: "Fri", optIn: 82, optOut: 18, searches: 72 },
  { name: "Sat", optIn: 78, optOut: 22, searches: 68 },
]

export default function AdminDashboardPage() {
  const router = useRouter()
  const [adminName, setAdminName] = useState("")
  const [events, setEvents] = useState<Event[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const adminToken = localStorage.getItem("admin_token")
    if (!adminToken) {
      router.push("/admin/login")
      return
    }

    const storedName = localStorage.getItem("admin_name")
    if (storedName) {
      setAdminName(storedName)
    }

    setTimeout(() => {
      setEvents([
        {
          id: "1",
          name: "Spring Orientation 2024",
          date: "2024-03-15",
          status: "completed",
          photoCount: 2145,
          optInRate: 78,
        },
        {
          id: "2",
          name: "Sports Day 2024",
          date: "2024-04-20",
          status: "completed",
          photoCount: 1823,
          optInRate: 82,
        },
        {
          id: "3",
          name: "Campus Concert",
          date: "2024-05-10",
          status: "active",
          photoCount: 3421,
          optInRate: 75,
        },
      ])
      setIsLoading(false)
    }, 800)
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem("admin_token")
    localStorage.removeItem("admin_name")
    router.push("/")
  }

  const getStatusBadge = (status: string) => {
    const styles = {
      upcoming: "bg-secondary text-secondary-foreground",
      active: "bg-primary text-primary-foreground",
      completed: "bg-muted text-muted-foreground",
    }
    return styles[status as keyof typeof styles] || styles.upcoming
  }

  const activeEvents = events.filter((e) => e.status === "active").length
  const avgOptIn = Math.round(events.reduce((sum, e) => sum + e.optInRate, 0) / events.length)

  return (
    <>
      <Header showLogout />
      <main className="min-h-screen bg-gradient-to-b from-background to-secondary/5">
        <div className="bg-card border-b border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
              <div>
                <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
                <p className="text-muted-foreground mt-1">Welcome back, {adminName}</p>
              </div>
              <Button
                onClick={() => router.push("/admin/events/create")}
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Event
              </Button>
            </div>

            <div className="grid md:grid-cols-4 gap-4">
              <Card className="border border-border">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Active Events</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-foreground">{activeEvents}</div>
                  <p className="text-xs text-muted-foreground mt-1">currently running</p>
                </CardContent>
              </Card>

              <Card className="border border-border">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Opt-in %</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-foreground">{avgOptIn}%</div>
                  <p className="text-xs text-muted-foreground mt-1">average rate</p>
                </CardContent>
              </Card>

              <Card className="border border-border">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Email CTR</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-foreground">34%</div>
                  <p className="text-xs text-muted-foreground mt-1">click through</p>
                </CardContent>
              </Card>

              <Card className="border border-border">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Search Latency</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-foreground">245ms</div>
                  <p className="text-xs text-muted-foreground mt-1">avg response</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Tabs defaultValue="events" className="space-y-6">
            <TabsList className="bg-card border border-border">
              <TabsTrigger value="events">Event Console</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="moderation">Moderation Queue</TabsTrigger>
              <TabsTrigger value="security">Security & Logs</TabsTrigger>
            </TabsList>

            <TabsContent value="events" className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <Card className="border border-border bg-secondary/10 border-secondary/20">
                  <CardContent className="pt-6">
                    <h3 className="font-semibold text-foreground mb-2">Upload Batches</h3>
                    <p className="text-sm text-muted-foreground">Review and manage uploaded photo batches</p>
                    <Button size="sm" variant="outline" className="border-border mt-4 bg-transparent">
                      View Uploads
                    </Button>
                  </CardContent>
                </Card>
                <Card className="border border-border bg-primary/10 border-primary/20">
                  <CardContent className="pt-6">
                    <h3 className="font-semibold text-foreground mb-2">Face Search Control</h3>
                    <p className="text-sm text-muted-foreground">Enable/disable face search per event</p>
                    <Button size="sm" variant="outline" className="border-border mt-4 bg-transparent">
                      Configure
                    </Button>
                  </CardContent>
                </Card>
              </div>

              {events.map((event) => (
                <Card key={event.id} className="border border-border">
                  <CardContent className="pt-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-foreground">{event.name}</h3>
                          <span
                            className={`text-xs font-semibold px-2 py-1 rounded capitalize ${getStatusBadge(event.status)}`}
                          >
                            {event.status}
                          </span>
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">Date</p>
                            <p className="font-medium text-foreground">{new Date(event.date).toLocaleDateString()}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Photos Ingested</p>
                            <p className="font-medium text-foreground">{event.photoCount}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Opt-in Rate</p>
                            <p className="font-medium text-foreground">{event.optInRate}%</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="border-border bg-transparent">
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </Button>
                        <Button size="sm" variant="outline" className="border-border bg-transparent">
                          <Edit className="w-4 h-4 mr-1" />
                          Edit
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="analytics" className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <Card className="border border-border">
                  <CardHeader>
                    <CardTitle>Opt-in Rate Trend</CardTitle>
                    <CardDescription>Track consent uptake over time</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                        <XAxis stroke="var(--color-muted-foreground)" />
                        <YAxis stroke="var(--color-muted-foreground)" />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="optIn" stroke="var(--color-primary)" strokeWidth={2} />
                        <Line type="monotone" dataKey="optOut" stroke="var(--color-destructive)" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card className="border border-border">
                  <CardHeader>
                    <CardTitle>Email CTR & Link Opens</CardTitle>
                    <CardDescription>Engagement metrics by event</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                        <XAxis stroke="var(--color-muted-foreground)" />
                        <YAxis stroke="var(--color-muted-foreground)" />
                        <Tooltip />
                        <Bar dataKey="searches" fill="var(--color-primary)" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="moderation" className="space-y-4">
              <Card className="border border-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-primary" />
                    Low Confidence Matches
                  </CardTitle>
                  <CardDescription>Matches below 70% confidence threshold</CardDescription>
                </CardHeader>
                <CardContent className="text-center py-8">
                  <p className="text-muted-foreground">No flagged matches found</p>
                </CardContent>
              </Card>

              <Card className="border border-border">
                <CardHeader>
                  <CardTitle>Blur/Removal Requests</CardTitle>
                  <CardDescription>User-requested photo modifications</CardDescription>
                </CardHeader>
                <CardContent className="text-center py-8">
                  <p className="text-muted-foreground">No pending removal requests</p>
                </CardContent>
              </Card>

              <Card className="border border-border">
                <CardHeader>
                  <CardTitle>User Reports</CardTitle>
                  <CardDescription>Reported content from users</CardDescription>
                </CardHeader>
                <CardContent className="text-center py-8">
                  <p className="text-muted-foreground">No reports submitted</p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="security" className="space-y-4">
              <Card className="border border-border">
                <CardHeader>
                  <CardTitle>PDPA Consent Logs</CardTitle>
                  <CardDescription>Audit trail of consent management</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-sm">
                    <div className="p-3 bg-card rounded border border-border/50">
                      <p className="font-medium text-foreground">User ID: U12345</p>
                      <p className="text-muted-foreground">Opted in • 2024-11-06 14:32 UTC</p>
                    </div>
                    <div className="p-3 bg-card rounded border border-border/50">
                      <p className="font-medium text-foreground">User ID: U12346</p>
                      <p className="text-muted-foreground">Opted out • 2024-11-06 13:15 UTC</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border border-border">
                <CardHeader>
                  <CardTitle>Moderation Actions</CardTitle>
                  <CardDescription>Audit trail of admin moderation</CardDescription>
                </CardHeader>
                <CardContent className="text-center py-8">
                  <p className="text-muted-foreground">No recent moderation actions</p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </>
  )
}
