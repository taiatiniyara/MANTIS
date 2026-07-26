/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { supabase } from "@/lib/supabase/client";
import { tableNames } from "@/lib/supabase/schema";

// CSS variables (from src/index.css) that App Admin can edit in-app.
export const EDITABLE_COLOR_TOKENS = [
  "--background",
  "--foreground",
  "--card",
  "--card-foreground",
  "--popover",
  "--popover-foreground",
  "--primary",
  "--primary-foreground",
  "--secondary",
  "--secondary-foreground",
  "--muted",
  "--muted-foreground",
  "--accent",
  "--accent-foreground",
  "--destructive",
  "--border",
  "--input",
  "--ring",
  "--chart-1",
  "--chart-2",
  "--chart-3",
  "--chart-4",
  "--chart-5",
] as const;

export const EDITABLE_SCALAR_TOKENS = ["--radius"] as const;

export type ThemeTokens = Record<string, string>;

interface ThemeContextValue {
  loading: boolean;
  /** Saved + applied overrides (css var -> value). */
  overrides: ThemeTokens;
  /** Live-apply a single token to :root without persisting (preview). */
  previewToken: (name: string, value: string) => void;
  /** Persist the full token map and apply it for everyone. */
  saveTheme: (tokens: ThemeTokens) => Promise<{ error: string | null }>;
  /** Clear all overrides (back to index.css defaults) and persist empty. */
  resetTheme: () => Promise<{ error: string | null }>;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within a ThemeProvider");
  return ctx;
};

function applyTokens(tokens: ThemeTokens) {
  const root = document.documentElement;
  Object.entries(tokens).forEach(([name, value]) => {
    if (value) root.style.setProperty(name, value);
  });
}

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [overrides, setOverrides] = useState<ThemeTokens>({});
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const { data, error } = await supabase
      .from(tableNames.appTheme)
      .select("tokens")
      .eq("id", "default")
      .maybeSingle();

    const tokens = (!error && (data?.tokens as ThemeTokens)) || {};
    applyTokens(tokens);
    setOverrides(tokens);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const previewToken = useCallback((name: string, value: string) => {
    document.documentElement.style.setProperty(name, value);
  }, []);

  const saveTheme = useCallback(async (tokens: ThemeTokens) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const { error } = await supabase.from(tableNames.appTheme).upsert({
      id: "default",
      tokens,
      updated_by: user?.id ?? null,
      updated_at: new Date().toISOString(),
    });
    if (!error) {
      applyTokens(tokens);
      setOverrides(tokens);
    }
    return { error: error?.message ?? null };
  }, []);

  const resetTheme = useCallback(async () => {
    const root = document.documentElement;
    Object.keys(overrides).forEach((name) => root.style.removeProperty(name));
    const { error } = await supabase.from(tableNames.appTheme).upsert({
      id: "default",
      tokens: {},
      updated_at: new Date().toISOString(),
    });
    if (!error) setOverrides({});
    return { error: error?.message ?? null };
  }, [overrides]);

  return (
    <ThemeContext.Provider
      value={{ loading, overrides, previewToken, saveTheme, resetTheme }}
    >
      {children}
    </ThemeContext.Provider>
  );
};
