import heroVehicle from "@/assets/hero-vehicle.jpg";
import vehSedan from "@/assets/veh-sedan.jpg";
import vehHatchback from "@/assets/veh-hatchback.jpg";
import vehLuxury from "@/assets/veh-luxury.jpg";
import vehElectric from "@/assets/veh-electric.jpg";
import vehMuv from "@/assets/veh-muv.jpg";

import type {
  AIInsight,
  BookRelation,
  RentalAgreement,
  ServiceAssignment,
  Booking,
  Customer,
  Employee,
  FleetDocument,
  FleetNotification,
  MaintenanceRecord,
  Payment,
  Recommendation,
  Review,
  Vehicle,
  VehicleCategory,
} from "@/types";

export const IMAGES: Record<VehicleCategory, string> = {
  SUV: heroVehicle,
  Sedan: vehSedan,
  Hatchback: vehHatchback,
  Luxury: vehLuxury,
  Electric: vehElectric,
  MUV: vehMuv,
  Convertible: vehLuxury,
};

export const LOCATIONS = [
  "Bengaluru — Indiranagar Hub",
  "Bengaluru — KIA Airport",
  "Mumbai — Bandra Kurla",
  "Delhi — Aerocity",
  "Pune — Baner",
  "Hyderabad — Gachibowli",
  "Chennai — Guindy",
  "Goa — Dabolim",
];

const FEATURES = [
  "Adaptive cruise control",
  "360° parking camera",
  "Ventilated front seats",
  "Wireless CarPlay & Android Auto",
  "Panoramic sunroof",
  "Lane keep assist",
  "Six airbags",
  "Digital cockpit",
  "Ambient lighting",
  "Hands-free tailgate",
];

function iso(daysFromNow: number) {
  const d = new Date(Date.UTC(2026, 7, 22));
  d.setUTCDate(d.getUTCDate() + daysFromNow);
  return d.toISOString().slice(0, 10);
}

type Seed = [
  string,
  string,
  VehicleCategory,
  Vehicle["fuel"],
  Vehicle["transmission"],
  number,
  number,
  Vehicle["status"],
];

const SEEDS: Seed[] = [
  ["Volvo XC60 Ultimate", "Volvo", "SUV", "Petrol", "Automatic", 5, 6499, "available"],
  ["Toyota Fortuner Legender", "Toyota", "SUV", "Diesel", "Automatic", 7, 5899, "rented"],
  ["Mahindra XUV700 AX7", "Mahindra", "SUV", "Diesel", "Automatic", 7, 3499, "available"],
  ["Jeep Compass Trailhawk", "Jeep", "SUV", "Diesel", "Automatic", 5, 4199, "maintenance"],
  ["Hyundai Creta SX(O)", "Hyundai", "SUV", "Petrol", "Manual", 5, 2599, "available"],
  ["BMW 530i M Sport", "BMW", "Sedan", "Petrol", "Automatic", 5, 8999, "available"],
  ["Skoda Superb Laurin", "Skoda", "Sedan", "Petrol", "Automatic", 5, 4599, "reserved"],
  ["Honda City ZX", "Honda", "Sedan", "Hybrid", "Automatic", 5, 2299, "available"],
  ["Hyundai Verna SX", "Hyundai", "Sedan", "Petrol", "Manual", 5, 1899, "available"],
  ["Maruti Baleno Alpha", "Maruti", "Hatchback", "Petrol", "Manual", 5, 1499, "available"],
  ["Tata Altroz Racer", "Tata", "Hatchback", "Petrol", "Manual", 5, 1399, "rented"],
  ["Mercedes-Benz S 450", "Mercedes-Benz", "Luxury", "Petrol", "Automatic", 5, 18999, "available"],
  ["Audi A6 Technology", "Audi", "Luxury", "Petrol", "Automatic", 5, 12499, "reserved"],
  ["Porsche Macan GTS", "Porsche", "Luxury", "Petrol", "Automatic", 5, 22999, "maintenance"],
  ["Tata Nexon EV Empowered", "Tata", "Electric", "Electric", "Automatic", 5, 2799, "available"],
  ["MG ZS EV Exclusive", "MG", "Electric", "Electric", "Automatic", 5, 3299, "available"],
  ["BYD Atto 3 Superior", "BYD", "Electric", "Electric", "Automatic", 5, 3899, "available"],
  ["Kia Carens Luxury Plus", "Kia", "MUV", "Diesel", "Manual", 7, 2999, "available"],
  ["Toyota Innova Hycross", "Toyota", "MUV", "Hybrid", "Automatic", 8, 4499, "rented"],
  ["Mini Cooper S Convertible", "Mini", "Convertible", "Petrol", "Automatic", 4, 9499, "inactive"],
];

