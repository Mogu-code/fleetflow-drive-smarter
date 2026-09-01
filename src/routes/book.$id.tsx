import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { format, differenceInDays } from "date-fns";
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  ShieldCheck,
  MapPin,
  CalendarDays,
  Upload,
  FileText,
  CreditCard,
  Loader2,
  Download,
} from "lucide-react";

import { SiteHeader, SiteFooter } from "@/components/fleet/site-chrome";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { inr } from "@/lib/format";
import {
  vehicleService,
  documentService,
  paymentService,
  bookingService,
  CURRENT_CUSTOMER_ID,
} from "@/lib/services";
import type { OCRResult, Booking, RentalAgreement } from "@/types";

import { ProtectedRoute } from "@/components/auth/protected-route";

type BookSearch = { pickup?: string; return?: string };

export const Route = createFileRoute("/book/$id")({
  validateSearch: (search: Record<string, unknown>): BookSearch => ({
    ...(typeof search["pickup"] === "string" ? { pickup: search["pickup"] } : {}),
    ...(typeof search["return"] === "string" ? { return: search["return"] } : {}),
  }),
  head: () => ({
    meta: [{ title: "Book Vehicle — FleetFlow" }],
  }),
  component: BookingFlowWrapper,
});

function BookingFlowWrapper() {
  return (
    <ProtectedRoute allowedRoles={["Customer", "Salesperson", "Mechanic", "Manager"]}>
      <BookingFlow />
    </ProtectedRoute>
  );
}

const STEPS = ["Vehicle", "Schedule", "Customer", "Documents", "Review", "Payment", "Confirmation"];

