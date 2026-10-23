// ============ app/frontend/lib/compressImage.ts ============
// Réduit une image choisie sur l'appareil avant l'envoi : 1600 px max, WebP (qualité 0,82).
// Une photo de téléphone de 4 Mo tombe à ~300 Ko : la base et les sauvegardes restent légères.
const MAX_SIDE = 1600;

export async function compressImage(file: File): Promise<File> {
  if (!file.type.startsWith("image/") || file.type === "image/svg+xml") {
    throw new Error("UNSUPPORTED_IMAGE");
  }
  const bitmap = await createImageBitmap(file).catch(() => null);
  if (!bitmap) throw new Error("UNSUPPORTED_IMAGE");

  const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
  const w = Math.max(1, Math.round(bitmap.width * scale));
  const h = Math.max(1, Math.round(bitmap.height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("UNSUPPORTED_IMAGE");
  ctx.drawImage(bitmap, 0, 0, w, h);
  bitmap.close();

  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/webp", 0.82));
  if (!blob) throw new Error("UNSUPPORTED_IMAGE");
  return new File([blob], "image.webp", { type: "image/webp" });
}