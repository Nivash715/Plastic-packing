// ststus.jsx — Stock Status / Contractor Orders (converted from TSX to JSX)
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Section, Pill, Btn } from "@/components/PageHelpers";
import { PackagePlus, FileText } from "lucide-react";

export const Route = createFileRoute("/ststus")({
  head: () => ({ meta: [{ title: "Stock Status — BrushPack" }] }),
  component: Page,
});

const initialRequests = [
  { id: "REQ-2055", contractor: "Prime Manufacturing Ltd.", date: "08 May 2026", items: "Round Tip 12mm (5,000 units)",   bill: "BILL-882", status: "Pending"  },
  { id: "REQ-2054", contractor: "Plastix Industries",       date: "05 May 2026", items: "Plastic Sleeves (10,000 units)", bill: "BILL-879", status: "Received" },
  { id: "REQ-2053", contractor: "TimberWorks Co.",          date: "02 May 2026", items: "Wooden Handles (2,500 units)",   bill: "BILL-870", status: "Pending"  },
  { id: "REQ-2052", contractor: "Prime Manufacturing Ltd.", date: "28 Apr 2026", items: "Flat Tip 18mm (3,000 units)",    bill: "BILL-865", status: "Received" },
];

function Page() {
  const [requests, setRequests] = useState(initialRequests);

  const toggleStatus = (id) => {
    setRequests((prev) =>
      prev.map((r) => r.id === id
        ? { ...r, status: r.status === "Pending" ? "Received" : "Pending" }
        : r
      )
    );
  };

  return (
    <DashboardLayout title="Stock Status" subtitle="Track requested stocks and contractor bills.">
      <Section
        title="Contractor Orders"
        action={<Btn variant="accent"><PackagePlus className="h-4 w-4" /> Request Stock</Btn>}
      >
        <div className="overflow-x-auto -mx-4 sm:-mx-6">
          <table className="w-full text-sm min-w-[620px]">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground border-b border-border">
                <th className="px-4 sm:px-6 py-3">Req #</th>
                <th className="px-4 sm:px-6 py-3">Contractor</th>
                <th className="px-4 sm:px-6 py-3">Date</th>
                <th className="px-4 sm:px-6 py-3">Requested Stocks</th>
                <th className="px-4 sm:px-6 py-3">Bill</th>
                <th className="px-4 sm:px-6 py-3">Status</th>
                <th className="px-4 sm:px-6 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((req) => (
                <tr key={req.id} className="border-b border-border/60 last:border-0 hover:bg-secondary/30 transition">
                  <td className="px-4 sm:px-6 py-3 font-medium whitespace-nowrap">{req.id}</td>
                  <td className="px-4 sm:px-6 py-3 whitespace-nowrap">{req.contractor}</td>
                  <td className="px-4 sm:px-6 py-3 text-muted-foreground whitespace-nowrap">{req.date}</td>
                  <td className="px-4 sm:px-6 py-3">{req.items}</td>
                  <td className="px-4 sm:px-6 py-3">
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <FileText className="h-4 w-4" />
                      <span className="text-foreground">{req.bill}</span>
                    </div>
                  </td>
                  <td className="px-4 sm:px-6 py-3">
                    <Pill tone={req.status === "Received" ? "success" : "warn"}>{req.status}</Pill>
                  </td>
                  <td className="px-4 sm:px-6 py-3 text-right">
                    <Btn variant="ghost" className="text-xs" onClick={() => toggleStatus(req.id)}>
                      {req.status === "Pending" ? "Mark Received" : "Details"}
                    </Btn>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>
    </DashboardLayout>
  );
}
