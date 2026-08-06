'use client';

import React, { useState, useEffect } from 'react';

interface Guest {
  id: string;
  nombre: string;
  pases: number;
  telefono: string;
  estado: 'pendiente' | 'confirmado' | 'rechazado';
  creadoEn: string;
  vistoEn: string | null;
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

export default function AdminBodaPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [guests, setGuests] = useState<Guest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'todos' | 'confirmados' | 'pendientes' | 'rechazados'>('todos');

  // New guest form
  const [newNombre, setNewNombre] = useState('');
  const [newPases, setNewPases] = useState(2);
  const [newTelefono, setNewTelefono] = useState('');
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    // Check session storage for auth
    if (typeof window !== 'undefined' && sessionStorage.getItem('admin_boda_auth') === 'true') {
      setAuthenticated(true);
      fetchGuests();
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput.trim().toLowerCase() === 'mirta2026' || passwordInput.trim() === 'boda') {
      sessionStorage.setItem('admin_boda_auth', 'true');
      setAuthenticated(true);
      fetchGuests();
    } else {
      alert('Contraseña incorrecta. Intentá con: mirta2026');
    }
  };

  const fetchGuests = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/boda/invitados');
      const data = await res.json();
      if (data.success) {
        setGuests(data.guests || []);
      }
    } catch (e) {
      console.error('Error fetching guests:', e);
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
          action: 'add',
          nombre: newNombre,
          pases: newPases,
          telefono: newTelefono
        })
      });
      const data = await res.json();
      if (data.success) {
        setGuests(data.guests);
        setNewNombre('');
        setNewPases(2);
        setNewTelefono('');
      }
    } catch (e) {
      alert('Error al agregar invitado');
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (id: string, nombre: string) => {
    if (!confirm(`¿Eliminar la invitación de "${nombre}"?`)) return;
    try {
      const res = await fetch('/api/boda/invitados', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete', id })
      });
      const data = await res.json();
      if (data.success) {
        setGuests(data.guests);
      }
    } catch (e) {
      alert('Error al eliminar');
    }
  };

  const getWhatsAppLink = (guest: Guest) => {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://sodi.com.ar';
    const link = `${baseUrl}/boda?i=${guest.id}`;
    const pasesText = guest.pases === 1 ? '1 pase' : `${guest.pases} pases`;
    const message = `¡Hola ${guest.nombre}! 💒 Nos encantaría que nos acompañes en nuestro casamiento. En este enlace podés ver la tarjeta de invitación y confirmar tus ${pasesText}:\n\n${link}`;
    const phoneParam = guest.telefono ? `phone=${encodeURIComponent(guest.telefono)}&` : '';
    return `https://api.whatsapp.com/send?${phoneParam}text=${encodeURIComponent(message)}`;
  };

  const copyLink = (guest: Guest) => {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://sodi.com.ar';
    const link = `${baseUrl}/boda?i=${guest.id}`;
    navigator.clipboard.writeText(link);
    alert(`¡Link copiado para ${guest.nombre}!\n${link}`);
  };

  const exportCSV = () => {
    const headers = ['Nombre', 'Pases Asignados', 'Estado', 'Pases Confirmados', 'Integrantes', 'Menú', 'Notas', 'Canción', 'Visto', 'Fecha Respuesta'];
    const rows = guests.map(g => [
      `"${g.nombre}"`,
      g.pases,
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
    link.setAttribute('download', `Invitaciones-Boda-Mirta-Guillermo-${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Metrics
  const totalInvitados = guests.reduce((sum, g) => sum + g.pases, 0);
  const confirmados = guests.filter(g => g.estado === 'confirmado').reduce((sum, g) => sum + (g.respuesta?.pasesConfirmados || g.pases), 0);
  const rechazados = guests.filter(g => g.estado === 'rechazado').length;
  const pendientes = guests.filter(g => g.estado === 'pendiente').length;

  const filteredGuests = guests.filter(g => {
    if (filter === 'confirmados') return g.estado === 'confirmado';
    if (filter === 'pendientes') return g.estado === 'pendiente';
    if (filter === 'rechazados') return g.estado === 'rechazado';
    return true;
  });

  if (!authenticated) {
    return (
      <div style={styles.loginContainer}>
        <div style={styles.loginCard}>
          <h1 style={styles.title}>Panel de Administración</h1>
          <p style={styles.subtitle}>Gestión de Invitaciones · Boda Mirta & Guillermo</p>
          <form onSubmit={handleLogin} style={styles.form}>
            <input
              type="password"
              placeholder="Ingresá la contraseña (mirta2026)"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              style={styles.input}
              required
            />
            <button type="submit" style={styles.buttonPrimary}>Ingresar</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div>
          <span style={styles.badge}>Panel de Mirta & Guillermo</span>
          <h1 style={styles.mainHeading}>Gestión de Invitados & Confirmaciones</h1>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={exportCSV} style={styles.buttonOutline}>📥 Exportar a Excel</button>
          <button onClick={() => { sessionStorage.removeItem('admin_boda_auth'); setAuthenticated(false); }} style={styles.buttonDanger}>Salir</button>
        </div>
      </header>

      {/* Metrics Row */}
      <div style={styles.metricsGrid}>
        <div style={styles.metricCard}>
          <span style={styles.metricLabel}>Total Pases Asignados</span>
          <span style={styles.metricValue}>{totalInvitados}</span>
        </div>
        <div style={{ ...styles.metricCard, borderLeft: '4px solid #2e7d32' }}>
          <span style={styles.metricLabel}>Pases Confirmados</span>
          <span style={{ ...styles.metricValue, color: '#2e7d32' }}>{confirmados}</span>
        </div>
        <div style={{ ...styles.metricCard, borderLeft: '4px solid #c62828' }}>
          <span style={styles.metricLabel}>Rechazados</span>
          <span style={{ ...styles.metricValue, color: '#c62828' }}>{rechazados}</span>
        </div>
        <div style={{ ...styles.metricCard, borderLeft: '4px solid #f57c00' }}>
          <span style={styles.metricLabel}>Pendientes de Respuesta</span>
          <span style={{ ...styles.metricValue, color: '#f57c00' }}>{pendientes}</span>
        </div>
      </div>

      {/* Add New Guest Form */}
      <section style={styles.card}>
        <h2 style={styles.cardTitle}>✨ Agregar Nueva Invitación</h2>
        <form onSubmit={handleAddGuest} style={styles.addForm}>
          <input
            type="text"
            placeholder="Nombre / Familia (ej: Familia Pérez)"
            value={newNombre}
            onChange={(e) => setNewNombre(e.target.value)}
            style={styles.inputFlex}
            required
          />
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <label style={{ fontSize: '0.9rem', color: '#555' }}>Pases:</label>
            <input
              type="number"
              min="1"
              max="10"
              value={newPases}
              onChange={(e) => setNewPases(parseInt(e.target.value, 10) || 1)}
              style={styles.inputSmall}
              required
            />
          </div>
          <input
            type="text"
            placeholder="Teléfono (opcional: 54911...)"
            value={newTelefono}
            onChange={(e) => setNewTelefono(e.target.value)}
            style={styles.inputFlex}
          />
          <button type="submit" disabled={adding} style={styles.buttonPrimary}>
            {adding ? 'Guardando...' : '➕ Crear e Invitación'}
          </button>
        </form>
      </section>

      {/* Filter Tabs */}
      <div style={styles.tabRow}>
        {(['todos', 'confirmados', 'pendientes', 'rechazados'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            style={{
              ...styles.tabButton,
              ...(filter === tab ? styles.tabButtonActive : {})
            }}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Guest Table */}
      <section style={styles.card}>
        {loading ? (
          <p style={{ padding: '20px', textAlign: 'center' }}>Cargando lista de invitados...</p>
        ) : filteredGuests.length === 0 ? (
          <p style={{ padding: '20px', textAlign: 'center', color: '#777' }}>No hay invitados en esta sección.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Invitado / Familia</th>
                  <th style={styles.th}>Pases</th>
                  <th style={styles.th}>Estado</th>
                  <th style={styles.th}>Visto</th>
                  <th style={styles.th}>Detalle Respuesta</th>
                  <th style={styles.th}>Acciones de Envío</th>
                </tr>
              </thead>
              <tbody>
                {filteredGuests.map(guest => (
                  <tr key={guest.id} style={styles.tr}>
                    <td style={styles.td}>
                      <strong>{guest.nombre}</strong>
                      <br />
                      <small style={{ color: '#888' }}>ID: {guest.id}</small>
                    </td>
                    <td style={styles.td}>{guest.pases}</td>
                    <td style={styles.td}>
                      {guest.estado === 'confirmado' && <span style={styles.badgeSuccess}>✅ Confirmado</span>}
                      {guest.estado === 'rechazado' && <span style={styles.badgeDanger}>❌ No Asiste</span>}
                      {guest.estado === 'pendiente' && <span style={styles.badgeWarning}>⏳ Pendiente</span>}
                    </td>
                    <td style={styles.td}>
                      {guest.vistoEn ? <span style={{ color: '#2e7d32' }}>👁️ Visto</span> : <span style={{ color: '#aaa' }}>Sin abrir</span>}
                    </td>
                    <td style={styles.td}>
                      {guest.respuesta ? (
                        <div style={{ fontSize: '0.85rem' }}>
                          <div><strong>Asisten:</strong> {guest.respuesta.pasesConfirmados} de {guest.pases}</div>
                          {guest.respuesta.integrantes.length > 0 && (
                            <div><strong>Nombres:</strong> {guest.respuesta.integrantes.join(', ')}</div>
                          )}
                          <div><strong>Menú:</strong> {guest.respuesta.menu}</div>
                          {guest.respuesta.notas && <div><strong>Notas:</strong> {guest.respuesta.notas}</div>}
                          {guest.respuesta.cancion && <div><strong>🎵 Canción:</strong> {guest.respuesta.cancion}</div>}
                        </div>
                      ) : (
                        <span style={{ color: '#999', fontSize: '0.85rem' }}>Aún no respondió</span>
                      )}
                    </td>
                    <td style={styles.td}>
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                        <a
                          href={getWhatsAppLink(guest)}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={styles.buttonWhatsapp}
                        >
                          📲 Enviar por WhatsApp
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
    fontFamily: 'system-ui, sans-serif'
  },
  loginCard: {
    backgroundColor: '#fff',
    padding: '40px',
    borderRadius: '16px',
    boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
    textAlign: 'center',
    maxWidth: '420px',
    width: '90%'
  },
  container: {
    padding: '30px 20px',
    maxWidth: '1200px',
    margin: '0 auto',
    fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    backgroundColor: '#faf8f5',
    minHeight: '100vh',
    color: '#222'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
    flexWrap: 'wrap',
    gap: '12px'
  },
  badge: {
    fontSize: '0.8rem',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    color: '#8b6f4e',
    fontWeight: '600'
  },
  mainHeading: {
    margin: '4px 0 0 0',
    fontSize: '1.8rem',
    color: '#2c3e35'
  },
  metricsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '16px',
    marginBottom: '24px'
  },
  metricCard: {
    backgroundColor: '#fff',
    padding: '20px',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
    display: 'flex',
    flexDirection: 'column'
  },
  metricLabel: {
    fontSize: '0.85rem',
    color: '#666',
    fontWeight: '500'
  },
  metricValue: {
    fontSize: '2rem',
    fontWeight: '700',
    marginTop: '4px',
    color: '#2c3e35'
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: '14px',
    padding: '24px',
    boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
    marginBottom: '24px'
  },
  cardTitle: {
    margin: '0 0 16px 0',
    fontSize: '1.2rem',
    color: '#2c3e35'
  },
  addForm: {
    display: 'flex',
    gap: '12px',
    flexWrap: 'wrap',
    alignItems: 'center'
  },
  input: {
    width: '100%',
    padding: '12px 16px',
    borderRadius: '8px',
    border: '1px solid #ccc',
    fontSize: '1rem',
    marginBottom: '12px'
  },
  inputFlex: {
    flex: '1 1 200px',
    padding: '10px 14px',
    borderRadius: '8px',
    border: '1px solid #d0c8b8',
    fontSize: '0.95rem'
  },
  inputSmall: {
    width: '70px',
    padding: '10px',
    borderRadius: '8px',
    border: '1px solid #d0c8b8',
    fontSize: '0.95rem'
  },
  buttonPrimary: {
    backgroundColor: '#355844',
    color: '#fff',
    border: 'none',
    padding: '11px 20px',
    borderRadius: '8px',
    fontWeight: '600',
    cursor: 'pointer',
    fontSize: '0.95rem'
  },
  buttonOutline: {
    backgroundColor: 'transparent',
    color: '#355844',
    border: '1px solid #355844',
    padding: '8px 16px',
    borderRadius: '8px',
    fontWeight: '600',
    cursor: 'pointer'
  },
  buttonDanger: {
    backgroundColor: '#fee2e2',
    color: '#991b1b',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '8px',
    fontWeight: '600',
    cursor: 'pointer'
  },
  tabRow: {
    display: 'flex',
    gap: '8px',
    marginBottom: '16px'
  },
  tabButton: {
    padding: '8px 16px',
    borderRadius: '20px',
    border: '1px solid #d0c8b8',
    backgroundColor: '#fff',
    cursor: 'pointer',
    fontSize: '0.9rem',
    color: '#555'
  },
  tabButtonActive: {
    backgroundColor: '#355844',
    color: '#fff',
    borderColor: '#355844'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'left'
  },
  th: {
    borderBottom: '2px solid #eee',
    padding: '12px',
    fontSize: '0.85rem',
    color: '#666',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  tr: {
    borderBottom: '1px solid #f0ede6'
  },
  td: {
    padding: '12px',
    verticalAlign: 'top',
    fontSize: '0.95rem'
  },
  badgeSuccess: {
    backgroundColor: '#e8f5e9',
    color: '#2e7d32',
    padding: '4px 10px',
    borderRadius: '12px',
    fontSize: '0.8rem',
    fontWeight: '600'
  },
  badgeDanger: {
    backgroundColor: '#ffebee',
    color: '#c62828',
    padding: '4px 10px',
    borderRadius: '12px',
    fontSize: '0.8rem',
    fontWeight: '600'
  },
  badgeWarning: {
    backgroundColor: '#fff3e0',
    color: '#ef6c00',
    padding: '4px 10px',
    borderRadius: '12px',
    fontSize: '0.8rem',
    fontWeight: '600'
  },
  buttonWhatsapp: {
    backgroundColor: '#25D366',
    color: '#fff',
    textDecoration: 'none',
    padding: '6px 12px',
    borderRadius: '6px',
    fontSize: '0.85rem',
    fontWeight: '600',
    display: 'inline-flex',
    alignItems: 'center'
  },
  buttonSmall: {
    backgroundColor: '#f0ede6',
    border: '1px solid #d0c8b8',
    padding: '6px 10px',
    borderRadius: '6px',
    fontSize: '0.85rem',
    cursor: 'pointer'
  },
  buttonSmallDanger: {
    backgroundColor: '#fee2e2',
    color: '#991b1b',
    border: 'none',
    padding: '6px 10px',
    borderRadius: '6px',
    cursor: 'pointer'
  }
};
