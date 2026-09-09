import React, { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Eyebrow } from "@/components/fleet/brand";
import { SiteFooter, SiteHeader } from "@/components/fleet/site-chrome";
import { PresentationBar } from "@/components/fleet/presentation-bar";
import { Button } from "@/components/ui/button";
import {
  Layers,
  Key,
  Link as LinkIcon,
  ShieldCheck,
  X,
  Info,
  ArrowRight,
  GitBranch,
} from "lucide-react";

export const Route = createFileRoute("/database/er-diagram")({
  head: () => ({
    meta: [
      { title: "Interactive ER Diagram — FleetFlow DBMS Academic Case Study" },
      {
        name: "description",
        content: "Interactive Entity-Relationship visualizer with 11 entities, ISA specialization hierarchy, weak entity dependencies, junction tables, and entity inspectors.",
      },
    ],
  }),
  component: ERDiagramPage,
});

interface EntityDef {
  id: string;
  name: string;
  type: "Strong" | "Weak" | "Subclass (ISA)" | "Junction (M:N)";
  primaryKey: string[];
  foreignKeys: { field: string; refTable: string; refField: string }[];
  attributes: { name: string; type: string; keyType?: "PK" | "FK" | "PK+FK"; constraint?: string }[];
  rationale: string;
  relationships: { label: string; cardinality: "1:1" | "1:N" | "M:N"; target: string }[];
}