export const vehicles: Vehicle[] = SEEDS.map((s, i) => {
  const [name, make, category, fuel, transmission, seats, pricePerDay, status] = s;
  const id = `V${101 + i}`;
  const image = IMAGES[category];
  return {
    id,
    name,
    make,
    model: name.replace(`${make} `, ""),
    year: 2022 + (i % 4),
    registration: `KA${(1 + (i % 9)).toString().padStart(2, "0")}FF${(1000 + i * 37) % 10000}`,
    category,
    fuel,
    transmission,
    seats,
    mileage: fuel === "Electric" ? `${380 + (i % 5) * 20} km range` : `${12 + (i % 8)} km/l`,
    pricePerDay,
    rating: Number((4.2 + ((i * 7) % 8) / 10).toFixed(1)),
    reviewCount: 38 + ((i * 17) % 220),
    status,
    location: LOCATIONS[i % LOCATIONS.length]!,
    image,
    gallery: [image, IMAGES.Luxury, IMAGES.Sedan],
    features: FEATURES.slice(i % 4, (i % 4) + 6),
    description: `The ${name} is part of FleetFlow's ${category.toLowerCase()} line — inspected before every handover, delivered fully fuelled${fuel === "Electric" ? " and charged" : ""}, and covered by roadside assistance across all ${LOCATIONS.length} hubs.`,
    odometerKm: 8000 + i * 3100,
    lastServiceDate: iso(-40 - (i % 30)),
    nextServiceDate: iso(20 - (i % 40)),
    utilization: 42 + ((i * 13) % 54),
    revenueGenerated: 180000 + i * 47500,
    currentRenterId: status === "rented" ? `C${201 + (i % 20)}` : undefined,
    unavailableDates: i % 3 === 0 ? [iso(2), iso(3), iso(4)] : i % 4 === 0 ? [iso(6), iso(7)] : [],
  };
});

const FIRST = [
  "Aarav",
  "Aviskha",
  "Kabir",
  "Ananya",
  "Rohan",
  "Ishita",
  "Devansh",
  "Meera",
  "Vikram",
  "Sanya",
  "Arjun",
  "Nikita",
  "Rahul",
  "Tara",
  "Aditya",
  "Priya",
  "Karthik",
  "Neha",
  "Siddharth",
  "Riya",
];
const LAST = [
  "Sharma",
  "Gupta",
  "Iyer",
  "Menon",
  "Kapoor",
  "Reddy",
  "Nair",
  "Bose",
  "Chopra",
  "Verma",
  "Rao",
  "Joshi",
  "Malhotra",
  "Sen",
  "Pillai",
  "Desai",
];

export const customers: Customer[] = FIRST.map((f, i) => {
  const name = `${f} ${LAST[i % LAST.length]}`;
  return {
    id: `C${201 + i}`,
    name,
    email: `${f.toLowerCase()}.${LAST[i % LAST.length]!.toLowerCase()}@example.com`,
    phone: `+91 9${(800000000 + i * 13457).toString().slice(0, 9)}`,
    dob: `19${85 + (i % 15)}-0${1 + (i % 9)}-1${i % 9}`,
    licenseNumber: `KA${(1 + (i % 9)).toString().padStart(2, "0")}${20180000000 + i * 4213}`,
    licenseExpiry: iso(400 + i * 20),
    city: LOCATIONS[i % LOCATIONS.length]!.split(" — ")[0]!,
    joinedAt: iso(-720 + i * 26),
    status: i % 11 === 0 ? "pending" : i % 17 === 0 ? "suspended" : "active",
    totalBookings: 1 + ((i * 3) % 14),
    totalSpend: 12500 + i * 8400,
    lastRentalAt: i % 9 === 0 ? null : iso(-(3 + i * 4)),
    salespersonId: `E${301 + (i % 3)}`,
    savedVehicleIds: [vehicles[i % vehicles.length]!.id, vehicles[(i + 5) % vehicles.length]!.id],
  };
});

export const CURRENT_CUSTOMER_ID = "C202";

