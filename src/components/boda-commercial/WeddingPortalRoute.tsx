"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { loadWeddingTrial, type WeddingTrialWorkspace } from "@/lib/boda-trial/schema";
import { WeddingPortalDemo } from "./WeddingPortalDemo";
import styles from "./portal-route.module.css";

export function WeddingPortalRoute() {
  const [workspace, setWorkspace] = useState<WeddingTrialWorkspace | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => setWorkspace(loadWeddingTrial()), 0);
    return () => window.clearTimeout(timer);
  }, []);

  if (!workspace) {
    return <main className={styles.page}><p>Preparando el panel...</p></main>;
  }

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <div>
          <span>Ejemplo con datos ficticios</span>
          <h1>Todo lo que pasa con tus invitados, en un solo lugar.</h1>
          <p>Este panel usa los mismos datos locales de la invitación que acabás de probar.</p>
        </div>
        <div className={styles.actions}>
          <Link href="/boda/prueba"><ArrowLeft size={17} /> Volver a editar</Link>
        </div>
      </header>
      <WeddingPortalDemo
        workspace={workspace}
        onOpenInvitation={() => {
          window.location.href = "/boda/prueba?modo=invitado";
        }}
      />
    </main>
  );
}
