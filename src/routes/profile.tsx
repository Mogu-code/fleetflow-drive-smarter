import React, { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth/auth-context";
import { Eyebrow } from "@/components/fleet/brand";
import { SiteFooter, SiteHeader } from "@/components/fleet/site-chrome";
import { PasswordInput } from "@/components/auth/password-input";
import { Button } from "@/components/ui/button";
import {
  User,
  ShieldCheck,
  FileText,
  Lock,
  Building,
  CheckCircle2,
  Car,
  Save,
} from "lucide-react";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "User Account & Security Profile — FleetFlow" },
      {
        name: "description",
        content: "Manage your FleetFlow personal details, driver license credentials, employee role permissions, and security settings.",
      },
    ],
  }),
  component: ProfilePage,
});

type ProfileTab = "personal" | "license" | "employee" | "security";

function ProfilePage() {
  const { user, role, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState<ProfileTab>("personal");

  // Form State
  const [firstName, setFirstName] = useState(user?.firstName || "Aviskha");
  const [lastName, setLastName] = useState(user?.lastName || "Talukdar");
  const [email, setEmail] = useState(user?.email || "aviskha.talukdar@example.com");
  const [phone, setPhone] = useState(user?.phone || "+91 98765 43210");
  const [city, setCity] = useState(user?.city || "Bengaluru");

  // License State
  const [licenseNum, setLicenseNum] = useState(user?.licenseNumber || "KA0320180004213");

  // Security State
  const [currentPass, setCurrentPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSavePersonal = (e: React.FormEvent) => {
    e.preventDefault();
    updateUser({
      firstName,
      lastName,
      name: `${firstName} ${lastName}`,
      email,
      phone,
      city,
    });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleSaveLicense = (e: React.FormEvent) => {
    e.preventDefault();
    updateUser({
      licenseNumber: licenseNum,
      licenseVerified: true,
    });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <SiteHeader />

      <main className="flex-1 mx-auto max-w-7xl w-full px-4 sm:px-8 py-10 space-y-8">
        {/* Header Profile Banner */}
        <div className="p-6 rounded-2xl bg-surface border border-border flex flex-wrap items-center justify-between gap-6 shadow-xl">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-primary/20 text-primary border border-primary/30 font-display text-2xl font-bold flex items-center justify-center">
              {user.avatarLabel || "U"}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-display font-semibold text-2xl text-foreground">{user.name}</h1>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-primary/20 text-primary border border-primary/30">
                  {user.role}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {user.email} • Joined {user.joinedAt}
              </p>
            </div>
          </div>

          <div className="text-xs text-muted-foreground">
            Account Status: <strong className="text-success">Active & Verified</strong>
          </div>
        </div>

        {/* Saved Alert Banner */}
        {saveSuccess && (
          <div className="p-4 rounded-xl bg-success/20 border border-success/40 text-success text-xs font-semibold flex items-center gap-2 animate-rise">
            <CheckCircle2 className="w-4 h-4" /> Account information updated successfully!
          </div>
        )}

        {/* Main Grid */}
        <div className="grid gap-8 lg:grid-cols-12 items-start">
          {/* Navigation Sidebar */}
          <aside className="lg:col-span-3 space-y-1 bg-surface p-2 rounded-2xl border border-border">
            <button
              onClick={() => setActiveTab("personal")}
              className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-left transition-colors ${
                activeTab === "personal"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-surface-2 hover:text-foreground"
              }`}
            >
              <User className="w-4 h-4" /> Personal Details
            </button>

            <button
              onClick={() => setActiveTab("license")}
              className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-left transition-colors ${
                activeTab === "license"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-surface-2 hover:text-foreground"
              }`}
            >
              <ShieldCheck className="w-4 h-4" /> Driving License & KYC
            </button>

            {role !== "Customer" && (
              <button
                onClick={() => setActiveTab("employee")}
                className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-left transition-colors ${
                  activeTab === "employee"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-surface-2 hover:text-foreground"
                }`}
              >
                <Building className="w-4 h-4" /> Staff Role & Permissions
              </button>
            )}

            <button
              onClick={() => setActiveTab("security")}
              className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-left transition-colors ${
                activeTab === "security"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-surface-2 hover:text-foreground"
              }`}
            >
              <Lock className="w-4 h-4" /> Security & Password
            </button>
          </aside>

          {/* Form Content Area */}
          <div className="lg:col-span-9 p-6 rounded-2xl bg-surface border border-border space-y-6">
            {/* PERSONAL TAB */}
            {activeTab === "personal" && (
              <form onSubmit={handleSavePersonal} className="space-y-4 text-xs animate-rise">
                <h3 className="font-display font-semibold text-base text-foreground border-b border-border/80 pb-3">
                  Personal Information
                </h3>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-semibold text-muted-foreground">First Name</label>
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="w-full rounded-lg bg-surface-2 border border-border px-3 py-2 text-foreground"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-muted-foreground">Last Name</label>
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="w-full rounded-lg bg-surface-2 border border-border px-3 py-2 text-foreground"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-muted-foreground">Email Address</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full rounded-lg bg-surface-2 border border-border px-3 py-2 text-foreground"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-muted-foreground">Mobile Phone</label>
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full rounded-lg bg-surface-2 border border-border px-3 py-2 text-foreground"
                    />
                  </div>

                  <div className="space-y-1 sm:col-span-2">
                    <label className="font-semibold text-muted-foreground">Base City Hub</label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full rounded-lg bg-surface-2 border border-border px-3 py-2 text-foreground"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-border/80 flex justify-end">
                  <Button type="submit" className="gap-2 font-semibold">
                    <Save className="w-4 h-4" /> Save Personal Details
                  </Button>
                </div>
              </form>
            )}

            {/* LICENSE TAB */}
            {activeTab === "license" && (
              <form onSubmit={handleSaveLicense} className="space-y-4 text-xs animate-rise">
                <h3 className="font-display font-semibold text-base text-foreground border-b border-border/80 pb-3">
                  Driving License & Driver Credentials
                </h3>

                <div className="p-4 rounded-xl bg-surface-2 border border-border flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="font-semibold text-foreground">Verification Status</div>
                    <div className="text-muted-foreground text-[11px]">
                      Your driving license has passed automated OCR verification and is valid across all 8 hubs.
                    </div>
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded bg-success/20 text-success flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> Verified
                  </span>
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-muted-foreground">Driving License Number</label>
                  <input
                    type="text"
                    value={licenseNum}
                    onChange={(e) => setLicenseNum(e.target.value)}
                    className="w-full rounded-lg bg-surface-2 border border-border px-3 py-2 font-mono text-foreground"
                  />
                </div>

                <div className="pt-4 border-t border-border/80 flex justify-end">
                  <Button type="submit" className="gap-2 font-semibold">
                    <Save className="w-4 h-4" /> Update License Details
                  </Button>
                </div>
              </form>
            )}

            {/* EMPLOYEE TAB */}
            {activeTab === "employee" && user.role !== "Customer" && (
              <div className="space-y-4 text-xs animate-rise">
                <h3 className="font-display font-semibold text-base text-foreground border-b border-border/80 pb-3">
                  Staff Role & Organizational Permissions
                </h3>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-surface-2 border border-border space-y-1">
                    <span className="text-muted-foreground uppercase text-[10px] font-semibold">Employee ID</span>
                    <div className="font-mono font-bold text-foreground text-sm">{user.id}</div>
                  </div>

                  <div className="p-4 rounded-xl bg-surface-2 border border-border space-y-1">
                    <span className="text-muted-foreground uppercase text-[10px] font-semibold">Assigned Branch</span>
                    <div className="font-semibold text-foreground text-sm">{user.branch || "Bengaluru Hub"}</div>
                  </div>

                  {user.role === "Salesperson" && (
                    <div className="p-4 rounded-xl bg-surface-2 border border-border space-y-1 sm:col-span-2">
                      <span className="text-muted-foreground uppercase text-[10px] font-semibold">Quarterly Sales Target</span>
                      <div className="font-mono font-bold text-primary text-base">
                        INR {(user.achieved || 1542000).toLocaleString("en-IN")} / {(user.target || 1800000).toLocaleString("en-IN")} ({(user.commissionRate || 3.5)}% Commission Rate)
                      </div>
                    </div>
                  )}

                  {user.role === "Mechanic" && (
                    <div className="p-4 rounded-xl bg-surface-2 border border-border space-y-1 sm:col-span-2">
                      <span className="text-muted-foreground uppercase text-[10px] font-semibold">Technical Specialization</span>
                      <div className="font-semibold text-foreground text-sm">{user.specialization || "EV Battery & HV Powertrain"}</div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* SECURITY TAB */}
            {activeTab === "security" && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setSaveSuccess(true);
                  setTimeout(() => setSaveSuccess(false), 3000);
                }}
                className="space-y-4 text-xs animate-rise"
              >
                <h3 className="font-display font-semibold text-base text-foreground border-b border-border/80 pb-3">
                  Security & Password Settings
                </h3>

                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="font-semibold text-muted-foreground">Current Password</label>
                    <PasswordInput value={currentPass} onChange={setCurrentPass} placeholder="Enter current password" />
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-muted-foreground">New Password</label>
                    <PasswordInput value={newPass} onChange={setNewPass} showRequirements={true} placeholder="Enter new password" />
                  </div>
                </div>

                <div className="pt-4 border-t border-border/80 flex justify-end">
                  <Button type="submit" className="gap-2 font-semibold">
                    <Save className="w-4 h-4" /> Change Password
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
