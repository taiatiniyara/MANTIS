import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import {
  EDITABLE_COLOR_TOKENS,
  EDITABLE_SCALAR_TOKENS,
  useTheme,
  type ThemeTokens,
} from "@/contexts/ThemeContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RotateCcw, Save } from "lucide-react";

// Resolve any CSS color (incl. oklch) to a #rrggbb hex the native color input
// can display, by letting the browser compute it.
function resolveHex(value: string): string {
  try {
    const el = document.createElement("div");
    el.style.color = value;
    el.style.display = "none";
    document.body.appendChild(el);
    const rgb = getComputedStyle(el).color;
    document.body.removeChild(el);
    const m = rgb.match(/\d+/g);
    if (!m) return "#000000";
    return (
      "#" +
      m
        .slice(0, 3)
        .map((n) => Number(n).toString(16).padStart(2, "0"))
        .join("")
    );
  } catch {
    return "#000000";
  }
}

export function ThemeEditor() {
  const { loading, saveTheme, resetTheme, previewToken } = useTheme();
  const [draft, setDraft] = useState<ThemeTokens>({});
  const [saving, setSaving] = useState(false);

  const initFromComputed = useCallback(() => {
    const cs = getComputedStyle(document.documentElement);
    const next: ThemeTokens = {};
    [...EDITABLE_COLOR_TOKENS, ...EDITABLE_SCALAR_TOKENS].forEach((token) => {
      next[token] = cs.getPropertyValue(token).trim();
    });
    setDraft(next);
  }, []);

  // Initialize the draft once the saved theme has been applied.
  useEffect(() => {
    if (!loading) initFromComputed();
  }, [loading, initFromComputed]);

  const setToken = (name: string, value: string) => {
    setDraft((d) => ({ ...d, [name]: value }));
    previewToken(name, value);
  };

  const handleSave = async () => {
    setSaving(true);
    const { error } = await saveTheme(draft);
    setSaving(false);
    if (error) toast.error(`Failed to save theme: ${error}`);
    else toast.success("Theme saved — applied for everyone.");
  };

  const handleReset = async () => {
    const { error } = await resetTheme();
    if (error) {
      toast.error(`Failed to reset: ${error}`);
      return;
    }
    initFromComputed();
    toast.success("Theme reset to defaults.");
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <CardTitle>Theme editor</CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleReset} disabled={saving}>
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              <Save className="w-4 h-4 mr-2" />
              {saving ? "Saving…" : "Save"}
            </Button>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          Edit colours below — changes preview live, and <strong>Save</strong>{" "}
          applies them for every visitor (including the public site). Accepts any
          CSS colour (e.g. <code>oklch(...)</code> or a hex).
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {EDITABLE_COLOR_TOKENS.map((token) => (
            <div key={token} className="flex items-center gap-3">
              <input
                type="color"
                aria-label={`${token} colour picker`}
                value={resolveHex(draft[token] ?? "#000000")}
                onChange={(e) => setToken(token, e.target.value)}
                className="h-9 w-10 shrink-0 cursor-pointer rounded border border-border bg-transparent p-0.5"
              />
              <div className="min-w-0 flex-1">
                <label className="block text-xs font-mono text-muted-foreground truncate">
                  {token}
                </label>
                <input
                  type="text"
                  value={draft[token] ?? ""}
                  onChange={(e) => setToken(token, e.target.value)}
                  spellCheck={false}
                  className="w-full rounded-md border border-input bg-background px-2 py-1 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-ring/40"
                />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 border-t border-border pt-4">
          {EDITABLE_SCALAR_TOKENS.map((token) => (
            <div key={token} className="flex items-center gap-3 max-w-xs">
              <label className="text-xs font-mono text-muted-foreground w-20 shrink-0">
                {token}
              </label>
              <input
                type="text"
                value={draft[token] ?? ""}
                onChange={(e) => setToken(token, e.target.value)}
                spellCheck={false}
                placeholder="e.g. 0.375rem"
                className="w-full rounded-md border border-input bg-background px-2 py-1 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-ring/40"
              />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
