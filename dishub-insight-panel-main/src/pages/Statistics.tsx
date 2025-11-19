import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, TrendingUp, Loader2 } from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
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
import { useStatisticsData, useExportStatistics } from "@/services/statisticsService";
import { calculateSummaryStats } from "@/services/statisticsService";

const COLORS = ["hsl(var(--primary))", "hsl(var(--warning))", "hsl(var(--info))"];
const TAX_COLORS = ["hsl(var(--success))", "hsl(var(--warning))"];

// Component for loading skeleton
const ChartSkeleton = () => (
  <Card className="p-6">
    <Skeleton className="h-6 w-[180px] mb-4" />
    <Skeleton className="h-[300px] w-full" />
  </Card>
);

const SummaryCardSkeleton = () => (
  <Card className="p-6">
    <Skeleton className="h-4 w-[140px] mb-2" />
    <Skeleton className="h-8 w-[80px] mb-2" />
    <Skeleton className="h-4 w-[80px]" />
  </Card>
);

const Statistics = () => {
  const [period, setPeriod] = useState<string>("month");
  const { vehicleTypes, taxStatus, scanTrends, isLoading, isError, lastUpdated } = useStatisticsData(period);
  const { exportPDF, exportExcel } = useExportStatistics();

  // Calculate summary statistics from real data
  const summaryStats = vehicleTypes.data && taxStatus.data
    ? calculateSummaryStats(vehicleTypes.data, taxStatus.data)
    : { totalVehicles: 0, compliantVehicles: 0, complianceRate: "0", mostCommonType: "N/A" };

  const handleExportPDF = async () => {
    try {
      await exportPDF();
    } catch (error) {
      // Error is already handled by the service
    }
  };

  const handleExportExcel = async () => {
    try {
      await exportExcel();
    } catch (error) {
      // Error is already handled by the service
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Statistik</h1>
          <p className="text-muted-foreground mt-1">
            Analisis data kendaraan hasil scan
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Minggu Ini</SelectItem>
              <SelectItem value="month">Bulan Ini</SelectItem>
              <SelectItem value="year">Tahun Ini</SelectItem>
            </SelectContent>
          </Select>
          <Button className="gap-2" onClick={handleExportPDF} disabled={isLoading}>
            <Download className="h-4 w-4" />
            Export PDF
          </Button>
          <Button className="gap-2" variant="outline" onClick={handleExportExcel} disabled={isLoading}>
            <Download className="h-4 w-4" />
            Export Excel
          </Button>
        </div>
      </div>

      {/* Insight Box */}
      <Card className="p-6 bg-gradient-to-br from-warning/10 to-warning/5 border-warning/20">
        <div className="flex items-start gap-4">
          <div className="bg-warning/20 p-3 rounded-full">
            <TrendingUp className="h-6 w-6 text-warning" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground mb-1">Insight {period === "week" ? "Minggu" : period === "month" ? "Bulan" : "Tahun"} Ini</h3>
            <p className="text-sm text-muted-foreground">
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Memuat data...
                </div>
              ) : (
                <>
                  Total <span className="font-bold">{summaryStats.totalVehicles.toLocaleString()} kendaraan</span> tercatat dalam sistem.
                  Tingkat kepatuhan pajak saat ini <span className="font-bold text-warning">{summaryStats.complianceRate}%</span>.
                </>
              )}
            </p>
          </div>
        </div>
      </Card>

      {/* Charts Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Bar Chart - Vehicle Types */}
        {isLoading ? (
          <ChartSkeleton />
        ) : (
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Jumlah Kendaraan per Jenis</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={vehicleTypes.data || []}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="type" className="text-sm" />
                <YAxis className="text-sm" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Bar dataKey="count" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        )}

        {/* Pie Chart - Tax Status */}
        {isLoading ? (
          <ChartSkeleton />
        ) : (
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Proporsi Status Pajak</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={taxStatus.data || []}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {(taxStatus.data || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={TAX_COLORS[index % TAX_COLORS.length]} />
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
        )}
      </div>

      {/* Line Chart - Trends */}
      {isLoading ? (
        <ChartSkeleton />
      ) : (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Tren Scan {period === "week" ? "Mingguan" : period === "month" ? "Bulanan" : "Tahunan"}</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={scanTrends.data || []}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="date" className="text-sm" />
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
                dot={{ fill: "hsl(var(--primary))", r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="newVehicles"
                stroke="hsl(var(--success))"
                strokeWidth={2}
                name="Kendaraan Baru"
                dot={{ fill: "hsl(var(--success))", r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      )}

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        {isLoading ? (
          <>
            <SummaryCardSkeleton />
            <SummaryCardSkeleton />
            <SummaryCardSkeleton />
          </>
        ) : (
          <>
            <Card className="p-6">
              <div className="text-sm text-muted-foreground mb-2">Total Kendaraan Terscan</div>
              <div className="text-3xl font-bold text-foreground">{summaryStats.totalVehicles.toLocaleString()}</div>
              <div className="text-xs text-success mt-2">Tipe terbanyak: {summaryStats.mostCommonType}</div>
            </Card>
            <Card className="p-6">
              <div className="text-sm text-muted-foreground mb-2">Kendaraan Patuh</div>
              <div className="text-3xl font-bold text-foreground">{summaryStats.compliantVehicles.toLocaleString()}</div>
              <div className="text-xs text-success mt-2">{summaryStats.complianceRate}% kepatuhan</div>
            </Card>
            <Card className="p-6">
              <div className="text-sm text-muted-foreground mb-2">Update Terakhir</div>
              <div className="text-lg font-bold text-foreground">
                {lastUpdated ? new Date(lastUpdated).toLocaleTimeString("id-ID") : "-"}
              </div>
              <div className="text-xs text-muted-foreground mt-2">Real-time data</div>
            </Card>
          </>
        )}
      </div>
    </div>
  );
};

export default Statistics;
