import type { ReactNode } from "react";
import styles from "./boda-layout.module.css";

export default function BodaLayout({ children }: { children: ReactNode }) {
  return <div className={styles.bodaRoot}>{children}</div>;
}
