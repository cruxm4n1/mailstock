"use client";

import { useCallback, useRef, useState } from "react";

type CopyTarget = "subject" | "email" | null;

export function useCopyState() {
  const [copiedTarget, setCopiedTarget] = useState<CopyTarget>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const copy = useCallback(async (target: Exclude<CopyTarget, null>, text: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedTarget(target);

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => setCopiedTarget(null), 1600);
  }, []);

  return { copiedTarget, copy };
}
