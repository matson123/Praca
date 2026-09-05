import React, { useState } from "react";
import { Search, Plus, LogOut, User as UserIcon, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/context/AuthContext";

const CITIES = [
  { name: "Cała Polska", lat: 52.069167, lon: 19.480556, zoom: 6.5 },
  { name: "Warszawa", lat: 52.2297, lon: 21.0122, zoom: 12 },
  { name: "Kraków", lat: 50.0614, lon: 19.9366, zoom: 12 },
  { name: "Wrocław", lat: 51.1079, lon: 17.0385, zoom: 12 },
  { name: "Poznań", lat: 52.4064, lon: 16.9252, zoom: 12 },
  { name: "Gdańsk", lat: 54.352, lon: 18.6466, zoom: 12 },
  { name: "Łódź", lat: 51.7592, lon: 19.456, zoom: 12 },
];

export default function TopBar({
  onCreate,
  onOpenProfile,
  onOpenAuth,
  onOpenFilters,
  onOpenAdmin,
  onFocusCity,
  onSearch,
  searchValue,
}) {
  const { user, logout } = useAuth();
  const [city, setCity] = useState("Cała Polska");

  const handleCity = (c) => {
    setCity(c.name);
    onFocusCity(c);
  };

  return (
    <header className="mm-topbar" data-testid="topbar">
      <div className="mm-topbar-inner">
        <div className="mm-brand" data-testid="topbar-logo">
          <div className="mm-brand-mark">
            <MapPin size={18} strokeWidth={2.4} />
          </div>
          <div className="mm-brand-text">
            <span className="mm-brand-name">MapMeet</span>
            <span className="mm-brand-badge">Polska</span>
          </div>
        </div>

        <div className="mm-topbar-search">
          <Search size={16} className="mm-search-icon" />
          <Input
            data-testid="topbar-search-input"
            value={searchValue}
            onChange={(e) => onSearch(e.target.value)}
            placeholder="Szukaj wydarzeń, miast, tagów…"
            className="mm-search-input"
          />
        </div>

        <div className="mm-topbar-cities">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                data-testid="topbar-city-filter"
                variant="outline"
                className="mm-city-btn"
              >
                <MapPin size={14} /> {city}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="mm-dd">
              <DropdownMenuLabel>Skocz do miasta</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {CITIES.map((c) => (
                <DropdownMenuItem key={c.name} onClick={() => handleCity(c)}>
                  {c.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <Button
          data-testid="topbar-create-event-btn"
          onClick={onCreate}
          className="mm-cta"
        >
          <Plus size={16} /> Utwórz wydarzenie
        </Button>

        {user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                data-testid="topbar-user-avatar-btn"
                className="mm-avatar-btn"
                aria-label="Menu użytkownika"
              >
                <Avatar className="h-9 w-9">
                  <AvatarImage src={user.avatar_url || undefined} alt={user.nick} />
                  <AvatarFallback>
                    {user.nick?.slice(0, 2).toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="mm-dd">
              <DropdownMenuLabel>{user.nick}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onOpenProfile} data-testid="menu-profile">
                <UserIcon size={14} className="mr-2" /> Mój profil
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onOpenFilters} data-testid="menu-filters">
                Filtry i widok
              </DropdownMenuItem>
              {user.role === "admin" && (
                <DropdownMenuItem onClick={onOpenAdmin} data-testid="menu-admin">
                  Panel administratora
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout} data-testid="menu-logout">
                <LogOut size={14} className="mr-2" /> Wyloguj się
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <div className="mm-auth-buttons">
            <Button
              data-testid="topbar-login-btn"
              variant="ghost"
              onClick={() => onOpenAuth("login")}
            >
              Zaloguj się
            </Button>
            <Button
              data-testid="topbar-register-btn"
              onClick={() => onOpenAuth("register")}
              className="mm-cta-outline"
            >
              Załóż konto
            </Button>
          </div>
        )}
      </div>
    </header>
  );
}
