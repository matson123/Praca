import React, { useEffect, useState, useCallback } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { api, formatApiError, formatDatePL, CATEGORY_META } from "@/lib/api";
import { toast } from "sonner";
import { Ban, CheckCircle2, Trash2, ShieldAlert, Users, Calendar, MessageSquare, ShieldCheck } from "lucide-react";

export default function AdminPanel({ onOpenEvent }) {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [reports, setReports] = useState([]);
  const [userSearch, setUserSearch] = useState("");
  const [reportStatus, setReportStatus] = useState("open");

  const loadStats = useCallback(async () => {
    try {
      const { data } = await api.get("/admin/stats");
      setStats(data);
    } catch (e) {
      toast.error(formatApiError(e));
    }
  }, []);

  const loadUsers = useCallback(async () => {
    try {
      const params = {};
      if (userSearch) params.search = userSearch;
      const { data } = await api.get("/admin/users", { params });
      setUsers(data.users);
    } catch (e) {
      toast.error(formatApiError(e));
    }
  }, [userSearch]);

  const loadReports = useCallback(async () => {
    try {
      const { data } = await api.get("/admin/reports", {
        params: reportStatus !== "all" ? { status: reportStatus } : {},
      });
      setReports(data.reports);
    } catch (e) {
      toast.error(formatApiError(e));
    }
  }, [reportStatus]);

  useEffect(() => {
    loadStats();
    loadUsers();
    loadReports();
  }, [loadStats, loadUsers, loadReports]);

  const toggleBlock = async (u) => {
    if (!window.confirm(u.is_blocked ? `Odblokować ${u.nick}?` : `Zablokować ${u.nick}? Nie będzie mógł się zalogować.`)) return;
    try {
      const { data } = await api.post(`/admin/users/${u.id}/block`);
      toast.success(data.is_blocked ? "Użytkownik zablokowany" : "Użytkownik odblokowany");
      loadUsers();
      loadStats();
    } catch (e) {
      toast.error(formatApiError(e));
    }
  };

  const resolveReport = async (r) => {
    try {
      await api.post(`/admin/reports/${r.id}/resolve`);
      toast.success("Zgłoszenie rozpatrzone");
      loadReports();
      loadStats();
    } catch (e) {
      toast.error(formatApiError(e));
    }
  };

  const deleteEvent = async (eventId) => {
    if (!window.confirm("Usunąć to wydarzenie? Operacja nieodwracalna.")) return;
    try {
      await api.delete(`/events/${eventId}`);
      toast.success("Wydarzenie usunięte");
      loadReports();
      loadStats();
    } catch (e) {
      toast.error(formatApiError(e));
    }
  };

  const deleteComment = async (commentId) => {
    if (!window.confirm("Usunąć ten komentarz?")) return;
    try {
      await api.delete(`/admin/comments/${commentId}`);
      toast.success("Komentarz usunięty");
      loadReports();
      loadStats();
    } catch (e) {
      toast.error(formatApiError(e));
    }
  };

  return (
    <div className="mm-admin" data-testid="admin-panel">
      <Tabs defaultValue="reports">
        <TabsList className="mm-auth-tabs">
          <TabsTrigger value="reports" data-testid="admin-tab-reports">
            <ShieldAlert size={14} className="mr-1" /> Zgłoszenia
          </TabsTrigger>
          <TabsTrigger value="users" data-testid="admin-tab-users">
            <Users size={14} className="mr-1" /> Użytkownicy
          </TabsTrigger>
          <TabsTrigger value="stats" data-testid="admin-tab-stats">
            Statystyki
          </TabsTrigger>
        </TabsList>

        <TabsContent value="reports" className="space-y-3 mt-4">
          <div className="flex gap-2">
            {["open", "resolved", "all"].map((s) => (
              <Button
                key={s}
                variant={reportStatus === s ? "default" : "outline"}
                size="sm"
                onClick={() => setReportStatus(s)}
                data-testid={`admin-reports-filter-${s}`}
                className={reportStatus === s ? "mm-cta" : ""}
              >
                {s === "open" ? "Otwarte" : s === "resolved" ? "Rozpatrzone" : "Wszystkie"}
              </Button>
            ))}
          </div>
          {reports.length === 0 && <p className="mm-hint">Brak zgłoszeń w tej kategorii.</p>}
          {reports.map((r) => (
            <div key={r.id} className="mm-admin-card" data-testid="admin-report-card">
              <div className="mm-admin-card-head">
                <Badge className="mm-badge" style={{ background: r.target_type === "event" ? "#FEF2F2" : "#F5F3FF", color: r.target_type === "event" ? "#991B1B" : "#5B21B6", borderColor: r.target_type === "event" ? "#FCA5A5" : "#C4B5FD" }}>
                  {r.target_type === "event" ? "Wydarzenie" : "Komentarz"}
                </Badge>
                {r.status === "open" ? (
                  <Badge variant="destructive">Otwarte</Badge>
                ) : (
                  <Badge variant="secondary"><ShieldCheck size={12} className="mr-1" /> Rozpatrzone</Badge>
                )}
                <span className="mm-admin-date">{formatDatePL(r.created_at)}</span>
              </div>
              <p className="mm-admin-reason">"{r.reason}"</p>
              <p className="mm-admin-reporter">Zgłosił: <b>{r.reporter_nick}</b></p>
              {r.target_snapshot?.exists && r.target_type === "event" && (
                <div className="mm-admin-target">
                  <p className="mm-admin-target-title">{r.target_snapshot.title}</p>
                  <p className="mm-hint">{r.target_snapshot.category} · {r.target_snapshot.location_name}</p>
                </div>
              )}
              {r.target_snapshot?.exists && r.target_type === "comment" && (
                <div className="mm-admin-target">
                  <p className="mm-admin-target-text">"{r.target_snapshot.text}"</p>
                </div>
              )}
              {!r.target_snapshot?.exists && (
                <p className="mm-hint">Obiekt został już usunięty.</p>
              )}
              <div className="mm-admin-actions">
                {r.status === "open" && (
                  <Button size="sm" onClick={() => resolveReport(r)} data-testid="admin-resolve-btn">
                    <CheckCircle2 size={14} /> Oznacz rozpatrzone
                  </Button>
                )}
                {r.target_snapshot?.exists && r.target_type === "event" && (
                  <>
                    <Button size="sm" variant="outline" onClick={() => onOpenEvent?.({ id: r.target_id, lat: 52, lon: 20, category: r.target_snapshot.category })}>
                      Otwórz
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => deleteEvent(r.target_id)} data-testid="admin-delete-event-btn">
                      <Trash2 size={14} /> Usuń wydarzenie
                    </Button>
                  </>
                )}
                {r.target_snapshot?.exists && r.target_type === "comment" && (
                  <Button size="sm" variant="destructive" onClick={() => deleteComment(r.target_id)} data-testid="admin-delete-comment-btn">
                    <Trash2 size={14} /> Usuń komentarz
                  </Button>
                )}
              </div>
            </div>
          ))}
        </TabsContent>

        <TabsContent value="users" className="space-y-3 mt-4">
          <div className="flex gap-2">
            <Input
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
              placeholder="Szukaj po emailu lub nicku"
              data-testid="admin-user-search"
            />
            <Button onClick={loadUsers} className="mm-cta">Szukaj</Button>
          </div>
          {users.map((u) => (
            <div key={u.id} className="mm-admin-user" data-testid="admin-user-row">
              <Avatar className="h-9 w-9">
                <AvatarImage src={u.avatar_url || undefined} />
                <AvatarFallback>{u.nick?.slice(0, 2)?.toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <b className="truncate">{u.nick}</b>
                  {u.role === "admin" && <Badge variant="secondary">admin</Badge>}
                  {u.is_blocked && <Badge variant="destructive">zablokowany</Badge>}
                </div>
                <p className="mm-hint truncate">{u.email}</p>
              </div>
              {u.role !== "admin" && (
                <Button
                  size="sm"
                  variant={u.is_blocked ? "outline" : "destructive"}
                  onClick={() => toggleBlock(u)}
                  data-testid={`admin-block-btn-${u.id}`}
                >
                  {u.is_blocked ? (
                    <><CheckCircle2 size={14} /> Odblokuj</>
                  ) : (
                    <><Ban size={14} /> Zablokuj</>
                  )}
                </Button>
              )}
            </div>
          ))}
        </TabsContent>

        <TabsContent value="stats" className="space-y-4 mt-4">
          {!stats && <p className="mm-hint">Ładowanie…</p>}
          {stats && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <StatCard label="Użytkownicy" value={stats.users.total} sub={`${stats.users.blocked} zablokowanych`} Icon={Users} />
                <StatCard label="Wydarzenia" value={stats.events.total} sub={`${stats.events.upcoming} nadchodzących`} Icon={Calendar} />
                <StatCard label="Komentarze" value={stats.comments.total} Icon={MessageSquare} />
                <StatCard label="Zgłoszenia" value={stats.reports.open + stats.reports.resolved} sub={`${stats.reports.open} otwartych`} Icon={ShieldAlert} />
              </div>
              <Separator />
              <div>
                <h4 className="mm-caption mb-2">Wydarzenia wg kategorii</h4>
                <div className="space-y-1.5">
                  {Object.entries(stats.events.by_category).map(([cat, n]) => {
                    const meta = CATEGORY_META[cat];
                    const max = Math.max(...Object.values(stats.events.by_category), 1);
                    return (
                      <div key={cat} className="mm-stat-bar">
                        <span className="mm-stat-bar-label">
                          <span className="mm-cat-dot" style={{ background: meta.hex }} /> {cat}
                        </span>
                        <div className="mm-stat-bar-track">
                          <div className="mm-stat-bar-fill" style={{ width: `${(n / max) * 100}%`, background: meta.hex }} />
                        </div>
                        <span className="mm-stat-bar-num">{n}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function StatCard({ label, value, sub, Icon }) {
  return (
    <div className="mm-stat-card">
      <div className="mm-stat-card-head">
        <Icon size={14} />
        <span>{label}</span>
      </div>
      <p className="mm-stat-card-value">{value}</p>
      {sub && <p className="mm-hint">{sub}</p>}
    </div>
  );
}
