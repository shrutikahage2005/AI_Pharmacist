import { Package, AlertTriangle, TrendingUp, Users, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { medicines } from "@/data/medicines";
import { orderHistory, getRefillPredictions } from "@/data/orderHistory";
import { StockBarChart, CategoryPieChart, StockStatusOverview } from "@/components/StockCharts";

export default function AdminDashboard() {
  const totalMeds = medicines.length;
  const lowStock = medicines.filter(m => m.stock_level < 20).length;
  const totalRevenue = orderHistory.reduce((s, o) => s + o.total_price, 0);
  const criticalRefills = getRefillPredictions().filter(p => p.urgency === "critical").length;

  const stats = [
    { label: "Total Medicines", value: totalMeds, icon: Package, trend: "+3", up: true, color: "text-primary" },
    { label: "Low Stock Items", value: lowStock, icon: AlertTriangle, trend: lowStock > 0 ? `${lowStock} items` : "None", up: false, color: "text-destructive" },
    { label: "Revenue (Sample)", value: `€${totalRevenue.toFixed(0)}`, icon: TrendingUp, trend: "+12%", up: true, color: "text-primary" },
    { label: "Critical Refills", value: criticalRefills, icon: Users, trend: criticalRefills > 0 ? "Needs attention" : "All good", up: criticalRefills === 0, color: criticalRefills > 0 ? "text-warning" : "text-primary" },
  ];

  return (
    <div className="p-4 lg:p-6 space-y-6 overflow-y-auto h-full scrollbar-thin">
      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <div key={i} className="glass-card rounded-xl p-5 animate-fade-in" style={{ animationDelay: `${i * 80}ms` }}>
            <div className="flex items-start justify-between mb-3">
              <div className={`w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center ${stat.color}`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <div className={`flex items-center gap-1 text-xs font-medium ${stat.up ? "text-primary" : "text-destructive"}`}>
                {stat.up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                {stat.trend}
              </div>
            </div>
            <p className="text-2xl font-bold">{stat.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass-card rounded-xl p-5 animate-fade-in">
          <h3 className="font-semibold mb-4">Stock Levels (Lowest First)</h3>
          <StockBarChart />
        </div>
        <div className="glass-card rounded-xl p-5 animate-fade-in">
          <h3 className="font-semibold mb-4">Stock Health</h3>
          <StockStatusOverview />
          <div className="mt-4">
            <h4 className="text-sm font-medium mb-3">Category Distribution</h4>
            <CategoryPieChart />
          </div>
        </div>
      </div>
    </div>
  );
}
