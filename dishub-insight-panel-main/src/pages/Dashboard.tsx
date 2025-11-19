import { useState } from "react";
import { StatCard } from "@/components/StatCard";
import { VehicleTable, VehicleData } from "@/components/VehicleTable";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Car, AlertTriangle, CheckCircle, Activity } from "lucide-react";
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

const trendData = [
  { day: "Sen", count: 180 },
  { day: "Sel", count: 220 },
  { day: "Rab", count: 280 },
  { day: "Kam", count: 310 },
  { day: "Jum", count: 290 },
  { day: "Sab", count: 250 },
  { day: "Min", count: 200 },
];

const taxStatusData = [
  { name: "Lunas", value: 1161 },
  { name: "Belum Lunas", value: 87 },
];

const COLORS = ["hsl(var(--success))", "hsl(var(--warning))"];

const mockVehicles: VehicleData[] = [
  {
    id: "1",
    plate: "BL 1234 AB",
    type: "Mobil",
    color: "Hitam",
    owner: "Ahmad Fauzi",
    taxStatus: "Aktif",
    scanTime: "2024-01-15 08:30:00",
  },
  {
    id: "2",
    plate: "BL 5678 CD",
    type: "Motor",
    color: "Merah",
    owner: "Siti Nurhaliza",
    taxStatus: "Mati",
    scanTime: "2024-01-15 08:45:00",
  },
  {
    id: "3",
    plate: "BL 9012 EF",
    type: "Mobil",
    color: "Putih",
    owner: "Budi Santoso",
    taxStatus: "Aktif",
    scanTime: "2024-01-15 09:00:00",
  },
  {
    id: "4",
    plate: "BL 3456 GH",
    type: "Motor",
    color: "Biru",
    owner: "Dewi Lestari",
    taxStatus: "Aktif",
    scanTime: "2024-01-15 09:15:00",
  },
  {
    id: "5",
    plate: "BL 7890 IJ",
    type: "Mobil",
    color: "Silver",
    owner: "Rudi Hartono",
    taxStatus: "Mati",
    scanTime: "2024-01-15 09:30:00",
  },
];

const Dashboard = () => {
  const [limit, setLimit] = useState<number>(10);
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
        <StatCard
          title="Total Kendaraan Terdeteksi"
          value="1,248"
          icon={Car}
          variant="primary"
          trend={{ value: "12%", isPositive: true }}
        />
        <StatCard
          title="Kendaraan Pajak Mati"
          value="87"
          icon={AlertTriangle}
          variant="warning"
          trend={{ value: "3%", isPositive: false }}
        />
        <StatCard
          title="Kendaraan Pajak Aktif"
          value="1,161"
          icon={CheckCircle}
          variant="success"
          trend={{ value: "8%", isPositive: true }}
        />
        <StatCard
          title="Scan Hari Ini"
          value="342"
          icon={Activity}
          variant="info"
          trend={{ value: "15%", isPositive: true }}
        />
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Tren Scan per Hari</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={trendData}>
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
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Perbandingan Status Pajak</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={taxStatusData}
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
                {taxStatusData.map((entry, index) => (
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
        <VehicleTable vehicles={mockVehicles.slice(0, limit)} />
      </div>
    </div>
  );
};

export default Dashboard;
