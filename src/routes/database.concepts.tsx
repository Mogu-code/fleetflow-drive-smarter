import React from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Eyebrow } from "@/components/fleet/brand";
import { SiteFooter, SiteHeader } from "@/components/fleet/site-chrome";
import { PresentationBar } from "@/components/fleet/presentation-bar";
import { BookOpen, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/database/concepts")({
  head: () => ({
    meta: [
      { title: "DBMS Core Concepts Library — FleetFlow" },
      {
        name: "description",
        content: "Academic definitions, FleetFlow case study examples, and application pointers for key database management system concepts.",
      },
    ],
  }),
  component: ConceptsPage,
});

function ConceptsPage() {
  const CONCEPTS = [
    {
      title: "PRIMARY KEY (PK)",
      definition: "A primary key uniquely identifies each record in a database table. It must contain unique values and cannot contain NULL values.",
      example: "C-ID uniquely identifies each Customer record (e.g. C201 for Alex Morgan).",
      link: "/database/schema",
      linkText: "View PKs in Schema",
    },
    {
      title: "FOREIGN KEY (FK)",
      definition: "A foreign key is a field that references a primary key in another table, creating a relational link between the two entities.",
      example: "RentalAgreement.C-ID references Customer.C-ID to associate a contract with a customer.",
      link: "/database/schema",
      linkText: "View FK Links",
    },
    {
      title: "WEAK ENTITY",
      definition: "An entity that cannot be uniquely identified by its attributes alone and depends on a parent identifying entity for its primary key.",
      example: "MaintenanceRecord relies on Vehicle.V-ID as part of its composite identity.",
      link: "/database/er-diagram",
      linkText: "View Weak Entity in ER Diagram",
    },
    {
      title: "JUNCTION TABLE (M:N RELATIONSHIP)",
      definition: "A bridge table used to break down many-to-many relationships into two one-to-many relationships using composite foreign keys.",
      example: "BOOKS connects Customer M:N Salesperson; SERVICES connects Mechanic M:N Vehicle.",
      link: "/database/er-diagram",
      linkText: "View Junction Tables in ER Diagram",
    },
    {
      title: "GENERALIZATION & SPECIALIZATION (ISA HIERARCHY)",
      definition: "An object-oriented relational concept where a superclass entity is specialized into subclasses with unique attributes.",
      example: "EMPLOYEE (Superclass) specializes into SALESPERSON (Target, Commission), MECHANIC (Specialization, Shift), and MANAGER (Branch-ID).",
      link: "/database/er-diagram",
      linkText: "View ISA Hierarchy",
    },
    {
      title: "NORMALIZATION (1NF → 2NF → 3NF)",
      definition: "The process of structuring relational tables to minimize data redundancy and prevent insertion, update, and deletion anomalies.",
      example: "Decomposing unnormalized rental records into distinct Customer, Vehicle, RentalAgreement, and Payment entities.",
      link: "/database/normalization",
      linkText: "View Normalization Lab",
    },
    {
      title: "ACID TRANSACTIONS",
      definition: "A set of four properties (Atomicity, Consistency, Isolation, Durability) that guarantee database transactions are processed reliably.",
      example: "Booking workflow verifies vehicle availability, creates agreement, processes payment, and commits atomically or rolls back.",
      link: "/database/transactions",
      linkText: "View Transaction Workflow",
    },
    {
      title: "CARDINALITY (1:1, 1:N, M:N)",
      definition: "Specifies the numerical relationship between occurrences in one entity and occurrences in another entity.",
      example: "Customer HAS 1:N RentalAgreements; Customer RENTS M:N Vehicles via historical bookings.",
      link: "/database/er-diagram",
      linkText: "View Cardinality Lines",
    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <PresentationBar />
      <SiteHeader />

      <main className="flex-1 mx-auto max-w-7xl w-full px-4 sm:px-8 py-10 space-y-8">
        <div className="border-b border-border/80 pb-6 flex items-center justify-between">
          <div>
            <Eyebrow>ACADEMIC REFERENCE</Eyebrow>
            <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-foreground flex items-center gap-2">
              <BookOpen className="w-7 h-7 text-primary" /> DBMS Core Concepts Library
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Formal database definitions mapped to FleetFlow real-world implementations.
            </p>
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-2">
          {CONCEPTS.map((c) => (
            <div key={c.title} className="p-6 rounded-2xl bg-surface border border-border flex flex-col justify-between space-y-4 shadow-lg">
              <div className="space-y-3">
                <span className="text-xs font-mono font-bold uppercase text-primary tracking-wider">
                  {c.title}
                </span>

                <div className="space-y-2 text-xs">
                  <div>
                    <span className="font-semibold uppercase text-[10px] text-muted-foreground block">Formal Definition:</span>
                    <p className="text-muted-foreground leading-relaxed mt-0.5">{c.definition}</p>
                  </div>

                  <div className="pt-2 border-t border-border/60">
                    <span className="font-semibold uppercase text-[10px] text-primary block">FleetFlow Case Study Example:</span>
                    <p className="text-foreground font-medium leading-relaxed mt-0.5">{c.example}</p>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-border/80 flex justify-end">
                <Button asChild size="sm" variant="ghost" className="text-xs gap-1 text-primary">
                  <Link to={c.link as any}>
                    {c.linkText} <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </Button>
              </div>
            </div>
          ))}
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
