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
  MaintenanceRecord,
} from "@/types";

const LATENCY = 350;

function resolve<T>(value: T, ms = LATENCY): Promise<T> {
  return new Promise((r) => setTimeout(() => r(value), ms));
}

const API_BASE = "http://localhost:8000/api";

async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  let token = null;
  const sessionRaw = localStorage.getItem("fleetflow_auth_session");
  if (sessionRaw) {
    try {
      token = JSON.parse(sessionRaw).token;
    } catch {}
  }
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({ detail: "API Error" }));
    throw new Error(err.detail || "API Error");
  }
  return response.json();
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
    const params = new URLSearchParams();
    if (query.categories?.length && query.categories[0]) params.append("category", query.categories[0]);
    if (query.location) params.append("location", query.location);
    
    // We fetch all vehicles from the backend then apply client-side filtering 
    // to preserve the complex mock filtering logic for now.
    const raw: any[] = await apiFetch(`/vehicles/?${params.toString()}`);
    let out: Vehicle[] = raw.map((v) => ({
      ...v,
      pricePerDay: v.price_per_day,
      odometerKm: v.odometer_km,
      reviewCount: v.review_count,
      lastServiceDate: v.last_service_date,
      nextServiceDate: v.next_service_date,
      revenueGenerated: v.revenue_generated,
      unavailableDates: [],
      utilization: v.utilization,
      rating: v.rating,
    }));
    
    const q = query.q?.trim().toLowerCase();
    if (q) {
      out = out.filter(
        (v) =>
          v.name.toLowerCase().includes(q) ||
          v.category.toLowerCase().includes(q) ||
          v.location.toLowerCase().includes(q),
      );
    }
    if (query.fuels?.length) out = out.filter((v) => query.fuels!.includes(v.fuel));
    if (query.transmissions?.length)
      out = out.filter((v) => query.transmissions!.includes(v.transmission));
    if (query.seats) out = out.filter((v) => v.seats >= query.seats!);
    if (query.maxPrice) out = out.filter((v) => v.pricePerDay <= query.maxPrice!);
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
    return out;
  },

  async get(id: string) {
    const v: any = await apiFetch(`/vehicles/${id}`);
    return {
      ...v,
      pricePerDay: v.price_per_day,
      odometerKm: v.odometer_km,
      reviewCount: v.review_count,
      lastServiceDate: v.last_service_date,
      nextServiceDate: v.next_service_date,
      revenueGenerated: v.revenue_generated,
      unavailableDates: [],
      utilization: v.utilization,
      rating: v.rating,
    } as Vehicle;
  },

  async updateStatus(id: string, status: string) {
    // We haven't implemented full PUT in the backend yet, just mock success for the UI
    return resolve({ ok: true });
  },

  async create(draft: Partial<Vehicle>) {
    // Mock success for admin dashboard
    return resolve({ ...draft, id: `V-${Date.now()}` } as Vehicle);
  },

  async featured() {
    const all = await this.list({ availableOnly: true });
    return all.slice(0, 6);
  },

  async similar(id: string) {
    const base = await this.get(id);
    const all = await this.list({ availableOnly: true });
    return all.filter((v) => v.id !== id && v.category === base?.category).slice(0, 3);
  },

  /** Availability check — the future backend enforces this server-side. */
  async checkAvailability(id: string, start: string, end: string) {
    try {
      const res = await apiFetch<{ available: boolean; conflict_booking_id: string | null }>(
        `/vehicles/${id}/availability?start_date=${start}&end_date=${end}`
      );
      return { available: res.available, conflicts: res.conflict_booking_id ? [res.conflict_booking_id] : [] };
    } catch (e) {
      return { available: false, conflicts: [] };
    }
  },
};

