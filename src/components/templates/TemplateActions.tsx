"use client";

export function TemplateActions() {
  return (
    <div className="template-actions" aria-label="Acciones de la plantilla">
      <button type="button" onClick={() => window.print()}>
        Imprimir o guardar en PDF
      </button>
      <span>No guarda respuestas ni pide una cuenta.</span>
    </div>
  );
}
