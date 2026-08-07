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

  useEffect(() => {
    loadGuests();
  }, [slug]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setLoading(true);

    try {
      const response = await fetch('/api/boda/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: passwordInput }),
      });

      if (!response.ok) {
        setLoginError('Contraseña incorrecta. Verificá los datos e intentá de nuevo.');
        return;
      }

      setAuthenticated(true);
      setPasswordInput('');
      await loadGuests();
    } catch {
      setLoginError('No se pudo acceder al panel. Intentá nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/boda/admin/logout', { method: 'POST' });
    setAuthenticated(false);
    setGuests([]);
  };

  const loadGuests = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/boda/invitados?slug=${encodeURIComponent(slug)}&t=${Date.now()}`);
      if (res.status === 401) {
        setAuthenticated(false);
        return;
      }

      const data = await res.json();
      if (!res.ok || !data.success || !Array.isArray(data.guests)) {
        throw new Error(data.message || 'No se pudo cargar la lista');
      }

      setAuthenticated(true);
      setGuests(data.guests);
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data.guests));
      }
    } catch (e) {
      console.error('Error loading guests:', e);
      setLoginError('No se pudo cargar la lista de invitados. Intentá nuevamente.');
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
      if (res.ok && data.success && Array.isArray(data.guests)) {
        setGuests(data.guests);
        if (typeof window !== 'undefined') {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(data.guests));
        }
      } else {
        throw new Error(data.message || 'No se pudo guardar la invitación');
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
      if (res.ok && data.success && Array.isArray(data.guests)) {
        setGuests(data.guests);
      } else {
        await loadGuests();
      }
    } catch (e) {
      await loadGuests();
    }
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
      if (res.ok && data.success && Array.isArray(data.guests)) {
        setGuests(data.guests);
      } else {
        await loadGuests();
      }
    } catch (e) {
      await loadGuests();
    }
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
          <a
            href={`/boda/${slug}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{ ...styles.buttonOutlineHeader, textDecoration: 'none' }}
          >
            👁️ Vista previa
          </a>
          <button onClick={exportCSV} style={styles.buttonOutlineHeader}>📥 Exportar Excel</button>
          <button onClick={handleLogout} style={styles.buttonDangerHeader}>Cerrar Sesión</button>
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

      {/* Friendly Guide for Mirta */}
      <div style={{
        backgroundColor: '#ecfdf5',
        border: '1px solid #a7f3d0',
        borderRadius: '12px',
        padding: '18px 24px',
        marginBottom: '24px',
        display: 'flex',
        gap: '16px',
        alignItems: 'flex-start',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px -2px rgba(0, 0, 0, 0.02)'
      }}>
        <span style={{ fontSize: '1.6rem', marginTop: '2px' }}>💡</span>
        <div style={{ fontSize: '0.9rem', color: '#065f46', lineHeight: '1.6' }}>
          <strong style={{ color: '#064e3b', fontSize: '1rem', display: 'block', marginBottom: '6px' }}>
            ¡Guía rápida de ayuda para enviar tus invitaciones!
          </strong>
          <ul style={{ margin: '0', paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <li><strong>Paso 1 (Crear):</strong> Escribí el nombre y teléfono del invitado arriba, elegí su tipo de pase y color, y hacé clic en el botón verde <strong>Crear Invitación</strong>.</li>
            <li><strong>Paso 2 (Enviar):</strong> Buscá al invitado abajo en la lista y tocá el botón verde <strong>📲 WhatsApp</strong>. Se abrirá WhatsApp con todo el mensaje ya escrito y su invitación lista para enviar.</li>
            <li><strong>Paso 3 (Copiar):</strong> Si preferís mandárselo por otra red social, hacé clic en <strong>📋 Copiar Link</strong> y pegalo donde quieras.</li>
            <li><strong>Paso 4 (Registro):</strong> Cuando envíes una invitación, el sistema automáticamente lo marcará como <span style={{ color: '#0369a1', fontWeight: 'bold' }}>🟢 Enviado</span> para que lleves el control perfecto de a quiénes ya les mandaste.</li>
          </ul>
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
            <div style={{ display: 'flex', flexDirection: 'column', flex: '1 1 100%', gap: '4px' }}>
              <label style={{ fontSize: '0.8rem', color: '#475569', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Tipo de Invitación / Pase:</label>
              <select
                value={newTipo}
                onChange={(e) => setNewTipo(e.target.value as 'completo' | 'solo-after' | 'solo-ceremonia')}
                style={{
                  height: '46px',
                  padding: '0 14px',
                  borderRadius: '8px',
                  border: '1.5px solid #cbd5e1',
                  fontSize: '0.95rem',
                  color: '#1e293b',
                  backgroundColor: '#ffffff',
                  fontWeight: '500',
                  width: '100%',
                  cursor: 'pointer',
                  outline: 'none',
                  boxShadow: 'none',
                  display: 'block',
                  appearance: 'auto'
                }}
              >
                <option value="completo">Completo (Ceremonia + Fiesta)</option>
                <option value="solo-after">Solo After-Party (Baile/Trasnochados)</option>
                <option value="solo-ceremonia">Solo Ceremonia (Iglesia/Civil)</option>
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
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <strong style={{ color: '#0f172a', fontSize: '1rem', fontWeight: '700' }}>{guest.nombre}</strong>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: '#64748b', flexWrap: 'wrap' }}>
                          <span style={{
                            fontWeight: '600',
                            color: guest.tipo === 'solo-after' ? '#0284c7' : guest.tipo === 'solo-ceremonia' ? '#ea580c' : '#7c3aed'
                          }}>
                            {guest.tipo === 'solo-after' ? 'Solo After' : guest.tipo === 'solo-ceremonia' ? 'Solo Civil' : 'Pase Completo'}
                          </span>
                          <span>•</span>
                          <code style={{ fontSize: '0.75rem', backgroundColor: '#f1f5f9', padding: '1px 4px', borderRadius: '4px' }}>?i={guest.id}</code>
                        </div>
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
                    <td style={{ ...styles.td, whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'nowrap' }}>
                        <a
                          href={`/boda/${slug}?i=${encodeURIComponent(guest.id)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            backgroundColor: '#e8f0eb',
                            border: '1px solid #9fb7a7',
                            color: '#1a4930',
                            padding: '8px',
                            borderRadius: '50%',
                            width: '38px',
                            height: '38px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '1.1rem',
                            textDecoration: 'none',
                          }}
                          title={`Ver la invitación de ${guest.nombre}`}
                          aria-label={`Ver la invitación de ${guest.nombre}`}
                        >
                          👁️
                        </a>
                        <a
                          href={getWhatsAppLink(guest)}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => handleWhatsAppClick(guest)}
                          style={{
                            backgroundColor: '#25D366',
                            color: '#ffffff',
                            textDecoration: 'none',
                            padding: '8px',
                            borderRadius: '50%',
                            width: '38px',
                            height: '38px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '1.25rem',
                            cursor: 'pointer',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                            border: 'none'
                          }}
                          title="Enviar invitación por WhatsApp (📲)"
                        >
                          📲
                        </a>
                        <button
                          onClick={() => copyLink(guest)}
                          style={{
                            backgroundColor: '#f1f5f9',
                            border: '1px solid #cbd5e1',
                            color: '#1e293b',
                            padding: '8px',
                            borderRadius: '50%',
                            width: '38px',
                            height: '38px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '1.1rem',
                            cursor: 'pointer',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                          }}
                          title="Copiar link de invitación (🔗)"
                        >
                          🔗
                        </button>
                        <button
                          onClick={() => handleDelete(guest.id, guest.nombre)}
                          style={{
                            backgroundColor: '#fee2e2',
                            color: '#991b1b',
                            border: 'none',
                            padding: '8px',
                            borderRadius: '50%',
                            width: '38px',
                            height: '38px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '1.1rem',
                            cursor: 'pointer',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                          }}
                          title="Eliminar invitación (🗑️)"
                        >
                          🗑️
                        </button>
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
    maxWidth: '1240px',
    margin: '0 auto',
    fontFamily: 'system-ui, -apple-system, sans-serif',
    backgroundColor: '#f8fafc',
    minHeight: '100vh',
    color: '#0f172a'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '28px',
    flexWrap: 'wrap',
    gap: '16px'
  },
  badge: {
    fontSize: '0.8rem',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    color: '#0f766e',
    fontWeight: '700',
    backgroundColor: '#ccfbf1',
    padding: '4px 10px',
    borderRadius: '6px',
    display: 'inline-block'
  },
  mainHeading: {
    margin: '8px 0 0 0',
    fontSize: '2rem',
    color: '#0f172a',
    fontWeight: '800',
    letterSpacing: '-0.5px'
  },
  buttonOutlineHeader: {
    backgroundColor: '#ffffff',
    color: '#0f172a',
    border: '1px solid #cbd5e1',
    padding: '10px 18px',
    borderRadius: '8px',
    fontWeight: '600',
    cursor: 'pointer',
    fontSize: '0.9rem',
    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px'
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
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: '20px',
    marginBottom: '28px'
  },
  metricCard: {
    backgroundColor: '#ffffff',
    padding: '24px',
    borderRadius: '12px',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05)',
    display: 'flex',
    flexDirection: 'column',
    border: '1px solid #e2e8f0',
    position: 'relative',
    overflow: 'hidden'
  },
  metricLabel: {
    fontSize: '0.85rem',
    color: '#64748b',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  metricValue: {
    fontSize: '2.2rem',
    fontWeight: '800',
    marginTop: '6px',
    color: '#0f172a',
    letterSpacing: '-0.5px'
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    padding: '28px',
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.04), 0 4px 6px -4px rgba(0, 0, 0, 0.04)',
    marginBottom: '28px',
    border: '1px solid #e2e8f0'
  },
  cardTitle: {
    margin: '0 0 20px 0',
    fontSize: '1.3rem',
    color: '#0f172a',
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
    height: '46px',
    padding: '0 16px',
    borderRadius: '8px',
    border: '1.5px solid #cbd5e1',
    fontSize: '0.95rem',
    color: '#0f172a',
    backgroundColor: '#ffffff',
    fontWeight: '500',
    outline: 'none',
    boxShadow: 'none',
    boxSizing: 'border-box'
  },
  inputSmallDark: {
    width: '70px',
    height: '46px',
    padding: '0 8px',
    borderRadius: '8px',
    border: '1.5px solid #cbd5e1',
    fontSize: '0.95rem',
    color: '#0f172a',
    backgroundColor: '#ffffff',
    fontWeight: '700',
    textAlign: 'center',
    outline: 'none',
    boxSizing: 'border-box'
  },
  buttonPrimary: {
    backgroundColor: '#0f766e',
    color: '#ffffff',
    border: 'none',
    padding: '12px 20px',
    borderRadius: '8px',
    fontWeight: '700',
    cursor: 'pointer',
    fontSize: '0.95rem',
    height: '46px',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'background-color 0.2s',
    boxShadow: '0 4px 6px -1px rgba(15, 118, 110, 0.1), 0 2px 4px -2px rgba(15, 118, 110, 0.1)'
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
    border: '1px solid #cbd5e1',
    backgroundColor: '#ffffff',
    cursor: 'pointer',
    fontSize: '0.85rem',
    color: '#475569',
    fontWeight: '600',
    transition: 'all 0.2s ease'
  },
  tabButtonActive: {
    backgroundColor: '#0f766e',
    color: '#ffffff',
    borderColor: '#0f766e',
    boxShadow: '0 2px 4px rgba(15, 118, 110, 0.15)'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'left'
  },
  th: {
    borderBottom: '2px solid #cbd5e1',
    padding: '12px 14px',
    fontSize: '0.8rem',
    color: '#475569',
    textTransform: 'uppercase',
    fontWeight: '700',
    letterSpacing: '0.5px',
    verticalAlign: 'middle'
  },
  tr: {
    borderBottom: '1px solid #eeeeee'
  },
  td: {
    padding: '12px 14px',
    verticalAlign: 'middle',
    fontSize: '0.92rem',
    color: '#0f172a'
  },
  badgeEnviado: {
    backgroundColor: '#e0f2fe',
    color: '#0369a1',
    padding: '6px 12px',
    borderRadius: '12px',
    fontSize: '0.8rem',
    fontWeight: '700',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    whiteSpace: 'nowrap'
  },
  badgeSinEnviar: {
    backgroundColor: '#f1f5f9',
    color: '#475569',
    padding: '6px 12px',
    borderRadius: '12px',
    fontSize: '0.8rem',
    fontWeight: '600',
    border: '1px solid #e2e8f0',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    whiteSpace: 'nowrap'
  },
  badgeSuccess: {
    backgroundColor: '#d1e7dd',
    color: '#0f5132',
    padding: '6px 12px',
    borderRadius: '12px',
    fontSize: '0.82rem',
    fontWeight: '700',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    whiteSpace: 'nowrap'
  },
  badgeDanger: {
    backgroundColor: '#f8d7da',
    color: '#842029',
    padding: '6px 12px',
    borderRadius: '12px',
    fontSize: '0.82rem',
    fontWeight: '700',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    whiteSpace: 'nowrap'
  },
  badgeWarning: {
    backgroundColor: '#fff3cd',
    color: '#664d03',
    padding: '6px 12px',
    borderRadius: '12px',
    fontSize: '0.82rem',
    fontWeight: '700',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    whiteSpace: 'nowrap'
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
