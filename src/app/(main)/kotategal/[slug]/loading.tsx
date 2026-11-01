import { Loader2 } from "lucide-react";

export default function LoadingKotaTegalKomunitas() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center p-8 min-h-[50vh] gap-3">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="text-sm text-muted-foreground font-medium">
        Memuat profil komunitas...
      </p>
    </div>
  );
}

