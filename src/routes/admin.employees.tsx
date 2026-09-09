import React, { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Users, Shield, Wrench, LayoutDashboard, GitBranch, Search, X, Eye } from "lucide-react";

import { Eyebrow } from "@/components/fleet/brand";
import { SiteFooter, SiteHeader } from "@/components/fleet/site-chrome";
import { employeeService } from "@/lib/services";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { PresentationBar } from "@/components/fleet/presentation-bar";
import { Button } from "@/components/ui/button";
import { inr } from "@/lib/format";
import type { Employee } from "@/types";

export const Route = createFileRoute("/admin/employees")({
  head: () => ({
    meta: [
      { title: "Employee Staff Roster — Manager Portal" },
      {
        name: "description",
        content: "Manager staff administration: ISA Employee Specialization Hierarchy (Salespersons, Mechanics, Managers).",
      },
    ],
  }),
  component: AdminEmployees,
});

function AdminEmployees() {
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

  const { data: employees, isPending } = useQuery({
    queryKey: ["employees", "admin-list"],
    queryFn: () => employeeService.list(),
  });

  const filteredEmployees = employees?.filter((e) => {
    const q = searchTerm.toLowerCase();
    const matchesSearch =
      e.name.toLowerCase().includes(q) ||
      e.id.toLowerCase().includes(q) ||
      e.email.toLowerCase().includes(q) ||
      e.role.toLowerCase().includes(q);
    const matchesRole = roleFilter === "all" ? true : e.role.toLowerCase() === roleFilter.toLowerCase();
    return matchesSearch && matchesRole;
  });

  return (
    <ProtectedRoute allowedRoles={["Manager"]}>
      <div className="min-h-screen bg-background text-foreground flex flex-col">
        <PresentationBar />
        <SiteHeader />

        <main className="flex-1 mx-auto max-w-7xl w-full px-4 sm:px-8 py-10 space-y-8">
          <div className="border-b border-border/80 pb-6 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Eyebrow>HUMAN RESOURCES & STAFFING</Eyebrow>
                <span className="text-[10px] font-mono uppercase font-bold px-2.5 py-0.5 rounded bg-primary/20 text-primary">
                  ISA SPECIALIZATION HIERARCHY
                </span>
              </div>
              <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-foreground flex items-center gap-2">
                <Users className="w-7 h-7 text-primary" /> Employee Roster & Role Hierarchy
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Staff administration displaying ISA specialization attributes (Salesperson Target/Commission, Mechanic Specialization/Shift, Manager Branch-ID).
              </p>
            </div>
          </div>

          {/* ISA Specialization Hierarchy Visualizer Banner */}
          <div className="p-6 rounded-2xl bg-surface border border-border space-y-4 shadow-xl">
            <div className="flex items-center gap-2 text-xs font-bold text-foreground font-mono">
              <GitBranch className="w-4 h-4 text-primary" /> DBMS Model: ISA Employee Specialization Hierarchy
            </div>

            <div className="grid gap-4 md:grid-cols-3 text-xs font-mono">
              <div className="p-4 rounded-xl bg-surface-2 border border-primary/40 space-y-2">
                <div className="font-bold text-primary flex items-center gap-1.5">
                  <Shield className="w-4 h-4" /> SALESPERSON (Subclass)
                </div>
                <div className="text-[11px] text-muted-foreground">E-ID (PK, FK → Employee), Target, Commission</div>
                <div className="text-[10px] text-primary font-bold">M:N BOOKS Relation with Customer</div>
              </div>

              <div className="p-4 rounded-xl bg-surface-2 border border-purple-500/40 space-y-2">
                <div className="font-bold text-purple-400 flex items-center gap-1.5">
                  <Wrench className="w-4 h-4" /> MECHANIC (Subclass)
                </div>
                <div className="text-[11px] text-muted-foreground">E-ID (PK, FK → Employee), Specialization, Shift</div>
                <div className="text-[10px] text-purple-400 font-bold">M:N SERVICES Relation with Vehicle</div>
              </div>

              <div className="p-4 rounded-xl bg-surface-2 border border-success/40 space-y-2">
                <div className="font-bold text-success flex items-center gap-1.5">
                  <LayoutDashboard className="w-4 h-4" /> MANAGER (Subclass)
                </div>
                <div className="text-[11px] text-muted-foreground">E-ID (PK, FK → Employee), Branch-ID</div>
                <div className="text-[10px] text-success font-bold">Full Enterprise Operations Authority</div>
              </div>
            </div>
          </div>

          {/* Search & Filter Controls */}
          <div className="p-4 rounded-2xl bg-surface border border-border flex flex-wrap items-center justify-between gap-4 shadow-md">
            <div className="relative max-w-xs w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by E-ID, name, role..."
                className="w-full rounded-lg bg-surface-2 border border-border pl-9 pr-3 py-2 text-xs text-foreground focus:outline-hidden font-mono"
              />
            </div>

            <div className="flex gap-2">
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="rounded-lg bg-surface-2 border border-border px-3 py-2 text-xs text-foreground font-semibold"
              >
                <option value="all">All Employee Subclasses</option>
                <option value="salesperson">Salesperson Subclass</option>
                <option value="mechanic">Mechanic Subclass</option>
                <option value="manager">Manager Subclass</option>
              </select>
            </div>
          </div>

          {/* Employee Roster Data Table */}
          <div className="p-6 rounded-2xl bg-surface border border-border space-y-4 shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="border-b border-border/80 uppercase text-[10px] text-muted-foreground tracking-wider bg-surface-2/50">
                  <tr>
                    <th className="p-3">E-ID</th>
                    <th className="p-3 font-sans">Staff Member</th>
                    <th className="p-3 font-sans">ISA Subclass Role</th>
                    <th className="p-3">Branch-ID</th>
                    <th className="p-3 font-sans">ISA Role Attributes</th>
                    <th className="p-3 text-right font-sans">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {isPending ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-muted-foreground font-sans">Loading employee roster...</td>
                    </tr>
                  ) : filteredEmployees?.map((e) => (
                    <tr key={e.id} className="hover:bg-surface-2/50 transition-colors">
                      <td className="p-3 font-bold text-foreground">{e.id}</td>
                      <td className="p-3 font-sans">
                        <div className="font-semibold text-foreground">{e.name}</div>
                        <div className="text-[10px] text-muted-foreground font-mono">{e.email}</div>
                      </td>
                      <td className="p-3 font-sans">
                        <span className={`text-xs font-semibold px-2.5 py-0.5 rounded border ${
                          e.role === "Salesperson" ? "bg-primary/20 text-primary border-primary/30" :
                          e.role === "Mechanic" ? "bg-purple-500/20 text-purple-400 border-purple-500/30" :
                          "bg-success/20 text-success border-success/30"
                        }`}>
                          {e.role}
                        </span>
                      </td>
                      <td className="p-3 text-muted-foreground">{e.branch || "BR-101"}</td>
                      <td className="p-3 font-sans text-muted-foreground">
                        {e.role === "Salesperson"
                          ? `Target: ₹18,00,000 | Comm: 3.5%`
                          : e.role === "Mechanic"
                          ? `Spec: EV Powertrain | Shift: Morning`
                          : `Manager Branch-ID: BR-101`}
                      </td>
                      <td className="p-3 text-right font-sans">
                        <Button size="sm" variant="outline" className="h-6 text-[10px]" onClick={() => setSelectedEmployee(e)}>
                          <Eye className="w-3 h-3 mr-1" /> View Profile
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>

        <SiteFooter />

        {/* MODAL: VIEW EMPLOYEE ISA DETAILS */}
        {selectedEmployee && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-rise">
            <div className="bg-surface border border-border rounded-3xl shadow-2xl max-w-md w-full p-6 space-y-4 font-mono text-xs">
              <div className="flex items-center justify-between border-b border-border/80 pb-3">
                <h3 className="font-display font-bold text-base text-foreground font-sans">Employee Staff Profile</h3>
                <button onClick={() => setSelectedEmployee(null)} className="p-1 text-muted-foreground hover:text-foreground">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-2 p-4 rounded-xl bg-surface-2 border border-border">
                <div className="flex justify-between"><span className="text-muted-foreground">Staff E-ID:</span><strong className="text-foreground font-bold">{selectedEmployee.id}</strong></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Full Name:</span><strong className="font-sans font-bold">{selectedEmployee.name}</strong></div>
                <div className="flex justify-between"><span className="text-muted-foreground">ISA Role Subclass:</span><strong className="text-primary font-sans">{selectedEmployee.role}</strong></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Branch-ID:</span><strong>{selectedEmployee.branch || "BR-101"}</strong></div>

                {selectedEmployee.role === "Salesperson" && (
                  <div className="pt-2 border-t border-border/60 space-y-1 font-sans">
                    <div className="flex justify-between text-primary"><span>Sales Target:</span><strong>₹18,00,000</strong></div>
                    <div className="flex justify-between text-success"><span>Achieved:</span><strong>₹15,42,000 (85.6%)</strong></div>
                    <div className="flex justify-between text-foreground"><span>Commission Rate:</span><strong>3.5% (Earned ₹53,970)</strong></div>
                  </div>
                )}

                {selectedEmployee.role === "Mechanic" && (
                  <div className="pt-2 border-t border-border/60 space-y-1 font-sans">
                    <div className="flex justify-between text-purple-400"><span>Specialization:</span><strong>EV & Powertrain Systems</strong></div>
                    <div className="flex justify-between text-foreground"><span>Shift:</span><strong>Morning (08:00 - 16:00)</strong></div>
                  </div>
                )}
              </div>

              <div className="pt-2 flex justify-end font-sans">
                <Button size="sm" onClick={() => setSelectedEmployee(null)}>Close Profile</Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
