import type { AuthSession, LoginCredentials, SignupData, User, UserRole } from "@/types/auth";

const STORAGE_KEY = "fleetflow_auth_session";

export const USER_PRESETS: Record<UserRole, User> = {
  Customer: {
    id: "C202",
    name: "Aviskha Gupta",
    firstName: "Aviskha",
    lastName: "Gupta",
    email: "aviskha.gupta@example.com",
    phone: "+91 98765 43210",
    role: "Customer",
    avatarLabel: "AG",
    emailVerified: true,
    city: "Bengaluru",
    licenseNumber: "KA0320180004213",
    licenseVerified: true,
    joinedAt: "2024-03-15",
  },
  Salesperson: {
    id: "E302",
    name: "Imran Qureshi",
    firstName: "Imran",
    lastName: "Qureshi",
    email: "imran.qureshi@fleetflow.in",
    phone: "+91 98450 11201",
    role: "Salesperson",
    avatarLabel: "IQ",
    emailVerified: true,
    branch: "Bengaluru — Indiranagar Hub",
    target: 1800000,
    achieved: 1542000,
    commissionRate: 3.5,
    joinedAt: "2023-01-10",
  },
  Mechanic: {
    id: "E313",
    name: "Joseph Mathew",
    firstName: "Joseph",
    lastName: "Mathew",
    email: "joseph.mathew@fleetflow.in",
    phone: "+91 98450 11311",
    role: "Mechanic",
    avatarLabel: "JM",
    emailVerified: true,
    branch: "Bengaluru — Indiranagar Hub",
    specialization: "Diesel Powertrain & EV Systems",
    joinedAt: "2022-08-01",
  },
  Manager: {
    id: "E321",
    name: "Anjali D",
    firstName: "Anjali",
    lastName: "D",
    email: "anjali.d@fleetflow.in",
    phone: "+91 98450 11321",
    role: "Manager",
    avatarLabel: "AD",
    emailVerified: true,
    branch: "Bengaluru — Indiranagar Hub",
    joinedAt: "2021-11-01",
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

    try {
      const formData = new URLSearchParams();
      formData.append("username", email);
      formData.append("password", credentials.password || "");
      
      const res = await fetch("http://localhost:8000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: formData.toString()
      });
      
      if (!res.ok) {
        return { success: false, error: "Invalid email or password" };
      }
      
      const data = await res.json();
      
      const session: AuthSession = {
        user: userMatch,
        token: data.access_token,
        expiresAt: new Date(Date.now() + 86400000 * 7).toISOString(),
        isDemo: true,
      };

      this.saveSession(session);
      return { success: true, session };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  }

  async loginAsDemo(role: UserRole): Promise<AuthSession> {
    const user = USER_PRESETS[role];
    try {
      const formData = new URLSearchParams();
      formData.append("username", user.email);
      formData.append("password", "password123");
      
      const res = await fetch("http://localhost:8000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: formData.toString()
      });
      
      if (!res.ok) {
        throw new Error("Demo login failed");
      }
      
      const data = await res.json();
      
      const session: AuthSession = {
        user,
        token: data.access_token,
        expiresAt: new Date(Date.now() + 86400000 * 7).toISOString(),
        isDemo: true,
      };
      this.saveSession(session);
      return session;
    } catch (e) {
      throw e;
    }
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
