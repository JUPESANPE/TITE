import type { ReactNode } from "react";
import { Button } from "./Button";

/** Todo flujo P0 contempla loading / error / empty explícitos (punto 63). */

export function LoadingState({ label = "Cargando..." }: { label?: string }) {
  return (
    <div role="status" aria-live="polite" className="flex flex-col items-center gap-3 py-16 text-ink-soft">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-line border-t-ink" />
      <p className="text-sm">{label}</p>
    </div>
  );
}

export function ErrorState({
  title = "Algo no salió bien",
  message,
  onRetry,
}: {
  title?: string;
  message: string;
  onRetry?: () => void;
}) {
  return (
    <div role="alert" className="flex flex-col items-center gap-3 rounded-2xl border border-danger/30 bg-danger/5 px-6 py-10 text-center">
      <p className="font-medium text-danger">{title}</p>
      <p className="text-sm text-ink-soft">{message}</p>
      {onRetry ? (
        <Button variant="secondary" onClick={onRetry}>
          Reintentar
        </Button>
      ) : null}
    </div>
  );
}

export function EmptyState({
  title,
  body,
  action,
}: {
  title: string;
  body: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-line px-6 py-12 text-center">
      <p className="font-medium">{title}</p>
      <p className="text-sm text-ink-soft">{body}</p>
      {action}
    </div>
  );
}
