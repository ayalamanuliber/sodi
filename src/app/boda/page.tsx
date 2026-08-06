'use client';

import React from 'react';
import Link from 'next/link';

export default function SodiBodasLandingPage() {
  return (
    <div style={styles.page}>
      {/* Header */}
      <header style={styles.nav}>
        <div style={styles.logo}>SODI <span>Bodas</span></div>
        <div style={{ display: 'flex', gap: '16px' }}>
          <Link href="/boda/mirta-y-guillermo" style={styles.navButtonOutline}>
            Ver Demo en Vivo 💒
          </Link>
          <a href="https://wa.me/5491162337552?text=¡Hola!%20Quiero%20más%20información%20sobre%20las%20invitaciones%20digitales%20de%20SODI%20Bodas" target="_blank" rel="noopener noreferrer" style={styles.navButtonPrimary}>
            Cotizar mi Casamiento
          </a>
        </div>
      </header>

      {/* Hero Section */}
      <section style={styles.hero}>
        <span style={styles.heroBadge}>Vertical de Invitaciones Digitales Premium</span>
        <h1 style={styles.heroTitle}>La experiencia digital que tu casamiento merece.</h1>
        <p style={styles.heroSub}>
          Invitaciones web interactivas de alta gama con sobres 3D, control de cupos por invitado, música en vivo y panel de gestión en tiempo real.
        </p>
        <div style={styles.heroCtaRow}>
          <Link href="/boda/mirta-y-guillermo" style={styles.ctaPrimary}>
            VER DEMO EN VIVO (Mirta & Guillermo) 💒
          </Link>
          <Link href="/boda/mirta-y-guillermo/admin" style={styles.ctaSecondary}>
            PROBAR PANEL ADMIN DEMO 📊
          </Link>
        </div>
      </section>

      {/* Features Grid */}
      <section style={styles.section}>
        <div style={styles.sectionHeading}>
          <h2>¿Por qué elegir SODI Bodas?</h2>
          <p>Diseñadas para emocionar a tus invitados y hacer que la organización sea simple y sin fricción.</p>
        </div>

        <div style={styles.grid}>
          <div style={styles.card}>
            <div style={styles.icon}>💌</div>
            <h3>Sobres Interactivos 3D</h3>
            <p>Apertura inmersiva con monograma dorado y sello de cera que crea un momento mágico desde la primera mirada.</p>
          </div>

          <div style={styles.card}>
            <div style={styles.icon}>🔗</div>
            <h3>Links Únicos & Control de Pases</h3>
            <p>Cada invitado recibe su enlace personalizado. El sistema limita los pases para evitar invitados no autorizados.</p>
          </div>

          <div style={styles.card}>
            <div style={styles.icon}>📊</div>
            <h3>Panel Admin en Tiempo Real</h3>
            <p>Gestioná quiénes confirmaron, restricciones alimentarias (Sin TACC, Vegetariano) y descargá tu lista en Excel.</p>
          </div>

          <div style={styles.card}>
            <div style={styles.icon}>📲</div>
            <h3>Integración con WhatsApp</h3>
            <p>Confirmaciones directas a tu celular con resumen de asistencia, acompañantes y canciones sugeridas.</p>
          </div>

          <div style={styles.card}>
            <div style={styles.icon}>🎵</div>
            <h3>Música & Cronograma</h3>
            <p>Canción de fondo con control de reproducción, cuenta regresiva en vivo y mapa interactivo de parroquia y salón.</p>
          </div>

          <div style={styles.card}>
            <div style={styles.icon}>🎁</div>
            <h3>CBU & Mesa de Regalos</h3>
            <p>Copia de alias bancario en 1 clic y lista de canciones colaborativa sugerida por tus invitados.</p>
          </div>
        </div>
      </section>

      {/* Demo Banner */}
      <section style={styles.demoBanner}>
        <h2>¿Querés ver cómo funciona en la vida real?</h2>
        <p>Probá la invitación de ejemplo diseñada para la boda de Mirta & Guillermo.</p>
        <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <Link href="/boda/mirta-y-guillermo" style={styles.ctaPrimary}>
            Abrir Invitación Demo
          </Link>
          <Link href="/boda/mirta-y-guillermo/admin" style={styles.ctaOutlineLight}>
            Abrir Panel Admin Demo
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer style={styles.footer}>
        <p>© 2026 SODI Bodas · Todos los derechos reservados · sodi.com.ar</p>
      </footer>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    backgroundColor: '#faf8f5',
    color: '#292b27',
    fontFamily: '"Montserrat", system-ui, sans-serif',
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column'
  },
  nav: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px 40px',
    maxWidth: '1200px',
    margin: '0 auto',
    width: '100%',
    flexWrap: 'wrap',
    gap: '16px'
  },
  logo: {
    fontSize: '1.5rem',
    fontWeight: '800',
    letterSpacing: '1px',
    color: '#355844'
  },
  navButtonOutline: {
    border: '1px solid #355844',
    color: '#355844',
    padding: '10px 18px',
    borderRadius: '24px',
    textDecoration: 'none',
    fontSize: '0.9rem',
    fontWeight: '600'
  },
  navButtonPrimary: {
    backgroundColor: '#355844',
    color: '#fff',
    padding: '10px 18px',
    borderRadius: '24px',
    textDecoration: 'none',
    fontSize: '0.9rem',
    fontWeight: '600'
  },
  hero: {
    textAlign: 'center',
    padding: '80px 20px 60px',
    maxWidth: '900px',
    margin: '0 auto'
  },
  heroBadge: {
    fontSize: '0.85rem',
    textTransform: 'uppercase',
    letterSpacing: '2px',
    color: '#8b6f4e',
    fontWeight: '700',
    display: 'inline-block',
    marginBottom: '16px'
  },
  heroTitle: {
    fontSize: '2.8rem',
    fontFamily: '"Cormorant Garamond", Georgia, serif',
    lineHeight: '1.2',
    color: '#203a2c',
    marginBottom: '20px'
  },
  heroSub: {
    fontSize: '1.15rem',
    color: '#575a53',
    lineHeight: '1.6',
    marginBottom: '36px'
  },
  heroCtaRow: {
    display: 'flex',
    justifyContent: 'center',
    gap: '16px',
    flexWrap: 'wrap'
  },
  ctaPrimary: {
    backgroundColor: '#355844',
    color: '#fff',
    padding: '16px 32px',
    borderRadius: '30px',
    textDecoration: 'none',
    fontWeight: '700',
    fontSize: '1rem',
    boxShadow: '0 6px 20px rgba(53, 88, 68, 0.25)'
  },
  ctaSecondary: {
    backgroundColor: '#fff',
    color: '#355844',
    border: '1px solid #355844',
    padding: '16px 32px',
    borderRadius: '30px',
    textDecoration: 'none',
    fontWeight: '700',
    fontSize: '1rem'
  },
  ctaOutlineLight: {
    backgroundColor: 'transparent',
    color: '#fff',
    border: '1px solid #fff',
    padding: '16px 32px',
    borderRadius: '30px',
    textDecoration: 'none',
    fontWeight: '700',
    fontSize: '1rem'
  },
  section: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '60px 20px'
  },
  sectionHeading: {
    textAlign: 'center',
    marginBottom: '48px'
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
    gap: '24px'
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: '16px',
    padding: '32px 24px',
    boxShadow: '0 4px 15px rgba(0,0,0,0.04)',
    border: '1px solid #eee'
  },
  icon: {
    fontSize: '2.5rem',
    marginBottom: '16px'
  },
  demoBanner: {
    backgroundColor: '#203a2c',
    color: '#fff',
    textAlign: 'center',
    padding: '60px 20px',
    margin: '40px 0 0 0'
  },
  footer: {
    textAlign: 'center',
    padding: '30px 20px',
    backgroundColor: '#17271e',
    color: '#859781',
    fontSize: '0.85rem'
  }
};
