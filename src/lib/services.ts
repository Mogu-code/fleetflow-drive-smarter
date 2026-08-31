/**
 * FleetFlow service layer.
 *
 * Every screen reads data through these services. They currently resolve
 * in-memory mock data with simulated latency; swapping the body of each
 * method for a real API/server-function call requires no UI changes.
 */
import {
  aiInsights,
  bookRelations,
  branchStats,
  bookings,
  categoryMix,
  customers,
  documents,
  employees,
  maintenanceRecords,
  notifications,
  payments,
  recommendations,
  rentalAgreements,
  reviews,
  serviceAssignments,
  revenueTrend,
  utilizationTrend,
  vehicles,
  CURRENT_CUSTOMER_ID,
} from "./mock-data";
import type {
  AIMessage,
  Booking,
  Customer,
  Employee,
  Mechanic,
  Salesperson,
  OCRResult,
  Vehicle,
  VehicleCategory,
} from "@/types";

const LATENCY = 350;

function resolve<T>(value: T, ms = LATENCY): Promise<T> {
  return new Promise((r) => setTimeout(() => r(value), ms));
}

export interface VehicleQuery {
  q?: string;
  categories?: VehicleCategory[];
  fuels?: string[];
  transmissions?: string[];
  seats?: number | null;
  maxPrice?: number;
  location?: string;
  availableOnly?: boolean;
  minRating?: number;
  sort?: "recommended" | "price-asc" | "price-desc" | "popular" | "newest";
}

export const vehicleService = {
  async list(query: VehicleQuery = {}): Promise<Vehicle[]> {
    let out = vehicles.slice();
    const q = query.q?.trim().toLowerCase();
    if (q) {
      out = out.filter(
        (v) =>
          v.name.toLowerCase().includes(q) ||
          v.category.toLowerCase().includes(q) ||
          v.location.toLowerCase().includes(q),
      );
    }
    if (query.categories?.length)
      out = out.filter((v) => query.categories!.includes(v.category));
    if (query.fuels?.length) out = out.filter((v) => query.fuels!.includes(v.fuel));
    if (query.transmissions?.length)
      out = out.filter((v) => query.transmissions!.includes(v.transmission));
    if (query.seats) out = out.filter((v) => v.seats >= query.seats!);
    if (query.maxPrice) out = out.filter((v) => v.pricePerDay <= query.maxPrice!);
    if (query.location) out = out.filter((v) => v.location === query.location);
    if (query.availableOnly) out = out.filter((v) => v.status === "available");
    if (query.minRating) out = out.filter((v) => v.rating >= query.minRating!);

    switch (query.sort) {
      case "price-asc":
        out.sort((a, b) => a.pricePerDay - b.pricePerDay);
        break;
      case "price-desc":
        out.sort((a, b) => b.pricePerDay - a.pricePerDay);
        break;
      case "popular":
        out.sort((a, b) => b.reviewCount - a.reviewCount);
        break;
      case "newest":
        out.sort((a, b) => b.year - a.year);
        break;
      default:
        out.sort((a, b) => b.rating * b.utilization - a.rating * a.utilization);
    }
    return resolve(out);
  },

  async get(id: string) {
    return resolve(vehicles.find((v) => v.id === id) ?? null);
  },

  async featured() {
    return resolve(vehicles.filter((v) => v.status === "available").slice(0, 6), 200);
  },

  async similar(id: string) {
    const base = vehicles.find((v) => v.id === id);
    return resolve(
      vehicles
        .filter((v) => v.id !== id && v.category === base?.category && v.status === "available")
        .slice(0, 3),
    );
  },

  /** Availability check — the future backend enforces this server-side. */
  async checkAvailability(id: string, start: string, end: string) {
    const v = vehicles.find((x) => x.id === id);
    if (!v) return resolve({ available: false, conflicts: [] as string[] }, 200);
    const conflicts = v.unavailableDates.filter((d) => d >= start && d <= end);
    return resolve(
      { available: v.status !== "inactive" && conflicts.length === 0, conflicts },
      450,
    );
  },
};

export const bookingService = {
  async list(customerId = CURRENT_CUSTOMER_ID) {
    return resolve(bookings.filter((b) => b.customerId === customerId));
  },
  async listAll() {
    return resolve(bookings);
  },
  async get(id: string) {
    return resolve(bookings.find((b) => b.id === id) ?? null);
  },
  async create(draft: Partial<Booking>) {
    return resolve(
      { ...draft, id: `FF-${Math.floor(20000 + Math.random() * 9000)}` } as Booking,
      900,
    );
  },
};

export const customerService = {
  async list() {
    return resolve(customers);
  },
  async get(id: string) {
    return resolve(customers.find((c) => c.id === id) ?? null);
  },
  async current() {
    return resolve(customers.find((c) => c.id === CURRENT_CUSTOMER_ID)!, 120);
  },
};

export const employeeService = {
  async list() {
    return resolve(employees);
  },
};

