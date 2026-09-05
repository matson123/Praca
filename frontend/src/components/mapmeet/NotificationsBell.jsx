import React, { useCallback, useEffect, useState } from "react";
import { Bell, CheckCheck, UserPlus, MessageCircle, CalendarClock, ShieldCheck, XCircle } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { api, formatApiError, formatDatePL } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

const TYPE_ICON = {
  joined: UserPlus,
  join_request: UserPlus,
  approved: ShieldCheck,
  rejected: XCircle,
  comment: MessageCircle,
  invite_joined: UserPlus,
  upcoming: CalendarClock,
};

export default function NotificationsBell({ onOpenEvent }) {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [unread, setUnread] = useState(0);
  const [open, setOpen] = useState(false);

  const load = useCallback(async () => {
    if (!user) return;
    try {
      const { data } = await api.get("/notifications");
      setItems(data.notifications);
      setUnread(data.unread);
    } catch {
      /* silent */
    }
  }, [user]);

  useEffect(() => {
    load();
    const t = setInterval(load, 30000);
    return () => clearInterval(t);
  }, [load]);

  const markAll = async () => {
    try {
      await api.post("/notifications/read-all");
      load();
      toast.success("Oznaczono wszystkie jako przeczytane");
    } catch (e) {
      toast.error(formatApiError(e));
    }
  };

  const handleClick = async (n) => {
    if (!n.is_read) {
      try {
        await api.post(`/notifications/${n.id}/read`);
      } catch {}
      load();
    }
    if (n.event_id) {
      try {
        const { data } = await api.get(`/events/${n.event_id}`);
        onOpenEvent?.(data);
        setOpen(false);
      } catch {
        toast.error("Wydarzenie już nie istnieje");
      }
    }
  };

  if (!user) return null;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          data-testid="topbar-notifications-btn"
          className="mm-bell-btn"
          aria-label="Powiadomienia"
        >
          <Bell size={18} />
          {unread > 0 && (
            <span className="mm-bell-badge" data-testid="notifications-unread-badge">
              {unread > 9 ? "9+" : unread}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="mm-notifications-pop">
        <div className="mm-notifications-head">
          <b>Powiadomienia</b>
          {unread > 0 && (
            <button className="mm-linkish-dark" onClick={markAll} data-testid="notifications-mark-all-btn">
              <CheckCheck size={14} /> Oznacz wszystkie
            </button>
          )}
        </div>
        <ScrollArea className="mm-notifications-body">
          {items.length === 0 && <p className="mm-hint p-3">Brak powiadomień.</p>}
          {items.map((n) => {
            const Icon = TYPE_ICON[n.type] || Bell;
            return (
              <button
                key={n.id}
                type="button"
                data-testid="notification-item"
                className={`mm-notification ${n.is_read ? "" : "is-unread"}`}
                onClick={() => handleClick(n)}
              >
                <span className="mm-notification-icon">
                  <Icon size={14} />
                </span>
                <div className="mm-notification-body">
                  <div className="mm-notification-head">
                    <b>{n.title}</b>
                    {!n.is_read && <span className="mm-notification-dot" />}
                  </div>
                  <p className="mm-notification-text">{n.body}</p>
                  <span className="mm-notification-time">{formatDatePL(n.created_at)}</span>
                </div>
              </button>
            );
          })}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
