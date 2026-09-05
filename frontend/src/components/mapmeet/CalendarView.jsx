import React, { useEffect, useState } from "react";
import { api, CATEGORY_META, formatApiError } from "@/lib/api";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin as MapPinIcon, Users } from "lucide-react";

const DAY_NAMES = ["niedziela", "poniedziałek", "wtorek", "środa", "czwartek", "piątek", "sobota"];
const MONTHS = ["stycznia", "lutego", "marca", "kwietnia", "maja", "czerwca", "lipca", "sierpnia", "września", "października", "listopada", "grudnia"];

function formatDayHeader(iso) {
  const d = new Date(iso + "T00:00:00");
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const isToday = d.getTime() === today.getTime();
  const isTomorrow = d.getTime() === tomorrow.getTime();
  const label = `${DAY_NAMES[d.getDay()]}, ${d.getDate()} ${MONTHS[d.getMonth()]}`;
  return { label, badge: isToday ? "dziś" : isTomorrow ? "jutro" : null };
}

function formatTime(iso) {
  return new Date(iso).toLocaleTimeString("pl-PL", { hour: "2-digit", minute: "2-digit" });
}

export default function CalendarView({ onOpenEvent, onClose }) {
  const [days, setDays] = useState([]);
  const [range, setRange] = useState(30);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api
      .get("/calendar", { params: { days: range } })
      .then((r) => setDays(r.data.days))
      .catch((e) => toast.error(formatApiError(e)))
      .finally(() => setLoading(false));
  }, [range]);

  const totalEvents = days.reduce((s, d) => s + d.events.length, 0);

  return (
    <div className="mm-calendar" data-testid="calendar-view">
      <div className="mm-calendar-head">
        <div>
          <span className="mm-caption">Kalendarz wydarzeń</span>
          <h2 className="mm-calendar-title">Nadchodzące spotkania</h2>
          <p className="mm-hint">{totalEvents} wydarzeń · najbliższe {range} dni</p>
        </div>
        <div className="flex gap-2">
          {[7, 30, 90].map((n) => (
            <Button
              key={n}
              size="sm"
              variant={range === n ? "default" : "outline"}
              onClick={() => setRange(n)}
              className={range === n ? "mm-cta" : ""}
              data-testid={`calendar-range-${n}`}
            >
              {n} dni
            </Button>
          ))}
          <Button variant="ghost" onClick={onClose} data-testid="calendar-close-btn">Zamknij</Button>
        </div>
      </div>

      {loading && <p className="mm-hint">Ładowanie…</p>}

      {!loading && days.length === 0 && (
        <div className="mm-calendar-empty">
          <Calendar size={40} className="opacity-30" />
          <p>Brak wydarzeń w wybranym zakresie.</p>
        </div>
      )}

      <div className="mm-calendar-days">
        {days.map((day) => {
          const { label, badge } = formatDayHeader(day.date);
          return (
            <section key={day.date} className="mm-calendar-day" data-testid="calendar-day">
              <header className="mm-calendar-day-head">
                <h3>{label}</h3>
                {badge && <Badge className="mm-badge mm-badge-accent">{badge}</Badge>}
                <span className="mm-calendar-day-count">{day.events.length} wydarzeń</span>
              </header>
              <div className="mm-calendar-day-grid">
                {day.events.map((e) => {
                  const meta = CATEGORY_META[e.category] || CATEGORY_META.Inne;
                  return (
                    <button
                      key={e.id}
                      onClick={() => onOpenEvent(e)}
                      className="mm-calendar-event"
                      style={{ borderLeftColor: meta.hex }}
                      data-testid="calendar-event-card"
                    >
                      <div className="mm-calendar-event-time" style={{ color: meta.hex }}>
                        {formatTime(e.starts_at)}
                      </div>
                      <div className="mm-calendar-event-body">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge
                            className="mm-badge"
                            style={{ background: meta.bg, color: meta.text, borderColor: meta.border }}
                          >
                            {e.category}
                          </Badge>
                          <h4 className="mm-calendar-event-title">{e.title}</h4>
                        </div>
                        <div className="mm-calendar-event-meta">
                          <span><MapPinIcon size={12} /> {e.location_name || "—"}</span>
                          <span><Users size={12} /> {e.participants_count} / {e.max_participants}</span>
                          <span>{e.organizer_nick}</span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
