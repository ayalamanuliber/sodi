'use client';

import React, { useState, useEffect, use } from 'react';

interface Guest {
  id: string;
  nombre: string;
  pases: number;
  telefono: string;
  estado: 'pendiente' | 'confirmado' | 'rechazado';
  enviado?: boolean;
  enviadoEn?: string | null;
  creadoEn: string;
  vistoEn: string | null;
  tipo?: 'completo' | 'solo-after' | 'solo-ceremonia';
  estilo?: 'oro' | 'esmeralda' | 'borgoña';
  respuesta?: {
    asistencia: string;
    pasesConfirmados: number;
    integrantes: string[];
    menu: string;
    notas: string;
    cancion: string;
    fechaRespuesta: string;
  } | null;
}

export default function DynamicAdminBodaPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = use(params);
  const slug = resolvedParams.slug || 'mirta-y-guillermo';

  const [authenticated, setAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState('');
  const [guests, setGuests] = useState<Guest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'todos' | 'confirmados' | 'pendientes' | 'rechazados' | 'sin-enviar'>('todos');

  // Form
  const [newNombre, setNewNombre] = useState('');
  const [newPases, setNewPases] = useState(2);
  const [newTelefono, setNewTelefono] = useState('');
  const [newTipo, setNewTipo] = useState<'completo' | 'solo-after' | 'solo-ceremonia'>('completo');
  const [newEstilo, setNewEstilo] = useState<'oro' | 'esmeralda' | 'borgoña'>('oro');
  const [adding, setAdding] = useState(false);

  const STORAGE_KEY = `sodi_boda_guests_${slug}`;

  // Helper to save guests locally so Vercel serverless read-only filesystem never loses data
  const saveLocalGuests = (updatedGuests: Guest[]) => {
    setGuests(updatedGuests);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedGuests));
      } catch (e) {
        console.error('Error saving to localStorage:', e);
      }
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (sessionStorage.getItem(`admin_boda_${slug}_auth`) === 'true') {
        setAuthenticated(true);
        loadGuests();
      }
    }
  }, [slug]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    // Secure authentication check without displaying hints
    const cleanPass = passwordInput.trim();
    if (cleanPass === 'mirta2026' || cleanPass === 'boda') {
      sessionStorage.setItem(`admin_boda_${slug}_auth`, 'true');
      setAuthenticated(true);
      loadGuests();
    } else {
      setLoginError('Contraseña incorrecta. Verificá los datos e intentá de nuevo.');
    }
  };

  const loadGuests = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/boda/invitados?slug=${encodeURIComponent(slug)}&t=${Date.now()}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.guests)) {
        setGuests(data.guests);
        if (typeof window !== 'undefined') {
          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data.guests));
          } catch (e) {}
        }
      }
    } catch (e) {
      console.error('Error loading guests:', e);
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          try { setGuests(JSON.parse(stored)); } catch (err) {}
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAddGuest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNombre.trim()) return;
    setAdding(true);

    try {
      const res = await fetch('/api/boda/invitados', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug,
          action: 'add',
          nombre: newNombre,
          pases: newPases,
          telefono: newTelefono,
          tipo: newTipo,
          estilo: newEstilo
        })
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.guests)) {
        setGuests(data.guests);
        if (typeof window !== 'undefined') {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(data.guests));
        }
      } else {
        await loadGuests();
      }
    } catch (e) {
      alert('Ocurrió un error al guardar la invitación.');
    } finally {
      setNewNombre('');
      setNewPases(2);
      setNewTelefono('');
      setNewTipo('completo');
      setNewEstilo('oro');
      setAdding(false);
    }
  };

  const handleToggleEnviado = async (id: string, currentEnviado: boolean) => {
    const updated = guests.map(g => {
      if (g.id === id) {
        const nextEnviado = !currentEnviado;
        return {
          ...g,
          enviado: nextEnviado,
          enviadoEn: nextEnviado ? new Date().toISOString() : g.enviadoEn
        };
      }
      return g;
    });
    setGuests(updated);

    try {
      const res = await fetch('/api/boda/invitados', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, action: 'toggleEnviado', id, enviado: !currentEnviado })
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.guests)) {
        setGuests(data.guests);
      }
    } catch (e) {}
  };

  const handleDelete = async (id: string, nombre: string) => {
    if (!confirm(`¿Eliminar la invitación de "${nombre}"?`)) return;
    const updated = guests.filter(g => g.id !== id);
    setGuests(updated);

    try {
      const res = await fetch('/api/boda/invitados', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, action: 'delete', id })
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.guests)) {
        setGuests(data.guests);
      }
    } catch (e) {}
  };

  const getWhatsAppLink = (guest: Guest) => {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://sodi.com.ar';
    const link = `${baseUrl}/boda/${slug}?i=${guest.id}`;
    const pasesText = guest.pases === 1 ? '1 pase' : `${guest.pases} pases`;
    
    let message = '';
    if (guest.tipo === 'solo-after') {
      message = `¡Hola ${guest.nombre}! 🥳 Queremos celebrar a lo grande en nuestro casamiento y nos encantaría que vengas a bailar, brindar y festejar con nosotros a partir del after-party (23:30hs). En este enlace podés ver la tarjeta digital y confirmar tus ${pasesText}:\n\n${link}`;
    } else if (guest.tipo === 'solo-ceremonia') {
      message = `¡Hola ${guest.nombre}! 💒 Nos encantaría de corazón que nos acompañes en la ceremonia civil de nuestro casamiento. En este enlace podés ver la tarjeta con toda la información y confirmar tu asistencia:\n\n${link}`;
    } else {
      message = `¡Hola ${guest.nombre}! 💒 Nos encantaría que nos acompañes en nuestro casamiento (Ceremonia y Fiesta). En este enlace podés ver la tarjeta de invitación premium y confirmar tus ${pasesText}:\n\n${link}`;
    }

    const phoneParam = guest.telefono ? `phone=${encodeURIComponent(guest.telefono.replace(/[^0-9]/g, ''))}&` : '';
    return `https://api.whatsapp.com/send?${phoneParam}text=${encodeURIComponent(message)}`;
  };

  const handleWhatsAppClick = (guest: Guest) => {
    if (!guest.enviado) {
      handleToggleEnviado(guest.id, false);
    }
  };

  const copyLink = (guest: Guest) => {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://sodi.com.ar';
    const link = `${baseUrl}/boda/${slug}?i=${guest.id}`;
    navigator.clipboard.writeText(link);
    alert(`¡Link copiado para ${guest.nombre}!\n${link}`);
  };

  const exportCSV = () => {
    const headers = ['Nombre', 'Pases Asignados', 'Enviado', 'Estado', 'Pases Confirmados', 'Integrantes', 'Menú', 'Notas', 'Canción', 'Visto', 'Fecha Respuesta'];
    const rows = guests.map(g => [
      `"${g.nombre}"`,
      g.pases,
      g.enviado ? 'Sí' : 'No',
      g.estado,
      g.respuesta ? g.respuesta.pasesConfirmados : '',
      `"${(g.respuesta?.integrantes || []).join(', ')}"`,
      `"${g.respuesta?.menu || ''}"`,
      `"${g.respuesta?.notas || ''}"`,
      `"${g.respuesta?.cancion || ''}"`,
      g.vistoEn ? new Date(g.vistoEn).toLocaleString('es-AR') : 'No',
      g.respuesta?.fechaRespuesta ? new Date(g.respuesta.fechaRespuesta).toLocaleString('es-AR') : ''
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Invitaciones-Boda-${slug}-${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const totalInvitaciones = guests.length;
  const totalPases = guests.reduce((sum, g) => sum + g.pases, 0);
  const totalEnviados = guests.filter(g => g.enviado).length;
  const confirmados = guests.filter(g => g.estado === 'confirmado').reduce((sum, g) => sum + (g.respuesta?.pasesConfirmados || g.pases), 0);
  const rechazados = guests.filter(g => g.estado === 'rechazado').length;
  const pendientes = guests.filter(g => g.estado === 'pendiente').length;

  const filteredGuests = guests.filter(g => {
    if (filter === 'confirmados') return g.estado === 'confirmado';
    if (filter === 'pendientes') return g.estado === 'pendiente';
    if (filter === 'rechazados') return g.estado === 'rechazado';
    if (filter === 'sin-enviar') return !g.enviado;
    return true;
  });

  if (!authenticated) {
    return (
      <div style={styles.loginContainer}>
        <div style={styles.loginCard}>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginBottom: '18px' }}>
            <span style={{ fontSize: '1.5rem', fontWeight: '900', letterSpacing: '2px', color: '#1a251e', border: '2px solid #1a251e', padding: '2px 10px', borderRadius: '4px', fontFamily: 'system-ui, sans-serif' }}>SODI</span>
            <span style={{ fontSize: '1.3rem', fontWeight: '500', color: '#8b6f4e', letterSpacing: '1px', fontFamily: 'Georgia, serif' }}>BODAS</span>
          </div>
          <h1 style={styles.loginTitle}>Panel de Control</h1>
          <p style={styles.loginSubtitle}>Gestión de Invitados: <strong>{slug}</strong></p>
          <form onSubmit={handleLogin} style={styles.form}>
            <input
              type="password"
              placeholder="Ingresá tu contraseña de acceso"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              style={styles.inputDarkText}
              required
            />
            {loginError && <p style={{ color: '#c62828', fontSize: '0.85rem', margin: '4px 0' }}>{loginError}</p>}
            <button type="submit" style={styles.buttonPrimaryBlock}>Ingresar al Panel</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span style={{ fontSize: '1.1rem', fontWeight: '900', letterSpacing: '1px', color: '#ffffff', backgroundColor: '#1a251e', padding: '1px 6px', borderRadius: '3px' }}>SODI</span>
            <span style={{ fontSize: '1rem', fontWeight: '600', color: '#8b6f4e', letterSpacing: '0.5px' }}>BODAS</span>
          </div>
          <h1 style={styles.mainHeading}>Administración de Invitaciones</h1>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button onClick={exportCSV} style={styles.buttonOutlineHeader}>📥 Exportar Excel</button>
          <button onClick={() => { sessionStorage.removeItem(`admin_boda_${slug}_auth`); setAuthenticated(false); }} style={styles.buttonDangerHeader}>Cerrar Sesión</button>
        </div>
      </header>

      {/* Metrics Row */}
      <div style={styles.metricsGrid}>
        <div style={styles.metricCard}>
          <span style={styles.metricLabel}>Total Invitaciones</span>
          <span style={styles.metricValue}>{totalInvitaciones} <small style={{ fontSize: '1rem', color: '#555' }}>({totalPases} pases)</small></span>
        </div>
        <div style={{ ...styles.metricCard, borderLeft: '4px solid #0288d1' }}>
          <span style={styles.metricLabel}>Enviadas por WhatsApp</span>
          <span style={{ ...styles.metricValue, color: '#0288d1' }}>{totalEnviados} / {totalInvitaciones}</span>
        </div>
        <div style={{ ...styles.metricCard, borderLeft: '4px solid #2e7d32' }}>
          <span style={styles.metricLabel}>Pases Confirmados</span>
          <span style={{ ...styles.metricValue, color: '#2e7d32' }}>{confirmados}</span>
        </div>
        <div style={{ ...styles.metricCard, borderLeft: '4px solid #f57c00' }}>
          <span style={styles.metricLabel}>Pendientes de Respuesta</span>
          <span style={{ ...styles.metricValue, color: '#f57c00' }}>{pendientes}</span>
        </div>
      </div>

      {/* Add New Guest Form */}
      <section style={styles.card}>
        <h2 style={styles.cardTitle}>✨ Agregar Nueva Invitación</h2>
        <form onSubmit={handleAddGuest} style={{ ...styles.addForm, display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', width: '100%' }}>
            <input
              type="text"
              placeholder="Nombre de Persona / Familia (ej: Familia Pérez)"
              value={newNombre}
              onChange={(e) => setNewNombre(e.target.value)}
              style={{ ...styles.inputFlexDark, flex: '2 1 300px' }}
              required
            />
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: '100px' }}>
              <label style={{ fontSize: '0.9rem', color: '#111', fontWeight: '600' }}>Pases:</label>
              <input
                type="number"
                min="1"
                max="10"
                value={newPases}
                onChange={(e) => setNewPases(parseInt(e.target.value, 10) || 1)}
                style={styles.inputSmallDark}
                required
              />
            </div>
            <input
              type="text"
              placeholder="Teléfono (ej: 5491162337552)"
              value={newTelefono}
              onChange={(e) => setNewTelefono(e.target.value)}
              style={{ ...styles.inputFlexDark, flex: '1 1 200px' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', width: '100%' }}>
            <div style={{ display: 'flex', flexDirection: 'column', flex: '1 1 200px', gap: '4px' }}>
              <label style={{ fontSize: '0.82rem', color: '#555', fontWeight: '600' }}>Tipo de Invitación / Pase:</label>
              <select
                value={newTipo}
                onChange={(e) => setNewTipo(e.target.value as any)}
                style={{ ...styles.inputFlexDark, width: '100%', padding: '10px' }}
              >
                <option value="completo">Completo (Ceremonia + Fiesta)</option>
                <option value="solo-after">Solo After-Party (Baile/Trasnochados)</option>
                <option value="solo-ceremonia">Solo Ceremonia (Iglesia/Civil)</option>
              </select>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', flex: '1 1 200px', gap: '4px' }}>
              <label style={{ fontSize: '0.82rem', color: '#555', fontWeight: '600' }}>Paleta de Estilo Visual (A/B/C):</label>
              <select
                value={newEstilo}
                onChange={(e) => setNewEstilo(e.target.value as any)}
                style={{ ...styles.inputFlexDark, width: '100%', padding: '10px' }}
              >
                <option value="oro">Opción A: Champagne y Oro Clásico</option>
                <option value="esmeralda">Opción B: Esmeralda y Champagne</option>
                <option value="borgoña">Opción C: Borgoña y Blanco Lino</option>
              </select>
            </div>
          </div>

          <button type="submit" disabled={adding} style={{ ...styles.buttonPrimary, width: '100%', marginTop: '8px' }}>
            {adding ? 'Guardando...' : '➕ Crear Invitación'}
          </button>
        </form>
      </section>

      {/* Filter Tabs */}
      <div style={styles.tabRow}>
        {(['todos', 'sin-enviar', 'confirmados', 'pendientes', 'rechazados'] as const).map(tab => {
          const tabStateMap: Record<string, (g: Guest) => boolean> = {
            todos: () => true,
            'sin-enviar': (g) => !g.enviado,
            confirmados: (g) => g.estado === 'confirmado',
            pendientes: (g) => g.estado === 'pendiente',
            rechazados: (g) => g.estado === 'rechazado'
          };
          const count = guests.filter(tabStateMap[tab]).length;
          const labelMap: Record<string, string> = {
            todos: 'Todos',
            'sin-enviar': 'Sin Enviar',
            confirmados: 'Confirmados',
            pendientes: 'Pendientes',
            rechazados: 'Rechazados'
          };
          return (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              style={{
                ...styles.tabButton,
                ...(filter === tab ? styles.tabButtonActive : {})
              }}
            >
              {labelMap[tab]} ({count})
            </button>
          );
        })}
      </div>

      {/* Guest Table */}
      <section style={styles.card}>
        {loading ? (
          <p style={{ padding: '24px', textAlign: 'center', color: '#111', fontWeight: '600' }}>Cargando lista de invitados...</p>
        ) : filteredGuests.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#444' }}>
            <p style={{ fontSize: '1.1rem', fontWeight: '600', color: '#111', marginBottom: '6px' }}>No hay invitaciones en esta sección.</p>
            <p style={{ fontSize: '0.9rem', color: '#555' }}>Agregá un invitado en el formulario de arriba para generar su link único y enviárselo por WhatsApp.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Invitado / Familia</th>
                  <th style={styles.th}>Pases</th>
                  <th style={styles.th}>¿Enviado?</th>
                  <th style={styles.th}>Estado RSVP</th>
                  <th style={styles.th}>Apertura</th>
                  <th style={styles.th}>Detalle Respuesta</th>
                  <th style={styles.th}>Acciones de Envío</th>
                </tr>
              </thead>
              <tbody>
                {filteredGuests.map(guest => (
                  <tr key={guest.id} style={styles.tr}>
                    <td style={styles.td}>
                      <strong style={{ color: '#111', fontSize: '1.05rem' }}>{guest.nombre}</strong>
                      <div style={{ color: '#555', fontSize: '0.8rem', marginTop: '2px' }}>ID Link: <code>?i={guest.id}</code></div>
                      <div style={{ display: 'flex', gap: '4px', marginTop: '6px' }}>
                        <span style={{
                          fontSize: '0.7rem',
                          fontWeight: '700',
                          padding: '2px 6px',
                          borderRadius: '12px',
                          textTransform: 'uppercase',
                          backgroundColor: guest.tipo === 'solo-after' ? '#e8f0fe' : guest.tipo === 'solo-ceremonia' ? '#fdf2e9' : '#f3e8ff',
                          color: guest.tipo === 'solo-after' ? '#1a73e8' : guest.tipo === 'solo-ceremonia' ? '#d56d12' : '#7b1fa2'
                        }}>
                          {guest.tipo === 'solo-after' ? 'Solo After' : guest.tipo === 'solo-ceremonia' ? 'Solo Civil' : 'Pase Completo'}
                        </span>
                        <span style={{
                          fontSize: '0.7rem',
                          fontWeight: '700',
                          padding: '2px 6px',
                          borderRadius: '12px',
                          textTransform: 'uppercase',
                          backgroundColor: guest.estilo === 'esmeralda' ? '#e6f4ea' : guest.estilo === 'borgoña' ? '#fce8e6' : '#fff8e1',
                          color: guest.estilo === 'esmeralda' ? '#137333' : guest.estilo === 'borgoña' ? '#c5221f' : '#b06000'
                        }}>
                          🎨 {guest.estilo === 'esmeralda' ? 'Esmeralda' : guest.estilo === 'borgoña' ? 'Borgoña' : 'Champagne'}
                        </span>
                      </div>
                    </td>
                    <td style={{ ...styles.td, fontWeight: '700', color: '#111' }}>{guest.pases}</td>
                    <td style={styles.td}>
                      <button
                        onClick={() => handleToggleEnviado(guest.id, !!guest.enviado)}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          padding: '0'
                        }}
                        title="Toca para cambiar estado de envío"
                      >
                        {guest.enviado ? (
                          <span style={styles.badgeEnviado}>🟢 Enviado</span>
                        ) : (
                          <span style={styles.badgeSinEnviar}>⚪ Pendiente</span>
                        )}
                      </button>
                    </td>
                    <td style={styles.td}>
                      {guest.estado === 'confirmado' && <span style={styles.badgeSuccess}>✅ Confirmado</span>}
                      {guest.estado === 'rechazado' && <span style={styles.badgeDanger}>❌ No Asiste</span>}
                      {guest.estado === 'pendiente' && <span style={styles.badgeWarning}>⏳ Pendiente</span>}
                    </td>
                    <td style={styles.td}>
                      {guest.vistoEn ? <span style={{ color: '#1b5e20', fontWeight: '600' }}>👁️ Abierto</span> : <span style={{ color: '#777' }}>Sin abrir</span>}
                    </td>
                    <td style={styles.td}>
                      {guest.respuesta ? (
                        <div style={{ fontSize: '0.85rem', color: '#222' }}>
                          <div><strong style={{ color: '#111' }}>Asisten:</strong> {guest.respuesta.pasesConfirmados} de {guest.pases} pases</div>
                          {guest.respuesta.integrantes.length > 0 && (
                            <div><strong style={{ color: '#111' }}>Nombres:</strong> {guest.respuesta.integrantes.join(', ')}</div>
                          )}
                          <div><strong style={{ color: '#111' }}>Menú:</strong> {guest.respuesta.menu}</div>
                          {guest.respuesta.notas && <div><strong style={{ color: '#111' }}>Notas:</strong> {guest.respuesta.notas}</div>}
                          {guest.respuesta.cancion && <div><strong style={{ color: '#111' }}>🎵 Canción:</strong> {guest.respuesta.cancion}</div>}
                        </div>
                      ) : (
                        <span style={{ color: '#666', fontSize: '0.85rem' }}>Aún no respondió</span>
                      )}
                    </td>
                    <td style={styles.td}>
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                        <a
                          href={getWhatsAppLink(guest)}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => handleWhatsAppClick(guest)}
                          style={styles.buttonWhatsapp}
                        >
                          📲 WhatsApp
                        </a>
                        <button onClick={() => copyLink(guest)} style={styles.buttonSmall}>📋 Copiar Link</button>
                        <button onClick={() => handleDelete(guest.id, guest.nombre)} style={styles.buttonSmallDanger}>🗑️</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  loginContainer: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f4f1ea',
    fontFamily: 'system-ui, -apple-system, sans-serif'
  },
  loginCard: {
    backgroundColor: '#ffffff',
    padding: '40px',
    borderRadius: '16px',
    boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
    textAlign: 'center',
    maxWidth: '420px',
    width: '90%',
    border: '1px solid #e0d8c8'
  },
  loginIcon: {
    fontSize: '2.5rem',
    marginBottom: '12px'
  },
  loginTitle: {
    margin: '0 0 6px 0',
    fontSize: '1.6rem',
    color: '#1a251e',
    fontWeight: '700'
  },
  loginSubtitle: {
    margin: '0 0 24px 0',
    fontSize: '0.95rem',
    color: '#333333'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  inputDarkText: {
    width: '100%',
    padding: '14px 16px',
    borderRadius: '8px',
    border: '1.5px solid #203a2c',
    fontSize: '1rem',
    color: '#111111',
    backgroundColor: '#ffffff',
    fontWeight: '500'
  },
  buttonPrimaryBlock: {
    width: '100%',
    backgroundColor: '#355844',
    color: '#ffffff',
    border: 'none',
    padding: '14px',
    borderRadius: '8px',
    fontWeight: '700',
    fontSize: '1rem',
    cursor: 'pointer'
  },
  container: {
    padding: '30px 20px',
    maxWidth: '1200px',
    margin: '0 auto',
    fontFamily: 'system-ui, -apple-system, sans-serif',
    backgroundColor: '#faf8f5',
    minHeight: '100vh',
    color: '#111111'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
    flexWrap: 'wrap',
    gap: '16px'
  },
  badge: {
    fontSize: '0.85rem',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    color: '#355844',
    fontWeight: '700'
  },
  mainHeading: {
    margin: '4px 0 0 0',
    fontSize: '1.8rem',
    color: '#1a251e',
    fontWeight: '800'
  },
  buttonOutlineHeader: {
    backgroundColor: '#ffffff',
    color: '#355844',
    border: '1.5px solid #355844',
    padding: '10px 16px',
    borderRadius: '8px',
    fontWeight: '700',
    cursor: 'pointer',
    fontSize: '0.9rem'
  },
  buttonDangerHeader: {
    backgroundColor: '#fee2e2',
    color: '#991b1b',
    border: '1px solid #f87171',
    padding: '10px 16px',
    borderRadius: '8px',
    fontWeight: '700',
    cursor: 'pointer',
    fontSize: '0.9rem'
  },
  metricsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '16px',
    marginBottom: '24px'
  },
  metricCard: {
    backgroundColor: '#ffffff',
    padding: '20px',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
    display: 'flex',
    flexDirection: 'column',
    border: '1px solid #e5dfd3'
  },
  metricLabel: {
    fontSize: '0.85rem',
    color: '#444444',
    fontWeight: '600'
  },
  metricValue: {
    fontSize: '2.2rem',
    fontWeight: '800',
    marginTop: '4px',
    color: '#1a251e'
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: '14px',
    padding: '24px',
    boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
    marginBottom: '24px',
    border: '1px solid #e5dfd3'
  },
  cardTitle: {
    margin: '0 0 16px 0',
    fontSize: '1.25rem',
    color: '#1a251e',
    fontWeight: '700'
  },
  addForm: {
    display: 'flex',
    gap: '12px',
    flexWrap: 'wrap',
    alignItems: 'center'
  },
  inputFlexDark: {
    flex: '1 1 220px',
    padding: '12px 14px',
    borderRadius: '8px',
    border: '1.5px solid #bbb',
    fontSize: '0.95rem',
    color: '#111111',
    backgroundColor: '#ffffff',
    fontWeight: '500'
  },
  inputSmallDark: {
    width: '70px',
    padding: '12px',
    borderRadius: '8px',
    border: '1.5px solid #bbb',
    fontSize: '0.95rem',
    color: '#111111',
    backgroundColor: '#ffffff',
    fontWeight: '700',
    textAlign: 'center'
  },
  buttonPrimary: {
    backgroundColor: '#355844',
    color: '#ffffff',
    border: 'none',
    padding: '12px 20px',
    borderRadius: '8px',
    fontWeight: '700',
    cursor: 'pointer',
    fontSize: '0.95rem'
  },
  tabRow: {
    display: 'flex',
    gap: '8px',
    marginBottom: '16px',
    flexWrap: 'wrap'
  },
  tabButton: {
    padding: '8px 16px',
    borderRadius: '20px',
    border: '1.5px solid #ccc',
    backgroundColor: '#ffffff',
    cursor: 'pointer',
    fontSize: '0.9rem',
    color: '#333333',
    fontWeight: '600'
  },
  tabButtonActive: {
    backgroundColor: '#355844',
    color: '#ffffff',
    borderColor: '#355844'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'left'
  },
  th: {
    borderBottom: '2px solid #ddd',
    padding: '12px',
    fontSize: '0.85rem',
    color: '#222222',
    textTransform: 'uppercase',
    fontWeight: '700',
    letterSpacing: '0.5px'
  },
  tr: {
    borderBottom: '1px solid #eeeeee'
  },
  td: {
    padding: '14px 12px',
    verticalAlign: 'top',
    fontSize: '0.95rem',
    color: '#111111'
  },
  badgeEnviado: {
    backgroundColor: '#e3f2fd',
    color: '#0288d1',
    padding: '6px 10px',
    borderRadius: '12px',
    fontSize: '0.8rem',
    fontWeight: '700'
  },
  badgeSinEnviar: {
    backgroundColor: '#f5f5f5',
    color: '#777777',
    padding: '6px 10px',
    borderRadius: '12px',
    fontSize: '0.8rem',
    fontWeight: '600',
    border: '1px solid #ddd'
  },
  badgeSuccess: {
    backgroundColor: '#d1e7dd',
    color: '#0f5132',
    padding: '6px 12px',
    borderRadius: '12px',
    fontSize: '0.85rem',
    fontWeight: '700'
  },
  badgeDanger: {
    backgroundColor: '#f8d7da',
    color: '#842029',
    padding: '6px 12px',
    borderRadius: '12px',
    fontSize: '0.85rem',
    fontWeight: '700'
  },
  badgeWarning: {
    backgroundColor: '#fff3cd',
    color: '#664d03',
    padding: '6px 12px',
    borderRadius: '12px',
    fontSize: '0.85rem',
    fontWeight: '700'
  },
  buttonWhatsapp: {
    backgroundColor: '#25D366',
    color: '#ffffff',
    textDecoration: 'none',
    padding: '8px 14px',
    borderRadius: '6px',
    fontSize: '0.85rem',
    fontWeight: '700',
    display: 'inline-flex',
    alignItems: 'center'
  },
  buttonSmall: {
    backgroundColor: '#f0ede6',
    border: '1px solid #ccc',
    color: '#111',
    padding: '8px 12px',
    borderRadius: '6px',
    fontSize: '0.85rem',
    fontWeight: '600',
    cursor: 'pointer'
  },
  buttonSmallDanger: {
    backgroundColor: '#fee2e2',
    color: '#991b1b',
    border: 'none',
    padding: '8px 12px',
    borderRadius: '6px',
    cursor: 'pointer'
  }
};