export const employees: Employee[] = [
  {
    id: "E301",
    name: "Rithika Menon",
    email: "rithika.menon@fleetflow.in",
    phone: "+91 98450 11201",
    role: "Salesperson",
    branch: "Bengaluru — Indiranagar Hub",
    status: "active",
    joinedAt: iso(-980),
    target: 1800000,
    achieved: 1542000,
    commissionRate: 3.5,
  },
  {
    id: "E302",
    name: "Imran Qureshi",
    email: "imran.qureshi@fleetflow.in",
    phone: "+91 98450 11202",
    role: "Salesperson",
    branch: "Mumbai — Bandra Kurla",
    status: "active",
    joinedAt: iso(-640),
    target: 2200000,
    achieved: 2310000,
    commissionRate: 4,
  },
  {
    id: "E303",
    name: "Sneha Kulkarni",
    email: "sneha.kulkarni@fleetflow.in",
    phone: "+91 98450 11203",
    role: "Salesperson",
    branch: "Pune — Baner",
    status: "on-leave",
    joinedAt: iso(-410),
    target: 1400000,
    achieved: 890000,
    commissionRate: 3,
  },
  {
    id: "E311",
    name: "Dinesh Waghmare",
    email: "dinesh.w@fleetflow.in",
    phone: "+91 98450 11311",
    role: "Mechanic",
    branch: "Bengaluru — Indiranagar Hub",
    status: "active",
    joinedAt: iso(-1200),
    specialization: "Diesel powertrain",
    shift: "Morning",
  },
  {
    id: "E312",
    name: "Farah Sheikh",
    email: "farah.sheikh@fleetflow.in",
    phone: "+91 98450 11312",
    role: "Mechanic",
    branch: "Mumbai — Bandra Kurla",
    status: "active",
    joinedAt: iso(-520),
    specialization: "EV battery & HV systems",
    shift: "Evening",
  },
  {
    id: "E313",
    name: "Joseph Mathew",
    email: "joseph.mathew@fleetflow.in",
    phone: "+91 98450 11313",
    role: "Mechanic",
    branch: "Hyderabad — Gachibowli",
    status: "active",
    joinedAt: iso(-300),
    specialization: "Body & paint",
    shift: "Night",
  },
  {
    id: "E321",
    name: "Anjali Deshpande",
    email: "anjali.d@fleetflow.in",
    phone: "+91 98450 11321",
    role: "Manager",
    branch: "Bengaluru — Indiranagar Hub",
    status: "active",
    joinedAt: iso(-1500),
    managedBranch: "Bengaluru — Indiranagar Hub",
    headcount: 14,
  },
  {
    id: "E322",
    name: "Rajeev Khanna",
    email: "rajeev.khanna@fleetflow.in",
    phone: "+91 98450 11322",
    role: "Manager",
    branch: "Delhi — Aerocity",
    status: "active",
    joinedAt: iso(-860),
    managedBranch: "Delhi — Aerocity",
    headcount: 11,
  },
];

const STATUSES: Booking["status"][] = [
  "confirmed",
  "active",
  "completed",
  "completed",
  "cancelled",
  "pending",
  "completed",
  "confirmed",
];

function timelineFor(status: Booking["status"], start: string): Booking["timeline"] {
  const stages = ["Booked", "Confirmed", "Pickup", "Active", "Returned", "Completed"];
  const reached: Record<Booking["status"], number> = {
    pending: 1,
    confirmed: 2,
    active: 4,
    completed: 6,
    cancelled: 1,
  };
  return stages.map((label, idx) => ({
    label,
    at: idx < reached[status] ? start : null,
    done: idx < reached[status],
  }));
}

export const bookings: Booking[] = Array.from({ length: 24 }, (_, i) => {
  const vehicle = vehicles[(i * 3) % vehicles.length]!;
  const customer = customers[(i * 5) % customers.length]!;
  const status = STATUSES[i % STATUSES.length]!;
  const offset = status === "completed" || status === "cancelled" ? -(10 + i * 5) : 1 + (i % 18);
  const days = 2 + (i % 6);
  const subtotal = vehicle.pricePerDay * days;
  const taxes = Math.round(subtotal * 0.18);
  const insurance = 499;
  return {
    id: `FF-${24810 + i * 7}`,
    vehicleId: vehicle.id,
    customerId: customer.id,
    salespersonId: `E${301 + (i % 3)}`,
    startDate: iso(offset),
    endDate: iso(offset + days),
    pickupLocation: vehicle.location,
    dropoffLocation: LOCATIONS[(i + 2) % LOCATIONS.length]!,
    status,
    subtotal,
    taxes,
    insurance,
    total: subtotal + taxes + insurance,
    createdAt: iso(offset - 6),
    agreementId: status === "cancelled" ? undefined : `AGR-${9100 + i}`,
    timeline: timelineFor(status, iso(offset)),
  };
});

