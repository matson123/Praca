import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
export const API = `${BACKEND_URL}/api`;

export const api = axios.create({
  baseURL: API,
  withCredentials: true,
});

export function formatApiError(err) {
  const d = err?.response?.data?.detail;
  if (d == null) return err?.message || "Coś poszło nie tak. Spróbuj ponownie.";
  if (typeof d === "string") return d;
  if (Array.isArray(d))
    return d.map((e) => (e && typeof e.msg === "string" ? e.msg : JSON.stringify(e))).join(" ");
  if (d && typeof d.msg === "string") return d.msg;
  return String(d);
}

export const CATEGORY_META = {
  Sport: { hex: "#EF4444", bg: "#FEF2F2", border: "#FCA5A5", text: "#991B1B", icon: "Trophy" },
  Kultura: { hex: "#8B5CF6", bg: "#F5F3FF", border: "#C4B5FD", text: "#5B21B6", icon: "Palette" },
  Muzyka: { hex: "#EC4899", bg: "#FDF2F8", border: "#FBCFE8", text: "#9D174D", icon: "Music" },
  Jedzenie: { hex: "#F59E0B", bg: "#FFFBEB", border: "#FDE68A", text: "#92400E", icon: "Utensils" },
  Nauka: { hex: "#06B6D4", bg: "#ECFEFF", border: "#A5F3FC", text: "#155E75", icon: "GraduationCap" },
  Gry: { hex: "#10B981", bg: "#ECFDF5", border: "#A7F3D0", text: "#065F46", icon: "Gamepad2" },
  Outdoor: { hex: "#15803D", bg: "#F0FDF4", border: "#86EFAC", text: "#166534", icon: "Trees" },
  Inne: { hex: "#64748B", bg: "#F1F5F9", border: "#CBD5E1", text: "#1E293B", icon: "MoreHorizontal" },
};

export const CATEGORIES = Object.keys(CATEGORY_META);

export function formatDatePL(iso) {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    return d.toLocaleString("pl-PL", {
      weekday: "short",
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}
