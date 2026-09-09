import React, { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Presentation, Database, LayoutDashboard, Car, ChevronDown, Sparkles, X } from "lucide-react";

export function PresentationBar() {
  const [collapsed, setCollapsed] = useState(false);

  if (collapsed) {
    return (
      <button
        onClick={() => setCollapsed(false)}
        className="fixed bottom-4 right-4 z-50 flex items-center gap-2 px-3 py-2 rounded-full bg-primary text-primary-foreground font-semibold text-xs shadow-2xl hover:scale-105 transition-all"
        title="Open Academic Demo Presentation Mode Bar"
      >
        <Presentation className="w-4 h-4" />
        <span>Presentation Mode</span>
      </button>
    );
  }

  return (
    <div className="w-full max-w-full overflow-hidden bg-surface border-b border-primary/30 text-xs py-1.5 px-4 sm:px-8 flex flex-wrap items-center justify-between gap-2 z-50 relative bg-linear-to-r from-background via-surface-2 to-background">
      <div className="flex items-center gap-2 font-medium">
        <span className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-primary/20 text-primary border border-primary/30 font-bold uppercase tracking-wider text-[10px]">
          <Presentation className="w-3.5 h-3.5" /> Demo Presentation Bar
        </span>
        <span className="text-muted-foreground hidden lg:inline">
          Academic DBMS Case Study Showcase
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
        <span className="text-muted-foreground uppercase text-[10px] tracking-wider font-semibold mr-1">
          Quick Jump:
        </span>

        <Link
          to="/explore"
          className="px-2 py-1 rounded bg-surface border border-border/80 text-foreground hover:border-primary/50 flex items-center gap-1 transition-colors"
        >
          <Car className="w-3 h-3 text-primary" /> Customer Flow
        </Link>

        <Link
          to="/admin"
          className="px-2 py-1 rounded bg-surface border border-border/80 text-foreground hover:border-primary/50 flex items-center gap-1 transition-colors"
        >
          <LayoutDashboard className="w-3 h-3 text-primary" /> Manager Portal
        </Link>

        <div className="h-4 w-px bg-border mx-1" />

        <Link
          to="/database/er-diagram"
          className="px-2 py-1 rounded bg-primary/10 border border-primary/30 text-primary font-semibold hover:bg-primary/20 flex items-center gap-1 transition-colors"
        >
          <Database className="w-3 h-3" /> ER Diagram
        </Link>

        <Link
          to="/database/schema"
          className="px-2 py-1 rounded bg-primary/10 border border-primary/30 text-primary font-semibold hover:bg-primary/20 transition-colors"
        >
          Schema
        </Link>

        <Link
          to="/database/sql-lab"
          className="px-2 py-1 rounded bg-primary/10 border border-primary/30 text-primary font-semibold hover:bg-primary/20 transition-colors"
        >
          SQL Lab
        </Link>

        <Link
          to="/database/normalization"
          className="px-2 py-1 rounded bg-primary/10 border border-primary/30 text-primary font-semibold hover:bg-primary/20 transition-colors"
        >
          Normalization
        </Link>

        <Link
          to="/database/transactions"
          className="px-2 py-1 rounded bg-primary/10 border border-primary/30 text-primary font-semibold hover:bg-primary/20 transition-colors"
        >
          ACID Txns
        </Link>

        <button
          onClick={() => setCollapsed(true)}
          className="p-1 rounded text-muted-foreground hover:text-foreground ml-1"
          title="Minimize Presentation Bar"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