export const payments: Payment[] = bookings.map((b, i) => ({
  id: `PAY-${70210 + i * 3}`,
  bookingId: b.id,
  customerId: b.customerId,
  amount: b.total,
  date: b.createdAt,
  method: (["Card", "UPI", "Netbanking", "Wallet"] as const)[i % 4]!,
  status:
    b.status === "cancelled"
      ? "refunded"
      : b.status === "pending"
        ? "pending"
        : i % 13 === 0
          ? "failed"
          : "paid",
  reference: `rzp_${(9182736 + i * 4517).toString(36)}`,
}));

const MAINT_TYPES = [
  "Scheduled 10,000 km service",
  "Brake pad replacement",
  "Tyre rotation & alignment",
  "HV battery health check",
  "AC condenser repair",
  "Clutch overhaul",
  "Annual inspection",
];

export const maintenanceRecords: MaintenanceRecord[] = Array.from({ length: 18 }, (_, i) => {
  const vehicle = vehicles[(i * 2) % vehicles.length]!;
  const status = (["completed", "scheduled", "in-progress", "completed", "overdue"] as const)[
    i % 5
  ]!;
  return {
    id: `${vehicle.id}-M${i + 1}`,
    vehicleId: vehicle.id,
    mechanicId: ["E311", "E312", "E313"][i % 3]!,
    type: MAINT_TYPES[i % MAINT_TYPES.length]!,
    description: `${MAINT_TYPES[i % MAINT_TYPES.length]} carried out at the ${vehicle.location} workshop bay.`,
    status,
    scheduledFor: status === "completed" ? iso(-(12 + i * 6)) : iso(1 + (i % 21)),
    completedAt: status === "completed" ? iso(-(11 + i * 6)) : null,
    cost: 2400 + i * 1150,
    odometerKm: vehicle.odometerKm - (i % 5) * 400,
  };
});

export const documents: FleetDocument[] = [
  {
    id: "DOC-5001",
    customerId: CURRENT_CUSTOMER_ID,
    kind: "Driving License",
    title: "Driving licence — KA0320180004213",
    uploadedAt: iso(-120),
    status: "verified",
    expiresAt: iso(620),
  },
  {
    id: "DOC-5002",
    customerId: CURRENT_CUSTOMER_ID,
    kind: "Rental Agreement",
    title: "Rental agreement — FF-24817",
    uploadedAt: iso(-18),
    status: "verified",
    bookingId: "FF-24817",
  },
  {
    id: "DOC-5003",
    customerId: CURRENT_CUSTOMER_ID,
    kind: "Invoice",
    title: "Invoice — FF-24810",
    uploadedAt: iso(-46),
    status: "verified",
    bookingId: "FF-24810",
  },
  {
    id: "DOC-5004",
    customerId: CURRENT_CUSTOMER_ID,
    kind: "Payment Receipt",
    title: "Receipt — PAY-70213",
    uploadedAt: iso(-46),
    status: "verified",
  },
  {
    id: "DOC-5005",
    customerId: CURRENT_CUSTOMER_ID,
    kind: "ID Proof",
    title: "Address proof — utility bill",
    uploadedAt: iso(-4),
    status: "pending",
  },
];

export const reviews: Review[] = Array.from({ length: 16 }, (_, i) => {
  const vehicle = vehicles[i % vehicles.length]!;
  const bodies = [
    "Picked up at 6am for an airport run and the car was already cooled and charged. Handover took four minutes.",
    "Second time renting this one. Interior was spotless and the fuel policy was exactly as stated — no surprise charges.",
    "Great highway车 stability on the Pune expressway. Only nitpick: the phone mount was missing.",
    "Booking modification through the app was painless when our flight moved by a day.",
  ];
  return {
    id: `R-${400 + i}`,
    vehicleId: vehicle.id,
    customerId: customers[(i * 3) % customers.length]!.id,
    rating: 4 + (i % 2),
    title: ["Effortless pickup", "Exactly as listed", "Solid long-drive car", "Flexible and fair"][
      i % 4
    ]!,
    body: bodies[i % 4]!.replace("车", " "),
    createdAt: iso(-(5 + i * 9)),
  };
});

