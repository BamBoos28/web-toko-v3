import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

type Variant = "success" | "error" | "info" | "warning" | "custom";

type ToastOptions = {
  variant?: Variant;
  duration?: number; // ms
  // optional raw colors (hex or css color). If provided, overrides variant defaults.
  backgroundColor?: string;
  textColor?: string;
};

type ToastItem = {
  id: string;
  text: string;
  options: ToastOptions;
  visible: boolean; // controls enter/exit animation
};

type ToastContextValue = {
  showToast: (text: string, opts?: ToastOptions) => string;
  dismissToast: (id: string) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

/** Helper: default colors per variant (fallbacks) */
const VARIANT_STYLES: Record<
  Variant,
  { bg: string; text: string; icon?: string }
> = {
  success: { bg: "bg-green-50", text: "text-green-800", icon: "✅" },
  error: { bg: "bg-red-50", text: "text-red-800", icon: "🚨" },
  info: { bg: "bg-blue-50", text: "text-blue-800", icon: "ℹ️" },
  warning: { bg: "bg-amber-50", text: "text-amber-800", icon: "⚠️" },
  custom: { bg: "bg-white", text: "text-slate-800", icon: "✨" },
};

// Duration of enter/exit animation (ms) - must match Tailwind duration class (here 300)
const ANIM_MS = 300;

type TimerRecord = {
  auto?: number;
  remove?: number;
  enter?: number;
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  // timers map to clear timeouts when dismissing early
  const timersRef = useRef<Record<string, TimerRecord>>({});

  // create id
  const createId = useCallback(() => {
    return `${Date.now().toString(36)}-${Math.random()
      .toString(36)
      .slice(2, 9)}`;
  }, []);

  const scheduleRemovalAfterAnim = useCallback((id: string) => {
    // remove toast after ANIM_MS
    const removeTimer = window.setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
      delete timersRef.current[id]?.remove;
      if (
        timersRef.current[id] &&
        Object.keys(timersRef.current[id]).length === 0
      ) {
        delete timersRef.current[id];
      }
    }, ANIM_MS);
    timersRef.current[id] = {
      ...(timersRef.current[id] ?? {}),
      remove: removeTimer,
    };
  }, []);

  const startDismiss = useCallback(
    (id: string) => {
      // set visible false -> triggers exit animation
      setToasts((prev) =>
        prev.map((t) => (t.id === id ? { ...t, visible: false } : t)),
      );
      // schedule actual removal after animation completes
      // clear any previous remove timer first
      const prev = timersRef.current[id];
      if (prev?.remove) {
        clearTimeout(prev.remove);
      }
      scheduleRemovalAfterAnim(id);
    },
    [scheduleRemovalAfterAnim],
  );

  const dismissToast = useCallback(
    (id: string) => {
      // initiate exit animation (if still present)
      const exists = toasts.find((t) => t.id === id);
      if (!exists) return;
      // clear any auto timer
      const rec = timersRef.current[id];
      if (rec?.auto) {
        clearTimeout(rec.auto);
        delete rec.auto;
      }
      startDismiss(id);
    },
    [toasts, startDismiss],
  );

  const showToast = useCallback(
    (text: string, opts: ToastOptions = {}) => {
      const id = createId();
      const duration = opts.duration ?? 3500;
      // mount toast initially invisible so we can animate "enter"
      const item: ToastItem = { id, text, options: opts, visible: false };
      setToasts((prev) => [item, ...prev]); // newest on top

      // ensure enter animation: flip visible -> true on next tick
      const enterTimer = window.setTimeout(() => {
        setToasts((prev) =>
          prev.map((t) => (t.id === id ? { ...t, visible: true } : t)),
        );
        // schedule auto-dismiss only after it has entered
        const autoTimer = window.setTimeout(() => {
          // initiate exit (which schedules removal after ANIM_MS)
          startDismiss(id);
        }, duration);
        timersRef.current[id] = {
          ...(timersRef.current[id] ?? {}),
          auto: autoTimer,
        };
      }, 20); // small delay to ensure transition triggers

      timersRef.current[id] = {
        ...(timersRef.current[id] ?? {}),
        enter: enterTimer,
      };

      return id;
    },
    [createId, startDismiss],
  );

  // cleanup timers on unmount
  useEffect(() => {
    return () => {
      Object.values(timersRef.current).forEach((rec) => {
        if (rec.auto) clearTimeout(rec.auto);
        if (rec.remove) clearTimeout(rec.remove);
        if (rec.enter) clearTimeout(rec.enter);
      });
      timersRef.current = {};
    };
  }, []);

  return (
    <ToastContext.Provider value={{ showToast, dismissToast }}>
      {children}

      {/* Toast container (top-right) */}
      <div
        aria-live="polite"
        aria-atomic="true"
        className="fixed right-4 top-4 z-50 flex max-w-sm flex-col gap-2"
      >
        {toasts.map((t) => (
          <ToastView
            key={t.id}
            toast={t}
            onClose={() => {
              dismissToast(t.id);
            }}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

/** Hook to use in components */
export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return ctx;
}

/** Visual for a single toast */
function ToastView({
  toast,
  onClose,
}: {
  toast: ToastItem;
  onClose: () => void;
}) {
  const { text, options, visible } = toast;
  const variant = options.variant ?? "info";
  const duration = options.duration ?? 3500;

  // style decision
  const variantStyle = VARIANT_STYLES[variant] ?? VARIANT_STYLES.info;
  const customBg = options.backgroundColor;
  const customText = options.textColor;

  const bgClass = customBg ? "" : variantStyle.bg;
  const textClass = customText ? "" : variantStyle.text;

  // inline style if custom colors are provided
  const inlineStyle: React.CSSProperties = {};
  if (customBg) inlineStyle.background = customBg;
  if (customText) inlineStyle.color = customText;

  // animation classes: slide in from right, slide out to right
  // when visible === true -> translate-x-0 opacity-100
  // when visible === false -> translate-x-4 opacity-0
  const animClasses = visible
    ? "translate-x-0 opacity-100"
    : "translate-x-4 opacity-0";

  return (
    <div
      role="status"
      className={`pointer-events-auto transform-gpu transition-all duration-300 ease-out ${animClasses}`}
      style={{ willChange: "transform, opacity", ...inlineStyle }}
    >
      <div
        className={`flex w-full items-start gap-3 rounded-md border px-3 py-2 shadow-sm ${bgClass}`}
      >
        {/* Icon */}
        <div
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${variantStyle.bg}`}
        >
          <span className={`text-sm font-semibold ${textClass}`}>
            {variantStyle.icon}
          </span>
        </div>

        {/* Content */}
        <div className="flex-1">
          <div className={`text-sm ${textClass}`}>{text}</div>
          {/* small meta */}
          <div className="mt-1 text-xs text-slate-400">
            Auto-hide in {Math.round(duration / 1000)}s
          </div>
        </div>

        {/* close */}
        <button
          onClick={onClose}
          aria-label="Close notification"
          className={`ml-3 rounded-md px-2 py-1 text-sm ${textClass} hover:opacity-80`}
        >
          ✕
        </button>
      </div>
    </div>
  );
}
