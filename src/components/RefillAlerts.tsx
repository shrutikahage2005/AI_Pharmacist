import { AlertTriangle, Clock, CheckCircle, Bell, RefreshCw } from "lucide-react";
import { getRefillPredictions } from "@/data/orderHistory";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function RefillAlerts() {
  const predictions = getRefillPredictions();

  const urgencyConfig = {
    critical: { icon: AlertTriangle, color: "bg-destructive/10 text-destructive border-destructive/20", badge: "destructive" as const, label: "Urgent Refill" },
    warning: { icon: Clock, color: "bg-warning/10 text-warning border-warning/20", badge: "secondary" as const, label: "Refill Soon" },
    ok: { icon: CheckCircle, color: "bg-accent text-accent-foreground border-border", badge: "outline" as const, label: "Adequate" },
  };

  return (
    <div className="space-y-3">
      {predictions.map((p, i) => {
        const config = urgencyConfig[p.urgency];
        const Icon = config.icon;
        return (
          <div key={i} className={`flex items-center gap-4 p-4 rounded-xl border ${config.color} animate-fade-in`} style={{ animationDelay: `${i * 50}ms` }}>
            <Icon className="w-5 h-5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-semibold text-sm">{p.patient_id}</span>
                <Badge variant={config.badge} className="text-xs">{config.label}</Badge>
              </div>
              <p className="text-sm truncate">{p.product_name}</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Last purchased: {p.last_purchase} · {p.dosage_frequency} · {p.days_since} days ago
              </p>
            </div>
            {p.urgency !== "ok" && (
              <Button size="sm" variant="outline" className="flex-shrink-0 gap-1.5">
                <Bell className="w-3.5 h-3.5" />
                Notify
              </Button>
            )}
          </div>
        );
      })}
    </div>
  );
}