export const notifications: FleetNotification[] = [
  {
    id: "N1",
    kind: "booking",
    title: "Booking confirmed",
    body: "FF-24817 — Volvo XC60 Ultimate, pickup Aug 24, 09:00.",
    at: "2h ago",
    read: false,
  },
  {
    id: "N2",
    kind: "payment",
    title: "Payment successful",
    body: "₹9,345 received via UPI for FF-24817.",
    at: "2h ago",
    read: false,
  },
  {
    id: "N3",
    kind: "document",
    title: "Licence verified",
    body: "Your driving licence passed verification.",
    at: "Yesterday",
    read: true,
  },
  {
    id: "N4",
    kind: "reminder",
    title: "Return reminder",
    body: "Drop off the Tata Nexon EV by 18:00 tomorrow.",
    at: "Yesterday",
    read: true,
  },
  {
    id: "N5",
    kind: "maintenance",
    title: "Maintenance alert",
    body: "V114 Porsche Macan GTS is overdue for its annual inspection.",
    at: "2d ago",
    read: true,
  },
  {
    id: "N6",
    kind: "ai",
    title: "New recommendation",
    body: "Three automatic SUVs under ₹3,500 match your last trip.",
    at: "3d ago",
    read: true,
  },
];

export const recommendations: Recommendation[] = [
  {
    id: "RC1",
    vehicleId: "V103",
    reason: "Because you rented the Hyundai Creta in July",
    bucket: "because-you-rented",
    confidence: 0.86,
  },
  {
    id: "RC2",
    vehicleId: "V118",
    reason: "Seats 7 — matches your last two group trips",
    bucket: "because-you-rented",
    confidence: 0.79,
  },
  {
    id: "RC3",
    vehicleId: "V115",
    reason: "Electric, and your average trip is under 220 km",
    bucket: "you-may-like",
    confidence: 0.72,
  },
  {
    id: "RC4",
    vehicleId: "V106",
    reason: "Highly rated by customers with similar history",
    bucket: "you-may-like",
    confidence: 0.68,
  },
  {
    id: "RC5",
    vehicleId: "V105",
    reason: "Most booked at Indiranagar Hub this month",
    bucket: "popular-near-you",
    confidence: 0.81,
  },
  {
    id: "RC6",
    vehicleId: "V110",
    reason: "Within your typical ₹1,500–2,500 per day range",
    bucket: "budget-match",
    confidence: 0.74,
  },
];

export const aiInsights: AIInsight[] = [
  {
    id: "AI1",
    category: "demand",
    title: "Weekend SUV demand trending above average",
    detail:
      "Requests for 7-seat SUVs at Bengaluru hubs are running ~22% above the four-week weekend average. Consider shifting two MUVs from Pune.",
    confidence: 0.74,
    impact: "high",
  },
  {
    id: "AI2",
    category: "utilization",
    title: "Luxury segment is under-utilised on weekdays",
    detail:
      "Mon–Thu utilisation for the Luxury category sits at 38% against a fleet average of 61%. A weekday corporate rate could recover idle days.",
    confidence: 0.69,
    impact: "medium",
  },
  {
    id: "AI3",
    category: "revenue",
    title: "Electric category leads revenue per available day",
    detail:
      "EVs earned ₹2,910 per available day last month versus ₹2,240 fleet-wide, helped by lower downtime.",
    confidence: 0.82,
    impact: "high",
  },
  {
    id: "AI4",
    category: "maintenance",
    title: "V104 servicing more often than similar vehicles",
    detail:
      "The Jeep Compass Trailhawk has had 3 unscheduled repairs in 90 days — roughly 2.4× comparable diesel SUVs. Worth a diagnostic review before renewal.",
    confidence: 0.77,
    impact: "high",
  },
  {
    id: "AI5",
    category: "maintenance",
    title: "SUV maintenance spend up 14% month-on-month",
    detail:
      "Driven mainly by brake and tyre work across high-mileage units. Not yet outside seasonal norms.",
    confidence: 0.63,
    impact: "medium",
  },
  {
    id: "AI6",
    category: "customer",
    title: "Repeat customers convert faster from recommendations",
    detail:
      "Customers with 3+ prior rentals book from a recommendation within 2.1 days on average, versus 6.4 days for first-time users.",
    confidence: 0.71,
    impact: "medium",
  },
];

export const revenueTrend = [
  { month: "Mar", revenue: 1840000, bookings: 218 },
  { month: "Apr", revenue: 2120000, bookings: 246 },
  { month: "May", revenue: 2480000, bookings: 291 },
  { month: "Jun", revenue: 2260000, bookings: 268 },
  { month: "Jul", revenue: 2790000, bookings: 312 },
  { month: "Aug", revenue: 3040000, bookings: 338 },
];

