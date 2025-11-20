import { useState } from "react";
import { StatCard } from "@/components/StatCard";
import { VehicleTable, VehicleData } from "@/components/VehicleTable";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Car, AlertTriangle, CheckCircle, Activity, Loader2 } from "lucide-react";
import { useDashboardStats, useRecentScans } from "@/hooks/useDashboardStats";
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

const COLORS = ["hsl(var(--success))", "hsl(var(--warning))"];

const Dashboard = () => {
  const [limit, setLimit] = useState<number>(10);
  const { data: stats, isLoading: statsLoading, error: statsError } = useDashboardStats();
  const { data: recentScans, isLoading: scansLoading } = useRecentScans(limit);

  // Transform backend data to frontend format
  const transformVehicleData = (scans: any[]): VehicleData[] => {
    return scans.map(scan => ({
      id: scan.id,
      plate: scan.plateNumber,
      type: scan.vehicleType,
      color: scan.color,
      owner: scan.ownerName,
      taxStatus: scan.taxStatus === 'Aktif' ? 'Aktif' : 'Mati',
      scanTime: new Date(scan.scanTime).toLocaleString('id-ID'),
    }));
  };

  if (statsError) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-500 mb-2">❌ Failed to load dashboard data</p>
          <p className="text-sm text-muted-foreground">Please check if backend server is running</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Monitoring kendaraan real-time dari CCTV Dishub Kota Medan
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statsLoading ? (
          <>
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="p-6">
                <div className="flex items-center space-x-2">
                  <Loader2 className="h-6 w-6 animate-spin" />
                  <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
                </div>
              </Card>
            ))}
          </>
        ) : (
          <>
            <StatCard
              title="Total Kendaraan"
              value={stats?.totalVehicles?.toLocaleString() || "0"}
              icon={Car}
              variant="primary"
            />
            <StatCard
              title="Kendaraan Pajak Mati"
              value={stats?.taxInactive?.toLocaleString() || "0"}
              icon={AlertTriangle}
              variant="warning"
            />
            <StatCard
              title="Kendaraan Pajak Aktif"
              value={stats?.taxActive?.toLocaleString() || "0"}
              icon={CheckCircle}
              variant="success"
            />
            <StatCard
              title="Scan Hari Ini"
              value={stats?.scansToday?.toLocaleString() || "0"}
              icon={Activity}
              variant="info"
            />
          </>
        )}
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">
            {statsLoading ? (
              <div className="h-6 bg-gray-200 rounded w-32 animate-pulse"></div>
            ) : (
              "Tren Scan per Hari"
            )}
          </h3>
          {statsLoading ? (
            <div className="h-64 flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={stats?.trends?.weekly || []}>
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
                  dataKey="count"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  name="Jumlah Scan"
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">
            {statsLoading ? (
              <div className="h-6 bg-gray-200 rounded w-40 animate-pulse"></div>
            ) : (
              "Perbandingan Status Pajak"
            )}
          </h3>
          {statsLoading ? (
            <div className="h-64 flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={stats?.trends?.taxStatus || []}
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
                  {(stats?.trends?.taxStatus || []).map((entry, index) => (
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
          )}
        </Card>
      </div>

      {/* Recent Scans Table */}
      <div className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <h2 className="text-xl font-semibold">Data Scan Terbaru</h2>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">
              Update terakhir: {new Date().toLocaleTimeString("id-ID")}
            </span>
            <Select value={limit.toString()} onValueChange={(value) => setLimit(Number(value))}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Jumlah data" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10 Terbaru</SelectItem>
                <SelectItem value="20">20 Terbaru</SelectItem>
                <SelectItem value="50">50 Terbaru</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        {scansLoading ? (
          <Card className="p-8">
            <div className="flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin mr-2" />
              <span>Loading recent scans...</span>
            </div>
          </Card>
        ) : (
          <VehicleTable vehicles={transformVehicleData(recentScans || [])} />
        )}
      </div>
    </div>
  );
};

export default Dashboard;