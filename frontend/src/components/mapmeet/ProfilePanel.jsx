import React, { useEffect, useState } from "react";
import { api, formatApiError } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";
import { EventCard } from "./Sidebar";

export default function ProfilePanel({ onOpenEvent }) {
  const { user, updateProfile } = useAuth();
  const [nick, setNick] = useState(user?.nick || "");
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar_url || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [organized, setOrganized] = useState([]);
  const [joined, setJoined] = useState([]);

  useEffect(() => {
    if (!user) return;
    setNick(user.nick);
    setAvatarUrl(user.avatar_url || "");
    setBio(user.bio || "");
    api
      .get("/me/events")
      .then((r) => {
        setOrganized(r.data.organized);
        setJoined(r.data.joined);
      })
      .catch(() => {});
  }, [user]);

  const save = async (e) => {
    e.preventDefault();
    const ok = await updateProfile({
      nick,
      avatar_url: avatarUrl || null,
      bio: bio || null,
    });
    if (ok) toast.success("Profil zaktualizowany");
  };

  if (!user) return null;

  const upcoming = (list) => list.filter((e) => !e.is_archived);
  const archive = (list) => list.filter((e) => e.is_archived);

  return (
    <div className="mm-profile" data-testid="profile-panel">
      <div className="mm-profile-head">
        <Avatar className="h-16 w-16">
          <AvatarImage src={avatarUrl || undefined} />
          <AvatarFallback>{nick?.slice(0, 2)?.toUpperCase()}</AvatarFallback>
        </Avatar>
        <div>
          <h3 className="mm-profile-nick">{user.nick}</h3>
          <p className="mm-hint">{user.email}</p>
        </div>
      </div>

      <form className="mm-profile-form" onSubmit={save}>
        <div>
          <Label>Nick</Label>
          <Input value={nick} onChange={(e) => setNick(e.target.value)} data-testid="profile-nick-input" />
        </div>
        <div>
          <Label>Avatar (URL)</Label>
          <Input value={avatarUrl} onChange={(e) => setAvatarUrl(e.target.value)} data-testid="profile-avatar-input" placeholder="https://…" />
        </div>
        <div>
          <Label>Bio</Label>
          <Textarea value={bio} onChange={(e) => setBio(e.target.value)} data-testid="profile-bio-input" rows={3} />
        </div>
        <Button type="submit" className="mm-cta" data-testid="profile-save-btn">
          Zapisz profil
        </Button>
      </form>

      <Tabs defaultValue="organized" className="mt-6">
        <TabsList className="mm-auth-tabs">
          <TabsTrigger value="organized">Utworzone ({organized.length})</TabsTrigger>
          <TabsTrigger value="joined">Dołączone ({joined.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="organized" className="space-y-3">
          {upcoming(organized).length > 0 && <h4 className="mm-caption">Nadchodzące</h4>}
          {upcoming(organized).map((e) => (
            <EventCard key={e.id} event={e} onClick={() => onOpenEvent(e)} />
          ))}
          {archive(organized).length > 0 && <h4 className="mm-caption mt-3">Archiwum</h4>}
          {archive(organized).map((e) => (
            <EventCard key={e.id} event={e} onClick={() => onOpenEvent(e)} />
          ))}
          {organized.length === 0 && <p className="mm-hint">Nie utworzyłeś jeszcze żadnego wydarzenia.</p>}
        </TabsContent>
        <TabsContent value="joined" className="space-y-3">
          {upcoming(joined).length > 0 && <h4 className="mm-caption">Nadchodzące</h4>}
          {upcoming(joined).map((e) => (
            <EventCard key={e.id} event={e} onClick={() => onOpenEvent(e)} />
          ))}
          {archive(joined).length > 0 && <h4 className="mm-caption mt-3">Archiwum</h4>}
          {archive(joined).map((e) => (
            <EventCard key={e.id} event={e} onClick={() => onOpenEvent(e)} />
          ))}
          {joined.length === 0 && <p className="mm-hint">Nie dołączyłeś jeszcze do żadnego wydarzenia.</p>}
        </TabsContent>
      </Tabs>
    </div>
  );
}