export const maintenanceService = {
  async list() {
    return resolve(maintenanceRecords);
  },
  async forVehicle(vehicleId: string) {
    return resolve(maintenanceRecords.filter((m) => m.vehicleId === vehicleId));
  },
};

export const paymentService = {
  async list() {
    return resolve(payments);
  },
  async forCustomer(customerId = CURRENT_CUSTOMER_ID) {
    return resolve(payments.filter((p) => p.customerId === customerId));
  },
  /** Mock checkout. Real gateway integration replaces this method only. */
  async process(_amount: number, _method: string) {
    return resolve({ status: "successful" as const, reference: `rzp_${Date.now().toString(36)}` }, 2200);
  },
};

export const documentService = {
  async list(customerId = CURRENT_CUSTOMER_ID) {
    return resolve(documents.filter((d) => d.customerId === customerId));
  },
  /** Mock OCR extraction — replaced by the document-processing service later. */
  async extract(fileName: string): Promise<OCRResult> {
    return resolve(
      {
        name: "Mokshdaa Gupta",
        licenseNumber: "KA0320180004213",
        dob: "1996-04-11",
        expiry: "2031-04-10",
        confidence: 0.93,
      },
      2400,
    ).then((r) => ({ ...r, source: fileName }) as OCRResult);
  },
};

export const reviewService = {
  async forVehicle(vehicleId: string) {
    const found = reviews.filter((r) => r.vehicleId === vehicleId);
    return resolve(found.length ? found : reviews.slice(0, 3));
  },
};

export const recommendationService = {
  async list() {
    return resolve(recommendations);
  },
};

export const notificationService = {
  async list() {
    return resolve(notifications, 150);
  },
};

export const analyticsService = {
  async overview() {
    const activeRentals = bookings.filter((b) => b.status === "active").length;
    const available = vehicles.filter((v) => v.status === "available").length;
    const inMaintenance = vehicles.filter((v) => v.status === "maintenance").length;
    const pendingPayments = payments.filter((p) => p.status === "pending").length;
    return resolve({
      revenue: revenueTrend.at(-1)!.revenue,
      revenueDelta: 9.2,
      activeRentals,
      utilization: Math.round(
        vehicles.reduce((s, v) => s + v.utilization, 0) / vehicles.length,
      ),
      available,
      inMaintenance,
      pendingPayments,
      revenueTrend,
      utilizationTrend,
      categoryMix,
    });
  },
  async insights() {
    return resolve(aiInsights);
  },
};

/** Mock AI. Replace with a real model call behind the same signature. */
export const aiService = {
  async ask(prompt: string): Promise<AIMessage> {
    const p = prompt.toLowerCase();
    let pool = vehicles.filter((v) => v.status === "available");
    let content = "Here are the vehicles that fit best right now.";

    if (p.includes("suv")) pool = pool.filter((v) => v.category === "SUV");
    if (p.includes("electric") || p.includes("ev"))
      pool = pool.filter((v) => v.fuel === "Electric");
    if (p.includes("automatic")) pool = pool.filter((v) => v.transmission === "Automatic");
    const seatMatch = p.match(/(\d+)\s*(people|seats|passengers)/);
    if (seatMatch) pool = pool.filter((v) => v.seats >= Number(seatMatch[1]));
    const priceMatch = p.match(/(?:under|below|less than)\s*₹?\s*(\d{3,6})/);
    if (priceMatch) pool = pool.filter((v) => v.pricePerDay <= Number(priceMatch[1]));

    if (p.includes("next booking")) {
      const next = bookings.find(
        (b) => b.customerId === CURRENT_CUSTOMER_ID && b.status !== "completed",
      );
      const veh = vehicles.find((v) => v.id === next?.vehicleId);
      return resolve(
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: next
            ? `Your next booking is ${next.id} — ${veh?.name}, picking up ${next.startDate} at ${next.pickupLocation}. Total ₹${next.total.toLocaleString("en-IN")}.`
            : "You have no upcoming bookings. Want me to find something for this weekend?",
          vehicleIds: veh ? [veh.id] : [],
          actions: [{ label: "View booking", to: "/bookings" }],
        },
        1200,
      );
    }

    const picks = pool.slice(0, 3);
    content = picks.length
      ? `I found ${picks.length} vehicle${picks.length > 1 ? "s" : ""} matching your requirements.`
      : "Nothing in the fleet matches all of those constraints today. Relaxing the price or seat count usually opens up options.";

    return resolve(
      {
        id: crypto.randomUUID(),
        role: "assistant",
        content,
        vehicleIds: picks.map((v) => v.id),
        actions: picks.length
          ? [
              { label: "Start booking", to: "/booking" },
              { label: "See all matches", to: "/explore" },
            ]
          : [{ label: "Browse the fleet", to: "/explore" }],
      },
      1400,
    );
  },
};

export const authService = {
  /**
   * Placeholder only — no real credential handling happens in this phase.
   * Wire this to the authentication provider when the backend exists.
   */
  async signIn(_email: string) {
    return resolve({ ok: true, mock: true }, 800);
  },
};

