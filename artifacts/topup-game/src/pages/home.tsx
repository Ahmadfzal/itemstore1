import { useListPackages } from "@workspace/api-client-react";
import { PackageCard } from "@/components/package-card";
import { Loader2, Search, Gamepad2 } from "lucide-react";
import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { useSettings } from "@/context/settings-context";

export default function Home() {
  const { data: packages, isLoading, error } = useListPackages();
  const { settings } = useSettings();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("All");

  const categories = useMemo(() => {
    if (!packages) return ["All"];
    const cats = new Set(packages.map(p => p.category));
    return ["All", ...Array.from(cats)].sort();
  }, [packages]);

  const filteredPackages = useMemo(() => {
    if (!packages) return [];
    return packages.filter(pkg => {
      const matchesSearch = pkg.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            pkg.category.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = activeCategory === "All" || pkg.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [packages, searchQuery, activeCategory]);

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
        <p className="text-primary font-display font-semibold tracking-widest animate-pulse">INITIATING UPLINK...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center">
        <div className="w-20 h-20 bg-destructive/20 rounded-full flex items-center justify-center mb-6">
          <Gamepad2 className="w-10 h-10 text-destructive" />
        </div>
        <h2 className="text-3xl font-display font-bold text-foreground mb-2">Connection Lost</h2>
        <p className="text-muted-foreground max-w-md">
          Unable to retrieve available packages from the server. Please try refreshing the page.
        </p>
      </div>
    );
  }

  const heroBg = settings.heroBgImage
    ? settings.heroBgImage
    : `${import.meta.env.BASE_URL}images/hero-bg.png`;

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="relative rounded-3xl overflow-hidden glass-panel border border-white/10 shadow-2xl">
        <div className="absolute inset-0">
          <img 
            src={heroBg}
            alt="Hero Background"
            className="w-full h-full object-cover opacity-40 mix-blend-overlay"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent" />
        </div>
        
        <div className="relative z-10 px-6 py-16 md:py-24 md:px-12 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-semibold uppercase tracking-widest mb-6">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            {settings.heroStatus}
          </div>
          <h2 className="text-5xl md:text-7xl font-display font-extrabold text-white mb-4 leading-tight">
            {settings.heroTitle1} <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary text-glow">{settings.heroTitle2}</span>
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-xl font-sans">
            {settings.heroSubtitle}
          </p>
        </div>
      </section>

      {/* Filters and Search */}
      <section className="space-y-6">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="flex gap-2 overflow-x-auto pb-2 w-full md:w-auto scrollbar-hide">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`whitespace-nowrap px-6 py-2.5 rounded-xl font-semibold tracking-wide transition-all duration-300 ${
                  activeCategory === cat 
                    ? "bg-primary text-primary-foreground shadow-neon" 
                    : "bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-white border border-white/5"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-72 group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
            </div>
            <Input
              type="text"
              placeholder="Search packages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-11 h-12 bg-white/5 border-white/10 focus-visible:ring-primary focus-visible:border-primary rounded-xl"
            />
          </div>
        </div>

        {/* Grid */}
        {filteredPackages && filteredPackages.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredPackages.map((pkg, idx) => (
              <PackageCard key={pkg.id} pkg={pkg} index={idx} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 text-muted-foreground">
            <Gamepad2 className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p className="font-display font-semibold tracking-wider">Tidak ada paket ditemukan</p>
          </div>
        )}
      </section>
    </div>
  );
}
