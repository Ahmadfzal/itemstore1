import { Link } from "wouter";
import { Zap, Diamond, Coins } from "lucide-react";
import { motion } from "framer-motion";
import { useSettings } from "@/context/settings-context";

interface PackageCardProps {
  pkg: {
    id: number;
    name: string;
    description: string;
    amount: number;
    price: number;
    currency: string;
    category: string;
    popular: boolean;
    unit?: string;
  };
  index: number;
}

export function PackageCard({ pkg, index }: PackageCardProps) {
  const { settings } = useSettings();
  const unit = (pkg as any).unit || settings.packageUnit || "Diamond";

  const getIcon = () => {
    const u = unit.toLowerCase();
    if (u.includes("diamond") || u.includes("gem")) return <Diamond className="w-6 h-6 text-primary" />;
    if (u.includes("coin") || u.includes("koin") || u.includes("gold")) return <Coins className="w-6 h-6 text-amber-400" />;
    return <Zap className="w-6 h-6 text-secondary" />;
  };

  const formattedPrice = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(pkg.price);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
    >
      <Link href={`/checkout/${pkg.id}`} className="block h-full group">
        <div className="relative h-full flex flex-col glass-panel rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-neon group-hover:border-primary/50">

          {pkg.popular && (
            <div className="absolute -top-3 -right-3">
              <div className="relative">
                <div className="absolute inset-0 bg-green-500 blur-md opacity-40 rounded-full" />
                <div className="relative flex items-center justify-center px-2.5 py-1 bg-green-500 rounded-full border-2 border-background text-white shadow-lg">
                  <span className="text-[10px] font-black uppercase tracking-widest">Diskon</span>
                </div>
              </div>
            </div>
          )}

          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-background/50 flex items-center justify-center border border-white/5 group-hover:bg-primary/10 transition-colors duration-300">
              {getIcon()}
            </div>
            <div className="px-3 py-1 rounded-full bg-white/5 text-xs font-semibold uppercase tracking-wider text-muted-foreground border border-white/10">
              {pkg.category}
            </div>
          </div>

          <div className="mb-6 flex-1">
            <h3 className="font-display text-xl font-bold text-foreground mb-1 group-hover:text-primary transition-colors">
              {pkg.name}
            </h3>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {pkg.description}
            </p>
            <div className="mt-4 flex items-baseline gap-1.5">
              <span className="text-3xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-white/70">
                {pkg.amount.toLocaleString("id-ID")}
              </span>
              <span className="text-sm font-semibold text-primary uppercase tracking-wider">
                {unit}
              </span>
            </div>
          </div>

          <div className="mt-auto pt-4 border-t border-white/10 flex items-center justify-between">
            <div className="font-display text-lg font-bold text-white">
              {formattedPrice}
            </div>
            <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
              <Zap className="w-4 h-4" />
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
