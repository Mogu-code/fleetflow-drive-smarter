/**
 * FleetFlow API Adapter Layer
 *
 * Connects Vehicles, Customers, and Rental Agreements to the Node.js/Express
 * REST backend (http://localhost:5000/api) when online, with transparent
 * fallback to the centralized mock datasets if the server is offline.
 */

const API_BASE_URL = "http://localhost:5000/api";

export async function isBackendOnline(): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE_URL}/health`, { signal: AbortSignal.timeout(1500) });
    return res.ok;
  } catch {
    return false;
  }
}

// =============================================================================
// VEHICLE API ADAPTERS
// =============================================================================

export async function fetchVehiclesApi(query?: { status?: string; category?: string }) {
  const params = new URLSearchParams();
  if (query?.status) params.set("status", query.status);
  if (query?.category) params.set("category", query.category);

  const res = await fetch(`${API_BASE_URL}/vehicles?${params.toString()}`);
  if (!res.ok) throw new Error("Failed to fetch vehicles from API");
  return res.json();
}

export async function createVehicleApi(data: {
  id: string;
  type: string;
  model: string;
  registration: string;
  fuel: string;
  seats: number;
  pricePerDay?: number;
  location?: string;
}) {
  const res = await fetch(`${API_BASE_URL}/vehicles`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Failed to create vehicle via REST API");
  }
  return res.json();
}

export async function updateVehicleStatusApi(id: string, status: string) {
  const res = await fetch(`${API_BASE_URL}/vehicles/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
  if (!res.ok) throw new Error("Failed to update vehicle status via REST API");
  return res.json();
}

// =============================================================================
// CUSTOMER API ADAPTERS
// =============================================================================

export async function fetchCustomersApi() {
  const res = await fetch(`${API_BASE_URL}/customers`);
  if (!res.ok) throw new Error("Failed to fetch customers from API");
  return res.json();
}

export async function createCustomerApi(data: {
  id: string;
  name: string;
  dob: string;
  gender: string;
  phone: string;
  licenseNumber: string;
}) {
  const res = await fetch(`${API_BASE_URL}/customers`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Failed to create customer via REST API");
  }
  return res.json();
}

// =============================================================================
// RENTAL AGREEMENT API ADAPTERS (ACID Transaction)
// =============================================================================

export async function fetchRentalAgreementsApi() {
  const res = await fetch(`${API_BASE_URL}/rental-agreements`);
  if (!res.ok) throw new Error("Failed to fetch rental agreements from API");
  return res.json();
}

export async function createRentalAgreementApi(data: {
  id: string;
  customerId: string;
  vehicleId: string;
  startDate: string;
  endDate: string;
  totalAmount: number;
}) {
  const res = await fetch(`${API_BASE_URL}/rental-agreements`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Failed to execute Rental Agreement ACID transaction");
  }
  return res.json();
}