function BookingFlow() {
  const { id } = Route.useParams();
  const search = Route.useSearch();
  const navigate = useNavigate();

  const { data: vehicle, isPending: loadingVehicle } = useQuery({
    queryKey: ["vehicle", id],
    queryFn: () => vehicleService.get(id),
  });

  const [step, setStep] = useState(0);

  // Form State
  const [schedule, setSchedule] = useState({
    pickupLocation: "",
    returnLocation: "",
    pickupDate: search.pickup || "",
    returnDate: search.return || "",
  });
  const [customer, setCustomer] = useState({
    name: "Aviskha Talukdar",
    email: "aviskha.talukdar@example.com",
    phone: "+91 9876543210",
    dob: "1996-04-11",
  });
  const [document, setDocument] = useState<OCRResult | null>(null);

  const [bookingResult, setBookingResult] = useState<{
    booking: Booking;
    agreement: RentalAgreement;
  } | null>(null);

  // Mutations
  const checkAvailability = useMutation({
    mutationFn: () =>
      vehicleService.checkAvailability(id, schedule.pickupDate, schedule.returnDate),
  });

  const extractDoc = useMutation({
    mutationFn: () => documentService.extract("license_upload.jpg"),
    onSuccess: (data) => setDocument(data),
  });

  const processPayment = useMutation({
    mutationFn: async () => {
      // 1. Process Payment
      await paymentService.process(estimatedTotal, "Card");
      // 2. Create Booking
      const b = await bookingService.create({
        vehicleId: id,
        customerId: CURRENT_CUSTOMER_ID,
        startDate: schedule.pickupDate,
        endDate: schedule.returnDate,
        pickupLocation: schedule.pickupLocation,
        dropoffLocation: schedule.returnLocation,
        status: "confirmed",
        subtotal: duration * (vehicle?.pricePerDay || 0),
        taxes,
        insurance,
        total: estimatedTotal,
        createdAt: new Date().toISOString(),
        timeline: [
          { label: "Booked", at: new Date().toISOString(), done: true },
          { label: "Confirmed", at: new Date().toISOString(), done: true },
          { label: "Pickup", at: null, done: false },
          { label: "Active", at: null, done: false },
          { label: "Returned", at: null, done: false },
          { label: "Completed", at: null, done: false },
        ],
      });
      // 3. Create mock Agreement
      const a: RentalAgreement = {
        id: `AGR-${Math.floor(8000 + Math.random() * 1000)}`,
        bookingId: b.id,
        customerId: CURRENT_CUSTOMER_ID,
        vehicleId: id,
        startDate: b.startDate,
        endDate: b.endDate,
        durationDays: duration,
        amount: b.total,
        status: "active",
        signedAt: new Date().toISOString(),
        terms: [
          "Fuel/charge level at return must match the level recorded at handover.",
          "Included 250 km per rental day; ₹14 per additional kilometre.",
          "Damage liability capped at ₹15,000 with the standard insurance add-on.",
        ],
      };
      return { booking: b, agreement: a };
    },
    onSuccess: (data) => {
      setBookingResult(data);
      setStep(6);
    },
  });

  if (loadingVehicle) {
    return <div className="p-20 text-center animate-pulse">Loading booking flow...</div>;
  }
  if (!vehicle) {
    return <div className="p-20 text-center">Vehicle not found.</div>;
  }

  // Pre-fill location if empty
  if (!schedule.pickupLocation) {
    setSchedule((s) => ({
      ...s,
      pickupLocation: vehicle.location,
      returnLocation: vehicle.location,
    }));
  }

  const duration =
    schedule.pickupDate && schedule.returnDate
      ? Math.max(1, differenceInDays(new Date(schedule.returnDate), new Date(schedule.pickupDate)))
      : 0;

  const subtotal = duration * vehicle.pricePerDay;
  const taxes = Math.round(subtotal * 0.18);
  const insurance = 499;
  const estimatedTotal = subtotal + taxes + insurance;

  const nextStep = async () => {
    if (step === 1) {
      // Check availability before leaving schedule
      if (!schedule.pickupDate || !schedule.returnDate) return;
      const res = await checkAvailability.mutateAsync();
      if (!res.available) return; // Stay on step 1 if unavailable
    }
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };

  const prevStep = () => setStep((s) => Math.max(s - 1, 0));

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <SiteHeader />

      {/* Stepper Header */}
      <div className="border-b border-border/70 bg-surface">
        <div className="mx-auto max-w-5xl px-5 py-4">
          <div className="flex items-center justify-between">
            {STEPS.map((s, i) => (
              <div key={s} className="flex flex-col items-center gap-2 relative z-10 flex-1">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-colors
                  ${
                    step > i
                      ? "bg-primary text-primary-foreground"
                      : step === i
                        ? "border-2 border-primary text-primary"
                        : "border-2 border-muted bg-surface text-muted-foreground"
                  }`}
                >
                  {step > i ? <CheckCircle2 className="w-5 h-5" /> : i + 1}
                </div>
                <span
                  className={`text-[10px] sm:text-xs font-medium uppercase tracking-wider hidden sm:block
                  ${step >= i ? "text-foreground" : "text-muted-foreground"}`}
                >
                  {s}
                </span>
                {i < STEPS.length - 1 && (
                  <div
                    className={`absolute top-4 left-[50%] w-[100%] h-[2px] -z-10
                    ${step > i ? "bg-primary" : "bg-muted"}`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <main className="flex-1 mx-auto max-w-3xl px-5 py-12 w-full">
        <div className="panel p-8 animate-rise">
          {/* STEP 0: VEHICLE */}
          {step === 0 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-display font-semibold">Confirm Vehicle</h2>
              <div className="flex gap-6 items-center p-4 rounded-xl border bg-surface-2/30">
                <img
                  src={vehicle.image}
                  alt={vehicle.name}
                  className="w-32 h-24 object-cover rounded-lg"
                />
                <div>
                  <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">
                    {vehicle.category}
                  </div>
                  <h3 className="text-xl font-semibold">{vehicle.name}</h3>
                  <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4" /> {vehicle.location}
                  </div>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                You are about to book this vehicle. Please ensure this is the exact model you
                require for your journey.
              </p>
            </div>
          )}

          {/* STEP 1: SCHEDULE */}
          {step === 1 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-display font-semibold">Journey Schedule</h2>
              <div className="grid sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Pickup Location</Label>
                  <Input
                    value={schedule.pickupLocation}
                    onChange={(e) => setSchedule({ ...schedule, pickupLocation: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Return Location</Label>
                  <Input
                    value={schedule.returnLocation}
                    onChange={(e) => setSchedule({ ...schedule, returnLocation: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Pickup Date</Label>
                  <Input
                    type="date"
                    value={schedule.pickupDate}
                    onChange={(e) => setSchedule({ ...schedule, pickupDate: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Return Date</Label>
                  <Input
                    type="date"
                    value={schedule.returnDate}
                    onChange={(e) => setSchedule({ ...schedule, returnDate: e.target.value })}
                  />
                </div>
              </div>

              {checkAvailability.isPending && (
                <div className="text-sm text-muted-foreground flex items-center">
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Checking availability...
                </div>
              )}

              {checkAvailability.isSuccess && !checkAvailability.data.available && (
                <div className="p-4 rounded-lg bg-destructive/10 text-destructive border border-destructive/20 text-sm flex items-start gap-3">
                  <ShieldCheck className="w-5 h-5 shrink-0" />
                  <div>
                    <span className="font-semibold block mb-1">Vehicle Unavailable</span>
                    This vehicle is already booked for these dates. Please select different dates or
                    explore alternative vehicles.
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 2: CUSTOMER */}
          {step === 2 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-display font-semibold">Renter Details</h2>
              <div className="grid sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Full Name</Label>
                  <Input
                    value={customer.name}
                    onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Date of Birth</Label>
                  <Input
                    type="date"
                    value={customer.dob}
                    onChange={(e) => setCustomer({ ...customer, dob: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={customer.email}
                    onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Phone Number</Label>
                  <Input
                    value={customer.phone}
                    onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: DOCUMENTS */}
          {step === 3 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-display font-semibold">Document Verification</h2>
              <p className="text-sm text-muted-foreground">
                Upload a clear image of your driving licence. Our AI will extract your details for
                faster verification.
              </p>

              {!document ? (
                <div
                  className="border-2 border-dashed border-border/70 rounded-xl p-10 flex flex-col items-center justify-center gap-4 bg-surface-2/30 cursor-pointer hover:bg-surface-2/50 transition-colors"
                  onClick={() => extractDoc.mutate()}
                >
                  {extractDoc.isPending ? (
                    <>
                      <Loader2 className="w-10 h-10 text-primary animate-spin" />
                      <div className="text-center">
                        <span className="block font-medium">Extracting information...</span>
                        <span className="text-xs text-muted-foreground">
                          Reading driving licence via OCR
                        </span>
                      </div>
                    </>
                  ) : (
                    <>
                      <Upload className="w-10 h-10 text-muted-foreground" />
                      <div className="text-center">
                        <span className="block font-medium">Click to upload Driving Licence</span>
                        <span className="text-xs text-muted-foreground">
                          JPEG, PNG or PDF up to 5MB
                        </span>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <div className="space-y-6 animate-rise">
                  <div className="p-4 rounded-lg bg-success/10 text-success border border-success/20 text-sm flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5" /> Document processed successfully. Please
                    confirm the extracted details.
                  </div>

                  <div className="grid sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label>Name on Licence</Label>
                      <Input
                        value={document.name}
                        onChange={(e) => setDocument({ ...document, name: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Licence Number</Label>
                      <Input
                        value={document.licenseNumber}
                        onChange={(e) =>
                          setDocument({ ...document, licenseNumber: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Date of Birth</Label>
                      <Input
                        type="date"
                        value={document.dob}
                        onChange={(e) => setDocument({ ...document, dob: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Expiry Date</Label>
                      <Input
                        type="date"
                        value={document.expiry}
                        onChange={(e) => setDocument({ ...document, expiry: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 4: REVIEW */}
          {step === 4 && (
            <div className="space-y-8">
              <h2 className="text-2xl font-display font-semibold">Review Booking</h2>

              <div className="grid gap-6">
                {/* Journey Details */}
                <div className="p-5 rounded-xl border bg-surface-2/30">
                  <h3 className="font-semibold flex items-center gap-2 mb-4">
                    <CalendarDays className="w-4 h-4" /> Journey Details
                  </h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground block text-xs uppercase tracking-wider mb-1">
                        Pickup
                      </span>
                      <div className="font-medium">
                        {format(new Date(schedule.pickupDate), "MMM d, yyyy")}
                      </div>
                      <div className="text-muted-foreground">{schedule.pickupLocation}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-xs uppercase tracking-wider mb-1">
                        Return
                      </span>
                      <div className="font-medium">
                        {format(new Date(schedule.returnDate), "MMM d, yyyy")}
                      </div>
                      <div className="text-muted-foreground">{schedule.returnLocation}</div>
                    </div>
                  </div>
                </div>

                {/* Price Breakdown */}
                <div className="p-5 rounded-xl border bg-surface-2/30">
                  <h3 className="font-semibold flex items-center gap-2 mb-4">
                    <FileText className="w-4 h-4" /> Price Breakdown
                  </h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Base Rental ({duration} days × {inr(vehicle.pricePerDay)})
                      </span>
                      <span className="font-medium">{inr(subtotal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Standard Insurance</span>
                      <span className="font-medium">{inr(insurance)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Taxes & Fees (18%)</span>
                      <span className="font-medium">{inr(taxes)}</span>
                    </div>
                    <Separator className="my-2" />
                    <div className="flex justify-between text-base font-semibold">
                      <span>Total</span>
                      <span>{inr(estimatedTotal)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: PAYMENT */}
          {step === 5 && (
            <div className="space-y-8 text-center animate-rise">
              <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <CreditCard className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-display font-semibold">Secure Payment</h2>
              <p className="text-muted-foreground">
                You are paying{" "}
                <span className="font-semibold text-foreground">{inr(estimatedTotal)}</span> for the{" "}
                {vehicle.name} rental.
              </p>

              <div className="pt-8">
                <Button
                  size="lg"
                  className="w-full sm:w-auto min-w-[200px]"
                  disabled={processPayment.isPending}
                  onClick={() => processPayment.mutate()}
                >
                  {processPayment.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Processing...
                    </>
                  ) : (
                    "Pay Now"
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* STEP 6: CONFIRMATION (Rental Agreement) */}
          {step === 6 && (
            <div className="space-y-8 animate-rise">
              <div className="text-center">
                <div className="w-16 h-16 bg-success/20 text-success rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h2 className="text-3xl font-display font-semibold text-success">
                  Booking Confirmed
                </h2>
                <p className="text-muted-foreground mt-2">
                  Your reservation is confirmed and locked in our operational database.
                </p>
              </div>

              {/* Digital Document View for Rental Agreement */}
              <div className="border border-border/70 rounded-xl bg-surface shadow-sm overflow-hidden mt-8">
                <div className="bg-surface-2 px-6 py-4 border-b border-border/70 flex items-center justify-between">
                  <div className="flex items-center gap-2 font-semibold">
                    <FileText className="w-5 h-5 text-primary" />
                    Digital Rental Agreement
                  </div>
                  <Button variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-2" /> Download PDF
                  </Button>
                </div>
                <div className="p-6 md:p-10 space-y-8 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-opacity-10">
                  <div className="flex justify-between items-start">
                    <div>
                      <h1 className="text-2xl font-display font-bold tracking-tight">FLEETFLOW</h1>
                      <p className="text-xs text-muted-foreground uppercase tracking-widest mt-1">
                        Rental Contract
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-muted-foreground">Agreement ID</div>
                      <div className="font-mono font-medium">
                        {bookingResult?.agreement?.id || `AGR-924${vehicle?.id || "101"}`}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-8 text-sm">
                    <div>
                      <div className="text-muted-foreground uppercase text-[10px] tracking-wider mb-1">
                        Renter Details
                      </div>
                      <div className="font-medium">{customer.name}</div>
                      <div className="text-muted-foreground">{document?.licenseNumber || "KA0320180004213"}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground uppercase text-[10px] tracking-wider mb-1">
                        Vehicle Details
                      </div>
                      <div className="font-medium">{vehicle.name}</div>
                      <div className="text-muted-foreground">{vehicle.registration}</div>
                    </div>
                  </div>

                  <Separator />

                  <div className="grid grid-cols-2 gap-8 text-sm">
                    <div>
                      <div className="text-muted-foreground uppercase text-[10px] tracking-wider mb-1">
                        Period
                      </div>
                      <div className="font-medium">
                        {schedule.pickupDate || format(new Date(), "MMM d, yyyy")} –{" "}
                        {schedule.returnDate || format(new Date(Date.now() + 86400000 * 3), "MMM d, yyyy")}
                      </div>
                    </div>
                    <div>
                      <div className="text-muted-foreground uppercase text-[10px] tracking-wider mb-1">
                        Total Amount
                      </div>
                      <div className="font-medium">
                        {inr(bookingResult?.agreement?.amount || estimatedTotal)} (Paid)
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="text-muted-foreground uppercase text-[10px] tracking-wider mb-2">
                      Terms & Conditions
                    </div>
                    <ul className="list-disc pl-4 space-y-1 text-xs text-muted-foreground">
                      {(bookingResult?.agreement?.terms || [
                        "Fuel/charge level at return must match the level recorded at handover.",
                        "Included 250 km per rental day; ₹14 per additional kilometre.",
                        "Damage liability capped at ₹15,000 with the standard insurance add-on.",
                        "Only drivers listed on this agreement may operate the vehicle.",
                      ]).map((t, i) => (
                        <li key={i}>{t}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-8 pt-8 border-t border-dashed flex justify-between items-center text-xs text-muted-foreground">
                    <div>Electronically Signed on {format(new Date(), "MMM d, yyyy")}</div>
                    <div className="font-display italic text-lg opacity-50">{customer.name}</div>
                  </div>
                </div>
              </div>

              <div className="flex justify-center gap-4 pt-4">
                <Button asChild variant="outline">
                  <Link to="/">Return to Home</Link>
                </Button>
                <Button asChild>
                  <Link to="/dashboard">Go to Dashboard</Link>
                </Button>
              </div>
            </div>
          )}

          {/* Navigation Controls (except step 6) */}
          {step < 6 && (
            <div className="flex items-center justify-between mt-10 pt-6 border-t border-border/70">
              <Button
                variant="ghost"
                onClick={prevStep}
                disabled={step === 0}
                className={step === 0 ? "invisible" : ""}
              >
                <ChevronLeft className="w-4 h-4 mr-2" /> Back
              </Button>
              <Button
                onClick={nextStep}
                disabled={
                  (step === 1 && (!schedule.pickupDate || !schedule.returnDate)) ||
                  (step === 1 &&
                    checkAvailability.isSuccess &&
                    !checkAvailability.data.available) ||
                  (step === 3 && !document)
                }
              >
                {step === 4 ? "Proceed to Payment" : "Continue"}{" "}
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          )}
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
