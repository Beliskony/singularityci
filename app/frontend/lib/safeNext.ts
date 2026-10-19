// ============ app/frontend/lib/safeNext.ts ============
// Valide le paramètre ?next= avant toute redirection post-connexion.
// Sans ça, /login?next=https://site-pirate.com ferait une redirection ouverte (phishing).
export function safeNext(next: string | null | undefined, fallback = "/dashboard"): string {
  if (!next) return fallback;
  // Chemin interne uniquement : commence par un seul "/", jamais "//" ni "/\".
  if (!next.startsWith("/") || next.startsWith("//") || next.startsWith("/\\")) return fallback;
  return next;
}