import Image from "next/image";
import type { CSSProperties } from "react";
import type { WeddingTheme } from "@/lib/boda-trial/themes";
import { WEDDING_THEME_PRESETS } from "@/lib/boda-trial/themes";
import styles from "./theme-proof.module.css";

interface WeddingThemeProofProps {
  theme: WeddingTheme;
  compact?: boolean;
  selector?: boolean;
}

export function WeddingThemeProof({ theme, compact = false, selector = false }: WeddingThemeProofProps) {
  const preset = WEDDING_THEME_PRESETS[theme.id];
  const style = {
    "--proof-bg": theme.tokens.background,
    "--proof-surface": theme.tokens.surface,
    "--proof-text": theme.tokens.text,
    "--proof-muted": theme.tokens.muted,
    "--proof-accent": theme.tokens.accent,
    "--proof-accent-contrast": theme.tokens.accentContrast,
    "--proof-border": theme.tokens.border,
    "--proof-display": theme.tokens.displayFont,
    "--proof-body": theme.tokens.bodyFont,
    "--proof-radius": theme.tokens.radius,
  } as CSSProperties;

  return (
    <div
      className={styles.proof}
      data-compact={compact ? "true" : undefined}
      data-selector={selector ? "true" : undefined}
      data-cover={preset.coverId}
      data-layout={theme.layout}
      data-monogram={preset.monogramId}
      data-ornament={preset.ornamentId}
      data-theme={theme.id}
      style={style}
      role="img"
      aria-label={`${theme.name}: la invitación de Julia y Mateo con ${theme.direction.toLocaleLowerCase("es")}`}
    >
      <div className={styles.photo} aria-hidden="true">
        <Image
          src={theme.moodboard}
          alt=""
          fill
          sizes={compact ? "96px" : selector ? "(max-width: 900px) 240px, 28vw" : "(max-width: 700px) 44vw, 28vw"}
        />
      </div>

      <div className={styles.paper} aria-hidden="true">
        <span className={styles.kicker}>Nos casamos</span>
        <strong className={styles.names}>Julia <i>y</i> Mateo</strong>
        <span className={styles.date}>20 · 03 · 2027</span>
        <span className={styles.place}>Jardín del Sur</span>
      </div>

      <span className={styles.monogram} aria-hidden="true">
        {preset.monogramId === "wordmark" ? "Julia + Mateo" : "JM"}
      </span>
      <span className={styles.ornament} aria-hidden="true" />
    </div>
  );
}
