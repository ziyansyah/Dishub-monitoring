import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, CheckCircle } from "lucide-react";
import { toast } from "sonner";

interface VehicleDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vehicle: {
    plate: string;
    type: string;
    color: string;
    owner: string;
    taxStatus: string;
    scanTime: string;
  } | null;
}

export const VehicleDetailModal = ({
  open,
  onOpenChange,
  vehicle,
}: VehicleDetailModalProps) => {
  if (!vehicle) return null;

  const handleMarkChecked = () => {
    toast.success(`Kendaraan ${vehicle.plate} ditandai sudah diperiksa`);
    onOpenChange(false);
  };

  const handleDownload = () => {
    toast.success("Bukti scan sedang diunduh...");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Detail Kendaraan</DialogTitle>
          <DialogDescription>
            Informasi lengkap hasil scan kendaraan
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Thumbnail CCTV */}
          <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <div className="text-4xl mb-2">📷</div>
              <div className="text-sm">Gambar hasil scan CCTV</div>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-muted-foreground mb-1">
                Nomor Plat
              </div>
              <div className="font-semibold text-lg">{vehicle.plate}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground mb-1">
                Jenis Kendaraan
              </div>
              <div className="font-semibold">{vehicle.type}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground mb-1">Warna</div>
              <div className="font-semibold">{vehicle.color}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground mb-1">
                Status Pajak
              </div>
              <Badge
                variant={vehicle.taxStatus === "Aktif" ? "default" : "destructive"}
                className={
                  vehicle.taxStatus === "Aktif"
                    ? "bg-success hover:bg-success/90"
                    : "bg-warning hover:bg-warning/90"
                }
              >
                {vehicle.taxStatus}
              </Badge>
            </div>
            <div>
              <div className="text-sm text-muted-foreground mb-1">
                Nama Pemilik
              </div>
              <div className="font-semibold">{vehicle.owner}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground mb-1">
                Waktu Scan
              </div>
              <div className="font-semibold text-sm">{vehicle.scanTime}</div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t">
            <Button onClick={handleMarkChecked} className="flex-1 gap-2">
              <CheckCircle className="h-4 w-4" />
              Tandai Sudah Diperiksa
            </Button>
            <Button
              onClick={handleDownload}
              variant="outline"
              className="flex-1 gap-2"
            >
              <Download className="h-4 w-4" />
              Download Bukti
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
