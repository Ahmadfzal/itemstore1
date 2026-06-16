import { useRoute, useLocation } from "wouter";
import { useListPackages, useCreateOrder } from "@workspace/api-client-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, ArrowLeft, Gamepad2, MessageCircle, Zap, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useSettings } from "@/context/settings-context";
import { motion } from "framer-motion";
import { useRef, useState } from "react";

const checkoutSchema = z.object({
  gameId: z.string().min(1, "ID Game wajib diisi"),
  username: z.string().optional(),
  customerNotes: z.string().optional(),
  contactPhone: z.string().min(2, "Nama pembeli wajib diisi"),
});

type CheckoutFormValues = z.infer<typeof checkoutSchema>;

export default function Checkout() {
  const [, params] = useRoute("/checkout/:id");
  const packageId = params?.id ? parseInt(params.id, 10) : 0;
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { settings } = useSettings();
  const [orderId, setOrderId] = useState<number | null>(null);
  const waWindowRef = useRef<Window | null>(null);

  const { data: packages, isLoading: isLoadingPackages } = useListPackages();
  const pkg = packages?.find((p) => p.id === packageId);

  const { mutate: createOrder, isPending } = useCreateOrder({
    mutation: {
      onSuccess: (data) => {
        setOrderId(data.id);
        const waNumber = settings.whatsappNumber.replace(/\D/g, "");
        if (!waNumber) {
          if (waWindowRef.current) waWindowRef.current.close();
          waWindowRef.current = null;
          toast({ title: "Pesanan dibuat!", description: `No. Order: #${data.id}` });
          return;
        }

        const formVals = form.getValues();
        const formattedPrice = new Intl.NumberFormat("id-ID", {
          style: "currency",
          currency: pkg?.currency || "IDR",
          maximumFractionDigits: 0,
        }).format(pkg?.price ?? 0);

        const message = encodeURIComponent(
          `Halo, saya ingin top-up! 🎮\n\n` +
          `📦 *Paket:* ${pkg?.name} (${pkg?.amount?.toLocaleString("id-ID")} ${(pkg as any)?.unit ?? "Diamond"})\n` +
          `💰 *Harga:* ${formattedPrice}\n` +
          `🎮 *ID Game:* ${formVals.gameId}\n` +
          `👤 *Username:* ${formVals.username || "-"}\n` +
          `📝 *Catatan:* ${formVals.customerNotes || "-"}\n` +
          `👤 *Nama Pembeli:* ${formVals.contactPhone}\n` +
          `🔖 *No. Order:* #${data.id}\n\n` +
          `Mohon konfirmasi pesanan saya. Terima kasih! 🙏`
        );

        const waUrl = `https://wa.me/${waNumber}?text=${message}`;

        // The window was opened synchronously during the click (see onSubmit) so
        // popup blockers don't block it. Redirect it to WhatsApp now.
        if (waWindowRef.current && !waWindowRef.current.closed) {
          waWindowRef.current.location.href = waUrl;
        } else {
          // Fallback: navigate the current tab if the pre-opened window was blocked.
          window.location.href = waUrl;
        }
        waWindowRef.current = null;
      },
      onError: (error) => {
        if (waWindowRef.current) waWindowRef.current.close();
        waWindowRef.current = null;
        toast({
          variant: "destructive",
          title: "Gagal",
          description: (error as { error?: { error?: string } }).error?.error || "Terjadi kesalahan saat memproses pesanan.",
        });
      },
    },
  });

  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: { gameId: "", username: "", customerNotes: "", contactPhone: "" },
  });

  if (isLoadingPackages) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (!pkg) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-display font-bold text-destructive mb-4">Paket Tidak Ditemukan</h2>
        <Button onClick={() => setLocation("/")} variant="outline">Kembali</Button>
      </div>
    );
  }

  if (orderId !== null) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-lg mx-auto mt-8 text-center"
      >
        <div className="glass-panel p-10 rounded-3xl border border-primary/30 shadow-neon">
          <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-primary" />
          </div>
          <h2 className="text-2xl font-display font-bold text-white mb-3">Pesanan Dibuat!</h2>
          <p className="text-muted-foreground mb-2">No. Order: <span className="text-white font-bold">#{orderId}</span></p>
          <p className="text-muted-foreground text-sm mb-8">
            {settings.whatsappNumber
              ? "Kami sudah membuka WhatsApp. Kirimkan pesan untuk konfirmasi pesanan kamu."
              : "Hubungi admin untuk konfirmasi pesanan."}
          </p>
          {settings.whatsappNumber && (
            <Button
              onClick={() => {
                const waNumber = settings.whatsappNumber.replace(/\D/g, "");
                window.open(`https://wa.me/${waNumber}`, "_blank");
              }}
              className="w-full h-12 bg-green-600 hover:bg-green-500 text-white font-bold uppercase tracking-wider gap-2 mb-3"
            >
              <MessageCircle className="w-5 h-5" />
              Buka WhatsApp
            </Button>
          )}
          <Button
            variant="outline"
            onClick={() => setLocation("/")}
            className="w-full h-12 border-white/20 text-muted-foreground hover:text-white"
          >
            Kembali ke Beranda
          </Button>
        </div>
      </motion.div>
    );
  }

  const formattedPrice = new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: pkg.currency || "IDR",
    maximumFractionDigits: 0,
  }).format(pkg.price);

  const onSubmit = (values: CheckoutFormValues) => {
    // Open a blank tab synchronously inside the user gesture so the browser's
    // popup blocker allows it. We redirect it to WhatsApp once the order is created.
    if (settings.whatsappNumber.replace(/\D/g, "")) {
      waWindowRef.current = window.open("", "_blank");
    }
    createOrder({
      data: {
        packageId: pkg.id,
        gameId: values.gameId,
        username: values.username || null,
        customerNotes: values.customerNotes || null,
        contactPhone: values.contactPhone,
      },
    });
  };

  return (
    <div className="max-w-4xl mx-auto">
      <button
        onClick={() => setLocation("/")}
        className="flex items-center gap-2 text-muted-foreground hover:text-primary mb-8 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="font-semibold uppercase tracking-wider text-sm">Kembali</span>
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Form */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-7 space-y-6"
        >
          <div className="glass-panel p-6 md:p-8 rounded-2xl border border-white/10">
            <h2 className="text-2xl font-display font-bold text-white mb-6 flex items-center gap-3">
              <Gamepad2 className="w-6 h-6 text-primary" />
              DATA PEMESANAN
            </h2>

            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="gameId" className="text-muted-foreground uppercase tracking-wider text-xs">
                  ID Game <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="gameId"
                  placeholder="Masukkan ID Game kamu"
                  className="h-12 bg-background/50 border-white/10 focus-visible:ring-primary"
                  {...form.register("gameId")}
                />
                {form.formState.errors.gameId && (
                  <p className="text-destructive text-sm">{form.formState.errors.gameId.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="username" className="text-muted-foreground uppercase tracking-wider text-xs">
                  Username Game <span className="text-muted-foreground text-xs normal-case">(opsional)</span>
                </Label>
                <Input
                  id="username"
                  placeholder="Nama karakter / username in-game"
                  className="h-12 bg-background/50 border-white/10"
                  {...form.register("username")}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="customerNotes" className="text-muted-foreground uppercase tracking-wider text-xs">
                  Catatan <span className="text-muted-foreground text-xs normal-case">(opsional)</span>
                </Label>
                <Textarea
                  id="customerNotes"
                  placeholder="Catatan tambahan untuk pesanan ini..."
                  className="bg-background/50 border-white/10 focus-visible:ring-primary resize-none"
                  rows={3}
                  {...form.register("customerNotes")}
                />
              </div>

              <div className="space-y-2 pt-2 border-t border-white/5">
                <Label htmlFor="contactPhone" className="text-muted-foreground uppercase tracking-wider text-xs">
                  Nama Pembeli <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="contactPhone"
                  placeholder="Nama lengkap kamu"
                  className="h-12 bg-background/50 border-white/10 focus-visible:ring-primary"
                  {...form.register("contactPhone")}
                />
                {form.formState.errors.contactPhone && (
                  <p className="text-destructive text-sm">{form.formState.errors.contactPhone.message}</p>
                )}
              </div>

              <Button
                type="submit"
                disabled={isPending}
                className="w-full h-14 text-lg font-display tracking-widest shadow-neon hover:shadow-neon-hover bg-primary text-primary-foreground transition-all"
              >
                {isPending ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    MEMPROSES...
                  </>
                ) : (
                  <>
                    <MessageCircle className="w-5 h-5 mr-2" />
                    PESAN VIA WHATSAPP
                  </>
                )}
              </Button>

              {settings.whatsappNumber && (
                <p className="text-xs text-center text-muted-foreground">
                  Setelah memesan, kamu akan diarahkan ke WhatsApp untuk konfirmasi.
                </p>
              )}
            </form>
          </div>
        </motion.div>

        {/* Summary */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-5"
        >
          <div className="glass-panel p-6 rounded-2xl border border-white/10 sticky top-24">
            <h3 className="text-lg font-display font-bold text-white mb-6 uppercase tracking-wider pb-4 border-b border-white/10">
              Ringkasan Pesanan
            </h3>

            <div className="flex gap-4 items-center mb-6">
              <div className="w-16 h-16 rounded-xl bg-secondary/20 flex items-center justify-center border border-secondary/30">
                <Zap className="w-8 h-8 text-secondary" />
              </div>
              <div>
                <div className="text-xs font-semibold text-primary uppercase tracking-widest mb-1">{pkg.category}</div>
                <h4 className="font-display font-bold text-xl">{pkg.name}</h4>
              </div>
            </div>

            <div className="space-y-4 mb-8">
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">{(pkg as any)?.unit ?? "Diamond"}</span>
                <span className="font-bold text-white">{pkg.amount.toLocaleString("id-ID")}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Biaya Transfer</span>
                <span className="font-bold text-white">Gratis</span>
              </div>
              <div className="pt-4 border-t border-white/10 flex justify-between items-center">
                <span className="font-display font-bold text-white">TOTAL</span>
                <span className="font-display text-2xl font-bold text-primary text-glow">{formattedPrice}</span>
              </div>
            </div>

            <div className="bg-green-500/10 rounded-xl p-4 border border-green-500/20 flex items-start gap-3">
              <MessageCircle className="w-5 h-5 text-green-400 shrink-0 mt-0.5" />
              <p className="text-xs text-green-300/80 leading-relaxed">
                Pemesanan dilakukan via WhatsApp. Admin akan memproses pesanan kamu setelah konfirmasi.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