export { CURRENT_CUSTOMER_ID };

/* ------------------------------------------------------------------ *
 * Relational services: Rental Agreement entity plus the Books and
 * Services many-to-many relationships from the ER model.
 * ------------------------------------------------------------------ */

export const agreementService = {
  async list() {
    return resolve(rentalAgreements);
  },
  async forCustomer(customerId = CURRENT_CUSTOMER_ID) {
    return resolve(rentalAgreements.filter((a) => a.customerId === customerId));
  },
  async forBooking(bookingId: string) {
    return resolve(rentalAgreements.find((a) => a.bookingId === bookingId) ?? null, 200);
  },
};

export const relationshipService = {
  /** Services junction — vehicles a mechanic has worked on. */
  async vehiclesServicedBy(mechanicId: string) {
    const rows = serviceAssignments.filter((s) => s.mechanicId === mechanicId);
    return resolve(
      rows.map((r) => ({
        ...r,
        vehicle: vehicles.find((v) => v.id === r.vehicleId)!,
      })),
    );
  },
  /** Services junction — mechanics who have worked on a vehicle. */
  async mechanicsForVehicle(vehicleId: string) {
    const rows = serviceAssignments.filter((s) => s.vehicleId === vehicleId);
    const ids = [...new Set(rows.map((r) => r.mechanicId))];
    return resolve(
      ids.map((id) => ({
        mechanic: employees.find((e) => e.id === id) as Mechanic,
        jobs: rows.filter((r) => r.mechanicId === id).length,
        hours: rows.filter((r) => r.mechanicId === id).reduce((s, r) => s + r.hours, 0),
      })),
    );
  },
  /** Books junction — customers handled by a salesperson. */
  async customersHandledBy(salespersonId: string) {
    const rows = bookRelations.filter((b) => b.salespersonId === salespersonId);
    const ids = [...new Set(rows.map((r) => r.customerId))];
    return resolve(
      ids.map((id) => ({
        customer: customers.find((c) => c.id === id) as Customer,
        bookings: rows.filter((r) => r.customerId === id).length,
        commission: rows
          .filter((r) => r.customerId === id)
          .reduce((s, r) => s + r.commission, 0),
      })),
    );
  },
  /** Books junction — salespersons a customer has booked through. */
  async salespersonsForCustomer(customerId: string) {
    const rows = bookRelations.filter((b) => b.customerId === customerId);
    const ids = [...new Set(rows.map((r) => r.salespersonId))];
    return resolve(
      ids.map((id) => ({
        salesperson: employees.find((e) => e.id === id) as Salesperson,
        bookings: rows.filter((r) => r.salespersonId === id).length,
      })),
    );
  },
};

export const fleetService = {
  async branches() {
    return resolve(branchStats, 200);
  },
};

export interface SearchHit {
  id: string;
  label: string;
  sub: string;
  group: "Vehicles" | "Bookings" | "Customers" | "Payments" | "Maintenance";
  to: string;
  params?: Record<string, string>;
}

export const searchService = {
  /** Command-centre search across the core entities. */
  async query(term: string): Promise<SearchHit[]> {
    const q = term.trim().toLowerCase();
    if (!q) return [];
    const hits: SearchHit[] = [];
    for (const v of vehicles) {
      if (`${v.id} ${v.name} ${v.registration}`.toLowerCase().includes(q))
        hits.push({ id: v.id, label: `${v.id} · ${v.name}`, sub: v.registration, group: "Vehicles", to: "/admin/vehicles/$id", params: { id: v.id } });
    }
    for (const b of bookings) {
      if (`${b.id} ${b.status}`.toLowerCase().includes(q))
        hits.push({ id: b.id, label: b.id, sub: `${b.status} · ${b.startDate}`, group: "Bookings", to: "/admin/bookings" });
    }
    for (const c of customers) {
      if (`${c.id} ${c.name} ${c.phone}`.toLowerCase().includes(q))
        hits.push({ id: c.id, label: `${c.id} · ${c.name}`, sub: c.phone, group: "Customers", to: "/admin/customers" });
    }
    for (const p of payments) {
      if (`${p.id} ${p.reference}`.toLowerCase().includes(q))
        hits.push({ id: p.id, label: p.id, sub: `${p.status} · ${p.method}`, group: "Payments", to: "/admin/payments" });
    }
    for (const m of maintenanceRecords) {
      if (`${m.id} ${m.type}`.toLowerCase().includes(q))
        hits.push({ id: m.id, label: m.id, sub: m.type, group: "Maintenance", to: "/admin/maintenance" });
    }
    return hits.slice(0, 12);
  },
};

export const employeeDirectory = {
  async byRole<T extends Employee["role"]>(role: T) {
    return resolve(employees.filter((e) => e.role === role));
  },
  async get(id: string) {
    return resolve(employees.find((e) => e.id === id) ?? null);
  },
};
