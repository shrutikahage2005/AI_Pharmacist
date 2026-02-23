import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Legend } from "recharts";
import { getDiseaseMatrix } from "@/data/orderHistory";

const COLORS = [
  "hsl(168, 76%, 36%)", "hsl(210, 80%, 50%)", "hsl(38, 92%, 50%)", "hsl(280, 65%, 60%)",
];

export default function DiseaseMatrix() {
  const matrix = getDiseaseMatrix();

  const chartData = matrix.map(item => ({
    category: item.category,
    "18-30": item.ageDistribution["18-30"],
    "31-45": item.ageDistribution["31-45"],
    "46-60": item.ageDistribution["46-60"],
    "61+": item.ageDistribution["61+"],
    total: item.patient_count,
  }));

  return (
    <div className="space-y-4">
      <ResponsiveContainer width="100%" height={350}>
        <BarChart data={chartData} margin={{ left: 10, right: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(210, 15%, 89%)" />
          <XAxis dataKey="category" tick={{ fontSize: 11 }} angle={-20} textAnchor="end" height={80} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip contentStyle={{ background: "hsl(0, 0%, 100%)", border: "1px solid hsl(210, 15%, 89%)", borderRadius: "8px" }} />
          <Legend />
          <Bar dataKey="18-30" stackId="a" fill={COLORS[0]} radius={[0, 0, 0, 0]} />
          <Bar dataKey="31-45" stackId="a" fill={COLORS[1]} />
          <Bar dataKey="46-60" stackId="a" fill={COLORS[2]} />
          <Bar dataKey="61+" stackId="a" fill={COLORS[3]} radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>

      {/* Matrix table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-2 px-3 font-medium text-muted-foreground">Condition</th>
              <th className="text-center py-2 px-3 font-medium text-muted-foreground">18-30</th>
              <th className="text-center py-2 px-3 font-medium text-muted-foreground">31-45</th>
              <th className="text-center py-2 px-3 font-medium text-muted-foreground">46-60</th>
              <th className="text-center py-2 px-3 font-medium text-muted-foreground">61+</th>
              <th className="text-center py-2 px-3 font-medium text-muted-foreground">Total</th>
            </tr>
          </thead>
          <tbody>
            {chartData.map((row, i) => (
              <tr key={i} className="border-b border-border/50 hover:bg-muted/50 transition-colors">
                <td className="py-2 px-3 font-medium">{row.category}</td>
                <td className="text-center py-2 px-3">{row["18-30"] || "—"}</td>
                <td className="text-center py-2 px-3">{row["31-45"] || "—"}</td>
                <td className="text-center py-2 px-3">{row["46-60"] || "—"}</td>
                <td className="text-center py-2 px-3">{row["61+"] || "—"}</td>
                <td className="text-center py-2 px-3 font-semibold">{row.total}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
