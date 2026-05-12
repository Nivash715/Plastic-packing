// production.weekly-report.jsx (converted from TSX to JSX)
import { createFileRoute } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Section, Stat } from "@/components/PageHelpers";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, LineChart, Line,
} from "recharts";

export const Route = createFileRoute("/production/weekly-report")({
  head: () => ({ meta: [{ title: "Weekly Report — BrushPack" }] }),
  component: Page,
});

const data = [
  { d: "Mon", received: 8400,  packed: 8200  },
  { d: "Tue", received: 9600,  packed: 9450  },
  { d: "Wed", received: 8950,  packed: 8800  },
  { d: "Thu", received: 10400, packed: 10200 },
  { d: "Fri", received: 11300, packed: 11100 },
  { d: "Sat", received: 9900,  packed: 9700  },
  { d: "Sun", received: 5400,  packed: 5200  },
];

const efficiency = data.map((x) => ({
  d: x.d,
  e: +(100 * x.packed / x.received).toFixed(1),
}));

function Page() {
  return (
    <DashboardLayout title="Weekly Report" subtitle="Packing trends, line efficiency and dispatch summary.">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6">
        <Stat label="Tips Received" value="63,950" hint="This week" />
        <Stat label="Units Packed"  value="62,650" hint="98.0% yield" />
        <Stat label="Avg. Efficiency" value="98.0%" hint="+0.4% vs last week" />
      </div>

      <Section title="Received vs Packed (units)">
        <div className="h-56 sm:h-72">
          <ResponsiveContainer>
            <BarChart data={data} margin={{ top: 5, right: 5, left: -15, bottom: 0 }}>
              <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="d" tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
              <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="received" name="Received" fill="#0d7377" radius={[6, 6, 0, 0]} />
              <Bar dataKey="packed"   name="Packed"   fill="#d97706"  radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Section>

      <div className="h-5 sm:h-6" />

      <Section title="Daily Efficiency (%)">
        <div className="h-48 sm:h-64">
          <ResponsiveContainer>
            <LineChart data={efficiency} margin={{ top: 5, right: 5, left: -15, bottom: 0 }}>
              <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="d" tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
              <YAxis domain={[95, 100]} tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12 }} />
              <Line
                type="monotone"
                dataKey="e"
                name="Efficiency %"
                stroke="#0d7377"
                strokeWidth={3}
                dot={{ r: 4, fill: "#d97706" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Section>
    </DashboardLayout>
  );
}