export const utilizationTrend = [
  { week: "W1", utilization: 58 },
  { week: "W2", utilization: 63 },
  { week: "W3", utilization: 61 },
  { week: "W4", utilization: 69 },
  { week: "W5", utilization: 72 },
  { week: "W6", utilization: 67 },
];

export const categoryMix = [
  { category: "SUV", value: 34 },
  { category: "Sedan", value: 22 },
  { category: "Electric", value: 17 },
  { category: "Hatchback", value: 13 },
  { category: "MUV", value: 9 },
  { category: "Luxury", value: 5 },
];

export const testimonials = [
  {
    name: "Nandini Rao",
    role: "Design lead, Bengaluru",
    quote:
      "I book the same XUV700 for every site visit. The handover is four minutes and the fuel reading always matches the contract.",
  },
  {
    name: "Feroz Ahmed",
    role: "Operations manager, Mumbai",
    quote:
      "We moved our whole client-visit fleet to FleetFlow. Invoices land the same evening and I can see every open rental on one screen.",
  },
  {
    name: "Ipsita Deb",
    role: "Photographer, Goa",
    quote:
      "Needed a convertible for two days on short notice. The assistant found one at Dabolim and I was driving within the hour.",
  },
];

/* ------------------------------------------------------------------ *
 * Relational extensions — Rental Agreement entity and the two
 * many-to-many junctions from the ER model (Books, Services).
 * Shaped exactly like the future SQL junction tables.
 * ------------------------------------------------------------------ */

export const rentalAgreements: RentalAgreement[] = bookings
  .filter((b) => b.agreementId)
  .map((b) => {
    const days = Math.max(
      1,
      Math.round(
        (new Date(b.endDate + "T00:00:00Z").getTime() -
          new Date(b.startDate + "T00:00:00Z").getTime()) /
          86400000,
      ),
    );
    const status: RentalAgreement["status"] =
      b.status === "completed" ? "closed" : b.status === "pending" ? "draft" : "active";
    return {
      id: b.agreementId!,
      bookingId: b.id,
      customerId: b.customerId,
      vehicleId: b.vehicleId,
      salespersonId: b.salespersonId,
      startDate: b.startDate,
      endDate: b.endDate,
      durationDays: days,
      amount: b.total,
      status,
      signedAt: status === "draft" ? null : b.createdAt,
      terms: [
        "Fuel/charge level at return must match the level recorded at handover.",
        "Included 250 km per rental day; ₹14 per additional kilometre.",
        "Damage liability capped at ₹15,000 with the standard insurance add-on.",
        "Only drivers listed on this agreement may operate the vehicle.",
        "Late return is charged at 10% of the daily rate per hour.",
      ],
    };
  });

/** Services junction: a mechanic services many vehicles; a vehicle is serviced by many mechanics. */
export const serviceAssignments: ServiceAssignment[] = maintenanceRecords.map((m, i) => ({
  mechanicId: m.mechanicId,
  vehicleId: m.vehicleId,
  maintenanceId: m.id,
  servicedOn: m.completedAt ?? m.scheduledFor,
  hours: 2 + (i % 5),
}));

/** Books junction: a salesperson books for many customers; a customer books via many salespersons. */
export const bookRelations: BookRelation[] = bookings
  .filter((b) => b.salespersonId)
  .map((b) => ({
    salespersonId: b.salespersonId!,
    customerId: b.customerId,
    bookingId: b.id,
    bookedOn: b.createdAt,
    commission: Math.round(b.total * 0.035),
  }));

export const howItWorks = [
  {
    step: "01",
    title: "Find your vehicle",
    body: "Filter the live fleet by location, dates, category and budget. Availability is checked against real rental windows.",
  },
  {
    step: "02",
    title: "Verify your licence",
    body: "Upload your driving licence once. We extract the details, you confirm them, and it stays verified for future rentals.",
  },
  {
    step: "03",
    title: "Pay and sign",
    body: "Transparent pricing with taxes and insurance itemised. Your rental agreement is generated the moment payment clears.",
  },
  {
    step: "04",
    title: "Drive and return",
    body: "Contactless handover at the hub. Track your active rental, extend it, and close it out with a digital return check.",
  },
];

export const branchStats = LOCATIONS.map((location, i) => ({
  location,
  vehicles: 18 + ((i * 7) % 23),
  utilization: 52 + ((i * 9) % 34),
  openRentals: 4 + ((i * 3) % 11),
}));
