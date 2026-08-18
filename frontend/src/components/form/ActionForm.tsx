"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/cn";

type State = { error?: string; success?: string } | null;
type Action = (state: State, formData: FormData) => Promise<State>;

/** Server action-ыг зөөж, буцаасан алдаа/амжилтын мэдээллийг маягтын дээр харуулна. */
export function ActionForm({
  action,
  className,
  children,
}: {
  action: Action;
  className?: string;
  children: React.ReactNode;
}) {
  const [state, formAction] = useActionState(action, null);

  return (
    <form action={formAction} className={className} noValidate>
      {state?.error && (
        <p
          role="alert"
          className="flex items-start gap-2 rounded-xl bg-[#fee2e2] px-4 py-3 text-sm leading-5 text-danger-dark"
        >
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          {state.error}
        </p>
      )}
      {state?.success && (
        <p
          role="status"
          className="flex items-start gap-2 rounded-xl bg-[#dcfce7] px-4 py-3 text-sm leading-5 text-success-darker"
        >
          <CheckCircle2 className="mt-0.5 size-4 shrink-0" />
          {state.success}
        </p>
      )}
      {children}
    </form>
  );
}

/** Илгээж байх үед идэвхгүй болдог товч. */
export function SubmitButton({
  children,
  pendingLabel,
  className,
}: {
  children: React.ReactNode;
  pendingLabel?: string;
  className?: string;
}) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className={cn("disabled:cursor-not-allowed disabled:opacity-60", className)}
    >
      {pending ? (pendingLabel ?? "Түр хүлээнэ үү...") : children}
    </button>
  );
}