export const bookingService = {
  async list(customerId = CURRENT_CUSTOMER_ID) {
    const raw: any[] = await apiFetch(`/bookings/`);
    return raw.map(b => ({
      ...b,
      vehicleId: b.vehicle_id,
      customerId: b.customer_id,
      salespersonId: b.salesperson?.id,
      startDate: b.start_date,
      endDate: b.end_date,
      pickupLocation: b.pickup_location,
      dropoffLocation: b.dropoff_location,
      createdAt: b.created_at,
      vehicle: b.vehicle,
      customer: b.customer,
      salesperson: b.salesperson,
      paymentStatus: b.payment_status,
      documentStatus: b.document_status,
      timeline: []
    })) as Booking[];
  },
  async listAll() {
    const raw: any[] = await apiFetch(`/bookings/`);
    return raw.map(b => ({
      ...b,
      vehicleId: b.vehicle_id,
      customerId: b.customer_id,
      salespersonId: b.salesperson?.id,
      startDate: b.start_date,
      endDate: b.end_date,
      pickupLocation: b.pickup_location,
      dropoffLocation: b.dropoff_location,
      createdAt: b.created_at,
      vehicle: b.vehicle,
      customer: b.customer,
      salesperson: b.salesperson,
      paymentStatus: b.payment_status,
      documentStatus: b.document_status,
      timeline: []
    })) as Booking[];
  },
  async get(id: string) {
    const b: any = await apiFetch(`/bookings/${id}`);
    return {
      ...b,
      vehicleId: b.vehicle_id,
      customerId: b.customer_id,
      salespersonId: b.salesperson?.id,
      startDate: b.start_date,
      endDate: b.end_date,
      pickupLocation: b.pickup_location,
      dropoffLocation: b.dropoff_location,
      createdAt: b.created_at,
      vehicle: b.vehicle,
      customer: b.customer,
      salesperson: b.salesperson,
      paymentStatus: b.payment_status,
      documentStatus: b.document_status,
      timeline: []
    } as Booking;
  },
  async updateStatus(id: string, status: string) {
    if (status === "cancelled") {
      return apiFetch(`/bookings/${id}/cancel`, { method: "POST" });
    } else if (status === "confirmed") {
      return apiFetch(`/bookings/${id}/confirm`, { method: "POST" });
    }
    return resolve({ ok: true });
  },
  async create(draft: Partial<Booking>) {
    const response = await apiFetch<any>(`/bookings/`, {
      method: "POST",
      body: JSON.stringify({
        vehicle_id: draft.vehicleId,
        start_date: draft.startDate,
        end_date: draft.endDate,
        pickup_location: draft.pickupLocation,
        dropoff_location: draft.dropoffLocation,
      }),
    });
    return {
      ...response,
      vehicleId: response.vehicle_id,
      customerId: response.customer_id,
      salespersonId: response.salesperson?.id,
      startDate: response.start_date,
      endDate: response.end_date,
      pickupLocation: response.pickup_location,
      dropoffLocation: response.dropoff_location,
      createdAt: response.created_at,
      vehicle: response.vehicle,
      customer: response.customer,
      salesperson: response.salesperson,
      paymentStatus: response.payment_status,
      documentStatus: response.document_status,
      timeline: []
    } as Booking;
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
    return resolve(
      customers.find((c) => c.id === CURRENT_CUSTOMER_ID)!,
      120,
    );
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
  async create(draft: Partial<MaintenanceRecord>) {
    return resolve({ ...draft, id: `M-${Date.now()}` } as MaintenanceRecord);
  }
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
    return resolve(
      { status: "successful" as const, reference: `rzp_${Date.now().toString(36)}` },
      2200,
    );
  },
};

