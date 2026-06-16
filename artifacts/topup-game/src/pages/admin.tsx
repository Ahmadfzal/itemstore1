import {
  useListAdminOrders,
  useUpdateOrderStatus,
  useListPackages,
  useCreatePackage,
  useUpdatePackage,
  useDeletePackage,
} from "@workspace/api-client-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import {
  Loader2, SlidersHorizontal, PackageOpen, CheckCheck, Trash2,
  Plus, Pencil, Gem, ShieldCheck, Eye, EyeOff, Store, MessageCircle, Palette, Save,
  ImageIcon, Upload, X, Type,
} from "lucide-react";
import { motion } from "framer-motion";
import { useSettings } from "@/context/settings-context";
import { THEMES, applyTheme } from "@/lib/theme";

const packageFormSchema = z.object({
  name: z.string().min(1, "Nama wajib diisi"),
  description: z.string().min(1, "Deskripsi wajib diisi"),
  amount: z.coerce.number().int().min(1, "Jumlah harus > 0"),
  price: z.coerce.number().min(0, "Harga tidak boleh negatif"),
  category: z.string().min(1),
  popular: z.boolean(),
  unit: z.string().min(1),
});
type PackageFormValues = z.infer<typeof packageFormSchema>;

function formatRupiah(n: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);
}

function getStatusColor(status: string) {
  switch (status.toLowerCase()) {
    case "completed":  return "bg-green-500/20 text-green-400 border-green-500/50";
    case "processing": return "bg-primary/20 text-primary border-primary/50";
    case "pending":    return "bg-amber-500/20 text-amber-400 border-amber-500/50";
    case "failed":     return "bg-destructive/20 text-destructive border-destructive/50";
    default:           return "bg-white/10 text-white border-white/20";
  }
}

