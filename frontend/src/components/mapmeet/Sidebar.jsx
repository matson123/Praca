import React from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CATEGORY_META, formatDatePL } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function Sidebar({ open, onClose, title, children, testid }) {
  return (
    <aside
      data-testid={testid || "sidebar-container"}
      className={`mm-sidebar ${open ? "is-open" : ""}`}
    >
      <div className="mm-sidebar-head">
        <h2 className="mm-sidebar-title">{title}</h2>
        <button
          data-testid="sidebar-close-btn"
          onClick={onClose}
          aria-label="Zamknij panel"
          className="mm-sidebar-close"
        >
          <X size={18} />
        </button>
      </div>
      <ScrollArea className="mm-sidebar-body">{children}</ScrollArea>
    </aside>
  );
}

export function EventCard({ event, onClick }) {
  const meta = CATEGORY_META[event.category] || CATEGORY_META.Inne;
  return (
    <button
      data-testid="sidebar-event-card"
      onClick={onClick}
      className="mm-event-card"
      style={{ borderLeftColor: meta.hex }}
    >
      <div className="mm-event-card-row">
        <Badge
          className="mm-badge"
          style={{ background: meta.bg, color: meta.text, borderColor: meta.border }}
        >
          {event.category}
        </Badge>
        <span className="mm-event-card-date">{formatDatePL(event.starts_at)}</span>
      </div>
      <h3 className="mm-event-card-title">{event.title}</h3>
      <p className="mm-event-card-loc">{event.location_name || "—"}</p>
      <div className="mm-event-card-foot">
        <div className="mm-event-card-org">
          <Avatar className="h-6 w-6">
            <AvatarImage src={event.organizer_avatar || undefined} />
            <AvatarFallback>{event.organizer_nick?.slice(0, 2)}</AvatarFallback>
          </Avatar>
          <span>{event.organizer_nick}</span>
        </div>
        <span className="mm-event-card-count">
          {event.participants_count} / {event.max_participants}
        </span>
      </div>
    </button>
  );
}
