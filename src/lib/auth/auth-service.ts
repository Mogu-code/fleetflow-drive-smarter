import type { AuthSession, LoginCredentials, SignupData, User, UserRole } from "@/types/auth";

const STORAGE_KEY = "fleetflow_auth_session";

export const USER_PRESETS: Record<UserRole, User> = {
  Customer: {
    id: "C201",
    name: "Alex Morgan",
    firstName: "Alex",
    lastName: "Morgan",
    email: "alex@fleetflow.demo",
    phone: "+91 98765 43210",
    role: "Customer",
    avatarLabel: "AM",
    emailVerified: true,
    city: "Bengaluru",
    licenseNumber: "KA0320180004213",
    licenseVerified: true,
    joinedAt: "2024-03-15",
  },
  Salesperson: {
    id: "E301",
    name: "Sarah Mitchell",
    firstName: "Sarah",
    lastName: "Mitchell",
    email: "sarah@fleetflow.demo",
    phone: "+91 98450 11201",
    role: "Salesperson",
    avatarLabel: "SM",
    emailVerified: true,
    branch: "Bengaluru — Indiranagar Hub",
    target: 1800000,
    achieved: 1542000,
    commissionRate: 3.5,
    joinedAt: "2023-01-10",
  },
  Mechanic: {
    id: "E311",
    name: "Daniel Carter",
    firstName: "Daniel",
    lastName: "Carter",
    email: "daniel@fleetflow.demo",
    phone: "+91 98450 11311",
    role: "Mechanic",
    avatarLabel: "DC",
    emailVerified: true,
    branch: "Bengaluru — Indiranagar Hub",
    specialization: "Diesel Powertrain & EV Systems",
    joinedAt: "2022-08-01",
  },
  Manager: {
    id: "E321",
    name: "Michael Anderson",
    firstName: "Michael",
    lastName: "Anderson",
    email: "michael@fleetflow.demo",
    phone: "+91 98450 11321",
    role: "Manager",
    avatarLabel: "MA",
    emailVerified: true,
    branch: "Bengaluru — Indiranagar Hub",
    headcount: 14,
    joinedAt: "2021-05-20",
  },
};

const LATENCY = 250;

function resolve<T>(value: T, ms = LATENCY): Promise<T> {
  return new Promise((r) => setTimeout(() => r(value), ms));
}

class AuthService {
  getSession(): AuthSession | null {
    if (typeof window === "undefined") return null;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const session = JSON.parse(raw) as AuthSession;
      
      // Check mock 7-day expiration
      if (session.expiresAt && new Date(session.expiresAt).getTime() < Date.now()) {
        this.clearSession();
        return null;
      }
      return session;
    } catch {
      return null;
    }
  }

  saveSession(session: AuthSession) {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    }
  }

  clearSession() {
    if (typeof window !== "undefined") {
      localStorage.removeItem(STORAGE_KEY);
    }
  }

  async login(credentials: LoginCredentials): Promise<{ success: boolean; session?: AuthSession; error?: string }> {
    const email = credentials.email.trim().toLowerCase();

    let userMatch: User | undefined = Object.values(USER_PRESETS).find(
      (u) => u.email.toLowerCase() === email
    );

    if (!userMatch) {
      if (email.includes("aviskha")) {
        userMatch = {
          id: "C202",
          name: "Aviskha Talukdar",
          firstName: "Aviskha",
          lastName: "Talukdar",
          email,
          phone: "+91 98765 43210",
          role: "Customer",
          avatarLabel: "AT",
          emailVerified: true,
          city: "Bengaluru",
          licenseNumber: "KA0320180004213",
          licenseVerified: true,
          joinedAt: "2024-03-15",
        };
      } else {
        const nameParts = email.split("@")[0]!.split(".");
        const first = nameParts[0] ? nameParts[0].charAt(0).toUpperCase() + nameParts[0].slice(1) : "Renter";
        const last = nameParts[1] ? nameParts[1].charAt(0).toUpperCase() + nameParts[1].slice(1) : "User";
        userMatch = {
          id: `C${Math.floor(250 + Math.random() * 500)}`,
          name: `${first} ${last}`,
          firstName: first,
          lastName: last,
          email,
          phone: "+91 98765 00000",
          role: "Customer",
          avatarLabel: `${first[0]}${last[0]}`,
          emailVerified: true,
          city: "Bengaluru",
          licenseNumber: "KA0320240019283",
          licenseVerified: true,
          joinedAt: new Date().toISOString().slice(0, 10),
        };
      }
    }

    const session: AuthSession = {
      user: userMatch,
      token: `mock_jwt_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      expiresAt: new Date(Date.now() + 86400000 * 7).toISOString(),
      isDemo: true,
    };

    this.saveSession(session);
    return resolve({ success: true, session });
  }

  async loginAsDemo(role: UserRole): Promise<AuthSession> {
    const user = USER_PRESETS[role];
    const session: AuthSession = {
      user,
      token: `mock_demo_jwt_${role.toLowerCase()}_${Date.now()}`,
      expiresAt: new Date(Date.now() + 86400000 * 7).toISOString(),
      isDemo: true,
    };
    this.saveSession(session);
    return resolve(session, 150);
  }

  async signup(data: SignupData): Promise<{ success: boolean; session?: AuthSession }> {
    const newUser: User = {
      id: `C${Math.floor(300 + Math.random() * 500)}`,
      name: `${data.firstName} ${data.lastName}`,
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email.trim().toLowerCase(),
      phone: data.phone,
      role: "Customer",
      avatarLabel: `${data.firstName[0] || "U"}${data.lastName[0] || "S"}`,
      emailVerified: false,
      city: "Bengaluru",
      joinedAt: new Date().toISOString().slice(0, 10),
    };

    const session: AuthSession = {
      user: newUser,
      token: `mock_signup_jwt_${Date.now()}`,
      expiresAt: new Date(Date.now() + 86400000 * 7).toISOString(),
      isDemo: true,
    };

    this.saveSession(session);
    return resolve({ success: true, session });
  }

  async verifyEmail(): Promise<{ success: boolean }> {
    const session = this.getSession();
    if (session) {
      session.user.emailVerified = true;
      this.saveSession(session);
    }
    return resolve({ success: true });
  }

  async resetPassword(email: string): Promise<{ success: boolean; message: string }> {
    return resolve({
      success: true,
      message: `If an account exists for ${email}, password reset instructions have been sent.`,
    });
  }

  async logout(): Promise<void> {
    this.clearSession();
    return resolve(undefined, 100);
  }
}

export const authService = new AuthService();
