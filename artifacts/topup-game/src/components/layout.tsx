import { Link, useLocation } from "wouter";
import { Gamepad2, ShieldAlert, LogOut } from "lucide-react";
import { ReactNode } from "react";
import { motion } from "framer-motion";
import { useSettings } from "@/context/settings-context";

export function Layout({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const isAdmin = location.startsWith("/admin");
  const { settings } = useSettings();

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      <div className="fixed inset-0 z-[-1] pointer-events-none opacity-20">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary/20 blur-[120px] rounded-full" />
      </div>

      <header className="sticky top-0 z-50 glass-panel border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative flex items-center justify-center w-12 h-12 rounded-xl bg-card border border-white/10 group-hover:border-primary/50 transition-colors shadow-neon">
                <Gamepad2 className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-display font-bold leading-none tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary uppercase">
                  {settings.storeName}
                </h1>
                <span className="text-xs font-sans text-muted-foreground uppercase tracking-widest font-semibold">
                  Top-Up Station
                </span>
              </div>
            </Link>

            <nav className="flex items-center gap-4">
              {isAdmin && (
                <Link
                  href="/"
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold bg-white/5 hover:bg-white/10 text-foreground transition-all duration-200"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Keluar Admin</span>
                </Link>
              )}
            </nav>
          </div>
        </div>
      </header>

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <motion.div
          key={location}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          {children}
        </motion.div>
      </main>

      <footer className="mt-auto border-t border-white/10 bg-card/40 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Gamepad2 className="w-5 h-5" />
              <span className="font-display font-semibold tracking-wide uppercase">{settings.storeName}</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} {settings.storeName}. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
