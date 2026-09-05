import React from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { CATEGORIES, CATEGORY_META } from "@/lib/api";

export default function FiltersPanel({ filters, setFilters, onApply, onReset }) {
  const toggleCategory = (c) => {
    setFilters((f) => ({
      ...f,
      category: f.category === c ? null : c,
    }));
  };

  return (
    <div className="mm-filters">
      <div>
        <Label className="mm-caption">Kategoria</Label>
        <div className="mm-cat-grid">
          {CATEGORIES.map((c) => {
            const active = filters.category === c;
            const meta = CATEGORY_META[c];
            return (
              <button
                key={c}
                type="button"
                data-testid={`sidebar-category-filter-btn-${c}`}
                onClick={() => toggleCategory(c)}
                className={`mm-cat-chip ${active ? "is-active" : ""}`}
                style={{
                  background: active ? meta.hex : meta.bg,
                  color: active ? "white" : meta.text,
                  borderColor: meta.border,
                }}
              >
                {c}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <Label>Od daty</Label>
        <Input
          type="date"
          value={filters.from_date || ""}
          onChange={(e) => setFilters((f) => ({ ...f, from_date: e.target.value }))}
        />
      </div>
      <div>
        <Label>Do daty</Label>
        <Input
          type="date"
          value={filters.to_date || ""}
          onChange={(e) => setFilters((f) => ({ ...f, to_date: e.target.value }))}
        />
      </div>

      <div className="mm-switch-row">
        <div>
          <p className="font-medium">Tylko publiczne</p>
        </div>
        <Switch
          checked={!!filters.only_public}
          onCheckedChange={(v) => setFilters((f) => ({ ...f, only_public: v }))}
        />
      </div>

      <div className="mm-switch-row">
        <div>
          <p className="font-medium">Pokaż archiwum</p>
        </div>
        <Switch
          checked={!!filters.include_archived}
          onCheckedChange={(v) => setFilters((f) => ({ ...f, include_archived: v }))}
        />
      </div>

      <div>
        <Label>Dystans od Twojej lokalizacji (km)</Label>
        <Input
          type="number"
          min={0}
          value={filters.max_km || ""}
          onChange={(e) =>
            setFilters((f) => ({
              ...f,
              max_km: e.target.value ? parseFloat(e.target.value) : null,
            }))
          }
          placeholder="np. 50"
        />
      </div>

      <div className="flex gap-2">
        <Button className="flex-1 mm-cta" onClick={onApply} data-testid="filters-apply-btn">
          Zastosuj filtry
        </Button>
        <Button variant="outline" onClick={onReset} data-testid="filters-reset-btn">
          Wyczyść
        </Button>
      </div>
    </div>
  );
}
