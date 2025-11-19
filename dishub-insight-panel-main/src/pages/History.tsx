import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Car, Calendar } from "lucide-react";

interface ScanHistory {
  id: string;
  plate: string;
  type: string;
  color: string;
  owner: string;
  taxStatus: "Lunas" | "Belum Lunas";
  scanTime: string;
}

const mockHistory: ScanHistory[] = [
  {
    id: "1",
    plate: "BK 1234 AB",
    type: "Mobil",
    color: "Hitam",
    owner: "Ahmad Fauzi",
    taxStatus: "Lunas",
    scanTime: "2025-11-07 10:15:00",
  },
  {
    id: "2",
    plate: "BK 5678 CD",
    type: "Motor",
    color: "Merah",
    owner: "Siti Nurhaliza",
    taxStatus: "Belum Lunas",
    scanTime: "2025-11-07 09:45:00",
  },
  {
    id: "3",
    plate: "BK 9012 EF",
    type: "Mobil",
    color: "Putih",
    owner: "Budi Santoso",
    taxStatus: "Lunas",
    scanTime: "2025-11-07 09:30:00",
  },
  {
    id: "4",
    plate: "BK 3456 GH",
    type: "Motor",
    color: "Biru",
    owner: "Dewi Lestari",
    taxStatus: "Lunas",
    scanTime: "2025-11-07 08:50:00",
  },
];

const History = () => {
  const [filter, setFilter] = useState<"today" | "week" | "month">("today");

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Riwayat Scan</h1>
          <p className="text-muted-foreground mt-1">
            Daftar hasil scan kendaraan terbaru
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={filter === "today" ? "default" : "outline"}
            onClick={() => setFilter("today")}
            className="gap-2"
          >
            <Calendar className="h-4 w-4" />
            Hari Ini
          </Button>
          <Button
            variant={filter === "week" ? "default" : "outline"}
            onClick={() => setFilter("week")}
          >
            Minggu Ini
          </Button>
          <Button
            variant={filter === "month" ? "default" : "outline"}
            onClick={() => setFilter("month")}
          >
            Bulan Ini
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {mockHistory.map((item) => (
          <div
            key={item.id}
            className="bg-card border rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer"
          >
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <div className="bg-primary/10 p-3 rounded-full">
                  <Clock className="h-6 w-6 text-primary" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-semibold text-foreground">
                        {item.plate}
                      </h3>
                      <Badge
                        variant={
                          item.taxStatus === "Lunas" ? "default" : "destructive"
                        }
                        className={
                          item.taxStatus === "Lunas"
                            ? "bg-success hover:bg-success/90"
                            : "bg-warning hover:bg-warning/90"
                        }
                      >
                        {item.taxStatus}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Car className="h-4 w-4" />
                        {item.type}
                      </span>
                      <span>•</span>
                      <span>{item.color}</span>
                      <span>•</span>
                      <span>{item.owner}</span>
                    </div>
                  </div>
                  <div className="text-right text-sm text-muted-foreground">
                    {item.scanTime}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {mockHistory.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Belum ada riwayat scan untuk periode ini</p>
        </div>
      )}
    </div>
  );
};

export default History;
