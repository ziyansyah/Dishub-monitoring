import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Clock, Car, Calendar, Loader2 } from "lucide-react";
import { useScanHistory } from "@/services/reportsService";
import { getPredefinedDateRanges } from "@/services/reportsService";

// Convert API data to component format
const convertToHistoryItem = (scans: any[]) => {
  return scans.map(scan => ({
    id: scan.id,
    plate: scan.plateNumber,
    type: scan.vehicleType.charAt(0).toUpperCase() + scan.vehicleType.slice(1),
    color: "-", // Not available in API
    owner: scan.ownerName,
    taxStatus: scan.status === 'compliant' ? "Lunas" : "Belum Lunas",
    scanTime: scan.scanTime,
    officer: scan.officer,
  }));
};

// Component for loading skeleton
const HistoryItemSkeleton = () => (
  <div className="bg-card border rounded-lg p-6">
    <div className="flex items-start gap-4">
      <Skeleton className="h-12 w-12 rounded-full" />
      <div className="flex-1 space-y-3">
        <div className="flex items-center gap-3">
          <Skeleton className="h-6 w-[120px]" />
          <Skeleton className="h-5 w-[80px]" />
        </div>
        <div className="flex items-center gap-4">
          <Skeleton className="h-4 w-[60px]" />
          <Skeleton className="h-4 w-[40px]" />
          <Skeleton className="h-4 w-[80px]" />
        </div>
        <Skeleton className="h-4 w-[140px]" />
      </div>
    </div>
  </div>
);

const History = () => {
  const [filter, setFilter] = useState<"today" | "week" | "month">("today");

  // Get predefined date ranges
  const dateRanges = getPredefinedDateRanges();
  const selectedDateRange = dateRanges[filter];

  // API call for scan history
  const { data: historyData, isLoading, error } = useScanHistory({
    startDate: selectedDateRange.start,
    endDate: selectedDateRange.end,
    limit: 50,
  });

  // Convert API data to component format
  const historyItems = historyData?.data?.scans ? convertToHistoryItem(historyData.data.scans) : [];

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
        {isLoading ? (
          <>
            {[...Array(5)].map((_, i) => (
              <HistoryItemSkeleton key={i} />
            ))}
          </>
        ) : error ? (
          <div className="bg-card border rounded-lg p-8 text-center">
            <p className="text-muted-foreground">
              Terjadi kesalahan saat memuat riwayat scan. Silakan coba lagi.
            </p>
          </div>
        ) : historyItems.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Belum ada riwayat scan untuk periode ini</p>
          </div>
        ) : (
          historyItems.map((item) => (
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
                      {item.officer && (
                        <div className="text-xs text-muted-foreground">
                          Petugas: {item.officer}
                        </div>
                      )}
                    </div>
                    <div className="text-right text-sm text-muted-foreground">
                      {item.scanTime}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination or load more can be added here */}
      {historyData?.data?.total > historyItems.length && (
        <div className="text-center py-4">
          <Button variant="outline">
            Muat Lebih Banyak
          </Button>
        </div>
      )}
    </div>
  );
};

export default History;
