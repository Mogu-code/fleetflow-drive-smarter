// FleetFlow domain model — mirrors the relational schema that the future
// backend will expose. UI components consume these types only.

export type VehicleCategory =
  | "SUV"
  | "Sedan"
  | "Hatchback"
  | "Luxury"
  | "Electric"
  | "MUV"
  | "Convertible";

export type FuelType = "Petrol" | "Diesel" | "Electric" | "Hybrid" | "CNG";
export type Transmission = "Automatic" | "Manual";

export type VehicleStatus =
  | "available"
  | "reserved"
  | "rented"
  | "maintenance"
  | "inactive";

export interface Vehicle {
  id: string;
  name: string;
  make: string;
  model: string;
  year: number;
  registration: string;
  category: VehicleCategory;
  fuel: FuelType;
  transmission: Transmission;
  seats: number;
  mileage: string;
  pricePerDay: number;
  rating: number;
  reviewCount: number;
  status: VehicleStatus;
  location: string;
  image: string;
  gallery: string[];
  features: string[];
  description: string;
  odometerKm: number;
  lastServiceDate: string;
  nextServiceDate: string;
  utilization: number; // 0-100
  revenueGenerated: number;
  currentRenterId?: string | undefined;
  unavailableDates: string[]; // ISO dates
}

export type BookingStatus =
  | "pending"
  | "confirmed"
  | "active"
  | "completed"
  | "cancelled";

export interface BookingTimelineEvent {
  label: string;
  at: string | null;
  done: boolean;
}

export interface Booking {
  id: string;
  vehicleId: string;
  customerId: string;
  salespersonId?: string | undefined;
  startDate: string;
  endDate: string;
  pickupLocation: string;
  dropoffLocation: string;
  status: BookingStatus;
  subtotal: number;
  taxes: number;
  insurance: number;
  total: number;
  createdAt: string;
  agreementId?: string | undefined;
  timeline: BookingTimelineEvent[];
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  dob: string;
  licenseNumber: string;
  licenseExpiry: string;
  city: string;
  joinedAt: string;
  status: "active" | "suspended" | "pending";
  totalBookings: number;
  totalSpend: number;
  lastRentalAt: string | null;
  salespersonId?: string | undefined;
  savedVehicleIds: string[];
}

export type EmployeeRole = "Salesperson" | "Mechanic" | "Manager";

export interface EmployeeBase {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: EmployeeRole;
  branch: string;
  status: "active" | "on-leave" | "inactive";
  joinedAt: string;
}

export interface Salesperson extends EmployeeBase {
  role: "Salesperson";
  target: number;
  achieved: number;
  commissionRate: number;
}

export interface Mechanic extends EmployeeBase {
  role: "Mechanic";
  specialization: string;
  shift: "Morning" | "Evening" | "Night";
}

export interface Manager extends EmployeeBase {
  role: "Manager";
  managedBranch: string;
  headcount: number;
}

export type Employee = Salesperson | Mechanic | Manager;

export type MaintenanceStatus =
  | "scheduled"
  | "in-progress"
  | "completed"
  | "overdue";

/** Weak entity: identified by its parent vehicle. */
export interface MaintenanceRecord {
  id: string;
  vehicleId: string;
  mechanicId: string;
  type: string;
  description: string;
  status: MaintenanceStatus;
  scheduledFor: string;
  completedAt: string | null;
  cost: number;
  odometerKm: number;
}

export type PaymentStatus = "paid" | "pending" | "failed" | "refunded";
export type PaymentMethod = "Card" | "UPI" | "Netbanking" | "Wallet";

export interface Payment {
  id: string;
  bookingId: string;
  customerId: string;
  amount: number;
  date: string;
  method: PaymentMethod;
  status: PaymentStatus;
  reference: string;
}

export type DocumentKind =
  | "Driving License"
  | "Rental Agreement"
  | "Invoice"
  | "Payment Receipt"
  | "ID Proof";

export type DocumentStatus = "verified" | "pending" | "expired" | "rejected";

export interface FleetDocument {
  id: string;
  customerId: string;
  kind: DocumentKind;
  title: string;
  uploadedAt: string;
  status: DocumentStatus;
  bookingId?: string | undefined;
  expiresAt?: string | undefined;
}

export interface Review {
  id: string;
  vehicleId: string;
  customerId: string;
  rating: number;
  title: string;
  body: string;
  createdAt: string;
}

export type NotificationKind =
  | "booking"
  | "payment"
  | "document"
  | "maintenance"
  | "ai"
  | "reminder";

export interface FleetNotification {
  id: string;
  kind: NotificationKind;
  title: string;
  body: string;
  at: string;
  read: boolean;
}

export interface Recommendation {
  id: string;
  vehicleId: string;
  reason: string;
  bucket: "because-you-rented" | "you-may-like" | "popular-near-you" | "budget-match";
  confidence: number;
}

export interface AIMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  vehicleIds?: string[] | undefined;
  actions?: { label: string; to?: string | undefined }[] | undefined;
  pending?: boolean | undefined;
}

export interface OCRResult {
  name: string;
  licenseNumber: string;
  dob: string;
  expiry: string;
  confidence: number;
}

export interface AIInsight {
  id: string;
  category: "demand" | "utilization" | "revenue" | "maintenance" | "customer";
  title: string;
  detail: string;
  confidence: number;
  impact: "high" | "medium" | "low";
}

/** Rental Agreement — the contract entity produced by a confirmed booking. */
export interface RentalAgreement {
  id: string;
  bookingId: string;
  customerId: string;
  vehicleId: string;
  salespersonId?: string | undefined;
  startDate: string;
  endDate: string;
  durationDays: number;
  amount: number;
  status: "draft" | "active" | "closed" | "cancelled";
  signedAt: string | null;
  terms: string[];
}

/** Junction row for the Mechanic ↔ Vehicle "Services" many-to-many. */
export interface ServiceAssignment {
  mechanicId: string;
  vehicleId: string;
  maintenanceId: string;
  servicedOn: string;
  hours: number;
}

/** Junction row for the Customer ↔ Salesperson "Books" many-to-many. */
export interface BookRelation {
  salespersonId: string;
  customerId: string;
  bookingId: string;
  bookedOn: string;
  commission: number;
}
