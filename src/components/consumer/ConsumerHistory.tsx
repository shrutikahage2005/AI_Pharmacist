import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Package, Calendar, DollarSign, Pill, AlertTriangle, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Order {
  id: string;
  items: any;
  status: string;
  total_price: number;
  created_at: string;
  prescription_verified: boolean;
}

export default function ConsumerHistory() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetchOrders = async () => {
      const { data } = await supabase
        .from("orders")
        .select("*")
        .eq("patient_id", user.id)
        .order("created_at", { ascending: false });
      setOrders(data || []);
      setLoading(false);
    };
    fetchOrders();
  }, [user]);

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center h-full">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  const statusConfig: Record<string, { color: string; badge: "default" | "secondary" | "destructive" | "outline" }> = {
    confirmed: { color: "text-green-600", badge: "default" },
    pending: { color: "text-yellow-600", badge: "secondary" },
    cancelled: { color: "text-red-600", badge: "destructive" },
  };

  return (
    <div className="p-4 lg:p-6 overflow-y-auto h-full scrollbar-thin">
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-1">Your Order History</h3>
        <p className="text-sm text-muted-foreground">View all your past medicine orders and their status</p>
      </div>

      {orders.length === 0 ? (
        <div className="glass-card rounded-xl p-8 text-center">
          <Package className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground">No orders yet. Chat with PharmaCare AI to place your first order!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order, i) => {
            const items = Array.isArray(order.items) ? order.items : [];
            const config = statusConfig[order.status || "pending"] || statusConfig.pending;
            return (
              <div
                key={order.id}
                className="glass-card rounded-xl p-4 animate-fade-in"
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Package className="w-4 h-4 text-primary" />
                    <span className="font-mono text-sm font-semibold">
                      #{order.id.slice(0, 8).toUpperCase()}
                    </span>
                  </div>
                  <Badge variant={config.badge} className="capitalize">
                    {order.status}
                  </Badge>
                </div>
                <div className="space-y-1">
                  {items.map((item: any, j: number) => (
                    <div key={j} className="flex items-center gap-2 text-sm">
                      <Pill className="w-3.5 h-3.5 text-muted-foreground" />
                      <span>{item.medicine}</span>
                      <span className="text-muted-foreground">×{item.quantity}</span>
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(order.created_at).toLocaleDateString()}
                  </span>
                  {order.total_price > 0 && (
                    <span className="flex items-center gap-1">
                      <DollarSign className="w-3 h-3" />
                      €{order.total_price.toFixed(2)}
                    </span>
                  )}
                  {order.prescription_verified && (
                    <Badge variant="outline" className="text-[10px]">Rx Verified</Badge>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
