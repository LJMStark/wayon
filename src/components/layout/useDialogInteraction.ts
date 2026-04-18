import { useEffect, useRef } from "react";

type UseDialogInteractionOptions = {
  isOpen: boolean;
  onClose: () => void;
};

// Minimal dialog-like interaction helper for overlay menus:
// - Escape key closes the dialog
// - Body scroll is locked while the dialog is open
// - Focus is trapped inside the container (Tab / Shift+Tab wrap around)
// - Focus auto-moves to the first tabbable element when the dialog opens
// - Focus is restored to the previously-focused element on close
export function useDialogInteraction<T extends HTMLElement>({
  isOpen,
  onClose,
}: UseDialogInteractionOptions) {
  const containerRef = useRef<T | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    const container = containerRef.current;
    const previouslyFocused = document.activeElement as HTMLElement | null;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const focusFirstTabbable = () => {
      if (!container) return;
      const focusable = getTabbableElements(container);
      focusable[0]?.focus();
    };

    focusFirstTabbable();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.stopPropagation();
        onClose();
        return;
      }

      if (event.key !== "Tab" || !container) return;

      const focusable = getTabbableElements(container);
      if (focusable.length === 0) {
        event.preventDefault();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement as HTMLElement | null;

      if (event.shiftKey && (active === first || !container.contains(active))) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = originalOverflow;
      previouslyFocused?.focus?.();
    };
  }, [isOpen, onClose]);

  return containerRef;
}

const TABBABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled]):not([type='hidden'])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "[tabindex]:not([tabindex='-1'])",
].join(",");

function getTabbableElements(root: HTMLElement): HTMLElement[] {
  return Array.from(root.querySelectorAll<HTMLElement>(TABBABLE_SELECTOR)).filter(
    (el) => !el.hasAttribute("aria-hidden") && el.offsetParent !== null,
  );
}
