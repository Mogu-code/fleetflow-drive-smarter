import React, { useState } from "react";
import { Eye, EyeOff, Check, X } from "lucide-react";

export function PasswordInput({
  value,
  onChange,
  placeholder = "Enter password",
  showRequirements = false,
}: {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  showRequirements?: boolean;
}) {
  const [showPassword, setShowPassword] = useState(false);

  const hasLength = value.length >= 8;
  const hasUpper = /[A-Z]/.test(value);
  const hasNumber = /[0-9]/.test(value);
  const hasSpecial = /[^A-Za-z0-9]/.test(value);

  const passedCount = [hasLength, hasUpper, hasNumber, hasSpecial].filter(Boolean).length;

  let strengthLabel = "Weak";
  let strengthColor = "bg-destructive";
  if (passedCount === 2 || passedCount === 3) {
    strengthLabel = "Fair";
    strengthColor = "bg-warning";
  } else if (passedCount === 4) {
    strengthLabel = "Strong";
    strengthColor = "bg-success";
  }

  return (
    <div className="space-y-2">
      <div className="relative">
        <input
          type={showPassword ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full rounded-lg bg-surface-2 border border-border px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:ring-1 focus:ring-primary pr-10"
        />
        <button
          type="button"
          onClick={() => setShowPassword((prev) => !prev)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1"
          aria-label={showPassword ? "Hide password" : "Show password"}
        >
          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>

      {showRequirements && value.length > 0 && (
        <div className="space-y-2 pt-1 animate-rise">
          {/* Strength Bar */}
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-muted-foreground">Password Strength:</span>
            <span className="font-semibold text-foreground">{strengthLabel}</span>
          </div>
          <div className="h-1.5 w-full bg-surface-2 rounded-full overflow-hidden flex gap-1">
            <div
              className={`h-full transition-all duration-300 ${strengthColor}`}
              style={{ width: `${(passedCount / 4) * 100}%` }}
            />
          </div>

          {/* Checklist */}
          <div className="grid grid-cols-2 gap-1 text-[11px] pt-1">
            <div className={`flex items-center gap-1 ${hasLength ? "text-success" : "text-muted-foreground"}`}>
              {hasLength ? <Check className="w-3 h-3" /> : <X className="w-3 h-3 opacity-50" />}
              <span>8+ characters</span>
            </div>
            <div className={`flex items-center gap-1 ${hasUpper ? "text-success" : "text-muted-foreground"}`}>
              {hasUpper ? <Check className="w-3 h-3" /> : <X className="w-3 h-3 opacity-50" />}
              <span>Uppercase letter</span>
            </div>
            <div className={`flex items-center gap-1 ${hasNumber ? "text-success" : "text-muted-foreground"}`}>
              {hasNumber ? <Check className="w-3 h-3" /> : <X className="w-3 h-3 opacity-50" />}
              <span>Number</span>
            </div>
            <div className={`flex items-center gap-1 ${hasSpecial ? "text-success" : "text-muted-foreground"}`}>
              {hasSpecial ? <Check className="w-3 h-3" /> : <X className="w-3 h-3 opacity-50" />}
              <span>Special symbol</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
