export async function studioRequest<T>(path: string, body?: unknown, method?: string): Promise<T> {
  const response = await fetch(`/api/boda-studio${path}`, {
    method: method ?? (body === undefined ? "GET" : "POST"),
    headers: body === undefined ? undefined : { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
    cache: "no-store",
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(result.message ?? result.error ?? (response.status === 401 ? "Ingresá con la contraseña de esta boda." : "No pudimos guardar. Tus cambios siguen en pantalla; intentá nuevamente."));
  return result as T;
}

export function downloadFile(content: string, name: string, type: string) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = name;
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export async function preparePhoto(file: File): Promise<string> {
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type) || file.size > 12 * 1024 * 1024) throw new Error("Elegí fotos JPG, PNG o WebP de hasta 12 MB.");
  const bitmap = await createImageBitmap(file);
  try {
    const canvas = document.createElement("canvas");
    const scale = Math.min(1, 1600 / Math.max(bitmap.width, bitmap.height));
    canvas.width = Math.max(1, Math.round(bitmap.width * scale));
    canvas.height = Math.max(1, Math.round(bitmap.height * scale));
    const context = canvas.getContext("2d");
    if (!context) throw new Error("No pudimos preparar esta foto.");
    context.fillStyle = "#f7f5f0";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    for (const quality of [0.85, 0.7, 0.55, 0.4]) {
      const data = canvas.toDataURL("image/jpeg", quality);
      if (data.length < 340_000) return data;
    }
    throw new Error("Esta foto necesita una versión más liviana. Probá con un recorte.");
  } finally { bitmap.close(); }
}
