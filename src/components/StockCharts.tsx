import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { medicines, categories } from "@/data/medicines";

const COLORS = [
  "hsl(168, 76%, 36%)", "hsl(210, 80%, 50%)", "hsl(38, 92%, 50%)",
  "hsl(280, 65%, 60%)", "hsl(0, 72%, 51%)", "hsl(168, 76%, 50%)",
  "hsl(210, 60%, 40%)", "hsl(38, 70%, 40%)", "hsl(330, 60%, 50%)",
];

export function StockBarChart() {
  const data = medicines
    .sort((a, b) => a.stock_level - b.stock_level)
    .slice(0, 15)
    .map(m => ({
      name: m.product_name.length > 20 ? m.product_name.slice(0, 18) + "…" : m.product_name,
      stock: m.stock_level,
      fill: m.stock_level < 20 ? "hsl(0, 72%, 51%)" : m.stock_level < 40 ? "hsl(38, 92%, 50%)" : "hsl(168, 76%, 36%)",
    }));

  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={data} layout="vertical" margin={{ left: 20, right: 20 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(210, 15%, 89%)" />
        <XAxis type="number" tick={{ fontSize: 12 }} />
        <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} width={140} />
        <Tooltip
          contentStyle={{ background: "hsl(0, 0%, 100%)", border: "1px solid hsl(210, 15%, 89%)", borderRadius: "8px" }}
        />
        <Bar dataKey="stock" radius={[0, 4, 4, 0]}>
          {data.map((entry, i) => (
            <Cell key={i} fill={entry.fill} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

export function CategoryPieChart() {
  const data = categories.map(cat => ({
    name: cat,
    value: medicines.filter(m => m.category === cat).length,
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie data={data} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={3} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
          {data.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
      </PieChart>
    </ResponsiveContainer>
  );
}

export function StockStatusOverview() {
  const critical = medicines.filter(m => m.stock_level < 20).length;
  const low = medicines.filter(m => m.stock_level >= 20 && m.stock_level < 40).length;
  const ok = medicines.filter(m => m.stock_level >= 40).length;

  const data = [
    { name: "Critical", value: critical, color: "hsl(0, 72%, 51%)" },
    { name: "Low", value: low, color: "hsl(38, 92%, 50%)" },
    { name: "In Stock", value: ok, color: "hsl(168, 76%, 36%)" },
  ];

  return (
    <ResponsiveContainer width="100%" height={200}>
      <PieChart>
        <Pie data={data} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value">
          {data.map((entry, i) => (
            <Cell key={i} fill={entry.color} />
          ))}
        </Pie>
        <Legend />
        <Tooltip />
      </PieChart>
    </ResponsiveContainer>
  );
}
