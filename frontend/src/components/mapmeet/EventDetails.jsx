import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Users, Clock, MapPin as MapPinIcon, Send, Trash2, CheckCircle2, XCircle, Flag, Link2, Copy } from "lucide-react";
import { api, CATEGORY_META, formatApiError, formatDatePL } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import ReportDialog from "./ReportDialog";

export default function EventDetails({ event, onChanged, onDeleted, onRequireAuth }) {
  const { user } = useAuth();
  const [details, setDetails] = useState(event);
  const [comments, setComments] = useState([]);
  const [participants, setParticipants] = useState({ participants: [], pending: [] });
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [reportTarget, setReportTarget] = useState(null);
  const [inviteLink, setInviteLink] = useState("");

  const meta = CATEGORY_META[details.category] || CATEGORY_META.Inne;
  const isOrganizer = user && user.id === details.organizer_id;
  const isParticipant = user && details.participants?.includes(user.id);
  const isPending = user && details.pending?.includes(user.id);

  const load = React.useCallback(async () => {
    try {
      const [ev, cs, ps] = await Promise.all([
        api.get(`/events/${event.id}`),
        api.get(`/events/${event.id}/comments`),
        api.get(`/events/${event.id}/participants`),
      ]);
      setDetails(ev.data);
      setComments(cs.data.comments);
      setParticipants(ps.data);
    } catch (e) {
      // silent
    }
  }, [event.id]);

  useEffect(() => {
    setDetails(event);
    load();
    const t = setInterval(load, 15000);
    return () => clearInterval(t);
  }, [event, load]);

  const doJoin = async () => {
    if (!user) return onRequireAuth();
    setBusy(true);
    try {
      const { data } = await api.post(`/events/${event.id}/join`);
      toast.success(data.status === "pending" ? "Zgłoszenie wysłane – oczekuje na akceptację" : "Dołączono do wydarzenia!");
      await load();
      onChanged?.();
    } catch (e) {
      toast.error(formatApiError(e));
    }
    setBusy(false);
  };

  const doLeave = async () => {
    setBusy(true);
    try {
      await api.post(`/events/${event.id}/leave`);
      toast.success("Opuściłeś wydarzenie");
      await load();
      onChanged?.();
    } catch (e) {
      toast.error(formatApiError(e));
    }
    setBusy(false);
  };

  const doDelete = async () => {
    if (!window.confirm("Usunąć wydarzenie? Tej operacji nie można cofnąć.")) return;
    try {
      await api.delete(`/events/${event.id}`);
      toast.success("Wydarzenie usunięte");
      onDeleted?.();
    } catch (e) {
      toast.error(formatApiError(e));
    }
  };

  const submitComment = async (e) => {
    e.preventDefault();
    if (!user) return onRequireAuth();
    if (!text.trim()) return;
    try {
      const { data } = await api.post(`/events/${event.id}/comments`, { text });
      setComments((c) => [...c, data]);
      setText("");
    } catch (err) {
      toast.error(formatApiError(err));
    }
  };

  const approvePending = async (uid) => {
    try {
      await api.post(`/events/${event.id}/approve/${uid}`);
      toast.success("Zaakceptowano zgłoszenie");
      load();
    } catch (e) {
      toast.error(formatApiError(e));
    }
  };
  const rejectPending = async (uid) => {
    try {
      await api.post(`/events/${event.id}/reject/${uid}`);
      toast.success("Odrzucono zgłoszenie");
      load();
    } catch (e) {
      toast.error(formatApiError(e));
    }
  };

  const generateInvite = async () => {
    try {
      const { data } = await api.post(`/events/${event.id}/invite`);
      const link = `${window.location.origin}/?invite=${data.invite_token}`;
      setInviteLink(link);
      try {
        await navigator.clipboard.writeText(link);
        toast.success("Link zapraszający skopiowany do schowka");
      } catch {
        toast.success("Link zapraszający wygenerowany");
      }
    } catch (e) {
      toast.error(formatApiError(e));
    }
  };

  const copyInvite = async () => {
    if (!inviteLink) return;
    try {
      await navigator.clipboard.writeText(inviteLink);
      toast.success("Skopiowano");
    } catch {
      toast.error("Nie udało się skopiować");
    }
  };

  return (
    <div className="mm-details" data-testid="event-details">
      <div className="mm-details-hero" style={{ background: meta.bg, borderColor: meta.border }}>
        <Badge className="mm-badge" style={{ background: "white", color: meta.text, borderColor: meta.border }}>
          {details.category}
        </Badge>
        <h1 className="mm-details-title">{details.title}</h1>
        <div className="mm-details-meta">
          <span><Clock size={14} /> {formatDatePL(details.starts_at)}</span>
          <span><MapPinIcon size={14} /> {details.location_name || `${details.lat.toFixed(3)}, ${details.lon.toFixed(3)}`}</span>
          <span><Users size={14} /> {details.participants_count} / {details.max_participants}</span>
        </div>
      </div>

      <div className="mm-details-organizer">
        <Avatar className="h-9 w-9">
          <AvatarImage src={details.organizer_avatar || undefined} />
          <AvatarFallback>{details.organizer_nick?.slice(0, 2)}</AvatarFallback>
        </Avatar>
        <div>
          <span className="mm-caption">Organizator</span>
          <p className="mm-details-org-name">{details.organizer_nick}</p>
        </div>
      </div>

      <p className="mm-details-desc">{details.description}</p>

      <div className="mm-details-actions">
        {details.is_archived ? (
          <Badge variant="secondary">Archiwum</Badge>
        ) : isOrganizer ? (
          <Button
            variant="destructive"
            onClick={doDelete}
            data-testid="event-delete-btn"
          >
            <Trash2 size={16} /> Usuń wydarzenie
          </Button>
        ) : isParticipant ? (
          <Button
            data-testid="sidebar-event-leave-btn"
            onClick={doLeave}
            disabled={busy}
            variant="outline"
          >
            Opuść wydarzenie
          </Button>
        ) : isPending ? (
          <Badge variant="secondary">Oczekuje na akceptację</Badge>
        ) : (
          <Button
            data-testid="sidebar-event-join-btn"
            onClick={doJoin}
            disabled={busy}
            className="mm-cta"
          >
            {details.requires_approval ? "Wyślij zgłoszenie" : "Dołącz do wydarzenia"}
          </Button>
        )}
        {user && user.id !== details.organizer_id && (
          <Button
            variant="ghost"
            size="sm"
            className="ml-auto text-slate-500"
            onClick={() => {
              if (!user) return onRequireAuth();
              setReportTarget({ type: "event", id: details.id });
            }}
            data-testid="event-report-btn"
          >
            <Flag size={14} /> Zgłoś
          </Button>
        )}
      </div>

      {isOrganizer && !details.is_archived && (
        <div className="mm-invite-box" data-testid="event-invite-box">
          <div className="mm-invite-head">
            <Link2 size={14} />
            <span className="mm-caption">Link zapraszający</span>
          </div>
          {inviteLink ? (
            <div className="mm-invite-row">
              <input
                readOnly
                value={inviteLink}
                onFocus={(e) => e.target.select()}
                className="mm-invite-input"
                data-testid="event-invite-link-input"
              />
              <Button size="icon" variant="outline" onClick={copyInvite} aria-label="Kopiuj">
                <Copy size={14} />
              </Button>
            </div>
          ) : (
            <Button
              size="sm"
              variant="outline"
              onClick={generateInvite}
              data-testid="event-invite-generate-btn"
            >
              <Link2 size={14} /> Wygeneruj link i skopiuj
            </Button>
          )}
          <p className="mm-hint">Osoby z linkiem dołączają bez akceptacji (do limitu miejsc).</p>
        </div>
      )}

      <Separator className="my-4" />

      <section className="mm-participants">
        <h3 className="mm-section-title">Uczestnicy ({participants.participants.length})</h3>
        <div className="mm-participants-list">
          {participants.participants.map((p) => (
            <div key={p.id} className="mm-participant">
              <Avatar className="h-8 w-8">
                <AvatarImage src={p.avatar_url || undefined} />
                <AvatarFallback>{p.nick?.slice(0, 2)}</AvatarFallback>
              </Avatar>
              <span>{p.nick}</span>
            </div>
          ))}
        </div>

        {isOrganizer && participants.pending.length > 0 && (
          <>
            <h3 className="mm-section-title mt-4">Oczekujący ({participants.pending.length})</h3>
            <div className="mm-participants-list">
              {participants.pending.map((p) => (
                <div key={p.id} className="mm-participant mm-participant-pending">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={p.avatar_url || undefined} />
                    <AvatarFallback>{p.nick?.slice(0, 2)}</AvatarFallback>
                  </Avatar>
                  <span>{p.nick}</span>
                  <div className="ml-auto flex gap-1">
                    <button onClick={() => approvePending(p.id)} className="mm-icon-btn ok" aria-label="Akceptuj">
                      <CheckCircle2 size={16} />
                    </button>
                    <button onClick={() => rejectPending(p.id)} className="mm-icon-btn no" aria-label="Odrzuć">
                      <XCircle size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </section>

      <Separator className="my-4" />

      <section className="mm-comments">
        <h3 className="mm-section-title">Komentarze ({comments.length})</h3>
        {!details.comments_enabled && <p className="mm-hint">Komentarze wyłączone przez organizatora.</p>}
        <div className="mm-comment-list">
          {comments.map((c) => (
            <div key={c.id} className="mm-comment">
              <Avatar className="h-7 w-7">
                <AvatarImage src={c.author?.avatar_url || undefined} />
                <AvatarFallback>{c.author?.nick?.slice(0, 2)}</AvatarFallback>
              </Avatar>
              <div>
                <div className="mm-comment-head">
                  <b>{c.author?.nick}</b>
                  <span className="flex items-center gap-2">
                    {formatDatePL(c.created_at)}
                    {user && c.author?.id !== user.id && (
                      <button
                        type="button"
                        className="mm-comment-report"
                        onClick={() => setReportTarget({ type: "comment", id: c.id })}
                        data-testid="comment-report-btn"
                        aria-label="Zgłoś komentarz"
                        title="Zgłoś komentarz"
                      >
                        <Flag size={12} />
                      </button>
                    )}
                  </span>
                </div>
                <p>{c.text}</p>
              </div>
            </div>
          ))}
          {comments.length === 0 && <p className="mm-hint">Bądź pierwszym komentującym.</p>}
        </div>

        {details.comments_enabled && (
          <form className="mm-comment-form" onSubmit={submitComment}>
            <Input
              data-testid="sidebar-comment-input"
              placeholder="Napisz komentarz…"
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
            <Button data-testid="sidebar-comment-submit-btn" type="submit" size="icon" className="mm-cta">
              <Send size={16} />
            </Button>
          </form>
        )}
      </section>
      <ReportDialog
        open={!!reportTarget}
        onOpenChange={(o) => !o && setReportTarget(null)}
        target={reportTarget}
      />
    </div>
  );
}
