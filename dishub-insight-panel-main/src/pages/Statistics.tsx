import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Download, TrendingUp } from "lucide-react";
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

const vehicleTypeData = [
  { name: "Mobil", value: 5320 },
  { name: "Motor", value: 8120 },
  { name: "Truk", value: 940 },
];

const taxStatusData = [
  { name: "Lunas", value: 10800 },
  { name: "Belum Lunas", value: 2580 },
];

const trendData = [
  { day: "Senin", count: 200 },
  { day: "Selasa", count: 320 },
  { day: "Rabu", count: 400 },
  { day: "Kamis", count: 450 },
  { day: "Jumat", count: 370 },
  { day: "Sabtu", count: 420 },
  { day: "Minggu", count: 310 },
];

const COLORS = ["hsl(var(--primary))", "hsl(var(--warning))", "hsl(var(--info))"];
const TAX_COLORS = ["hsl(var(--success))", "hsl(var(--warning))"];

const Statistics = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Statistik</h1>
          <p className="text-muted-foreground mt-1">
            Analisis data kendaraan hasil scan
          </p>
        </div>
        <Button className="gap-2">
          <Download className="h-4 w-4" />
          Download Statistik (PDF)
        </Button>
      </div>

      {/* Insight Box */}
      <Card className="p-6 bg-gradient-to-br from-warning/10 to-warning/5 border-warning/20">
        <div className="flex items-start gap-4">
          <div className="bg-warning/20 p-3 rounded-full">
            <TrendingUp className="h-6 w-6 text-warning" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground mb-1">Insight Minggu Ini</h3>
            <p className="text-sm text-muted-foreground">
              Kendaraan belum bayar pajak naik <span className="font-bold text-warning">12%</span> dibanding minggu lalu. 
              Total <span className="font-bold">2,580 kendaraan</span> perlu ditindaklanjuti.
            </p>
          </div>
        </div>
      </Card>

      {/* Charts Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Bar Chart - Vehicle Types */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Jumlah Kendaraan per Jenis</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={vehicleTypeData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="name" className="text-sm" />
              <YAxis className="text-sm" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
              />
              <Bar dataKey="value" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Pie Chart - Tax Status */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Proporsi Status Pajak</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={taxStatusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {taxStatusData.map((entry, index) => (
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
      </div>

      {/* Line Chart - Weekly Trend */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Tren Scan Mingguan</h3>
        <ResponsiveContainer width="100%" height={300}>
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
              dot={{ fill: "hsl(var(--primary))", r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="p-6">
          <div className="text-sm text-muted-foreground mb-2">Total Kendaraan Terscan</div>
          <div className="text-3xl font-bold text-foreground">14,380</div>
          <div className="text-xs text-success mt-2">+8% dari bulan lalu</div>
        </Card>
        <Card className="p-6">
          <div className="text-sm text-muted-foreground mb-2">Rata-rata Scan per Hari</div>
          <div className="text-3xl font-bold text-foreground">352</div>
          <div className="text-xs text-muted-foreground mt-2">7 hari terakhir</div>
        </Card>
        <Card className="p-6">
          <div className="text-sm text-muted-foreground mb-2">Tingkat Kepatuhan Pajak</div>
          <div className="text-3xl font-bold text-foreground">80.7%</div>
          <div className="text-xs text-warning mt-2">-2% dari target</div>
        </Card>
      </div>
    </div>
  );
};

export default Statistics;
