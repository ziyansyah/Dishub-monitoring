import { useState } from "react";
import { StatCard } from "@/components/StatCard";
import { VehicleTable, VehicleData } from "@/components/VehicleTable";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Car, AlertTriangle, CheckCircle, Activity, RefreshCw } from "lucide-react";
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useDashboardData, useRefreshDashboard } from "@/services/dashboardService";

const COLORS = ["hsl(var(--success))", "hsl(var(--warning))"];

// Component for loading skeleton
const StatCardSkeleton = () => (
  <Card className="p-6">
    <div className="flex items-center justify-between">
      <div className="space-y-2">
        <Skeleton className="h-4 w-[140px]" />
        <Skeleton className="h-8 w-[80px]" />
        <Skeleton className="h-4 w-[60px]" />
      </div>
      <Skeleton className="h-12 w-12 rounded-lg" />
    </div>
  </Card>
);

// Component for chart skeleton
const ChartSkeleton = () => (
  <Card className="p-6">
    <Skeleton className="h-6 w-[180px] mb-4" />
    <Skeleton className="h-[250px] w-full" />
  </Card>
);

// Convert API data to component format
const convertToVehicleData = (scans: any[]): VehicleData[] => {
  return scans.map(scan => ({
    id: scan.id,
    plate: scan.plateNumber,
    type: scan.vehicleType,
    color: "-", // Not available in API, set default
    owner: scan.ownerName,
    taxStatus: scan.status === 'compliant' ? 'Aktif' : 'Mati',
    scanTime: scan.scanTime,
  }));
};

const Dashboard = () => {
  const [limit, setLimit] = useState<number>(10);
  const { stats, recentScans, weeklyTrend, taxStatus, isLoading, isError, lastUpdated } = useDashboardData(limit);
  const { refreshAll } = useRefreshDashboard();

  // Convert recent scans to vehicle data format
  const vehicleData = recentScans.data ? convertToVehicleData(recentScans.data) : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Monitoring kendaraan real-time dari CCTV Dishub Kota Medan
          </p>
        </div>
        <button
          onClick={refreshAll}
          className="flex items-center gap-2 px-4 py-2 text-sm bg-primary/10 hover:bg-primary/20 rounded-lg transition-colors"
          disabled={isLoading}
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {isLoading ? (
          <>
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </>
        ) : (
          <>
            <StatCard
              title="Total Kendaraan Terdeteksi"
              value={stats.data?.totalVehicles?.toLocaleString() || "0"}
              icon={Car}
              variant="primary"
              trend={{ value: "12%", isPositive: true }}
            />
            <StatCard
              title="Kendaraan Pajak Mati"
              value={(stats.data?.totalVehicles - stats.data?.taxCompliant)?.toLocaleString() || "0"}
              icon={AlertTriangle}
              variant="warning"
              trend={{ value: "3%", isPositive: false }}
            />
            <StatCard
              title="Kendaraan Pajak Aktif"
              value={stats.data?.taxCompliant?.toLocaleString() || "0"}
              icon={CheckCircle}
              variant="success"
              trend={{ value: "8%", isPositive: true }}
            />
            <StatCard
              title="Scan Hari Ini"
              value={stats.data?.activeScans?.toLocaleString() || "0"}
              icon={Activity}
              variant="info"
              trend={{ value: "15%", isPositive: true }}
            />
          </>
        )}
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        {isLoading ? (
          <>
            <ChartSkeleton />
            <ChartSkeleton />
          </>
        ) : (
          <>
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Tren Scan per Hari</h3>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={weeklyTrend.data || []}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="day" className="text-sm" />
                  <YAxis className="text-sm" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="scans"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    name="Jumlah Scan"
                  />
                </LineChart>
              </ResponsiveContainer>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Perbandingan Status Pajak</h3>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={taxStatus.data || []}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {(taxStatus.data || []).map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </Card>
          </>
        )}
      </div>

      {/* Recent Scans Table */}
      <div className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <h2 className="text-xl font-semibold">Data Scan Terbaru</h2>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">
              Update terakhir: {lastUpdated ? new Date(lastUpdated).toLocaleTimeString("id-ID") : "-"}
            </span>
            <Select value={limit.toString()} onValueChange={(value) => setLimit(Number(value))}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Jumlah data" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5 Terbaru</SelectItem>
                <SelectItem value="10">10 Terbaru</SelectItem>
                <SelectItem value="20">20 Terbaru</SelectItem>
                <SelectItem value="50">50 Terbaru</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        {isLoading ? (
          <Card className="p-6">
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <Skeleton className="h-12 w-12 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-[200px]" />
                    <Skeleton className="h-4 w-[150px]" />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        ) : (
          <VehicleTable vehicles={vehicleData.slice(0, limit)} />
        )}
      </div>
    </div>
  );
};

export default Dashboard;