const ENTITIES: EntityDef[] = [
  {
    id: "CUSTOMER",
    name: "CUSTOMER",
    type: "Strong",
    primaryKey: ["C-ID"],
    foreignKeys: [],
    attributes: [
      { name: "C-ID", type: "VARCHAR(10)", keyType: "PK", constraint: "NOT NULL" },
      { name: "Name", type: "VARCHAR(50)", constraint: "NOT NULL" },
      { name: "DOB", type: "DATE", constraint: "NOT NULL" },
      { name: "Gender", type: "VARCHAR(10)" },
      { name: "Mob-No", type: "VARCHAR(15)", constraint: "UNIQUE, NOT NULL" },
      { name: "License-No", type: "VARCHAR(20)", constraint: "UNIQUE" },
    ],
    rationale: "Core customer identity record. Mob-No and License-No enforce unique constraints to prevent duplicate driver profiles.",
    relationships: [
      { label: "HAS", cardinality: "1:N", target: "RENTAL AGREEMENT" },
      { label: "PAYS", cardinality: "1:N", target: "PAYMENT" },
      { label: "BOOKS", cardinality: "M:N", target: "SALESPERSON" },
    ],
  },
  {
    id: "EMPLOYEE",
    name: "EMPLOYEE",
    type: "Strong",
    primaryKey: ["E-ID"],
    foreignKeys: [],
    attributes: [
      { name: "E-ID", type: "VARCHAR(10)", keyType: "PK", constraint: "NOT NULL" },
      { name: "Name", type: "VARCHAR(50)", constraint: "NOT NULL" },
      { name: "Salary", type: "DECIMAL(10,2)", constraint: "NOT NULL" },
      { name: "Sex", type: "CHAR(1)" },
      { name: "Mob-No", type: "VARCHAR(15)", constraint: "UNIQUE" },
      { name: "Address", type: "VARCHAR(100)" },
      { name: "State", type: "VARCHAR(30)" },
      { name: "City", type: "VARCHAR(30)" },
      { name: "Pin-No", type: "VARCHAR(10)" },
    ],
    rationale: "Superclass entity for all staff members. Specializes into Salesperson, Mechanic, and Manager via ISA hierarchy.",
    relationships: [
      { label: "ISA Superclass", cardinality: "1:1", target: "SALESPERSON / MECHANIC / MANAGER" },
    ],
  },
  {
    id: "SALESPERSON",
    name: "SALESPERSON",
    type: "Subclass (ISA)",
    primaryKey: ["E-ID"],
    foreignKeys: [{ field: "E-ID", refTable: "EMPLOYEE", refField: "E-ID" }],
    attributes: [
      { name: "E-ID", type: "VARCHAR(10)", keyType: "PK+FK", constraint: "FK → EMPLOYEE" },
      { name: "Target", type: "DECIMAL(12,2)" },
      { name: "Commission", type: "DECIMAL(4,2)" },
    ],
    rationale: "Specialized subclass of Employee handling customer booking requests and sales revenue targets.",
    relationships: [
      { label: "ISA Subclass", cardinality: "1:1", target: "EMPLOYEE" },
      { label: "BOOKS", cardinality: "M:N", target: "CUSTOMER" },
    ],
  },
  {
    id: "MECHANIC",
    name: "MECHANIC",
    type: "Subclass (ISA)",
    primaryKey: ["E-ID"],
    foreignKeys: [{ field: "E-ID", refTable: "EMPLOYEE", refField: "E-ID" }],
    attributes: [
      { name: "E-ID", type: "VARCHAR(10)", keyType: "PK+FK", constraint: "FK → EMPLOYEE" },
      { name: "Specialization", type: "VARCHAR(50)" },
      { name: "Shift", type: "VARCHAR(15)" },
    ],
    rationale: "Specialized subclass of Employee performing diagnostic service work orders on fleet vehicles.",
    relationships: [
      { label: "ISA Subclass", cardinality: "1:1", target: "EMPLOYEE" },
      { label: "SERVICES", cardinality: "M:N", target: "VEHICLE" },
    ],
  },
  {
    id: "MANAGER",
    name: "MANAGER",
    type: "Subclass (ISA)",
    primaryKey: ["E-ID"],
    foreignKeys: [{ field: "E-ID", refTable: "EMPLOYEE", refField: "E-ID" }],
    attributes: [
      { name: "E-ID", type: "VARCHAR(10)", keyType: "PK+FK", constraint: "FK → EMPLOYEE" },
      { name: "Branch-ID", type: "VARCHAR(10)", constraint: "NOT NULL" },
    ],
    rationale: "Specialized subclass of Employee overseeing hub branch operations, fleet utilization, and headcount.",
    relationships: [
      { label: "ISA Subclass", cardinality: "1:1", target: "EMPLOYEE" },
    ],
  },
  {
    id: "VEHICLE",
    name: "VEHICLE",
    type: "Strong",
    primaryKey: ["V-ID"],
    foreignKeys: [],
    attributes: [
      { name: "V-ID", type: "VARCHAR(10)", keyType: "PK", constraint: "NOT NULL" },
      { name: "Type", type: "VARCHAR(30)", constraint: "NOT NULL" },
      { name: "Model", type: "VARCHAR(50)", constraint: "NOT NULL" },
      { name: "Reg-No", type: "VARCHAR(20)", constraint: "UNIQUE, NOT NULL" },
      { name: "Fuel-Type", type: "VARCHAR(15)", constraint: "NOT NULL" },
      { name: "Capacity", type: "INT", constraint: "NOT NULL" },
    ],
    rationale: "Core physical vehicle asset. Reg-No enforces state motor registry uniqueness.",
    relationships: [
      { label: "RENTS", cardinality: "1:N", target: "RENTAL AGREEMENT" },
      { label: "UNDERGOES", cardinality: "1:N", target: "MAINTENANCE RECORD" },
      { label: "SERVICES", cardinality: "M:N", target: "MECHANIC" },
    ],
  },
  {
    id: "RENTAL AGREEMENT",
    name: "RENTAL AGREEMENT",
    type: "Strong",
    primaryKey: ["RA-ID"],
    foreignKeys: [
      { field: "C-ID", refTable: "CUSTOMER", refField: "C-ID" },
      { field: "V-ID", refTable: "VEHICLE", refField: "V-ID" },
    ],
    attributes: [
      { name: "RA-ID", type: "VARCHAR(10)", keyType: "PK", constraint: "NOT NULL" },
      { name: "C-ID", type: "VARCHAR(10)", keyType: "FK", constraint: "FK → CUSTOMER" },
      { name: "V-ID", type: "VARCHAR(10)", keyType: "FK", constraint: "FK → VEHICLE" },
      { name: "Start-Date", type: "DATE", constraint: "NOT NULL" },
      { name: "End-Date", type: "DATE", constraint: "NOT NULL" },
    ],
    rationale: "Legal contract binding a Customer reservation to a specific Vehicle over a time period.",
    relationships: [
      { label: "HAS", cardinality: "1:N", target: "CUSTOMER" },
      { label: "RENTS", cardinality: "1:N", target: "VEHICLE" },
    ],
  },
  {
    id: "PAYMENT",
    name: "PAYMENT",
    type: "Strong",
    primaryKey: ["Pay-ID"],
    foreignKeys: [{ field: "C-ID", refTable: "CUSTOMER", refField: "C-ID" }],
    attributes: [
      { name: "Pay-ID", type: "VARCHAR(10)", keyType: "PK", constraint: "NOT NULL" },
      { name: "C-ID", type: "VARCHAR(10)", keyType: "FK", constraint: "FK → CUSTOMER" },
      { name: "Amount", type: "DECIMAL(10,2)", constraint: "NOT NULL" },
      { name: "Date", type: "DATE", constraint: "NOT NULL" },
    ],
    rationale: "Financial transaction ledger recording payment amounts received from Customers.",
    relationships: [
      { label: "PAYS", cardinality: "1:N", target: "CUSTOMER" },
    ],
  },
  {
    id: "MAINTENANCE RECORD",
    name: "MAINTENANCE RECORD",
    type: "Weak",
    primaryKey: ["M-ID", "V-ID"],
    foreignKeys: [{ field: "V-ID", refTable: "VEHICLE", refField: "V-ID" }],
    attributes: [
      { name: "M-ID", type: "VARCHAR(10)", keyType: "PK", constraint: "Partial Key" },
      { name: "V-ID", type: "VARCHAR(10)", keyType: "PK+FK", constraint: "Identifying FK → VEHICLE" },
      { name: "Service-Date", type: "DATE", constraint: "NOT NULL" },
      { name: "Cost", type: "DECIMAL(10,2)", constraint: "NOT NULL" },
      { name: "Description", type: "TEXT" },
    ],
    rationale: "Weak entity dependent on identifying Vehicle. V-ID combines with M-ID to form composite primary key.",
    relationships: [
      { label: "UNDERGOES", cardinality: "1:N", target: "VEHICLE" },
    ],
  },
  {
    id: "BOOKS",
    name: "BOOKS",
    type: "Junction (M:N)",
    primaryKey: ["C-ID", "E-ID"],
    foreignKeys: [
      { field: "C-ID", refTable: "CUSTOMER", refField: "C-ID" },
      { field: "E-ID", refTable: "SALESPERSON", refField: "E-ID" },
    ],
    attributes: [
      { name: "C-ID", type: "VARCHAR(10)", keyType: "PK+FK", constraint: "FK → CUSTOMER" },
      { name: "E-ID", type: "VARCHAR(10)", keyType: "PK+FK", constraint: "FK → SALESPERSON" },
      { name: "Booking-Date", type: "DATE", constraint: "NOT NULL" },
    ],
    rationale: "Junction table mapping M:N relationship between Customers and Salespersons.",
    relationships: [
      { label: "Maps", cardinality: "M:N", target: "CUSTOMER ↔ SALESPERSON" },
    ],
  },
  {
    id: "SERVICES",
    name: "SERVICES",
    type: "Junction (M:N)",
    primaryKey: ["E-ID", "V-ID"],
    foreignKeys: [
      { field: "E-ID", refTable: "MECHANIC", refField: "E-ID" },
      { field: "V-ID", refTable: "VEHICLE", refField: "V-ID" },
    ],
    attributes: [
      { name: "E-ID", type: "VARCHAR(10)", keyType: "PK+FK", constraint: "FK → MECHANIC" },
      { name: "V-ID", type: "VARCHAR(10)", keyType: "PK+FK", constraint: "FK → VEHICLE" },
      { name: "Service-Date", type: "DATE", constraint: "NOT NULL" },
    ],
    rationale: "Junction table mapping M:N relationship between Mechanics and Vehicles.",
    relationships: [
      { label: "Maps", cardinality: "M:N", target: "MECHANIC ↔ VEHICLE" },
    ],
  },
];

