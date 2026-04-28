"use client";

import { Check, Clipboard, RotateCcw } from "lucide-react";
import type { useCopyState } from "@/components/useCopyState";

type EmailPreviewProps = {
  subject: string;
  body: string;
  missing: string[];
  warnings: string[];
  copyState: ReturnType<typeof useCopyState>;
  onReset: () => void;
};

export function EmailPreview({ subject, body, missing, warnings, copyState, onReset }: EmailPreviewProps) {
  const { copiedTarget, copy } = copyState;

  return (
    <aside className="panel sticky top-4 max-h-[calc(100vh-2rem)] overflow-hidden lg:self-start">
      <div className="border-b border-line p-4 sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="section-title">Email généré</h2>
          <div className="flex flex-wrap gap-2">
            <button className="secondary-button" type="button" onClick={() => copy("subject", subject)}>
              {copiedTarget === "subject" ? <Check size={16} /> : <Clipboard size={16} />}
              Copier l&apos;objet
            </button>
            <button className="secondary-button" type="button" onClick={() => copy("email", body)}>
              {copiedTarget === "email" ? <Check size={16} /> : <Clipboard size={16} />}
              Copier l&apos;email
            </button>
            <button className="secondary-button" type="button" onClick={onReset}>
              <RotateCcw size={16} />
              Réinitialiser
            </button>
          </div>
        </div>
      </div>

      <div className="max-h-[calc(100vh-7rem)] overflow-auto p-4 sm:p-5">
        {missing.length || warnings.length ? (
          <div className="mb-4 space-y-2 rounded-lg border border-warning/25 bg-warning/10 p-3 text-sm text-amber-100">
            {missing.map((field) => (
              <p key={`missing-${field}`}>Information manquante : {field}</p>
            ))}
            {warnings.map((warning) => (
              <p key={`warning-${warning}`}>{warning}</p>
            ))}
          </div>
        ) : (
          <div className="mb-4 rounded-lg border border-primary/20 bg-primary/10 p-3 text-sm text-emerald-100">
            Prêt à copier.
          </div>
        )}

        <div className="mb-4">
          <p className="mb-1.5 text-sm font-medium text-zinc-300">Objet</p>
          <div className="rounded-lg border border-line bg-black/25 p-3 text-sm font-semibold text-zinc-100">
            {subject}
          </div>
        </div>

        <div>
          <p className="mb-1.5 text-sm font-medium text-zinc-300">Corps</p>
          <pre className="whitespace-pre-wrap rounded-lg border border-line bg-black/25 p-4 text-sm leading-6 text-zinc-100">
            {body}
          </pre>
        </div>
      </div>
    </aside>
  );
}
