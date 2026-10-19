// ============ app/frontend/components/dashboard/GuestList.tsx ============
"use client";

import { useMemo, useState } from "react";

export interface GuestRow {
  id: string;
  guestName: string;
  guestPhone: string;
  guestEmail: string;
  numberOfGuests: number;
  status: "ATTENDING" | "NOT_ATTENDING" | "PENDING";
  message: string;
  respondedAt: string; // ISO
}

type Filter = "ALL" | GuestRow["status"];

const STATUS_LABEL: Record<GuestRow["status"], string> = {
  ATTENDING: "Présent",
  NOT_ATTENDING: "Absent",
  PENDING: "Peut-être",
};

const STATUS_STYLE: Record<GuestRow["status"], string> = {
  ATTENDING: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  NOT_ATTENDING: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
  PENDING: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
};

function csvCell(v: string | number): string {
  const s = String(v);
  // Neutralise l'injection de formules (=, +, -, @) à l'ouverture dans Excel.
  const safe = /^[=+\-@]/.test(s) ? `'${s}` : s;
  return `"${safe.replace(/"/g, '""')}"`;
}

export function GuestList({ rows, fileName }: { rows: GuestRow[]; fileName: string }) {
  const [filter, setFilter] = useState<Filter>("ALL");
  const [query, setQuery] = useState("");

  const counts = useMemo(
    () => ({
      ALL: rows.length,
      ATTENDING: rows.filter((r) => r.status === "ATTENDING").length,
      NOT_ATTENDING: rows.filter((r) => r.status === "NOT_ATTENDING").length,
      PENDING: rows.filter((r) => r.status === "PENDING").length,
    }),
    [rows]
  );

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter(
      (r) =>
        (filter === "ALL" || r.status === filter) &&
        (!q || r.guestName.toLowerCase().includes(q) || r.guestPhone.includes(q) || r.guestEmail.toLowerCase().includes(q))
    );
  }, [rows, filter, query]);

  const totalPeople = visible.reduce((n, r) => n + r.numberOfGuests, 0);

  function exportCsv() {
    const header = ["Nom", "Téléphone", "Email", "Statut", "Personnes", "Message", "Date de réponse"];
    const lines = visible.map((r) =>
      [r.guestName, r.guestPhone, r.guestEmail, STATUS_LABEL[r.status], r.numberOfGuests, r.message, new Date(r.respondedAt).toLocaleString("fr-FR")]
        .map(csvCell)
        .join(";")
    );
    // BOM UTF-8 pour que Excel lise correctement les accents.
    const blob = new Blob(["﻿" + [header.map(csvCell).join(";"), ...lines].join("\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${fileName}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  if (rows.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border px-8 py-16 text-center">
        <p className="font-display italic text-xl text-foreground">Aucune réponse pour l&apos;instant</p>
        <p className="mt-2 text-foreground/60">Partagez le lien de votre site : les réponses s&apos;afficheront ici.</p>
      </div>
    );
  }

  const filters: { key: Filter; label: string }[] = [
    { key: "ALL", label: "Tous" },
    { key: "ATTENDING", label: "Présents" },
    { key: "NOT_ATTENDING", label: "Absents" },
    { key: "PENDING", label: "Peut-être" },
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex flex-wrap gap-1">
          {filters.map((f) => (
            <button
              key={f.key}
              type="button"
              onClick={() => setFilter(f.key)}
              className={`px-3 py-1.5 rounded-full text-sm ${
                filter === f.key ? "bg-gold/15 text-gold" : "text-foreground/60 hover:text-foreground"
              }`}
            >
              {f.label} ({counts[f.key]})
            </button>
          ))}
        </div>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Rechercher un invité…"
          className="flex-1 min-w-48 rounded-full border border-border bg-background px-4 py-2 text-sm text-foreground"
        />
        <button
          type="button"
          onClick={exportCsv}
          className="px-4 py-2 rounded-full border border-border text-sm text-foreground hover:border-foreground/40"
        >
          Exporter (CSV)
        </button>
      </div>

      <p className="text-sm text-foreground/50">
        {visible.length} réponse{visible.length > 1 ? "s" : ""} · {totalPeople} personne{totalPeople > 1 ? "s" : ""}
      </p>

      <ul className="divide-y divide-border rounded-2xl border border-border">
        {visible.map((r) => (
          <li key={r.id} className="p-4 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <p className="font-medium text-foreground">{r.guestName}</p>
              <p className="text-xs text-foreground/50 break-all">
                {[r.guestPhone, r.guestEmail].filter(Boolean).join(" · ") || "Aucun contact"}
              </p>
              {r.message && <p className="mt-2 text-sm text-foreground/70 italic">« {r.message} »</p>}
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <span className="text-sm text-foreground/60">
                {r.numberOfGuests} pers.
              </span>
              <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_STYLE[r.status]}`}>
                {STATUS_LABEL[r.status]}
              </span>
            </div>
          </li>
        ))}
        {visible.length === 0 && <li className="p-6 text-center text-sm text-foreground/50">Aucun résultat.</li>}
      </ul>
    </div>
  );
}