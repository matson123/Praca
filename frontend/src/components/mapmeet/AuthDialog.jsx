import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

export default function AuthDialog({ open, onOpenChange, initialMode = "login" }) {
  const { login, register, error, setError } = useAuth();
  const [mode, setMode] = useState(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nick, setNick] = useState("");
  const [busy, setBusy] = useState(false);

  React.useEffect(() => {
    setMode(initialMode);
    setError("");
  }, [initialMode, open, setError]);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    let ok = false;
    if (mode === "login") ok = await login(email, password);
    else ok = await register(email, password, nick);
    setBusy(false);
    if (ok) {
      toast.success(mode === "login" ? "Zalogowano pomyślnie" : "Konto utworzone. Miłego mapowania!");
      onOpenChange(false);
      setEmail("");
      setPassword("");
      setNick("");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="mm-auth-dialog">
        <DialogHeader>
          <DialogTitle className="mm-auth-title">
            {mode === "login" ? "Zaloguj się do MapMeet" : "Załóż konto MapMeet"}
          </DialogTitle>
          <DialogDescription className="mm-auth-desc">
            Odkrywaj lokalne wydarzenia i twórz własne pinezki na mapie Polski.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={mode} onValueChange={setMode} className="w-full">
          <TabsList className="mm-auth-tabs">
            <TabsTrigger value="login" data-testid="auth-tab-login">Logowanie</TabsTrigger>
            <TabsTrigger value="register" data-testid="auth-tab-register">Rejestracja</TabsTrigger>
          </TabsList>

          <TabsContent value="login">
            <form className="mm-auth-form" onSubmit={submit}>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  data-testid="auth-email-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>
              <div>
                <Label htmlFor="password">Hasło</Label>
                <Input
                  id="password"
                  type="password"
                  data-testid="auth-password-input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
              </div>
              {error && <p className="mm-error">{error}</p>}
              <Button
                type="submit"
                data-testid="auth-submit-btn"
                disabled={busy}
                className="mm-cta w-full"
              >
                {busy ? "Logowanie…" : "Zaloguj się"}
              </Button>
              <p className="mm-hint">
                Konto testowe: <b>demo@mapmeet.pl</b> / <b>Demo123!</b>
              </p>
            </form>
          </TabsContent>

          <TabsContent value="register">
            <form className="mm-auth-form" onSubmit={submit}>
              <div>
                <Label htmlFor="nick">Nick</Label>
                <Input
                  id="nick"
                  data-testid="auth-nick-input"
                  value={nick}
                  onChange={(e) => setNick(e.target.value)}
                  required
                  minLength={2}
                />
              </div>
              <div>
                <Label htmlFor="reg-email">Email</Label>
                <Input
                  id="reg-email"
                  type="email"
                  data-testid="auth-email-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>
              <div>
                <Label htmlFor="reg-password">Hasło (min. 6 znaków)</Label>
                <Input
                  id="reg-password"
                  type="password"
                  data-testid="auth-password-input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  autoComplete="new-password"
                />
              </div>
              {error && <p className="mm-error">{error}</p>}
              <Button
                type="submit"
                data-testid="auth-submit-btn"
                disabled={busy}
                className="mm-cta w-full"
              >
                {busy ? "Tworzenie konta…" : "Utwórz konto"}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
