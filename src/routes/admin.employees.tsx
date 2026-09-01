import React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Users, ShieldCheck, Wrench, LayoutDashboard } from "lucide-react";

import { Eyebrow } from "@/components/fleet/brand";
import { SiteFooter, SiteHeader } from "@/components/fleet/site-chrome";
import { employeeService } from "@/lib/services";
import { ProtectedRoute } from "@/components/auth/protected-route";

export const Route = createFileRoute("/admin/employees")({
  head: () => ({
    meta: [
      { title: "Employee Staff Roster — FleetFlow Admin" },
      {
        name: "description",
        content: "Manage operational headcount, salesperson targets, and mechanics roster.",
      },
    ],
  }),
  component: AdminEmployees,
});

function AdminEmployees() {
  const { data: employees, isPending } = useQuery({
    queryKey: ["employees", "admin-list"],
    queryFn: () => employeeService.list(),
  });

  return (
    <ProtectedRoute allowedRoles={["Manager", "Salesperson"]}>
      <div className="min-h-screen bg-background text-foreground flex flex-col">
        <SiteHeader />

        <main className="flex-1 mx-auto max-w-7xl w-full px-4 sm:px-8 py-10 space-y-8">
          <div className="border-b border-border/80 pb-6">
            <Eyebrow>HUMAN RESOURCES & STAFFING</Eyebrow>
            <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-foreground">
              Fleet Operations Staff Roster
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Sales team targets, mechanics specializations, and hub manager assignments.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-surface border border-border space-y-4">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-border/80 uppercase text-[10px] text-muted-foreground tracking-wider bg-surface-2/50">
                  <tr>
                    <th className="p-3">Emp ID</th>
                    <th className="p-3">Staff Member</th>
                    <th className="p-3">Role</th>
                    <th className="p-3">Hub Branch</th>
                    <th className="p-3">Target / Specialization</th>
                    <th className="p-3">Joined Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {isPending ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-muted-foreground">Loading employee roster...</td>
                    </tr>
                  ) : employees?.map((e) => (
                    <tr key={e.id} className="hover:bg-surface-2/50 transition-colors">
                      <td className="p-3 font-mono font-bold text-foreground">{e.id}</td>
                      <td className="p-3">
                        <div className="font-semibold text-foreground">{e.name}</div>
                        <div className="text-[10px] text-muted-foreground">{e.email}</div>
                      </td>
                      <td className="p-3">
                        <span className="text-xs font-semibold px-2.5 py-0.5 rounded bg-primary/20 text-primary border border-primary/30">
                          {e.role}
                        </span>
                      </td>
                      <td className="p-3 text-muted-foreground">{e.branch}</td>
                      <td className="p-3 text-muted-foreground font-mono">
                        {e.role === "Salesperson"
                          ? `₹${((e as any).achieved || 1542000).toLocaleString("en-IN")} Target`
                          : e.role === "Mechanic"
                          ? (e as any).specialization || "EV Powertrain"
                          : "Fleet Ops Control"}
                      </td>
                      <td className="p-3 text-muted-foreground">{e.joinedAt}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>

        <SiteFooter />
      </div>
    </ProtectedRoute>
  );
}
