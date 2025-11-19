import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { User, Upload, Shield, Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Role {
  id: string;
  name: string;
  description: string;
  permissions: {
    view: boolean;
    edit: boolean;
    export: boolean;
    delete: boolean;
  };
}

const Settings = () => {
  const [name, setName] = useState("Admin Dishub");
  const [email, setEmail] = useState("admin@dishub.go.id");
  
  // Role & Permission states
  const [roles, setRoles] = useState<Role[]>([
    {
      id: "1",
      name: "Super Admin",
      description: "Akses penuh ke semua fitur sistem",
      permissions: { view: true, edit: true, export: true, delete: true },
    },
    {
      id: "2",
      name: "Operator",
      description: "Dapat melihat dan mengedit data",
      permissions: { view: true, edit: true, export: false, delete: false },
    },
    {
      id: "3",
      name: "Viewer",
      description: "Hanya dapat melihat data",
      permissions: { view: true, edit: false, export: false, delete: false },
    },
  ]);
  const [showRoleDialog, setShowRoleDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [deletingRoleId, setDeletingRoleId] = useState<string | null>(null);
  const [roleForm, setRoleForm] = useState<Omit<Role, "id">>({
    name: "",
    description: "",
    permissions: { view: false, edit: false, export: false, delete: false },
  });

  const handleSaveProfile = () => {
    toast.success("Profil berhasil diperbarui");
  };

  const handleOpenAddRole = () => {
    setEditingRole(null);
    setRoleForm({
      name: "",
      description: "",
      permissions: { view: false, edit: false, export: false, delete: false },
    });
    setShowRoleDialog(true);
  };

  const handleOpenEditRole = (role: Role) => {
    setEditingRole(role);
    setRoleForm({
      name: role.name,
      description: role.description,
      permissions: { ...role.permissions },
    });
    setShowRoleDialog(true);
  };

  const handleSaveRole = () => {
    if (!roleForm.name || !roleForm.description) {
      toast.error("Nama dan deskripsi role harus diisi");
      return;
    }

    if (editingRole) {
      setRoles(roles.map(r => r.id === editingRole.id ? { ...editingRole, ...roleForm } : r));
      toast.success("Role berhasil diperbarui");
    } else {
      const newRole: Role = {
        id: Date.now().toString(),
        ...roleForm,
      };
      setRoles([...roles, newRole]);
      toast.success("Role berhasil ditambahkan");
    }
    setShowRoleDialog(false);
  };

  const handleDeleteRole = (roleId: string) => {
    setDeletingRoleId(roleId);
    setShowDeleteDialog(true);
  };

  const confirmDeleteRole = () => {
    if (deletingRoleId) {
      setRoles(roles.filter(r => r.id !== deletingRoleId));
      toast.success("Role berhasil dihapus");
    }
    setShowDeleteDialog(false);
    setDeletingRoleId(null);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Pengaturan</h1>
        <p className="text-muted-foreground mt-1">
          Kelola akun admin dan role & permission
        </p>
      </div>

      <Tabs defaultValue="account" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="account">Akun Admin</TabsTrigger>
          <TabsTrigger value="roles">Role & Permission</TabsTrigger>
        </TabsList>

        {/* Akun Admin */}
        <TabsContent value="account">
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-primary/10 p-2 rounded">
                <User className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Informasi Akun</h3>
                <p className="text-sm text-muted-foreground">Kelola profil dan keamanan akun</p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20 border-2 border-primary">
                  <AvatarFallback className="bg-primary text-primary-foreground text-2xl font-bold">
                    AD
                  </AvatarFallback>
                </Avatar>
                <Button variant="outline" className="gap-2">
                  <Upload className="h-4 w-4" />
                  Ubah Foto
                </Button>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Nama Lengkap</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password Baru</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Kosongkan jika tidak diubah"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Konfirmasi Password</Label>
                  <Input id="confirm-password" type="password" />
                </div>
              </div>

              <Button onClick={handleSaveProfile}>Simpan Perubahan</Button>
            </div>
          </Card>
        </TabsContent>

        {/* Role & Permission */}
        <TabsContent value="roles">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 p-2 rounded">
                  <Shield className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Manajemen Role</h3>
                  <p className="text-sm text-muted-foreground">Kelola role dan permission admin</p>
                </div>
              </div>
              <Button onClick={handleOpenAddRole} className="gap-2">
                <Plus className="h-4 w-4" />
                Tambah Role
              </Button>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Role</TableHead>
                  <TableHead>View</TableHead>
                  <TableHead>Edit</TableHead>
                  <TableHead>Export</TableHead>
                  <TableHead>Delete</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {roles.map((role) => (
                  <TableRow key={role.id}>
                    <TableCell>
                      <div className="font-medium">{role.name}</div>
                      <div className="text-sm text-muted-foreground">{role.description}</div>
                    </TableCell>
                    <TableCell>
                      <Badge className={role.permissions.view ? "bg-success" : "bg-muted"}>
                        {role.permissions.view ? "✓" : "✗"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={role.permissions.edit ? "bg-success" : "bg-muted"}>
                        {role.permissions.edit ? "✓" : "✗"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={role.permissions.export ? "bg-success" : "bg-muted"}>
                        {role.permissions.export ? "✓" : "✗"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={role.permissions.delete ? "bg-success" : "bg-muted"}>
                        {role.permissions.delete ? "✓" : "✗"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleOpenEditRole(role)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteRole(role.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add/Edit Role Dialog */}
      <Dialog open={showRoleDialog} onOpenChange={setShowRoleDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingRole ? "Edit Role" : "Tambah Role Baru"}</DialogTitle>
            <DialogDescription>
              {editingRole ? "Perbarui informasi role" : "Buat role baru dengan permission yang sesuai"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="role-name">Nama Role</Label>
              <Input
                id="role-name"
                placeholder="Contoh: Manager"
                value={roleForm.name}
                onChange={(e) => setRoleForm({ ...roleForm, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role-description">Deskripsi</Label>
              <Input
                id="role-description"
                placeholder="Jelaskan tugas role ini"
                value={roleForm.description}
                onChange={(e) => setRoleForm({ ...roleForm, description: e.target.value })}
              />
            </div>
            <div className="space-y-3">
              <Label>Permission</Label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="perm-view"
                    checked={roleForm.permissions.view}
                    onCheckedChange={(checked) =>
                      setRoleForm({
                        ...roleForm,
                        permissions: { ...roleForm.permissions, view: !!checked },
                      })
                    }
                  />
                  <label htmlFor="perm-view" className="text-sm font-medium cursor-pointer">
                    View - Dapat melihat data
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="perm-edit"
                    checked={roleForm.permissions.edit}
                    onCheckedChange={(checked) =>
                      setRoleForm({
                        ...roleForm,
                        permissions: { ...roleForm.permissions, edit: !!checked },
                      })
                    }
                  />
                  <label htmlFor="perm-edit" className="text-sm font-medium cursor-pointer">
                    Edit - Dapat mengedit data
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="perm-export"
                    checked={roleForm.permissions.export}
                    onCheckedChange={(checked) =>
                      setRoleForm({
                        ...roleForm,
                        permissions: { ...roleForm.permissions, export: !!checked },
                      })
                    }
                  />
                  <label htmlFor="perm-export" className="text-sm font-medium cursor-pointer">
                    Export - Dapat export data
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="perm-delete"
                    checked={roleForm.permissions.delete}
                    onCheckedChange={(checked) =>
                      setRoleForm({
                        ...roleForm,
                        permissions: { ...roleForm.permissions, delete: !!checked },
                      })
                    }
                  />
                  <label htmlFor="perm-delete" className="text-sm font-medium cursor-pointer">
                    Delete - Dapat menghapus data
                  </label>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRoleDialog(false)}>
              Batal
            </Button>
            <Button onClick={handleSaveRole}>
              {editingRole ? "Update" : "Tambah"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Role?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini tidak dapat dibatalkan. Role ini akan dihapus secara permanen dari sistem.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteRole} className="bg-destructive hover:bg-destructive/90">
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Settings;
