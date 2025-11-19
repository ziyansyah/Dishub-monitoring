import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Download, FileSpreadsheet, Eye, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useReportExport } from "@/services/reportsService";

const Reports = () => {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [taxStatus, setTaxStatus] = useState("all");
  const [showPreview, setShowPreview] = useState(false);

  const handleGenerate = () => {
    if (!startDate || !endDate) {
      toast.error("Harap isi tanggal mulai dan tanggal akhir");
      return;
    }
    setShowPreview(true);
  };

  const handleDownloadPDF = () => {
    toast.success("Laporan PDF sedang diunduh...");
  };

  const handleExportExcel = () => {
    toast.success("Laporan Excel sedang diunduh...");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Laporan</h1>
        <p className="text-muted-foreground mt-1">
          Generate laporan periode tertentu
        </p>
      </div>

      {/* Filter Form */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Parameter Laporan</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-2">
            <Label htmlFor="start-date">Tanggal Mulai</Label>
            <Input
              id="start-date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="end-date">Tanggal Akhir</Label>
            <Input
              id="end-date"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tax-status">Status Pajak</Label>
            <Select value={taxStatus} onValueChange={setTaxStatus}>
              <SelectTrigger id="tax-status">
                <SelectValue placeholder="Pilih status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua</SelectItem>
                <SelectItem value="lunas">Lunas</SelectItem>
                <SelectItem value="belum-lunas">Belum Lunas</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-end">
            <Button onClick={handleGenerate} className="w-full gap-2">
              <Eye className="h-4 w-4" />
              Preview Laporan
            </Button>
          </div>
        </div>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3">
        <Button onClick={handleDownloadPDF} className="gap-2">
          <Download className="h-4 w-4" />
          Generate PDF
        </Button>
        <Button onClick={handleExportExcel} variant="outline" className="gap-2">
          <FileSpreadsheet className="h-4 w-4" />
          Export Excel
        </Button>
      </div>

      {/* Recent Reports */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Laporan Terbaru</h2>
        <div className="space-y-3">
          {[
            { title: "Laporan Bulanan Oktober 2025", date: "2025-10-31", status: "Belum Lunas" },
            { title: "Laporan Minggu 43", date: "2025-10-27", status: "Semua" },
            { title: "Laporan Harian 2025-10-15", date: "2025-10-15", status: "Lunas" },
          ].map((report, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 p-2 rounded">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <div className="font-medium">{report.title}</div>
                  <div className="text-sm text-muted-foreground">{report.date}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline">{report.status}</Badge>
                <Button size="sm" variant="ghost">
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Preview Modal */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Preview Laporan</DialogTitle>
            <DialogDescription>
              Periode: {startDate} s/d {endDate}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            {/* Header */}
            <div className="text-center border-b pb-4">
              <h2 className="text-2xl font-bold text-primary">DINAS PERHUBUNGAN</h2>
              <p className="text-lg">KOTA MEDAN</p>
              <p className="text-sm text-muted-foreground mt-2">
                Laporan Monitoring Kendaraan
              </p>
            </div>

            {/* Summary */}
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <div className="text-2xl font-bold text-foreground">1,248</div>
                <div className="text-sm text-muted-foreground">Total Scan</div>
              </div>
              <div className="text-center p-4 bg-success/10 rounded-lg">
                <div className="text-2xl font-bold text-success">1,161</div>
                <div className="text-sm text-muted-foreground">Pajak Lunas</div>
              </div>
              <div className="text-center p-4 bg-warning/10 rounded-lg">
                <div className="text-2xl font-bold text-warning">87</div>
                <div className="text-sm text-muted-foreground">Belum Lunas</div>
              </div>
            </div>

            {/* Sample Table */}
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted">
                  <tr>
                    <th className="p-3 text-left">No. Plat</th>
                    <th className="p-3 text-left">Jenis</th>
                    <th className="p-3 text-left">Status Pajak</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t">
                    <td className="p-3">BK 1234 AB</td>
                    <td className="p-3">Mobil</td>
                    <td className="p-3">
                      <Badge className="bg-success">Lunas</Badge>
                    </td>
                  </tr>
                  <tr className="border-t">
                    <td className="p-3">BK 5678 CD</td>
                    <td className="p-3">Motor</td>
                    <td className="p-3">
                      <Badge className="bg-warning">Belum Lunas</Badge>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Actions */}
            <div className="flex gap-3 justify-end pt-4 border-t">
              <Button onClick={handleExportExcel} variant="outline" className="gap-2">
                <FileSpreadsheet className="h-4 w-4" />
                Export Excel
              </Button>
              <Button onClick={handleDownloadPDF} className="gap-2">
                <Download className="h-4 w-4" />
                Download PDF
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Reports;
