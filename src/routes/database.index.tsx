import React from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Eyebrow } from "@/components/fleet/brand";
import { SiteFooter, SiteHeader } from "@/components/fleet/site-chrome";
import { PresentationBar } from "@/components/fleet/presentation-bar";
import { Button } from "@/components/ui/button";
import {
  Database,
  Layers,
  FileCode2,
  GitBranch,
  ArrowRight,
  ShieldAlert,
  Server,
  BookOpen,
} from "lucide-react";

export const Route = createFileRoute("/database/")({
  head: () => ({
    meta: [
      { title: "Database Center — FleetFlow DBMS Academic Case Study" },
      {
        name: "description",
        content: "Explore FleetFlow's underlying DBMS relational model, ER diagrams, schema definitions, SQL lab, normalization stages, and transaction safeguards.",
      },
    ],
  }),
  component: DatabaseIndexPage,
});

function DatabaseIndexPage() {
  const TOOLS = [
    {
      to: "/database/er-diagram",
      title: "Interactive ER Diagram",
      tag: "Entity-Relationship",
      icon: Layers,
      desc: "Visual node graph detailing 11 relational entities, 1:1 / 1:N / M:N cardinalities, ISA specialization hierarchy, and weak entities.",
    },
    {
      to: "/database/schema",
      title: "Relational Schema Visualizer",
      tag: "Table Schemas",
      icon: Database,
      desc: "Interactive database table cards featuring data types, PK/FK attributes, UNIQUE constraints, and visual relationship linkage.",
    },
    {
      to: "/database/sql-lab",
      title: "SQL Demonstration Lab",
      tag: "Query Simulation",
      icon: FileCode2,
      desc: "Execute pre-configured & custom SQL queries (SELECT, JOIN, COUNT, GROUP BY) against live relational mock datasets.",
    },
    {
      to: "/database/normalization",
      title: "Normalization Visualizer",
      tag: "1NF → 2NF → 3NF",
      icon: GitBranch,
      desc: "Step-by-step transformation showing an unnormalized rental table resolving update/insertion/deletion anomalies into 3NF.",
    },
    {
      to: "/database/transactions",
      title: "ACID Booking Transactions",
      tag: "Transaction Safeguards",
      icon: Server,
      desc: "Interactive step-by-step booking workflow (BEGIN TRANSACTION → Check Availability → Create Agreement → COMMIT / ROLLBACK).",
    },
    {
      to: "/database/concepts",
      title: "DBMS Core Concepts Library",
      tag: "Academic Guide",
      icon: BookOpen,
      desc: "Comprehensive reference cards explaining Primary Keys, Foreign Keys, Weak Entities, ISA Hierarchies, and Data Integrity.",
    },
    {
      to: "/database/architecture",
      title: "System Architecture",
      tag: "Full-Stack Design",
      icon: Server,
      desc: "Architectural blueprint mapping Customer/Admin Portals → Service Layer → Relational Model → Mock Storage Engine.",
    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <PresentationBar />
      <SiteHeader />

      <main className="flex-1 mx-auto max-w-7xl w-full px-4 sm:px-8 py-10 space-y-10">
        {/* Header Banner */}
        <div className="p-8 rounded-3xl bg-surface border border-primary/40 space-y-4 shadow-2xl relative overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/80 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <Eyebrow>ACADEMIC CASE STUDY</Eyebrow>
                <span className="text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded bg-warning/20 text-warning border border-warning/30">
                  Mock Relational Data / Prototype
                </span>
              </div>
              <h1 className="mt-2 font-display text-3xl sm:text-4xl font-semibold tracking-tight text-foreground flex items-center gap-2">
                <Database className="w-8 h-8 text-primary" /> FleetFlow Database Center
              </h1>
            </div>

            <Button asChild size="sm" className="gap-2">
              <Link to="/database/er-diagram">
                Open ER Diagram <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </div>

          <p className="text-sm text-muted-foreground leading-relaxed max-w-3xl">
            Welcome to the FleetFlow DBMS Visualization Suite. This academic section bridges theoretical database design with an operational vehicle rental application. Explore how real-world mobility workflows map to relational entities, foreign keys, normalization stages, and transaction boundaries.
          </p>
        </div>

        {/* Tools Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {TOOLS.map((tool) => {
            const Icon = tool.icon;
            return (
              <Link
                key={tool.to}
                to={tool.to as any}
                className="p-6 rounded-2xl bg-surface border border-border hover:border-primary/60 transition-all flex flex-col justify-between space-y-4 group shadow-lg"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-primary/20 text-primary border border-primary/30 flex items-center justify-center">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-mono uppercase font-semibold px-2 py-0.5 rounded bg-surface-2 text-muted-foreground">
                      {tool.tag}
                    </span>
                  </div>

                  <h3 className="font-display font-semibold text-lg text-foreground group-hover:text-primary transition-colors">
                    {tool.title}
                  </h3>

                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {tool.desc}
                  </p>
                </div>

                <div className="pt-3 border-t border-border/60 flex items-center justify-end text-xs font-semibold text-primary group-hover:translate-x-1 transition-transform">
                  <span>Explore Tool</span> <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </div>
              </Link>
            );
          })}
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