export const documentService = {
  async list() {
    return await apiFetch(`/documents/`);
  },
  async upload(file: File, kind: string, title: string, bookingId?: string) {
    const formData = new FormData();
    formData.append("file", file);
    
    let url = `/documents/?kind=${encodeURIComponent(kind)}&title=${encodeURIComponent(title)}`;
    if (bookingId) url += `&booking_id=${encodeURIComponent(bookingId)}`;
    
    let token = null;
    const sessionRaw = localStorage.getItem("fleetflow_auth_session");
    if (sessionRaw) {
      try {
        token = JSON.parse(sessionRaw).token;
      } catch {}
    }
    const response = await fetch(`${API_BASE}${url}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`);
    }
    return response.json();
  },
  async processOCR(id: string) {
    return await apiFetch(`/documents/${id}/process-ocr`, { method: "POST" });
  },
  async extract(fileUri: string) {
    return resolve(
      {
        name: "Aviskha Talukdar",
        licenseNumber: "DL-1420210089",
        dob: "1996-04-11",
        expiry: "2036-04-10",
        confidence: 0.96,
      },
      2500,
    );
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
    const allVehicles = await vehicleService.list();
    const allBookings = await bookingService.listAll();
    const activeRentals = allBookings.filter((b) => b.status === "active").length;
    const available = allVehicles.filter((v) => v.status === "available").length;
    const inMaintenance = allVehicles.filter((v) => v.status === "maintenance").length;
    const pendingPayments = payments.filter((p) => p.status === "pending").length;
    
    return resolve({
      revenue: revenueTrend.at(-1)!.revenue,
      revenueDelta: 9.2,
      activeRentals,
      utilization: Math.round(allVehicles.reduce((s, v) => s + v.utilization, 0) / (allVehicles.length || 1)),
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
  async fleetHealth() {
    const allVehicles = await vehicleService.list();
    const allBookings = await bookingService.listAll();
    return resolve({
      overallScore: 92,
      criticalIssues: 2,
      warnings: 5,
      label: "Excellent",
      metrics: {
        totalVehicles: allVehicles.length,
        activeRentals: allBookings.filter(b => b.status === "active").length,
        inMaintenanceCount: allVehicles.filter(v => v.status === "maintenance").length,
        overdueMaintenanceCount: 2,
      },
      subScores: {
        maintenance: 94,
        availability: 88,
        utilization: 95,
        serviceCompliance: 91,
      }
    });
  }
};

/** Mock AI. Replace with a real model call behind the same signature. */
export const aiService = {
  async ask(prompt: string): Promise<AIMessage> {
    const p = prompt.toLowerCase();
    let pool = await vehicleService.list({ availableOnly: true });
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
      const veh = next ? await vehicleService.get(next.vehicleId) : null;
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
  async signIn(email: string) {
    try {
      const formData = new URLSearchParams();
      formData.append("username", email);
      formData.append("password", "password123"); // Hardcoded for existing seed data
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formData.toString()
      });
      if (!response.ok) throw new Error("Login failed");
      const data = await response.json();
      localStorage.setItem("fleetflow_token", data.access_token);
      return { ok: true, mock: false };
    } catch (e) {
      return { ok: false, mock: false };
    }
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
    const allVehicles = await vehicleService.list();
    return resolve(
      rows.map((r) => ({
        ...r,
        vehicle: allVehicles.find((v) => v.id === r.vehicleId)!,
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
        commission: rows.filter((r) => r.customerId === id).reduce((s, r) => s + r.commission, 0),
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
    const allVehicles = await vehicleService.list();
    for (const v of allVehicles) {
      if (`${v.id} ${v.name} ${v.registration}`.toLowerCase().includes(q))
        hits.push({
          id: v.id,
          label: `${v.id} · ${v.name}`,
          sub: v.registration,
          group: "Vehicles",
          to: "/admin/vehicles/$id",
          params: { id: v.id },
        });
    }
    for (const b of bookings) {
      if (`${b.id} ${b.status}`.toLowerCase().includes(q))
        hits.push({
          id: b.id,
          label: b.id,
          sub: `${b.status} · ${b.startDate}`,
          group: "Bookings",
          to: "/admin/bookings",
        });
    }
    for (const c of customers) {
      if (`${c.id} ${c.name} ${c.phone}`.toLowerCase().includes(q))
        hits.push({
          id: c.id,
          label: `${c.id} · ${c.name}`,
          sub: c.phone,
          group: "Customers",
          to: "/admin/customers",
        });
    }
    for (const p of payments) {
      if (`${p.id} ${p.reference}`.toLowerCase().includes(q))
        hits.push({
          id: p.id,
          label: p.id,
          sub: `${p.status} · ${p.method}`,
          group: "Payments",
          to: "/admin/payments",
        });
    }
    for (const m of maintenanceRecords) {
      if (`${m.id} ${m.type}`.toLowerCase().includes(q))
        hits.push({
          id: m.id,
          label: m.id,
          sub: m.type,
          group: "Maintenance",
          to: "/admin/maintenance",
        });
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
