import type { ReactNode } from 'react';
import styles from '../boda/boda-layout.module.css';
export default function Layout({children}:{children:ReactNode}) {return <div className={styles.bodaRoot}>{children}</div>;}
