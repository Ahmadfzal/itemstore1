import { useRoute, useLocation } from "wouter";
import { useUploadOrderProof } from "@workspace/api-client-react";
import { useState, useRef } from "react";
import { Upload, CheckCircle2, Building2, Copy, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

export default function Proof() {
  const [, params] = useRoute("/order/:id/proof");
  const orderId = params?.id ? parseInt(params.id, 10) : 0;
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { mutate: uploadProof, isPending } = useUploadOrderProof({
    mutation: {
      onSuccess: () => {
        setIsSuccess(true);
        toast({
          title: "Transmission Complete",
          description: "Payment proof uploaded successfully. Awaiting admin verification.",
        });
      },
      onError: (error) => {
        toast({
          variant: "destructive",
          title: "Upload Failed",
          description: (error as { error?: { error?: string } }).error?.error || "Could not upload proof.",
        });
      }
    }
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      if (selected.size > 5 * 1024 * 1024) {
        toast({ variant: "destructive", title: "File too large", description: "Max size is 5MB" });
        return;
      }
      setFile(selected);
      const reader = new FileReader();
      reader.onload = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(selected);
    }
  };

  const handleSubmit = () => {
    if (!previewUrl) return;
    uploadProof({
      id: orderId,
      data: { proofImageUrl: previewUrl }
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard",
      description: "Bank account number copied.",
    });
  };

  if (isSuccess) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-lg mx-auto mt-12 text-center"
      >
        <div className="glass-panel p-10 rounded-3xl border border-primary/30 shadow-neon">
          <div className="w-24 h-24 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-12 h-12 text-primary" />
          </div>
          <h2 className="text-3xl font-display font-bold text-white mb-4">Payment Verified</h2>
          <p className="text-muted-foreground mb-8">
            Your transaction proof has been received. Our automated systems will verify the payment and deploy your credits shortly. Order ID: #{orderId}
          </p>
          <Button 
            onClick={() => setLocation("/")}
            className="w-full h-12 text-lg font-display uppercase tracking-widest bg-white/10 hover:bg-white/20 text-white"
          >
            Return to Base
          </Button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-display font-bold text-white mb-2 uppercase tracking-wider">
          Awaiting <span className="text-primary text-glow">Payment</span>
        </h2>
        <p className="text-muted-foreground">Order #{orderId} has been generated.</p>
      </div>

      <div className="space-y-6">
        {/* Bank Instructions */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel p-6 rounded-2xl border border-secondary/30 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/10 blur-[50px] rounded-full" />
          
          <div className="flex items-center gap-3 mb-6">
            <Building2 className="w-6 h-6 text-secondary" />
            <h3 className="font-display font-bold text-lg text-white">Transfer Coordinates</h3>
          </div>

          <div className="bg-background/80 rounded-xl p-5 border border-white/5 space-y-4 relative z-10">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Bank</p>
              <p className="font-bold text-white">Bank Central Asia (BCA)</p>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Account Number</p>
                <p className="font-display text-2xl font-bold text-secondary text-glow-magenta tracking-widest">
                  1234567890
                </p>
              </div>
              <Button 
                variant="outline" 
                size="icon" 
                onClick={() => copyToClipboard("1234567890")}
                className="bg-white/5 border-white/10 hover:bg-secondary/20 hover:text-secondary hover:border-secondary/50"
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>

            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Account Name</p>
              <p className="font-bold text-white">NEXUS GAME STORE</p>
            </div>
          </div>
        </motion.div>

        {/* Upload Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-panel p-6 rounded-2xl border border-white/10"
        >
          <h3 className="font-display font-bold text-lg text-white mb-4">Upload Proof of Transmission</h3>
          
          <div 
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-300 ${
              previewUrl 
                ? "border-primary/50 bg-primary/5" 
                : "border-white/20 hover:border-primary hover:bg-white/5"
            }`}
          >
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/jpeg,image/png,image/jpg"
              onChange={handleFileChange}
            />
            
            {previewUrl ? (
              <div className="space-y-4">
                <div className="w-full h-48 relative rounded-lg overflow-hidden border border-white/10">
                  <img src={previewUrl} alt="Proof preview" className="w-full h-full object-contain bg-black/50" />
                </div>
                <p className="text-sm text-primary font-semibold">Tap to select a different file</p>
              </div>
            ) : (
              <div className="space-y-4 py-6">
                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto">
                  <Upload className="w-8 h-8 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-semibold text-white mb-1">Click to browse or drag image here</p>
                  <p className="text-xs text-muted-foreground">JPG, PNG up to 5MB</p>
                </div>
              </div>
            )}
          </div>

          <div className="mt-6">
            <Button 
              onClick={handleSubmit} 
              disabled={!previewUrl || isPending}
              className="w-full h-14 text-lg font-display tracking-widest bg-primary text-primary-foreground hover:shadow-neon transition-all disabled:opacity-50"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  UPLOADING...
                </>
              ) : (
                <>
                  <Upload className="w-5 h-5 mr-2" />
                  SUBMIT TRANSMISSION
                </>
              )}
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
