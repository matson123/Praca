import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { api, CATEGORIES, CATEGORY_META, formatApiError } from "@/lib/api";
import { toast } from "sonner";
import { MapPin } from "lucide-react";

export default function CreateEventForm({ pickedLocation, onCreated, onRequestPick }) {
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "Sport",
    starts_at: "",
    max_participants: 10,
    is_public: true,
    requires_approval: false,
    comments_enabled: true,
    location_name: "",
  });
  const [busy, setBusy] = useState(false);

  const upd = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    if (!pickedLocation) {
      toast.error("Wybierz punkt na mapie klikając w wybrane miejsce.");
      onRequestPick();
      return;
    }
    if (!form.starts_at) {
      toast.error("Podaj datę i godzinę wydarzenia.");
      return;
    }
    setBusy(true);
    try {
      const payload = {
        ...form,
        lat: pickedLocation.lat,
        lon: pickedLocation.lng,
        starts_at: new Date(form.starts_at).toISOString(),
      };
      const { data } = await api.post("/events", payload);
      toast.success("Wydarzenie zostało utworzone!");
      onCreated?.(data);
    } catch (err) {
      toast.error(formatApiError(err));
    }
    setBusy(false);
  };

  const meta = CATEGORY_META[form.category];

  return (
    <form className="mm-create-form" onSubmit={submit}>
      <div className="mm-pick-loc" style={{ borderColor: meta.border, background: meta.bg }}>
        <MapPin size={18} color={meta.hex} />
        {pickedLocation ? (
          <div>
            <p className="mm-caption">Wybrany punkt</p>
            <p className="mm-pick-loc-coords">
              {pickedLocation.lat.toFixed(5)}, {pickedLocation.lng.toFixed(5)}
            </p>
          </div>
        ) : (
          <div>
            <p className="mm-caption">Krok 1</p>
            <button
              type="button"
              className="mm-pick-loc-btn"
              onClick={onRequestPick}
              data-testid="create-event-pick-btn"
            >
              Kliknij tutaj, potem wybierz punkt na mapie Polski
            </button>
          </div>
        )}
      </div>

      <div>
        <Label>Tytuł</Label>
        <Input
          data-testid="create-event-title-input"
          value={form.title}
          onChange={(e) => upd("title", e.target.value)}
          required
          minLength={3}
          placeholder="np. Wieczór planszówek na Starówce"
        />
      </div>

      <div>
        <Label>Opis</Label>
        <Textarea
          data-testid="create-event-description-input"
          value={form.description}
          onChange={(e) => upd("description", e.target.value)}
          required
          rows={4}
          placeholder="Co robimy, co warto wiedzieć, co zabrać…"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>Kategoria</Label>
          <Select value={form.category} onValueChange={(v) => upd("category", v)}>
            <SelectTrigger data-testid="create-event-category-select">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((c) => (
                <SelectItem key={c} value={c}>
                  <span
                    className="mm-cat-dot"
                    style={{ background: CATEGORY_META[c].hex }}
                  />
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Max osób</Label>
          <Input
            type="number"
            min={2}
            max={1000}
            value={form.max_participants}
            onChange={(e) => upd("max_participants", parseInt(e.target.value || "2", 10))}
            data-testid="create-event-max-input"
          />
        </div>
      </div>

      <div>
        <Label>Data i godzina</Label>
        <Input
          type="datetime-local"
          data-testid="create-event-date-picker"
          value={form.starts_at}
          onChange={(e) => upd("starts_at", e.target.value)}
          required
        />
      </div>

      <div>
        <Label>Nazwa miejsca (opcjonalnie)</Label>
        <Input
          value={form.location_name}
          onChange={(e) => upd("location_name", e.target.value)}
          placeholder="np. Kraków – Rynek Główny"
        />
      </div>

      <div className="mm-switch-row">
        <div>
          <p className="font-medium">Publiczne</p>
          <p className="mm-hint">Widoczne dla wszystkich na mapie</p>
        </div>
        <Switch
          checked={form.is_public}
          onCheckedChange={(v) => upd("is_public", v)}
          data-testid="create-event-public-switch"
        />
      </div>

      <div className="mm-switch-row">
        <div>
          <p className="font-medium">Wymagaj akceptacji</p>
          <p className="mm-hint">Zgłoszenia trafiają na listę oczekujących</p>
        </div>
        <Switch
          checked={form.requires_approval}
          onCheckedChange={(v) => upd("requires_approval", v)}
        />
      </div>

      <div className="mm-switch-row">
        <div>
          <p className="font-medium">Komentarze</p>
          <p className="mm-hint">Pozwalaj uczestnikom pisać w wątku</p>
        </div>
        <Switch
          checked={form.comments_enabled}
          onCheckedChange={(v) => upd("comments_enabled", v)}
        />
      </div>

      <Button
        type="submit"
        disabled={busy}
        data-testid="create-event-submit-btn"
        className="mm-cta w-full"
      >
        {busy ? "Zapisywanie…" : "Opublikuj wydarzenie"}
      </Button>
    </form>
  );
}