// ─── Password Gate ───────────────────────────────────────────────────────────
function AdminLogin({ onSuccess }: { onSuccess: () => void }) {
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { toast } = useToast();

  const handleLogin = async () => {
    if (!password) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (data.success) {
        sessionStorage.setItem("adminAuth", "1");
        toast({ title: "Masuk berhasil" });
        onSuccess();
      } else {
        setError("Password salah. Coba lagi.");
      }
    } catch {
      setError("Terjadi kesalahan. Coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-sm mx-auto mt-16"
    >
      <div className="glass-panel p-8 rounded-3xl border border-white/10 text-center">
        <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <ShieldCheck className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-2xl font-display font-bold text-white mb-2 uppercase tracking-wider">Admin Login</h2>
        <p className="text-muted-foreground text-sm mb-8">Masukkan password untuk mengakses panel admin.</p>
        <div className="space-y-4 text-left">
          <div className="space-y-2">
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">Password</Label>
            <div className="relative">
              <Input
                type={showPw ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                placeholder="Masukkan password admin"
                className="h-12 bg-background/50 border-white/10 focus-visible:ring-primary pr-12"
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white"
              >
                {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {error && <p className="text-destructive text-sm">{error}</p>}
          </div>
          <Button
            onClick={handleLogin}
            disabled={loading || !password}
            className="w-full h-12 bg-primary text-primary-foreground font-bold uppercase tracking-wider"
          >
            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Masuk
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

// gradient per theme
const THEME_GRADIENTS: Record<string, string> = {
  gaming: "linear-gradient(135deg, #00ffff, #ff00ff)",
  purple: "linear-gradient(135deg, #8b5cf6, #ec4899)",
  orange: "linear-gradient(135deg, #f97316, #facc15)",
  green:  "linear-gradient(135deg, #22c55e, #14b8a6)",
  red:    "linear-gradient(135deg, #ef4444, #f97316)",
};

async function verifyPassword(pw: string): Promise<boolean> {
  const res = await fetch("/api/admin/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password: pw }),
  });
  const d = await res.json();
  return d.success === true;
}

// ─── Kelola Toko Tab ─────────────────────────────────────────────────────────
function KelolaToko() {
  const { settings, setSettings } = useSettings();
  const { toast } = useToast();

  // general
  const [storeName, setStoreName] = useState(settings.storeName);
  const [storeTheme, setStoreTheme] = useState(settings.storeTheme);

  // WA number — needs password confirm
  const [waNumber, setWaNumber] = useState(settings.whatsappNumber);
  const [waPasswordInput, setWaPasswordInput] = useState("");
  const [showWaPw, setShowWaPw] = useState(false);

  // admin password change — needs current password
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);

  const [saving, setSaving] = useState(false);
  const [savingPw, setSavingPw] = useState(false);

  // hero section texts
  const [heroStatus, setHeroStatus] = useState(settings.heroStatus ?? "SYSTEM ONLINE");
  const [heroTitle1, setHeroTitle1] = useState(settings.heroTitle1 ?? "POWER UP");
  const [heroTitle2, setHeroTitle2] = useState(settings.heroTitle2 ?? "YOUR GAME");
  const [heroSubtitle, setHeroSubtitle] = useState(settings.heroSubtitle ?? "");
  const [heroBgImage, setHeroBgImage] = useState<string | null>(settings.heroBgImage ?? null);
  const [savingHero, setSavingHero] = useState(false);

  // Handle image file → base64
  const handleHeroImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast({ variant: "destructive", title: "Gambar terlalu besar", description: "Maksimal 5 MB." });
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setHeroBgImage(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSaveHero = async () => {
    setSavingHero(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ heroStatus, heroTitle1, heroTitle2, heroSubtitle, heroBgImage }),
      });
      const data = await res.json();
      setSettings({
        ...settings,
        heroStatus: data.heroStatus,
        heroTitle1: data.heroTitle1,
        heroTitle2: data.heroTitle2,
        heroSubtitle: data.heroSubtitle,
        heroBgImage: data.heroBgImage ?? null,
      });
      toast({ title: "Hero section disimpan ✓" });
    } catch {
      toast({ variant: "destructive", title: "Gagal menyimpan hero" });
    } finally {
      setSavingHero(false);
    }
  };

  // Save store name + WA (with password confirmation for WA)
  const handleSaveInfo = async () => {
    const waChanged = waNumber !== settings.whatsappNumber;
    if (waChanged) {
      if (!waPasswordInput) {
        toast({ variant: "destructive", title: "Masukkan password untuk mengubah nomor WA" });
        return;
      }
      const ok = await verifyPassword(waPasswordInput);
      if (!ok) {
        toast({ variant: "destructive", title: "Password salah", description: "Konfirmasi password tidak cocok." });
        return;
      }
    }
    setSaving(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ storeName, whatsappNumber: waNumber, storeTheme }),
      });
      const data = await res.json();
      setSettings({ ...settings, storeName: data.storeName, whatsappNumber: data.whatsappNumber, storeTheme: data.storeTheme });
      applyTheme(data.storeTheme);
      setWaPasswordInput("");
      toast({ title: "Pengaturan disimpan ✓" });
    } catch {
      toast({ variant: "destructive", title: "Gagal menyimpan" });
    } finally {
      setSaving(false);
    }
  };

  // Save new admin password (requires current password)
  const handleSavePassword = async () => {
    if (!currentPw || !newPw || !confirmPw) {
      toast({ variant: "destructive", title: "Isi semua kolom password" });
      return;
    }
    if (newPw !== confirmPw) {
      toast({ variant: "destructive", title: "Password baru tidak cocok" });
      return;
    }
    const ok = await verifyPassword(currentPw);
    if (!ok) {
      toast({ variant: "destructive", title: "Password sekarang salah" });
      return;
    }
    setSavingPw(true);
    try {
      await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminPassword: newPw }),
      });
      setCurrentPw(""); setNewPw(""); setConfirmPw("");
      toast({ title: "Password berhasil diubah ✓" });
    } catch {
      toast({ variant: "destructive", title: "Gagal ubah password" });
    } finally {
      setSavingPw(false);
    }
  };

  return (
    <div className="max-w-xl space-y-6">
      {/* ── Nama Toko ── */}
      <div className="glass-panel rounded-2xl border border-white/10 p-6 space-y-5">
        <div className="flex items-center gap-3 mb-2">
          <Store className="w-5 h-5 text-primary" />
          <h3 className="font-display font-bold text-white uppercase tracking-wider">Informasi Toko</h3>
        </div>
        <div className="space-y-2">
          <Label className="text-xs uppercase tracking-wider text-muted-foreground">Nama Toko</Label>
          <Input
            value={storeName}
            onChange={(e) => setStoreName(e.target.value)}
            placeholder="cth: GameStore ID"
            className="h-11 bg-background/50 border-white/10 focus-visible:ring-primary"
          />
        </div>

        {/* WA Number */}
        <div className="space-y-2">
          <Label className="text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-1">
            <MessageCircle className="w-3.5 h-3.5" />
            Nomor WhatsApp Tujuan
          </Label>
          <Input
            value={waNumber}
            onChange={(e) => setWaNumber(e.target.value)}
            placeholder="cth: 6281234567890"
            className="h-11 bg-background/50 border-white/10 focus-visible:ring-primary"
          />
          <p className="text-xs text-muted-foreground">Format internasional: 628xxx (tanpa +). Pesanan diarahkan ke nomor ini.</p>
        </div>

        {/* Password confirm for WA (only shown when WA changes) */}
        {waNumber !== settings.whatsappNumber && (
          <div className="space-y-2 rounded-xl border border-amber-500/30 bg-amber-500/5 p-4">
            <Label className="text-xs uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              Konfirmasi Password untuk Ubah Nomor WA
            </Label>
            <div className="relative">
              <Input
                type={showWaPw ? "text" : "password"}
                value={waPasswordInput}
                onChange={(e) => setWaPasswordInput(e.target.value)}
                placeholder="Masukkan password admin"
                className="h-11 bg-background/50 border-amber-500/30 focus-visible:ring-amber-500 pr-12"
              />
              <button type="button" onClick={() => setShowWaPw(!showWaPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white">
                {showWaPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Tema ── */}
      <div className="glass-panel rounded-2xl border border-white/10 p-6 space-y-4">
        <div className="flex items-center gap-3 mb-2">
          <Palette className="w-5 h-5 text-primary" />
          <h3 className="font-display font-bold text-white uppercase tracking-wider">Tema Toko</h3>
        </div>
        <div className="grid grid-cols-5 gap-3">
          {Object.entries(THEMES).map(([key, theme]) => {
            const active = storeTheme === key;
            return (
              <button
                key={key}
                onClick={() => { setStoreTheme(key); applyTheme(key); }}
                className={`relative flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all duration-200 ${
                  active ? "border-white/60 bg-white/10 scale-105" : "border-white/10 hover:border-white/30 bg-white/5 hover:scale-102"
                }`}
                title={theme.label}
              >
                <div
                  className="w-10 h-10 rounded-full shadow-lg"
                  style={{
                    background: THEME_GRADIENTS[key],
                    boxShadow: active ? `0 0 18px ${theme.color}80` : "none",
                  }}
                />
                <span className="text-[10px] text-muted-foreground font-semibold truncate w-full text-center leading-tight">{theme.label.split(" ")[0]}</span>
                {active && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-white flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full" style={{ background: THEME_GRADIENTS[key] }} />
                  </div>
                )}
              </button>
            );
          })}
        </div>
        <div
          className="h-2 w-full rounded-full mt-2 opacity-70"
          style={{ background: THEME_GRADIENTS[storeTheme] ?? THEME_GRADIENTS.gaming }}
        />
      </div>

      {/* ── Save info button ── */}
      <Button
        onClick={handleSaveInfo}
        disabled={saving}
        className="w-full h-12 bg-primary text-primary-foreground font-bold uppercase tracking-wider gap-2"
      >
        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
        Simpan Informasi & Tema
      </Button>

      {/* ── Hero Section ── */}
      <div className="glass-panel rounded-2xl border border-white/10 p-6 space-y-5">
        <div className="flex items-center gap-3 mb-2">
          <Type className="w-5 h-5 text-primary" />
          <h3 className="font-display font-bold text-white uppercase tracking-wider">Hero Section</h3>
        </div>
        <p className="text-xs text-muted-foreground -mt-2">Teks dan gambar latar yang muncul di bagian atas halaman utama.</p>

        {/* Status badge text */}
        <div className="space-y-2">
          <Label className="text-xs uppercase tracking-wider text-muted-foreground">Teks Badge Status</Label>
          <Input
            value={heroStatus}
            onChange={(e) => setHeroStatus(e.target.value)}
            placeholder="cth: SYSTEM ONLINE"
            className="h-11 bg-background/50 border-white/10 focus-visible:ring-primary"
          />
          <p className="text-xs text-muted-foreground">Label kecil di atas judul (contoh: "SYSTEM ONLINE").</p>
        </div>

        {/* Title baris 1 */}
        <div className="space-y-2">
          <Label className="text-xs uppercase tracking-wider text-muted-foreground">Judul Baris 1 (putih)</Label>
          <Input
            value={heroTitle1}
            onChange={(e) => setHeroTitle1(e.target.value)}
            placeholder="cth: POWER UP"
            className="h-11 bg-background/50 border-white/10 focus-visible:ring-primary"
          />
        </div>

        {/* Title baris 2 */}
        <div className="space-y-2">
          <Label className="text-xs uppercase tracking-wider text-muted-foreground">Judul Baris 2 (warna tema)</Label>
          <Input
            value={heroTitle2}
            onChange={(e) => setHeroTitle2(e.target.value)}
            placeholder="cth: YOUR GAME"
            className="h-11 bg-background/50 border-white/10 focus-visible:ring-primary"
          />
        </div>

        {/* Subtitle */}
        <div className="space-y-2">
          <Label className="text-xs uppercase tracking-wider text-muted-foreground">Deskripsi / Subtitle</Label>
          <textarea
            value={heroSubtitle}
            onChange={(e) => setHeroSubtitle(e.target.value)}
            placeholder="Deskripsi singkat toko kamu..."
            rows={3}
            className="w-full rounded-lg bg-background/50 border border-white/10 focus:outline-none focus:ring-2 focus:ring-primary px-3 py-2.5 text-sm text-white resize-none"
          />
        </div>

        {/* Background image */}
        <div className="space-y-3">
          <Label className="text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <ImageIcon className="w-3.5 h-3.5" />
            Gambar Latar Hero
          </Label>

          {heroBgImage ? (
            <div className="relative rounded-xl overflow-hidden border border-white/10 group">
              <img
                src={heroBgImage}
                alt="Hero background preview"
                className="w-full h-36 object-cover opacity-70"
              />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  type="button"
                  onClick={() => setHeroBgImage(null)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-destructive/80 text-white text-sm font-semibold hover:bg-destructive transition-colors"
                >
                  <X className="w-4 h-4" />
                  Hapus Gambar
                </button>
              </div>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center gap-3 h-36 rounded-xl border-2 border-dashed border-white/20 bg-background/30 hover:border-primary/50 hover:bg-primary/5 transition-all cursor-pointer">
              <Upload className="w-8 h-8 text-muted-foreground" />
              <div className="text-center">
                <p className="text-sm text-white font-semibold">Klik untuk upload gambar</p>
                <p className="text-xs text-muted-foreground mt-1">PNG, JPG, WebP — maks. 5 MB</p>
              </div>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleHeroImageUpload}
              />
            </label>
          )}

          {heroBgImage && (
            <label className="flex items-center gap-2 text-xs text-primary cursor-pointer hover:text-primary/80 transition-colors">
              <Upload className="w-3.5 h-3.5" />
              Ganti gambar
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleHeroImageUpload}
              />
            </label>
          )}
          <p className="text-xs text-muted-foreground">Jika tidak diisi, gambar default akan digunakan.</p>
        </div>

        <Button
          onClick={handleSaveHero}
          disabled={savingHero}
          className="w-full h-12 bg-primary text-primary-foreground font-bold uppercase tracking-wider gap-2"
        >
          {savingHero ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Simpan Hero Section
        </Button>
      </div>

      {/* ── Ganti Password ── */}
      <div className="glass-panel rounded-2xl border border-white/10 p-6 space-y-4">
        <div className="flex items-center gap-3 mb-1">
          <ShieldCheck className="w-5 h-5 text-primary" />
          <h3 className="font-display font-bold text-white uppercase tracking-wider">Ganti Password Admin</h3>
        </div>
        <p className="text-xs text-muted-foreground">Masukkan password sekarang untuk memverifikasi sebelum mengganti.</p>

        <div className="space-y-2">
          <Label className="text-xs uppercase tracking-wider text-muted-foreground">Password Sekarang</Label>
          <div className="relative">
            <Input
              type={showCurrentPw ? "text" : "password"}
              value={currentPw}
              onChange={(e) => setCurrentPw(e.target.value)}
              placeholder="Password saat ini"
              className="h-11 bg-background/50 border-white/10 focus-visible:ring-primary pr-12"
            />
            <button type="button" onClick={() => setShowCurrentPw(!showCurrentPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white">
              {showCurrentPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-xs uppercase tracking-wider text-muted-foreground">Password Baru</Label>
          <div className="relative">
            <Input
              type={showNewPw ? "text" : "password"}
              value={newPw}
              onChange={(e) => setNewPw(e.target.value)}
              placeholder="Password baru"
              className="h-11 bg-background/50 border-white/10 focus-visible:ring-primary pr-12"
            />
            <button type="button" onClick={() => setShowNewPw(!showNewPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white">
              {showNewPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-xs uppercase tracking-wider text-muted-foreground">Konfirmasi Password Baru</Label>
          <Input
            type="password"
            value={confirmPw}
            onChange={(e) => setConfirmPw(e.target.value)}
            placeholder="Ulangi password baru"
            className="h-11 bg-background/50 border-white/10 focus-visible:ring-primary"
          />
          {newPw && confirmPw && newPw !== confirmPw && (
            <p className="text-destructive text-xs">Password tidak cocok</p>
          )}
        </div>

        <Button
          onClick={handleSavePassword}
          disabled={savingPw || !currentPw || !newPw || !confirmPw}
          className="w-full h-11 bg-white/10 hover:bg-white/15 text-white font-bold uppercase tracking-wider gap-2 border border-white/10"
        >
          {savingPw ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
          Ubah Password
        </Button>
      </div>
    </div>
  );
}

// ─── Main Admin ───────────────────────────────────────────────────────────────
export default function Admin() {
  const { toast } = useToast();
  const [isAuthed, setIsAuthed] = useState(() => sessionStorage.getItem("adminAuth") === "1");
  if (!isAuthed) return <AdminLogin onSuccess={() => setIsAuthed(true)} />;
  return <AdminPanel toast={toast} />;
}

function AdminPanel({ toast }: { toast: ReturnType<typeof useToast>["toast"] }) {
  const { settings, setSettings } = useSettings();

  // ─── Category & Unit management ───────────────────────────
  const [categories, setCategories] = useState<string[]>(() => settings.categories ?? ["Starter", "Popular", "Premium"]);
  const [newCategory, setNewCategory] = useState("");
  const [savingCats, setSavingCats] = useState(false);

  const [units, setUnits] = useState<string[]>(() => settings.units ?? ["Diamond", "Chip", "Pulsa"]);
  const [newUnit, setNewUnit] = useState("");
  const [savingUnits, setSavingUnits] = useState(false);

  const saveCategories = async (list: string[]) => {
    setSavingCats(true);
    try {
      const res = await fetch("/api/admin/settings", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ categories: JSON.stringify(list) }) });
      const data = await res.json();
      let cats: string[] = list;
      try { cats = JSON.parse(data.categories ?? "[]"); } catch {}
      setCategories(cats);
      setSettings({ ...settings, categories: cats });
      toast({ title: "Kategori disimpan ✓" });
    } catch { toast({ variant: "destructive", title: "Gagal simpan kategori" }); }
    finally { setSavingCats(false); }
  };

  const saveUnits = async (list: string[]) => {
    setSavingUnits(true);
    try {
      const res = await fetch("/api/admin/settings", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ units: JSON.stringify(list) }) });
      const data = await res.json();
      let us: string[] = list;
      try { us = JSON.parse(data.units ?? "[]"); } catch {}
      setUnits(us);
      setSettings({ ...settings, units: us });
      toast({ title: "Satuan disimpan ✓" });
    } catch { toast({ variant: "destructive", title: "Gagal simpan satuan" }); }
    finally { setSavingUnits(false); }
  };

  // ─── Orders ──────────────────────────────────────────────
  const [statusFilter, setStatusFilter] = useState("all");
  const { data: orders, isLoading: ordersLoading, refetch: refetchOrders } = useListAdminOrders(
    statusFilter === "all" ? undefined : { status: statusFilter }
  );
  const [hidingId, setHidingId] = useState<number | null>(null);

  const { mutate: updateStatus, isPending: isUpdating } = useUpdateOrderStatus({
    mutation: {
      onSuccess: () => { toast({ title: "Pesanan selesai ✓" }); refetchOrders(); },
      onError: () => toast({ variant: "destructive", title: "Gagal update status" }),
    },
  });

  const hideOrder = async (id: number) => {
    setHidingId(id);
    try {
      await fetch(`/api/admin/orders/${id}/hide`, { method: "PATCH" });
      toast({ title: "Riwayat dihapus" });
      refetchOrders();
    } catch {
      toast({ variant: "destructive", title: "Gagal hapus riwayat" });
    } finally {
      setHidingId(null);
    }
  };

  // ─── Packages ─────────────────────────────────────────────
  const { data: packages, isLoading: packagesLoading, refetch: refetchPackages } = useListPackages();
  const [isPackageModalOpen, setIsPackageModalOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState<any>(null);
  const [deleteTarget, setDeleteTarget] = useState<any>(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<PackageFormValues>({
    resolver: zodResolver(packageFormSchema),
    defaultValues: { name: "", description: "", amount: 0, price: 0, category: "popular", popular: false, unit: "Diamond" },
  });
  const popularValue = watch("popular");
  const unitValue = watch("unit");
  const categoryValue = watch("category");

  const { mutate: createPackage, isPending: isCreating } = useCreatePackage({
    mutation: {
      onSuccess: () => { toast({ title: "Paket ditambahkan" }); setIsPackageModalOpen(false); refetchPackages(); },
      onError: () => toast({ variant: "destructive", title: "Gagal tambah paket" }),
    },
  });

  const { mutate: updatePackage, isPending: isUpdatingPkg } = useUpdatePackage({
    mutation: {
      onSuccess: () => { toast({ title: "Paket diperbarui" }); setIsPackageModalOpen(false); setEditingPackage(null); refetchPackages(); },
      onError: () => toast({ variant: "destructive", title: "Gagal update paket" }),
    },
  });

  const { mutate: deletePackage, isPending: isDeleting } = useDeletePackage({
    mutation: {
      onSuccess: () => { toast({ title: "Paket dihapus" }); setIsDeleteConfirmOpen(false); setDeleteTarget(null); refetchPackages(); },
      onError: () => toast({ variant: "destructive", title: "Gagal hapus paket" }),
    },
  });

  const openCreate = () => {
    setEditingPackage(null);
    const defaultCat = settings.categories?.[0] ?? "Popular";
    const defaultUnit = units[0] ?? "Diamond";
    reset({ name: "", description: "", amount: 0, price: 0, category: defaultCat, popular: false, unit: defaultUnit });
    setIsPackageModalOpen(true);
  };

  const openEdit = (pkg: any) => {
    setEditingPackage(pkg);
    reset({ name: pkg.name, description: pkg.description, amount: pkg.amount, price: pkg.price, category: pkg.category, popular: pkg.popular, unit: pkg.unit ?? "Diamond" });
    setIsPackageModalOpen(true);
  };

  const onPackageSubmit = (values: PackageFormValues) => {
    const payload = { name: values.name, description: values.description, amount: values.amount, price: values.price, currency: "IDR", category: values.category, popular: values.popular, unit: values.unit } as any;
    if (editingPackage) {
      updatePackage({ id: editingPackage.id, data: payload });
    } else {
      createPackage({ data: payload });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-display font-bold text-white uppercase tracking-wider">Command Center</h2>
          <p className="text-muted-foreground">Kelola pesanan, paket, dan pengaturan toko.</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => { sessionStorage.removeItem("adminAuth"); window.location.reload(); }}
          className="border-white/10 text-muted-foreground hover:text-white text-xs"
        >
          Logout
        </Button>
      </div>

      <Tabs defaultValue="orders">
        <TabsList className="bg-white/5 border border-white/10 rounded-xl p-1 h-auto gap-1 flex-wrap">
          <TabsTrigger value="orders" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-muted-foreground px-4 py-2 font-semibold uppercase text-xs tracking-wider">
            Riwayat Pesanan
          </TabsTrigger>
          <TabsTrigger value="packages" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-muted-foreground px-4 py-2 font-semibold uppercase text-xs tracking-wider">
            Kelola Paket
          </TabsTrigger>
          <TabsTrigger value="toko" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-muted-foreground px-4 py-2 font-semibold uppercase text-xs tracking-wider">
            Kelola Toko
          </TabsTrigger>
        </TabsList>

        {/* ══ RIWAYAT PESANAN ══ */}
        <TabsContent value="orders" className="mt-6 space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-muted-foreground text-sm">Semua transaksi yang masuk.</p>
            <div className="glass-panel px-4 py-2 rounded-xl flex items-center gap-2 border border-white/10">
              <SlidersHorizontal className="w-4 h-4 text-muted-foreground" />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px] h-8 border-0 bg-transparent focus:ring-0 p-0 text-white font-semibold">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-card border-white/10 text-white">
                  <SelectItem value="all">Semua</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-panel rounded-2xl border border-white/10 overflow-hidden">
            {ordersLoading ? (
              <div className="h-64 flex items-center justify-center"><Loader2 className="w-8 h-8 text-primary animate-spin" /></div>
            ) : !orders?.length ? (
              <div className="py-20 text-center flex flex-col items-center">
                <PackageOpen className="w-12 h-12 text-muted-foreground mb-4" />
                <h3 className="text-xl font-display font-bold text-white mb-2">Belum Ada Pesanan</h3>
                <p className="text-muted-foreground">Belum ada transaksi yang masuk.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-white/5 hover:bg-white/5">
                    <TableRow className="border-white/10">
                      <TableHead className="text-muted-foreground font-semibold">ID</TableHead>
                      <TableHead className="text-muted-foreground font-semibold">Waktu</TableHead>
                      <TableHead className="text-muted-foreground font-semibold">Paket / Detail</TableHead>
                      <TableHead className="text-muted-foreground font-semibold">Nama Pembeli</TableHead>
                      <TableHead className="text-muted-foreground font-semibold">Status</TableHead>
                      <TableHead className="text-muted-foreground font-semibold text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.map((order) => (
                      <TableRow key={order.id} className="border-white/5 hover:bg-white/5 transition-colors">
                        <TableCell className="font-mono font-medium text-white">#{order.id}</TableCell>
                        <TableCell className="text-muted-foreground text-sm">{format(new Date(order.createdAt), "dd MMM, HH:mm")}</TableCell>
                        <TableCell>
                          <div className="font-semibold text-white">{order.package.name}</div>
                          <div className="text-xs text-primary font-mono mt-1">ID: {order.gameId}</div>
                          {(order as any).username && <div className="text-xs text-muted-foreground">@{(order as any).username}</div>}
                          {(order as any).customerNotes && <div className="text-xs text-amber-400/80 mt-0.5 max-w-[180px] truncate">📝 {(order as any).customerNotes}</div>}
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-white font-semibold">
                            {order.contactPhone || <span className="text-muted-foreground italic">—</span>}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={`uppercase tracking-widest text-[10px] ${getStatusColor(order.status)}`}>
                            {order.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              size="sm"
                              disabled={order.status === "completed" || isUpdating}
                              onClick={() => updateStatus({ id: order.id, data: { status: "completed", notes: null } })}
                              className="bg-green-500/20 hover:bg-green-500/30 text-green-400 border border-green-500/30 h-8 px-3 font-bold uppercase text-xs gap-1.5 disabled:opacity-40"
                            >
                              <CheckCheck className="w-3.5 h-3.5" />
                              Selesai
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={hidingId === order.id}
                              onClick={() => hideOrder(order.id)}
                              className="bg-destructive/10 border-destructive/30 hover:bg-destructive/20 text-destructive h-8 w-8 p-0"
                              title="Hapus riwayat"
                            >
                              {hidingId === order.id
                                ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                : <Trash2 className="w-3.5 h-3.5" />}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </motion.div>
        </TabsContent>

        {/* ══ KELOLA PAKET ══ */}
        <TabsContent value="packages" className="mt-6 space-y-6">
          {/* ── Category & Unit Manager ── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Kategori */}
            <div className="glass-panel rounded-2xl border border-white/10 p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Plus className="w-4 h-4 text-primary" />
                  <h3 className="font-display font-bold text-white uppercase tracking-wider text-sm">Kategori</h3>
                </div>
                <Button size="sm" disabled={savingCats} onClick={() => saveCategories(categories)} className="h-7 px-3 text-xs bg-primary text-primary-foreground font-bold gap-1">
                  {savingCats ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}Simpan
                </Button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {categories.map((cat) => (
                  <span key={cat} className="flex items-center gap-1 bg-white/10 border border-white/10 rounded-full px-2.5 py-1 text-xs font-semibold text-white">
                    {cat}
                    <button type="button" disabled={categories.length <= 1} onClick={() => setCategories(categories.filter((c) => c !== cat))} className="text-muted-foreground hover:text-destructive disabled:opacity-30 ml-0.5">
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); const t = newCategory.trim(); if (t && !categories.includes(t)) { setCategories([...categories, t]); setNewCategory(""); } } }}
                  placeholder="Nama kategori baru..."
                  className="h-9 bg-background/50 border-white/10 focus-visible:ring-primary text-sm flex-1"
                  maxLength={30}
                />
                <Button type="button" size="sm" className="h-9 px-3 bg-white/10 text-white border border-white/10 hover:bg-white/20"
                  onClick={() => { const t = newCategory.trim(); if (t && !categories.includes(t)) { setCategories([...categories, t]); setNewCategory(""); } }}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Satuan Paket */}
            <div className="glass-panel rounded-2xl border border-white/10 p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Gem className="w-4 h-4 text-primary" />
                  <h3 className="font-display font-bold text-white uppercase tracking-wider text-sm">Satuan Paket</h3>
                </div>
                <Button size="sm" disabled={savingUnits} onClick={() => saveUnits(units)} className="h-7 px-3 text-xs bg-primary text-primary-foreground font-bold gap-1">
                  {savingUnits ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}Simpan
                </Button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {units.map((u) => (
                  <span key={u} className="flex items-center gap-1 bg-white/10 border border-white/10 rounded-full px-2.5 py-1 text-xs font-semibold text-white">
                    {u}
                    <button type="button" disabled={units.length <= 1} onClick={() => setUnits(units.filter((x) => x !== u))} className="text-muted-foreground hover:text-destructive disabled:opacity-30 ml-0.5">
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  value={newUnit}
                  onChange={(e) => setNewUnit(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); const t = newUnit.trim(); if (t && !units.includes(t)) { setUnits([...units, t]); setNewUnit(""); } } }}
                  placeholder="Nama satuan baru (cth: Gem)..."
                  className="h-9 bg-background/50 border-white/10 focus-visible:ring-primary text-sm flex-1"
                  maxLength={20}
                />
                <Button type="button" size="sm" className="h-9 px-3 bg-white/10 text-white border border-white/10 hover:bg-white/20"
                  onClick={() => { const t = newUnit.trim(); if (t && !units.includes(t)) { setUnits([...units, t]); setNewUnit(""); }  }}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <p className="text-muted-foreground text-sm">Tambah, ubah, atau hapus paket top-up.</p>
            <Button onClick={openCreate} className="bg-primary text-primary-foreground font-bold uppercase tracking-wider gap-2">
              <Plus className="w-4 h-4" />Tambah Paket
            </Button>
          </div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-panel rounded-2xl border border-white/10 overflow-hidden">
            {packagesLoading ? (
              <div className="h-64 flex items-center justify-center"><Loader2 className="w-8 h-8 text-primary animate-spin" /></div>
            ) : !packages?.length ? (
              <div className="py-20 text-center flex flex-col items-center">
                <Gem className="w-12 h-12 text-muted-foreground mb-4" />
                <h3 className="text-xl font-display font-bold text-white mb-2">Belum Ada Paket</h3>
                <p className="text-muted-foreground">Klik "Tambah Paket" untuk membuat paket baru.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-white/5 hover:bg-white/5">
                    <TableRow className="border-white/10">
                      <TableHead className="text-muted-foreground font-semibold">ID</TableHead>
                      <TableHead className="text-muted-foreground font-semibold">Nama Paket</TableHead>
                      <TableHead className="text-muted-foreground font-semibold">Jumlah</TableHead>
                      <TableHead className="text-muted-foreground font-semibold">Harga</TableHead>
                      <TableHead className="text-muted-foreground font-semibold">Kategori</TableHead>
                      <TableHead className="text-muted-foreground font-semibold">Diskon</TableHead>
                      <TableHead className="text-muted-foreground font-semibold text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {packages.map((pkg) => (
                      <TableRow key={pkg.id} className="border-white/5 hover:bg-white/5 transition-colors">
                        <TableCell className="font-mono font-medium text-white">#{pkg.id}</TableCell>
                        <TableCell>
                          <div className="font-semibold text-white">{pkg.name}</div>
                          <div className="text-xs text-muted-foreground mt-0.5 max-w-[200px] truncate">{pkg.description}</div>
                        </TableCell>
                        <TableCell><span className="flex items-center gap-1 text-cyan-400 font-bold"><Gem className="w-3.5 h-3.5" />{pkg.amount.toLocaleString("id-ID")} <span className="text-[10px] text-muted-foreground font-normal">{(pkg as any).unit ?? "Diamond"}</span></span></TableCell>
                        <TableCell className="text-white font-semibold">{formatRupiah(pkg.price)}</TableCell>
                        <TableCell><Badge variant="outline" className="uppercase text-[10px] tracking-widest border-white/20 text-muted-foreground">{pkg.category}</Badge></TableCell>
                        <TableCell>{pkg.popular ? <Badge className="bg-green-500/20 text-green-400 border-green-500/50 uppercase text-[10px]">Ya</Badge> : <span className="text-muted-foreground">—</span>}</TableCell>
                        <TableCell className="text-right space-x-2">
                          <Button variant="outline" size="sm" onClick={() => openEdit(pkg)} className="bg-white/5 border-white/10 hover:bg-white/10 text-white h-8 px-2"><Pencil className="w-4 h-4" /></Button>
                          <Button variant="outline" size="sm" onClick={() => { setDeleteTarget(pkg); setIsDeleteConfirmOpen(true); }} className="bg-destructive/10 border-destructive/30 hover:bg-destructive/20 text-destructive h-8 px-2"><Trash2 className="w-4 h-4" /></Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </motion.div>
        </TabsContent>

        {/* ══ KELOLA TOKO ══ */}
        <TabsContent value="toko" className="mt-6">
          <KelolaToko />
        </TabsContent>
      </Tabs>

      {/* Package Form Dialog */}
      <Dialog open={isPackageModalOpen} onOpenChange={(open) => { setIsPackageModalOpen(open); if (!open) setEditingPackage(null); }}>
        <DialogContent className="bg-card border-white/10 sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-display uppercase tracking-wider">{editingPackage ? "Edit Paket" : "Tambah Paket Baru"}</DialogTitle>
            <DialogDescription className="text-muted-foreground">{editingPackage ? `Paket #${editingPackage.id}` : "Isi semua kolom."}</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onPackageSubmit)} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">Nama Paket</Label>
              <Input {...register("name")} placeholder="cth: 86 Diamonds" className="h-11 bg-background/50 border-white/10 focus-visible:ring-primary" />
              {errors.name && <p className="text-destructive text-xs">{errors.name.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">Deskripsi</Label>
              <Input {...register("description")} placeholder="cth: Paket starter" className="h-11 bg-background/50 border-white/10 focus-visible:ring-primary" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs uppercase tracking-wider text-muted-foreground">Jumlah {unitValue || "Satuan"}</Label>
                <Input {...register("amount")} type="number" min={1} className="h-11 bg-background/50 border-white/10" />
                {errors.amount && <p className="text-destructive text-xs">{errors.amount.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs uppercase tracking-wider text-muted-foreground">Harga (Rp)</Label>
                <Input {...register("price")} type="number" min={0} className="h-11 bg-background/50 border-white/10" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs uppercase tracking-wider text-muted-foreground">Kategori</Label>
                <div className="flex flex-wrap gap-1.5 mb-1.5">
                  {["Populer", "Best Seller"].map((quick) => (
                    <button
                      key={quick}
                      type="button"
                      onClick={() => setValue("category", quick)}
                      className="px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider border transition-all bg-white/5 border-white/10 text-muted-foreground hover:border-primary/60 hover:text-primary"
                    >
                      {quick}
                    </button>
                  ))}
                </div>
                <Select value={categoryValue ?? (settings.categories?.[0] ?? "Popular")} onValueChange={(v) => setValue("category", v)}>
                  <SelectTrigger className="h-11 bg-background/50 border-white/10"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-card border-white/10 text-white">
                    {(settings.categories ?? ["Starter", "Popular", "Premium"]).map((cat) => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs uppercase tracking-wider text-muted-foreground">Satuan Paket</Label>
                <Select value={unitValue ?? (units[0] ?? "Diamond")} onValueChange={(v) => setValue("unit", v)}>
                  <SelectTrigger className="h-11 bg-background/50 border-white/10"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-card border-white/10 text-white">
                    {units.map((u) => (
                      <SelectItem key={u} value={u}>{u}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">Mata Uang</Label>
              <div className="h-11 bg-background/30 border border-white/10 rounded-md flex items-center px-3 text-muted-foreground text-sm">IDR — Rupiah Indonesia (tetap)</div>
            </div>
            <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3">
              <div>
                <p className="text-sm font-semibold text-white">Tandai sebagai Diskon</p>
                <p className="text-xs text-muted-foreground">Tampil dengan badge DISKON di kartu paket</p>
              </div>
              <Switch checked={popularValue} onCheckedChange={(v) => setValue("popular", v)} className="data-[state=checked]:bg-green-500" />
            </div>
            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setIsPackageModalOpen(false)} className="border-white/10 text-white">Batal</Button>
              <Button type="submit" disabled={isCreating || isUpdatingPkg} className="bg-primary text-primary-foreground font-bold uppercase">
                {(isCreating || isUpdatingPkg) && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {editingPackage ? "Simpan" : "Tambah"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Package Confirm Dialog */}
      <Dialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
        <DialogContent className="bg-card border-white/10 sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-display uppercase tracking-wider text-destructive">Hapus Paket</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Hapus <span className="text-white font-semibold">"{deleteTarget?.name}"</span>? Tindakan ini tidak bisa dibatalkan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteConfirmOpen(false)} className="border-white/10 text-white">Batal</Button>
            <Button variant="destructive" disabled={isDeleting} onClick={() => deleteTarget && deletePackage({ id: deleteTarget.id })} className="font-bold uppercase">
              {isDeleting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}Hapus
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
