import React, { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import TopBar from "@/components/mapmeet/TopBar";
import MapView from "@/components/mapmeet/MapView";
import Sidebar, { EventCard } from "@/components/mapmeet/Sidebar";
import EventDetails from "@/components/mapmeet/EventDetails";
import CreateEventForm from "@/components/mapmeet/CreateEventForm";
import FiltersPanel from "@/components/mapmeet/FiltersPanel";
import ProfilePanel from "@/components/mapmeet/ProfilePanel";
import AuthDialog from "@/components/mapmeet/AuthDialog";
import AdminPanel from "@/components/mapmeet/AdminPanel";
import CalendarView from "@/components/mapmeet/CalendarView";
import { Button } from "@/components/ui/button";
import { Compass, LocateFixed, Layers, Home as HomeIcon } from "lucide-react";

const DEFAULT_VIEW = { lat: 52.069167, lon: 19.480556, zoom: 6.5 };

export default function MapPage() {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [selected, setSelected] = useState(null); // event obj
  const [panel, setPanel] = useState(null); // 'details' | 'create' | 'filters' | 'profile' | 'list'
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState("login");
  const [pickMode, setPickMode] = useState(false);
  const [pickedLocation, setPickedLocation] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [focus, setFocus] = useState(null);
  const [filters, setFilters] = useState({
    category: null,
    from_date: "",
    to_date: "",
    only_public: false,
    include_archived: false,
    max_km: null,
  });
  const [search, setSearch] = useState("");
  const [view, setView] = useState("map"); // 'map' | 'calendar'

  // Handle ?invite=token in URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("invite");
    if (!token) return;
    (async () => {
      try {
        const { data } = await api.get(`/events/by_invite/${token}`);
        setSelected(data);
        setPanel("details");
        setFocus({ lat: data.lat, lon: data.lon, zoom: 13 });
        if (user) {
          try {
            await api.post(`/events/by_invite/${token}/join`);
            toast.success("Dołączono do wydarzenia przez zaproszenie!");
            const fresh = await api.get(`/events/${data.id}`);
            setSelected(fresh.data);
            loadEvents();
          } catch (e) {
            // already in / capacity full etc.
          }
        } else {
          setAuthMode("login");
          setAuthOpen(true);
          toast("Zaloguj się, aby dołączyć przez zaproszenie.");
        }
      } catch {
        toast.error("Zaproszenie nieaktywne lub wydarzenie usunięte");
      } finally {
        const url = new URL(window.location.href);
        url.searchParams.delete("invite");
        window.history.replaceState({}, "", url.toString());
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const loadEvents = useCallback(async () => {
    try {
      const params = {};
      if (filters.category) params.category = filters.category;
      if (filters.from_date) params.from_date = new Date(filters.from_date).toISOString();
      if (filters.to_date) {
        const d = new Date(filters.to_date);
        d.setHours(23, 59, 59);
        params.to_date = d.toISOString();
      }
      if (filters.only_public) params.only_public = true;
      if (filters.include_archived) params.include_archived = true;
      if (search) params.search = search;
      if (filters.max_km && userLocation) {
        params.near_lat = userLocation.lat;
        params.near_lon = userLocation.lon;
        params.max_km = filters.max_km;
      }
      const { data } = await api.get("/events", { params });
      setEvents(data.events);
    } catch {
      /* silent */
    }
  }, [filters, search, userLocation]);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  useEffect(() => {
    const t = setInterval(loadEvents, 30000);
    return () => clearInterval(t);
  }, [loadEvents]);

  const requireAuth = () => {
    setAuthMode("login");
    setAuthOpen(true);
  };

  const onCreateClick = () => {
    if (!user) return requireAuth();
    setPanel("create");
    setPickMode(true);
    toast("Kliknij na mapie, aby wybrać miejsce wydarzenia.");
  };

  const onSelectEvent = (ev) => {
    setSelected(ev);
    setPanel("details");
    setFocus({ lat: ev.lat, lon: ev.lon, zoom: 14 });
  };

  const onPickLocation = async (latlng) => {
    try {
      const { data } = await api.get("/poland/check", {
        params: { lat: latlng.lat, lon: latlng.lng },
      });
      if (!data.in_poland) {
        toast.error("Punkt musi znajdować się w granicach Polski.");
        return;
      }
      setPickedLocation(latlng);
    } catch {
      setPickedLocation(latlng);
    }
  };

  const onEventCreated = (ev) => {
    setPickedLocation(null);
    setPickMode(false);
    setPanel("details");
    setSelected(ev);
    setFocus({ lat: ev.lat, lon: ev.lon, zoom: 14 });
    loadEvents();
  };

  const closePanel = () => {
    setPanel(null);
    setPickMode(false);
    setPickedLocation(null);
  };

  const useMyLocation = () => {
    if (!("geolocation" in navigator)) return toast.error("Geolokalizacja niedostępna");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc = { lat: pos.coords.latitude, lon: pos.coords.longitude };
        setUserLocation(loc);
        setFocus({ ...loc, zoom: 13 });
        toast.success("Wycentrowano na Twojej lokalizacji");
      },
      () => toast.error("Nie udało się pobrać lokalizacji")
    );
  };

  const resetView = () => {
    setFocus({ ...DEFAULT_VIEW });
    toast("Widok cała Polska");
  };

  const panelTitle = useMemo(() => {
    switch (panel) {
      case "details": return "Szczegóły wydarzenia";
      case "create": return "Nowe wydarzenie";
      case "filters": return "Filtry mapy";
      case "profile": return "Mój profil";
      case "list": return `Wydarzenia (${events.length})`;
      case "admin": return "Panel administratora";
      default: return "";
    }
  }, [panel, events.length]);

  return (
    <div className="mm-app">
      <TopBar
        onCreate={onCreateClick}
        onOpenProfile={() => setPanel("profile")}
        onOpenFilters={() => setPanel("filters")}
        onOpenAdmin={() => setPanel("admin")}
        onOpenAuth={(mode) => {
          setAuthMode(mode);
          setAuthOpen(true);
        }}
        onFocusCity={(c) => setFocus({ lat: c.lat, lon: c.lon, zoom: c.zoom })}
        onSearch={setSearch}
        searchValue={search}
        view={view}
        onToggleView={(v) => {
          setView(v);
          if (v === "map") closePanel();
        }}
        onOpenEventFromNotification={(ev) => {
          setView("map");
          onSelectEvent(ev);
        }}
      />

      {view === "map" ? (
        <>
          <MapView
            events={events}
            onSelectEvent={onSelectEvent}
            pickMode={pickMode}
            onPickLocation={onPickLocation}
            pickedLocation={pickedLocation}
            focus={focus}
          />

          {/* Floating map controls */}
          <div className="mm-floating">
            <Button
              data-testid="map-reset-view-btn"
              onClick={resetView}
              variant="secondary"
              className="mm-float-btn"
              size="icon"
              title="Cała Polska"
            >
              <HomeIcon size={18} />
            </Button>
            <Button
              data-testid="map-my-location-btn"
              onClick={useMyLocation}
              variant="secondary"
              className="mm-float-btn"
              size="icon"
              title="Moja lokalizacja"
            >
              <LocateFixed size={18} />
            </Button>
            <Button
              data-testid="map-list-toggle-btn"
              onClick={() => setPanel(panel === "list" ? null : "list")}
              variant="secondary"
              className="mm-float-btn mm-float-count"
            >
              <Layers size={16} /> {events.length}
            </Button>
          </div>

          {pickMode && (
            <div className="mm-pick-banner">
              <Compass size={16} />
              <span>Kliknij na mapie w wybranym punkcie Polski, aby zapisać lokalizację.</span>
              <button onClick={() => setPickMode(false)} className="mm-linkish">
                Anuluj
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="mm-calendar-wrap">
          <CalendarView
            onOpenEvent={(ev) => {
              setView("map");
              onSelectEvent(ev);
            }}
            onClose={() => setView("map")}
          />
        </div>
      )}

      <Sidebar open={!!panel} onClose={closePanel} title={panelTitle}>
        {panel === "details" && selected && (
          <EventDetails
            event={selected}
            onChanged={loadEvents}
            onDeleted={() => {
              closePanel();
              loadEvents();
            }}
            onRequireAuth={requireAuth}
          />
        )}
        {panel === "create" && (
          <CreateEventForm
            pickedLocation={pickedLocation}
            onCreated={onEventCreated}
            onRequestPick={() => setPickMode(true)}
          />
        )}
        {panel === "filters" && (
          <FiltersPanel
            filters={filters}
            setFilters={setFilters}
            onApply={() => {
              loadEvents();
              toast.success("Zastosowano filtry");
            }}
            onReset={() => {
              setFilters({
                category: null,
                from_date: "",
                to_date: "",
                only_public: false,
                include_archived: false,
                max_km: null,
              });
              setSearch("");
            }}
          />
        )}
        {panel === "profile" && user && (
          <ProfilePanel onOpenEvent={onSelectEvent} />
        )}
        {panel === "admin" && user?.role === "admin" && (
          <AdminPanel onOpenEvent={onSelectEvent} />
        )}
        {panel === "list" && (
          <div className="space-y-2.5">
            {events.length === 0 && <p className="mm-hint">Brak wydarzeń dla wybranych filtrów.</p>}
            {events.map((e) => (
              <EventCard key={e.id} event={e} onClick={() => onSelectEvent(e)} />
            ))}
          </div>
        )}
      </Sidebar>

      <AuthDialog open={authOpen} onOpenChange={setAuthOpen} initialMode={authMode} />
    </div>
  );
}
