import { useState, useMemo } from "react";
import { Search as SearchIcon, Filter, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { VehicleTable, VehicleData } from "@/components/VehicleTable";
import { useVehicleSearch } from "@/services/vehicleService";
import { useDebounce } from "@/hooks/useDebounce";
import { VehicleSearchParams } from "@/types/api";

// Convert API data to component format
const convertToVehicleData = (vehicles: any[]): VehicleData[] => {
  return vehicles.map(vehicle => ({
    id: vehicle.id,
    plate: vehicle.plateNumber,
    type: vehicle.vehicleType.charAt(0).toUpperCase() + vehicle.vehicleType.slice(1),
    color: vehicle.color || "-",
    owner: vehicle.ownerName,
    taxStatus: vehicle.taxStatus === 'lunas' ? 'Aktif' : 'Mati',
    scanTime: vehicle.lastScanDate,
  }));
};

// Component for loading skeleton
const VehicleTableSkeleton = () => (
  <div className="bg-card rounded-lg border shadow-sm overflow-hidden">
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-muted/50">
          <tr>
            <th className="p-4 text-left font-medium">Nomor Plat</th>
            <th className="p-4 text-left font-medium">Jenis</th>
            <th className="p-4 text-left font-medium">Warna</th>
            <th className="p-4 text-left font-medium">Pemilik</th>
            <th className="p-4 text-left font-medium">Status Pajak</th>
            <th className="p-4 text-left font-medium">Waktu Scan</th>
          </tr>
        </thead>
        <tbody>
          {[...Array(5)].map((_, i) => (
            <tr key={i} className="border-t">
              <td className="p-4"><Skeleton className="h-4 w-[100px]" /></td>
              <td className="p-4"><Skeleton className="h-4 w-[80px]" /></td>
              <td className="p-4"><Skeleton className="h-4 w-[60px]" /></td>
              <td className="p-4"><Skeleton className="h-4 w-[120px]" /></td>
              <td className="p-4"><Skeleton className="h-4 w-[80px]" /></td>
              <td className="p-4"><Skeleton className="h-4 w-[140px]" /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

const Search = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [vehicleType, setVehicleType] = useState("all");
  const [taxStatus, setTaxStatus] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Debounce search query to avoid excessive API calls
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // Build search parameters for API
  const searchParams: VehicleSearchParams = useMemo(() => {
    const params: VehicleSearchParams = {
      page: 1,
      limit: 50,
    };

    if (debouncedSearchQuery.trim()) {
      params.search = debouncedSearchQuery.trim();
    }

    if (vehicleType !== "all") {
      params.vehicleType = vehicleType;
    }

    if (taxStatus !== "all") {
      params.taxStatus = taxStatus;
    }

    if (startDate) {
      params.startDate = startDate;
    }

    if (endDate) {
      params.endDate = endDate;
    }

    return params;
  }, [debouncedSearchQuery, vehicleType, taxStatus, startDate, endDate]);

  // API call with search parameters
  const { data: searchResult, isLoading, error } = useVehicleSearch(searchParams);

  // Convert API data to component format
  const vehicleData = searchResult?.data?.vehicles ? convertToVehicleData(searchResult.data.vehicles) : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Data Kendaraan</h1>
        <p className="text-muted-foreground mt-1">
          Cari data kendaraan berdasarkan nomor plat, jenis, status pajak, dan rentang waktu
        </p>
      </div>

      <div className="bg-card p-6 rounded-lg border shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Masukkan nomor plat (contoh: BK 1234 AB) atau nama pemilik"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12 text-base"
            />
            {isLoading && debouncedSearchQuery && (
              <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 animate-spin text-muted-foreground" />
            )}
          </div>
        </div>

        {/* Filter Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2 border-t">
          <div className="space-y-2">
            <Label htmlFor="vehicle-type" className="text-sm font-medium flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Jenis Kendaraan
            </Label>
            <Select value={vehicleType} onValueChange={setVehicleType}>
              <SelectTrigger id="vehicle-type">
                <SelectValue placeholder="Jenis Kendaraan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Jenis</SelectItem>
                <SelectItem value="mobil">Mobil</SelectItem>
                <SelectItem value="motor">Motor</SelectItem>
                <SelectItem value="truk">Truk</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="tax-status" className="text-sm font-medium">Status Pajak</Label>
            <Select value={taxStatus} onValueChange={setTaxStatus}>
              <SelectTrigger id="tax-status">
                <SelectValue placeholder="Status Pajak" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Status</SelectItem>
                <SelectItem value="lunas">Lunas</SelectItem>
                <SelectItem value="belum-lunas">Belum Lunas</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="start-date" className="text-sm font-medium">Tanggal Mulai</Label>
            <Input
              id="start-date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="end-date" className="text-sm font-medium">Tanggal Akhir</Label>
            <Input
              id="end-date"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Hasil Pencarian</h2>
          <div className="flex items-center gap-4">
            {isLoading && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Mencari...
              </div>
            )}
            <p className="text-sm text-muted-foreground">
              {isLoading ? (
                "Mencari data..."
              ) : (
                `Menampilkan ${vehicleData.length} dari ${searchResult?.data?.total || 0} data`
              )}
            </p>
          </div>
        </div>

        {isLoading ? (
          <VehicleTableSkeleton />
        ) : error ? (
          <div className="bg-card p-8 rounded-lg border text-center">
            <p className="text-muted-foreground">
              Terjadi kesalahan saat mencari data. Silakan coba lagi.
            </p>
          </div>
        ) : vehicleData.length === 0 && (debouncedSearchQuery || vehicleType !== "all" || taxStatus !== "all" || startDate || endDate) ? (
          <div className="bg-card p-8 rounded-lg border text-center">
            <p className="text-muted-foreground">
              Tidak ada data yang ditemukan dengan kriteria pencarian tersebut.
            </p>
          </div>
        ) : vehicleData.length === 0 ? (
          <div className="bg-card p-8 rounded-lg border text-center">
            <p className="text-muted-foreground">
              Masukkan kata kunci pencarian atau filter untuk menampilkan data kendaraan.
            </p>
          </div>
        ) : (
          <VehicleTable vehicles={vehicleData} />
        )}
      </div>
    </div>
  );
};

export default Search;
