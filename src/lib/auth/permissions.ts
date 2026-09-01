import type { User, UserRole } from "@/types/auth";

export type Permission =
  | "viewBookings"
  | "manageBookings"
  | "viewCustomers"
  | "manageCustomers"
  | "viewVehicles"
  | "manageVehicles"
  | "viewMaintenance"
  | "manageMaintenance"
  | "viewPayments"
  | "viewAnalytics"
  | "viewEmployees"
  | "manageEmployees"
  | "viewAIInsights";

const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  Customer: ["viewBookings"],
  Salesperson: [
    "viewBookings",
    "manageBookings",
    "viewCustomers",
    "viewVehicles",
    "viewPayments",
  ],
  Mechanic: [
    "viewVehicles",
    "viewMaintenance",
    "manageMaintenance",
  ],
  Manager: [
    "viewBookings",
    "manageBookings",
    "viewCustomers",
    "manageCustomers",
    "viewVehicles",
    "manageVehicles",
    "viewMaintenance",
    "manageMaintenance",
    "viewPayments",
    "viewAnalytics",
    "viewEmployees",
    "manageEmployees",
    "viewAIInsights",
  ],
};

export function hasPermission(role: UserRole | undefined, permission: Permission): boolean {
  if (!role) return false;
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

export function can(user: User | null | undefined, permission: Permission): boolean {
  if (!user) return false;
  return hasPermission(user.role, permission);
}
