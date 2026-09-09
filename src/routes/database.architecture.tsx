import React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Eyebrow } from "@/components/fleet/brand";
import { SiteFooter, SiteHeader } from "@/components/fleet/site-chrome";
import { PresentationBar } from "@/components/fleet/presentation-bar";
import { Server, Code2, Database, ShieldCheck, Cpu } from "lucide-react";

export const Route = createFileRoute("/database/architecture")({
  head: () => ({
    meta: [
      { title: "System Architecture — FleetFlow DBMS Academic Case Study" },
      {
        name: "description",
        content: "Technical architecture diagram and tech stack specification for FleetFlow frontend database prototype.",
      },
    ],
  }),
  component: ArchitecturePage,
});

function ArchitecturePage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <PresentationBar />
      <SiteHeader />

      <main className="flex-1 mx-auto max-w-7xl w-full px-4 sm:px-8 py-10 space-y-10">
        <div className="border-b border-border/80 pb-6 flex items-center justify-between">
          <div>
            <Eyebrow>FULL-STACK BLUEPRINT</Eyebrow>
            <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-foreground flex items-center gap-2">
              <Server className="w-7 h-7 text-primary" /> System Architecture & Tech Stack
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Technical layers mapping presentation UI to relational service abstraction and local persistence.
            </p>
          </div>
          <span className="text-xs font-mono uppercase font-bold px-3 py-1 rounded bg-warning/20 text-warning border border-warning/30">
            Mock Relational Data / Prototype
          </span>
        </div>

        {/* Visual Architecture Flow Diagram */}
        <div className="p-8 rounded-3xl bg-surface border border-border space-y-8 shadow-xl">
          <h3 className="font-display font-semibold text-lg text-foreground text-center">
            FleetFlow Layered Application Blueprint
          </h3>

          <div className="grid gap-6 md:grid-cols-3 text-center relative">
            {/* Layer 1 */}
            <div className="p-6 rounded-2xl bg-surface-2 border border-primary/40 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-primary/20 text-primary border border-primary/30 flex items-center justify-center mx-auto">
                <Code2 className="w-5 h-5" />
              </div>
              <h4 className="font-display font-semibold text-base text-foreground">PRESENTATION LAYER</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Customer Portal, Salesperson Desk, Mechanic Service Bay, Manager Admin Console & Academic Database Center.
              </p>
            </div>

            {/* Layer 2 */}
            <div className="p-6 rounded-2xl bg-surface-2 border border-primary/40 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-primary/20 text-primary border border-primary/30 flex items-center justify-center mx-auto">
                <Cpu className="w-5 h-5" />
              </div>
              <h4 className="font-display font-semibold text-base text-foreground">APPLICATION SERVICES LAYER</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Service Abstraction API, Auth Session Context, Permission Evaluator (`can()`), and ACID Transaction Engine.
              </p>
            </div>

            {/* Layer 3 */}
            <div className="p-6 rounded-2xl bg-surface-2 border border-primary/40 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-primary/20 text-primary border border-primary/30 flex items-center justify-center mx-auto">
                <Database className="w-5 h-5" />
              </div>
              <h4 className="font-display font-semibold text-base text-foreground">RELATIONAL MOCK DATA ENGINE</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Centralized relational state (`fleetStore`) containing 11 Academic Entities with PK/FK Integrity Constraints.
              </p>
            </div>
          </div>
        </div>

        {/* Real Tech Stack Specification */}
        <div className="grid gap-6 md:grid-cols-3">
          <div className="p-6 rounded-2xl bg-surface border border-border space-y-4 shadow-lg">
            <div className="flex items-center gap-2 font-display font-semibold text-base text-foreground border-b border-border/80 pb-3">
              <Code2 className="w-5 h-5 text-primary" /> Frontend Stack
            </div>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li className="flex justify-between"><span>UI Framework:</span> <strong className="text-foreground">React 19</strong></li>
              <li className="flex justify-between"><span>Language:</span> <strong className="text-foreground">TypeScript 5.8</strong></li>
              <li className="flex justify-between"><span>Build Tool:</span> <strong className="text-foreground">Vite 8.1</strong></li>
              <li className="flex justify-between"><span>Routing Engine:</span> <strong className="text-foreground">TanStack Router</strong></li>
              <li className="flex justify-between"><span>Styling Engine:</span> <strong className="text-foreground">Tailwind CSS v4</strong></li>
            </ul>
          </div>

          <div className="p-6 rounded-2xl bg-surface border border-border space-y-4 shadow-lg">
            <div className="flex items-center gap-2 font-display font-semibold text-base text-foreground border-b border-border/80 pb-3">
              <Cpu className="w-5 h-5 text-primary" /> Application Architecture
            </div>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li className="flex justify-between"><span>State Management:</span> <strong className="text-foreground">React Context & TanStack Query</strong></li>
              <li className="flex justify-between"><span>Service Layer:</span> <strong className="text-foreground">Modular Service Abstraction</strong></li>
              <li className="flex justify-between"><span>Data Model:</span> <strong className="text-foreground">Mock Relational Schema</strong></li>
              <li className="flex justify-between"><span>Persistence:</span> <strong className="text-foreground">LocalStorage Session Storage</strong></li>
            </ul>
          </div>

          <div className="p-6 rounded-2xl bg-surface border border-border space-y-4 shadow-lg">
            <div className="flex items-center gap-2 font-display font-semibold text-base text-foreground border-b border-border/80 pb-3">
              <ShieldCheck className="w-5 h-5 text-primary" /> Development Tooling
            </div>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li className="flex justify-between"><span>Version Control:</span> <strong className="text-foreground">Git & GitHub</strong></li>
              <li className="flex justify-between"><span>IDE Environment:</span> <strong className="text-foreground">VS Code</strong></li>
              <li className="flex justify-between"><span>Package Manager:</span> <strong className="text-foreground">npm</strong></li>
              <li className="flex justify-between"><span>Deploy Preset:</span> <strong className="text-foreground">Vite Preview / SSR Node</strong></li>
            </ul>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
