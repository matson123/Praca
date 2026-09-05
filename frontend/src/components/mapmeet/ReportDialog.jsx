import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { api, formatApiError } from "@/lib/api";
import { toast } from "sonner";

export default function ReportDialog({ open, onOpenChange, target }) {
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!target) return;
    setBusy(true);
    try {
      await api.post("/reports", {
        target_type: target.type,
        target_id: target.id,
        reason,
      });
      toast.success("Zgłoszenie wysłane. Dziękujemy!");
      setReason("");
      onOpenChange(false);
    } catch (err) {
      toast.error(formatApiError(err));
    }
    setBusy(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Zgłoś {target?.type === "event" ? "wydarzenie" : "komentarz"}</DialogTitle>
          <DialogDescription>
            Opisz, co jest niewłaściwe. Zgłoszenie trafi do moderatora.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-3">
          <div>
            <Label>Powód zgłoszenia</Label>
            <Textarea
              data-testid="report-reason-input"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={4}
              required
              minLength={3}
              placeholder="np. spam, treści nienawistne, oszustwo…"
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Anuluj
            </Button>
            <Button type="submit" disabled={busy} className="mm-cta" data-testid="report-submit-btn">
              {busy ? "Wysyłanie…" : "Wyślij zgłoszenie"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
