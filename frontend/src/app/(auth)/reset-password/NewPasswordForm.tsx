"use client";

import { useState } from "react";
import { Check, Eye, EyeOff } from "lucide-react";
import { ActionForm, SubmitButton } from "@/components/form/ActionForm";
import { updatePassword } from "@/lib/auth/actions";

const RULES = [
  { label: "8+ тэмдэгт", test: (v: string) => v.length >= 8 },
  { label: "Том үсэг агуулсан", test: (v: string) => /\p{Lu}/u.test(v) },
  { label: "Тоо агуулсан", test: (v: string) => /\d/.test(v) },
];

const LEVELS = [
  { label: "Сул", width: "33%", color: "bg-[#c6c6c7]" },
  { label: "Дунд", width: "66%", color: "bg-warning" },
  { label: "Хүчтэй", width: "100%", color: "bg-success" },
];

export function NewPasswordForm() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const passed = RULES.filter((r) => r.test(password)).length;
  const level = LEVELS[Math.max(0, passed - 1)];

  return (
    <ActionForm action={updatePassword} className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <label htmlFor="password" className="text-xs leading-4 font-medium text-body">
          Шинэ нууц үг
        </label>
        <PasswordBox
          id="password"
          name="password"
          value={password}
          onChange={setPassword}
          placeholder="Шинэ нууц үгээ оруулна уу"
          show={show}
          onToggle={() => setShow((s) => !s)}
        />

        <div className="mt-2 flex flex-col gap-1">
          <div className="h-1.5 overflow-hidden rounded-full bg-surface-variant">
            <div
              className={`h-full rounded-full transition-all ${level.color}`}
              style={{ width: password ? level.width : "0%" }}
            />
          </div>
          <div className="flex justify-between text-[10px] leading-6">
            {LEVELS.map((l, i) => (
              <span key={l.label} className={i === passed - 1 ? "text-body" : "text-muted"}>
                {l.label}
              </span>
            ))}
          </div>
        </div>

        <ul className="mt-3 flex flex-col gap-2">
          {RULES.map((r) => {
            const ok = r.test(password);
            return (
              <li key={r.label} className="flex items-center gap-2 text-[13px] leading-5">
                <Check className={`size-3.5 ${ok ? "text-success" : "text-muted"}`} />
                <span className={ok ? "text-body" : "text-body"}>{r.label}</span>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="confirm" className="text-xs leading-4 font-medium text-body">
          Нууц үг баталгаажуулах
        </label>
        <PasswordBox
          id="confirm"
          name="confirm"
          value={confirm}
          onChange={setConfirm}
          placeholder="Нууц үгээ дахин оруулна уу"
          show={showConfirm}
          onToggle={() => setShowConfirm((s) => !s)}
        />
      </div>

      <SubmitButton
        pendingLabel="Хадгалж байна..."
        className="h-14 rounded-xl bg-primary text-base font-medium text-white hover:bg-primary-dark"
      >
        Хадгалах
      </SubmitButton>
    </ActionForm>
  );
}

function PasswordBox({
  id,
  name,
  value,
  onChange,
  placeholder,
  show,
  onToggle,
}: {
  id: string;
  name: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  show: boolean;
  onToggle: () => void;
}) {
  const Icon = show ? EyeOff : Eye;
  return (
    <div className="relative">
      <input
        id={id}
        name={name}
        type={show ? "text" : "password"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete="new-password"
        className="h-14 w-full rounded-xl bg-surface-tint px-4 pr-12 text-base font-medium text-ink placeholder:text-[rgba(133,115,116,0.5)] focus:outline-2 focus:outline-primary"
      />
      <button
        type="button"
        onClick={onToggle}
        aria-label={show ? "Нууц үг нуух" : "Нууц үг харах"}
        className="absolute top-1/2 right-4 -translate-y-1/2 text-muted hover:text-primary"
      >
        <Icon className="size-5" />
      </button>
    </div>
  );
}