function ERDiagramPage() {
  const [selectedEntity, setSelectedEntity] = useState<EntityDef | null>(ENTITIES[0]);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <PresentationBar />
      <SiteHeader />

      <main className="flex-1 mx-auto max-w-7xl w-full px-4 sm:px-8 py-10 space-y-8">
        <div className="border-b border-border/80 pb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <Eyebrow>ACADEMIC DBMS MODEL</Eyebrow>
            <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-foreground flex items-center gap-2">
              <Layers className="w-7 h-7 text-primary" /> Interactive Entity-Relationship Diagram
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Click any entity node to inspect primary keys, foreign key constraints, cardinalities, and relationship rationale.
            </p>
          </div>
          <Button asChild size="sm" variant="outline">
            <Link to="/database/schema">View Relational Schema</Link>
          </Button>
        </div>

        {/* ER Canvas & Inspector Grid */}
        <div className="grid gap-8 lg:grid-cols-12 items-start">
          {/* Visual Entity Nodes Canvas */}
          <div className="lg:col-span-7 space-y-6">
            <div className="p-6 rounded-2xl bg-surface border border-border space-y-6 shadow-xl relative overflow-hidden">
              <div className="flex items-center justify-between border-b border-border/80 pb-3 text-xs font-semibold">
                <span className="text-muted-foreground uppercase tracking-wider">Entity Nodes (11 Relational Tables)</span>
                <span className="text-primary">Click to Inspect Details</span>
              </div>

              {/* Node Layout Grid */}
              <div className="grid gap-4 sm:grid-cols-2">
                {ENTITIES.map((ent) => {
                  const isSelected = selectedEntity?.id === ent.id;
                  return (
                    <button
                      key={ent.id}
                      onClick={() => setSelectedEntity(ent)}
                      className={`p-4 rounded-xl border text-left transition-all hover:scale-[1.02] ${
                        isSelected
                          ? "bg-primary/20 border-primary ring-2 ring-primary/40 shadow-lg"
                          : ent.type === "Weak"
                          ? "bg-surface-2 border-dashed border-warning/60 text-foreground"
                          : ent.type === "Subclass (ISA)"
                          ? "bg-surface-2 border-primary/40 text-foreground"
                          : ent.type === "Junction (M:N)"
                          ? "bg-surface-2 border-purple-500/40 text-foreground"
                          : "bg-surface-2 border-border text-foreground hover:border-primary/50"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-display font-bold text-sm text-foreground">{ent.name}</span>
                        <span
                          className={`text-[9px] uppercase font-bold px-1.5 py-0.5 rounded ${
                            ent.type === "Weak"
                              ? "bg-warning/20 text-warning"
                              : ent.type === "Subclass (ISA)"
                              ? "bg-primary/20 text-primary"
                              : ent.type === "Junction (M:N)"
                              ? "bg-purple-500/20 text-purple-400"
                              : "bg-surface text-muted-foreground"
                          }`}
                        >
                          {ent.type}
                        </span>
                      </div>

                      <div className="text-[11px] text-muted-foreground mt-2 font-mono truncate">
                        PK: {ent.primaryKey.join(", ")}
                      </div>

                      {ent.relationships.length > 0 && (
                        <div className="mt-2 pt-2 border-t border-border/60 text-[10px] text-muted-foreground flex flex-wrap gap-1">
                          {ent.relationships.map((rel, idx) => (
                            <span key={idx} className="px-1.5 py-0.5 rounded bg-background border border-border">
                              {rel.label} ({rel.cardinality})
                            </span>
                          ))}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Entity Inspector Side Drawer */}
          <div className="lg:col-span-5 space-y-6 sticky top-24">
            {selectedEntity ? (
              <div className="p-6 rounded-2xl bg-surface border border-primary/50 space-y-6 shadow-2xl animate-rise">
                <div className="flex items-center justify-between border-b border-border/80 pb-3">
                  <div>
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-primary/20 text-primary">
                      {selectedEntity.type} Entity
                    </span>
                    <h2 className="mt-1 font-display text-2xl font-bold text-foreground">
                      {selectedEntity.name}
                    </h2>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setSelectedEntity(null)}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>

                {/* Attributes Table */}
                <div className="space-y-2">
                  <span className="text-xs font-semibold uppercase text-muted-foreground">Entity Attributes & Constraints</span>
                  <div className="overflow-x-auto rounded-xl border border-border">
                    <table className="w-full text-left text-xs">
                      <thead className="border-b border-border/80 uppercase text-[9px] text-muted-foreground bg-surface-2">
                        <tr>
                          <th className="p-2.5">Attribute</th>
                          <th className="p-2.5">Data Type</th>
                          <th className="p-2.5">Key Type</th>
                          <th className="p-2.5">Constraint</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/60 font-mono text-[11px]">
                        {selectedEntity.attributes.map((attr) => (
                          <tr key={attr.name} className="hover:bg-surface-2/50">
                            <td className="p-2.5 font-bold text-foreground">{attr.name}</td>
                            <td className="p-2.5 text-muted-foreground">{attr.type}</td>
                            <td className="p-2.5">
                              {attr.keyType ? (
                                <span className="px-1.5 py-0.5 rounded bg-primary/20 text-primary font-bold text-[10px]">
                                  {attr.keyType}
                                </span>
                              ) : (
                                "—"
                              )}
                            </td>
                            <td className="p-2.5 text-muted-foreground">{attr.constraint || "—"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Relational Rationale */}
                <div className="p-4 rounded-xl bg-surface-2 border border-border space-y-2 text-xs">
                  <div className="font-semibold text-foreground flex items-center gap-1.5">
                    <Info className="w-4 h-4 text-primary" /> Why This Relationship Exists
                  </div>
                  <p className="text-muted-foreground leading-relaxed">
                    {selectedEntity.rationale}
                  </p>
                </div>

                {/* Cardinalities */}
                <div className="space-y-2">
                  <span className="text-xs font-semibold uppercase text-muted-foreground">Connected Relationships</span>
                  <div className="space-y-1 text-xs">
                    {selectedEntity.relationships.map((rel, idx) => (
                      <div key={idx} className="p-2.5 rounded-lg bg-surface-2 border border-border flex justify-between items-center">
                        <span className="font-medium text-foreground">{rel.label} → {rel.target}</span>
                        <span className="font-mono font-bold text-primary px-2 py-0.5 rounded bg-primary/10">
                          {rel.cardinality}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-8 rounded-2xl bg-surface border border-border text-center text-xs text-muted-foreground space-y-2">
                <Info className="w-6 h-6 text-primary mx-auto" />
                <p>Click any entity node on the left to inspect attributes, primary keys, and cardinality rules.</p>
              </div>
            )}
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
