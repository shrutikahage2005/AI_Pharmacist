import { medicines } from "@/data/medicines";
import { Badge } from "@/components/ui/badge";
import { Package, AlertTriangle, Pill, Search } from "lucide-react";
import { useState } from "react";

export default function InventoryTable() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "low" | "prescription">("all");

  const filtered = medicines.filter(m => {
    const matchSearch = m.product_name.toLowerCase().includes(search.toLowerCase()) || m.category.toLowerCase().includes(search.toLowerCase());
    if (filter === "low") return matchSearch && m.stock_level < 30;
    if (filter === "prescription") return matchSearch && m.prescription_required;
    return matchSearch;
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search medicines..."
            className="w-full bg-secondary rounded-lg pl-10 pr-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground"
          />
        </div>
        <div className="flex gap-2">
          {(["all", "low", "prescription"] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                filter === f ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-muted"
              }`}
            >
              {f === "all" ? "All" : f === "low" ? "⚠️ Low Stock" : "💊 Rx Required"}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted/50">
              <th className="text-left py-3 px-4 font-medium text-muted-foreground">Medicine</th>
              <th className="text-left py-3 px-4 font-medium text-muted-foreground">Category</th>
              <th className="text-right py-3 px-4 font-medium text-muted-foreground">Price</th>
              <th className="text-right py-3 px-4 font-medium text-muted-foreground">Stock</th>
              <th className="text-center py-3 px-4 font-medium text-muted-foreground">Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((m, i) => (
              <tr key={m.product_id} className="border-t border-border/50 hover:bg-muted/30 transition-colors animate-fade-in" style={{ animationDelay: `${i * 20}ms` }}>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <Pill className="w-4 h-4 text-primary flex-shrink-0" />
                    <div>
                      <p className="font-medium">{m.product_name}</p>
                      <p className="text-xs text-muted-foreground">{m.package_size} · PZN: {m.pzn}</p>
                    </div>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <Badge variant="secondary" className="text-xs">{m.category}</Badge>
                </td>
                <td className="py-3 px-4 text-right font-medium">€{m.price.toFixed(2)}</td>
                <td className="py-3 px-4 text-right">
                  <span className={`font-semibold ${m.stock_level < 20 ? "text-destructive" : m.stock_level < 40 ? "text-warning" : "text-primary"}`}>
                    {m.stock_level}
                  </span>
                </td>
                <td className="py-3 px-4 text-center">
                  <div className="flex items-center justify-center gap-1.5">
                    {m.prescription_required && (
                      <Badge variant="outline" className="text-xs border-primary/30 text-primary">Rx</Badge>
                    )}
                    {m.stock_level < 20 && (
                      <AlertTriangle className="w-4 h-4 text-destructive" />
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-muted-foreground">{filtered.length} of {medicines.length} medicines shown</p>
    </div>
  );
}
