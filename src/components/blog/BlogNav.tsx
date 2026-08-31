import Link from "next/link";
import styles from "./blog.module.css";

export function BlogNav() {
  return (
    <nav className={styles.blogNav} aria-label="Navegación del blog">
      <Link href="/" className={styles.blogBrand}>SODI</Link>
      <div className={styles.blogNavLinks}>
        <Link href="/blog">Rutas</Link>
        <Link href="/#servicios">Servicios</Link>
      </div>
      <Link href="/diagnostico">Diagnóstico</Link>
    </nav>
  );
}
