import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Download, Search, Filter } from "lucide-react";
import { toast } from "sonner";

interface ActivityLog {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  ip: string;
  status: "success" | "failed";
}

const mockLogs: ActivityLog[] = [
  {
    id: "1",
    timestamp: "2025-11-07 10:30:15",
    user: "admin@dishub.go.id",
    action: "Login ke sistem",
    ip: "192.168.1.100",
    status: "success",
  },
  {
    id: "2",
    timestamp: "2025-11-07 10:25:42",
    user: "operator1@dishub.go.id",
    action: "Export data kendaraan",
    ip: "192.168.1.105",
    status: "success",
  },
  {
    id: "3",
    timestamp: "2025-11-07 10:20:18",
    user: "operator2@dishub.go.id",
    action: "Update status pajak BK 1234 AB",
    ip: "192.168.1.108",
    status: "success",
  },
  {
    id: "4",
    timestamp: "2025-11-07 10:15:05",
    user: "viewer@dishub.go.id",
    action: "Akses halaman laporan",
    ip: "192.168.1.112",
    status: "failed",
  },
  {
    id: "5",
    timestamp: "2025-11-07 10:10:33",
    user: "admin@dishub.go.id",
    action: "Hapus data kendaraan BK 9999 XX",
    ip: "192.168.1.100",
    status: "success",
  },
];

const ActivityLog = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredLogs = mockLogs.filter((log) =>
    Object.values(log).some((value) =>
      value.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const handleExport = () => {
    toast.success("Log aktivitas sedang diunduh...");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Log Aktivitas</h1>
          <p className="text-muted-foreground mt-1">
            Riwayat aktivitas admin dan operator sistem
          </p>
        </div>
        <Button onClick={handleExport} className="gap-2">
          <Download className="h-4 w-4" />
          Export Log (CSV)
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari user, aksi, atau IP address..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline" className="gap-2">
          <Filter className="h-4 w-4" />
          Filter
        </Button>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="font-semibold">Waktu</TableHead>
              <TableHead className="font-semibold">Pengguna</TableHead>
              <TableHead className="font-semibold">Aksi</TableHead>
              <TableHead className="font-semibold">IP Address</TableHead>
              <TableHead className="font-semibold">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredLogs.map((log) => (
              <TableRow key={log.id} className="hover:bg-muted/50">
                <TableCell className="text-sm text-muted-foreground">
                  {log.timestamp}
                </TableCell>
                <TableCell className="font-medium">{log.user}</TableCell>
                <TableCell>{log.action}</TableCell>
                <TableCell className="font-mono text-sm">{log.ip}</TableCell>
                <TableCell>
                  <Badge
                    variant={log.status === "success" ? "default" : "destructive"}
                    className={
                      log.status === "success"
                        ? "bg-success hover:bg-success/90"
                        : ""
                    }
                  >
                    {log.status === "success" ? "Berhasil" : "Gagal"}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {filteredLogs.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <p>Tidak ada log aktivitas yang ditemukan</p>
        </div>
      )}
    </div>
  );
};

export default ActivityLog;
