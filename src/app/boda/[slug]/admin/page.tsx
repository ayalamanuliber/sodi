'use client';

import React, { use, useCallback, useMemo, useRef, useState, useEffect } from 'react';
import {
  Activity, Bell, Check, CheckCircle2, ChevronRight, ClipboardList, Copy, Download,
  Eye, FileUp, Gift, Headphones, Home, Link2, ListChecks, LogOut, Mail, Menu, MessageCircle,
  MoreHorizontal, Music2, Pencil, Plus, RefreshCw, Search, Send, Settings, Share2,
  Sparkles, Trash2, UserPlus, Users, Utensils, X,
} from 'lucide-react';
import './admin.css';

type View = 'resumen' | 'invitados' | 'envios' | 'respuestas' | 'invitacion' | 'configuracion';
type Filter = 'todos' | 'sin-enviar' | 'confirmados' | 'pendientes' | 'rechazados';
type ChartMode = 'lugares' | 'invitaciones';

interface ChartSegment {
  label: string;
  value: number;
  tone: 'confirmed' | 'waiting' | 'unsent' | 'declined' | 'unassigned';
}

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
  cancionSugerida?: string;
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

const DEFAULT_MESSAGE = 'Hola, {nombre}. Nos encantaría que nos acompañes en nuestro casamiento. Reservamos {pases} para vos.\n\nEn este enlace podés ver la invitación y confirmar tu asistencia:\n{enlace}';
const SODI_SUPPORT_WHATSAPP = 'https://wa.me/5491138696958?text=Hola%20SODI%2C%20necesito%20ayuda%20con%20mi%20panel%20de%20invitaciones.';

const navItems: Array<{ id: View; label: string; icon: React.ElementType }> = [
  { id: 'resumen', label: 'Resumen', icon: Home },
  { id: 'invitados', label: 'Invitados', icon: Users },
  { id: 'envios', label: 'Envíos', icon: Send },
  { id: 'respuestas', label: 'Respuestas', icon: MessageCircle },
  { id: 'invitacion', label: 'Invitación', icon: Mail },
  { id: 'configuracion', label: 'Configuración', icon: Settings },
];
const mobileNavItems = navItems.filter((item) => item.id !== 'invitacion');

function statusLabel(guest: Guest) {
  if (guest.estado === 'confirmado') return 'Asiste';
  if (guest.estado === 'rechazado') return 'No asiste';
  if (guest.enviado) return 'Esperando respuesta';
  return 'Por enviar';
}

function formatPases(count: number) {
  return count === 1 ? '1 lugar' : `${count} lugares`;
}

function buildMessage(template: string, guest: Guest, link: string) {
  return template
    .replaceAll('{nombre}', guest.nombre)
    .replaceAll('{pases}', formatPases(guest.pases))
    .replaceAll('{enlace}', link);
}

function ProgressRing({ value }: { value: number }) {
  const radius = 48;
  const circumference = 2 * Math.PI * radius;
  return (
    <div className="wa-progress-ring" aria-label={`${value}% del cupo asignado`}>
      <svg viewBox="0 0 112 112" aria-hidden="true">
        <circle className="wa-progress-ring__track" cx="56" cy="56" r={radius} />
        <circle className="wa-progress-ring__value" cx="56" cy="56" r={radius}
          strokeDasharray={circumference} strokeDashoffset={circumference * (1 - value / 100)} />
      </svg>
      <strong>{value}%</strong>
    </div>
  );
}

function DonutChart({ segments, centerValue, centerLabel }: { segments: ChartSegment[]; centerValue: string; centerLabel: string }) {
  const radius = 44;
  const circumference = 2 * Math.PI * radius;
  const total = Math.max(1, segments.reduce((sum, segment) => sum + segment.value, 0));
  const visibleSegments = segments.filter((segment) => segment.value > 0);
  const arcs = visibleSegments.map((segment, index) => ({
    segment,
    length: (segment.value / total) * circumference,
    offset: (visibleSegments.slice(0, index).reduce((sum, item) => sum + item.value, 0) / total) * circumference,
  }));

  return (
    <div className="wa-donut" role="img" aria-label={segments.map((segment) => `${segment.label}: ${segment.value}`).join(', ')}>
      <svg viewBox="0 0 108 108" aria-hidden="true">
        <circle className="wa-donut__track" cx="54" cy="54" r={radius} />
        {arcs.map(({ segment, length, offset }) => <circle key={segment.label} className={`wa-donut__segment is-${segment.tone}`} cx="54" cy="54" r={radius} strokeDasharray={`${length} ${circumference - length}`} strokeDashoffset={-offset} />)}
      </svg>
      <div><strong>{centerValue}</strong><span>{centerLabel}</span></div>
    </div>
  );
}

export default function WeddingAdminPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug = 'mirta-y-guillermo' } = use(params);
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [guests, setGuests] = useState<Guest[]>([]);
  const [view, setView] = useState<View>('resumen');
  const [filter, setFilter] = useState<Filter>('todos');
  const [chartMode, setChartMode] = useState<ChartMode>('lugares');
  const [search, setSearch] = useState('');
  const [notice, setNotice] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [createMode, setCreateMode] = useState<'single' | 'bulk'>('single');
  const [newName, setNewName] = useState('');
  const [newPasses, setNewPasses] = useState(2);
  const [newPhone, setNewPhone] = useState('');
  const [bulkText, setBulkText] = useState('');
  const [saving, setSaving] = useState(false);
  const [messageTemplate, setMessageTemplate] = useState(DEFAULT_MESSAGE);
  const [defaultMessage, setDefaultMessage] = useState(DEFAULT_MESSAGE);
  const [messageSaving, setMessageSaving] = useState(false);
  const [guestGoal, setGuestGoal] = useState(0);
  const [goalSaving, setGoalSaving] = useState(false);
  const [pendingSentGuest, setPendingSentGuest] = useState<Guest | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const messageRef = useRef<HTMLTextAreaElement>(null);

  const showNotice = useCallback((message: string) => {
    setNotice(message);
    window.setTimeout(() => setNotice(''), 3600);
  }, []);

  const expireSession = useCallback(() => {
    setAuthenticated(false);
    setLoginError('Tu sesión venció. Ingresá nuevamente para continuar.');
  }, []);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [guestResponse, settingsResponse] = await Promise.all([
        fetch(`/api/boda/invitados?slug=${encodeURIComponent(slug)}&t=${Date.now()}`),
        fetch(`/api/boda/configuracion?slug=${encodeURIComponent(slug)}&t=${Date.now()}`),
      ]);
      if (guestResponse.status === 401 || settingsResponse.status === 401) return expireSession();
      const guestData = await guestResponse.json();
      const settingsData = await settingsResponse.json();
      if (!guestResponse.ok || !guestData.success || !Array.isArray(guestData.guests)) {
        throw new Error(guestData.message || 'No se pudo cargar la lista');
      }
      setGuests(guestData.guests);
      if (settingsResponse.ok && settingsData.success) {
        setMessageTemplate(settingsData.settings.whatsappMessage);
        setDefaultMessage(settingsData.defaultMessage || DEFAULT_MESSAGE);
        setGuestGoal(settingsData.settings.guestGoal || 0);
      }
      setAuthenticated(true);
      setLoginError('');
    } catch (error) {
      console.error('Wedding admin load failed:', error);
      setLoginError('No pudimos cargar el panel. Revisá tu conexión e intentá nuevamente.');
    } finally {
      setLoading(false);
    }
  }, [expireSession, slug]);

  useEffect(() => { void loadData(); }, [loadData]);

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setLoginError('');
    try {
      const response = await fetch('/api/boda/admin/login', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password }),
      });
      if (!response.ok) return setLoginError('La contraseña no es correcta. Volvé a intentarlo.');
      setPassword('');
      await loadData();
    } catch {
      setLoginError('No pudimos acceder al panel. Revisá tu conexión.');
    } finally { setLoading(false); }
  };

  const mutateGuests = async (payload: Record<string, unknown>) => {
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 12_000);
    try {
      const response = await fetch('/api/boda/invitados', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, signal: controller.signal,
        body: JSON.stringify({ slug, ...payload }),
      });
      const data = await response.json();
      if (response.status === 401) { expireSession(); return null; }
      if (!response.ok || !data.success) throw new Error(data.message || 'No se pudo guardar el cambio');
      if (Array.isArray(data.guests)) setGuests(data.guests);
      return data;
    } finally { window.clearTimeout(timeout); }
  };

  const handleCreate = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    try {
      if (createMode === 'single') {
        const result = await mutateGuests({ action: 'add', nombre: newName, pases: newPasses, telefono: newPhone });
        if (!result) return;
        showNotice(`Invitación creada para ${newName.trim()}.`);
      } else {
        const parsed = bulkText.split('\n').map((line) => line.trim()).filter(Boolean).map((line) => {
          const separator = line.includes('|') ? /\s*\|\s*/ : /\s+-\s+/;
          const [nombre = '', pases = '2', telefono = ''] = line.split(separator).map((part) => part.trim());
          return { nombre, pases: Number.parseInt(pases, 10) || 2, telefono };
        });
        const result = await mutateGuests({ action: 'addMany', guests: parsed });
        if (!result) return;
        showNotice(`${parsed.length} invitaciones creadas correctamente.`);
      }
      setNewName(''); setNewPasses(2); setNewPhone(''); setBulkText(''); setCreateOpen(false);
    } catch (error) {
      const message = error instanceof DOMException && error.name === 'AbortError'
        ? 'La conexión tardó demasiado. Recargá la lista antes de volver a intentar.'
        : error instanceof Error ? error.message : 'No se pudo crear la invitación.';
      showNotice(message);
    } finally { setSaving(false); }
  };

  const handleToggleSent = async (guest: Guest, sent: boolean) => {
    try {
      await mutateGuests({ action: 'toggleEnviado', id: guest.id, enviado: sent });
      showNotice(sent ? `Marcaste la invitación de ${guest.nombre} como enviada.` : 'La invitación volvió a pendientes.');
    } catch { showNotice('No se pudo actualizar el estado.'); }
  };

  const handleDelete = async (guest: Guest) => {
    if (!window.confirm(`¿Eliminar la invitación de “${guest.nombre}”?`)) return;
    try { await mutateGuests({ action: 'delete', id: guest.id }); showNotice('Invitación eliminada.'); }
    catch { showNotice('No se pudo eliminar la invitación.'); }
  };

  const invitationLink = (guest: Guest) => `${window.location.origin}/boda/${slug}?i=${guest.id}`;
  const whatsappLink = (guest: Guest) => {
    const message = buildMessage(messageTemplate, guest, invitationLink(guest));
    const phone = guest.telefono.replace(/[^0-9]/g, '');
    return `https://api.whatsapp.com/send?${phone ? `phone=${encodeURIComponent(phone)}&` : ''}text=${encodeURIComponent(message)}`;
  };

  const openWhatsApp = (guest: Guest) => {
    window.open(whatsappLink(guest), '_blank', 'noopener,noreferrer');
    if (!guest.enviado) setPendingSentGuest(guest);
  };

  const copyInvitation = async (guest: Guest) => {
    try { await navigator.clipboard.writeText(invitationLink(guest)); showNotice(`Link de ${guest.nombre} copiado.`); }
    catch { showNotice('No se pudo copiar el enlace.'); }
  };

  const shareDemo = async () => {
    const url = `${window.location.origin}/boda/${slug}`;
    try {
      if (navigator.share) await navigator.share({ title: 'Mirta & Guillermo', text: 'Mirá nuestra invitación', url });
      else { await navigator.clipboard.writeText(url); showNotice('Link de demostración copiado.'); }
    } catch { /* The user may cancel the native share sheet. */ }
  };

  const saveMessage = async () => {
    setMessageSaving(true);
    try {
      const response = await fetch('/api/boda/configuracion', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, whatsappMessage: messageTemplate }),
      });
      const data = await response.json();
      if (response.status === 401) return expireSession();
      if (!response.ok || !data.success) throw new Error(data.message || 'No se pudo guardar el mensaje');
      setMessageTemplate(data.settings.whatsappMessage);
      showNotice('Mensaje de WhatsApp guardado.');
    } catch (error) { showNotice(error instanceof Error ? error.message : 'No se pudo guardar el mensaje.'); }
    finally { setMessageSaving(false); }
  };

  const saveGuestGoal = async () => {
    setGoalSaving(true);
    try {
      const response = await fetch('/api/boda/configuracion', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, guestGoal }),
      });
      const data = await response.json();
      if (response.status === 401) return expireSession();
      if (!response.ok || !data.success) throw new Error(data.message || 'No se pudo guardar el cupo');
      setGuestGoal(data.settings.guestGoal);
      showNotice('Cupo total guardado.');
    } catch (error) { showNotice(error instanceof Error ? error.message : 'No se pudo guardar el cupo.'); }
    finally { setGoalSaving(false); }
  };

  const insertVariable = (variable: string) => {
    const field = messageRef.current;
    if (!field) return;
    const start = field.selectionStart;
    const next = `${messageTemplate.slice(0, start)}${variable}${messageTemplate.slice(field.selectionEnd)}`;
    setMessageTemplate(next);
    requestAnimationFrame(() => { field.focus(); field.setSelectionRange(start + variable.length, start + variable.length); });
  };

  const logout = async () => {
    await fetch('/api/boda/admin/logout', { method: 'POST' });
    setAuthenticated(false); setGuests([]);
  };

  const exportCSV = () => {
    const cell = (value: unknown) => `"${String(value ?? '').replaceAll('"', '""')}"`;
    const rows = guests.map((guest) => [guest.nombre, guest.pases, guest.telefono, guest.enviado ? 'Sí' : 'No', statusLabel(guest), guest.respuesta?.pasesConfirmados || '', (guest.respuesta?.integrantes || []).join(', '), guest.respuesta?.menu || '', guest.respuesta?.notas || ''].map(cell));
    const csv = '\uFEFF' + [['Nombre', 'Lugares', 'Teléfono', 'Enviada', 'Estado', 'Confirmados', 'Integrantes', 'Menú', 'Notas'].map(cell), ...rows].map((row) => row.join(',')).join('\n');
    const anchor = document.createElement('a'); anchor.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    anchor.download = `invitados-${slug}.csv`; anchor.click(); URL.revokeObjectURL(anchor.href);
  };

  const stats = useMemo(() => {
    const sent = guests.filter((guest) => guest.enviado).length;
    const pending = guests.filter((guest) => guest.enviado && guest.estado === 'pendiente').length;
    const confirmed = guests.reduce((sum, guest) => sum + (guest.estado === 'confirmado' ? guest.respuesta?.pasesConfirmados || guest.pases : 0), 0);
    const declined = guests.reduce((sum, guest) => sum + (guest.estado === 'rechazado' ? guest.pases : 0), 0);
    const passes = guests.reduce((sum, guest) => sum + guest.pases, 0);
    return { sent, confirmed, declined, passes, unsent: guests.length - sent, pending };
  }, [guests]);
  const capacityProgress = guestGoal ? Math.min(100, Math.round((stats.passes / guestGoal) * 100)) : 0;
  const remainingCapacity = guestGoal - stats.passes;
  const chartSegments = useMemo<ChartSegment[]>(() => {
    const buckets = guests.reduce((result, guest) => {
      const amount = chartMode === 'lugares' ? guest.pases : 1;
      if (guest.estado === 'confirmado') result.confirmed += amount;
      else if (guest.estado === 'rechazado') result.declined += amount;
      else if (guest.enviado) result.waiting += amount;
      else result.unsent += amount;
      return result;
    }, { confirmed: 0, declined: 0, waiting: 0, unsent: 0 });

    const segments: ChartSegment[] = [
      { label: 'Confirmados', value: buckets.confirmed, tone: 'confirmed' },
      { label: 'Esperando respuesta', value: buckets.waiting, tone: 'waiting' },
      { label: 'Por enviar', value: buckets.unsent, tone: 'unsent' },
      { label: 'No asistirán', value: buckets.declined, tone: 'declined' },
    ];
    if (chartMode === 'lugares' && guestGoal > stats.passes) {
      segments.push({ label: 'Sin asignar', value: guestGoal - stats.passes, tone: 'unassigned' });
    }
    return segments;
  }, [chartMode, guestGoal, guests, stats.passes]);

  const menuStats = useMemo(() => {
    const counts = new Map<string, number>();
    guests.forEach((guest) => {
      if (guest.estado !== 'confirmado') return;
      const menu = guest.respuesta?.menu?.trim() || 'Sin especificar';
      counts.set(menu, (counts.get(menu) || 0) + (guest.respuesta?.pasesConfirmados || guest.pases));
    });
    return [...counts.entries()].sort((a, b) => b[1] - a[1]);
  }, [guests]);

  const filteredGuests = useMemo(() => guests.filter((guest) => {
    const matchesSearch = `${guest.nombre} ${guest.telefono}`.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'todos' || (filter === 'sin-enviar' && !guest.enviado)
      || (filter === 'confirmados' && guest.estado === 'confirmado')
      || (filter === 'pendientes' && guest.estado === 'pendiente')
      || (filter === 'rechazados' && guest.estado === 'rechazado');
    return matchesSearch && matchesFilter;
  }), [filter, guests, search]);

  const nextGuest = guests.find((guest) => !guest.enviado);
  const sampleGuest = guests[0] || { id: 'ejemplo', nombre: 'Julieta', pases: 2, telefono: '', estado: 'pendiente', creadoEn: '', vistoEn: null } as Guest;
  const publicOrigin = typeof window !== 'undefined' ? window.location.origin : 'https://www.sodi.com.ar';

  if (loading && !authenticated && !loginError) return (
    <main className="wa-login wa-session-loading">
      <section>
        <div className="wa-brand wa-brand--login"><strong>SODI</strong><span>BODAS</span></div>
        <RefreshCw className="wa-spin" aria-hidden="true" />
        <p>Preparando tu panel…</p>
      </section>
    </main>
  );

  if (!authenticated) return (
    <main className="wa-login">
      <section className="wa-login__card">
        <div className="wa-brand wa-brand--login"><strong>SODI</strong><span>BODAS</span></div>
        <p className="wa-eyebrow">Administración privada</p>
        <h1>Tu casamiento,<br />todo en orden.</h1>
        <p>Ingresá para administrar invitaciones y respuestas de Mirta & Guillermo.</p>
        <form onSubmit={handleLogin}>
          <label htmlFor="wedding-password">Contraseña</label>
          <input id="wedding-password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Ingresá tu contraseña" required />
          {loginError && <div className="wa-form-error" role="alert">{loginError}</div>}
          <button className="wa-button wa-button--primary wa-button--block" disabled={loading}>{loading ? 'Ingresando…' : 'Ingresar al panel'}</button>
        </form>
        <span className="wa-login__secure">Acceso protegido · SODI Bodas</span>
      </section>
    </main>
  );

  const selectView = (next: View) => {
    if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
    setView(next);
    setSidebarOpen(false);
  };

  return (
    <div className="wa-shell">
      {notice && <div className="wa-toast" role="status"><CheckCircle2 size={18} />{notice}</div>}
      <aside className={`wa-sidebar ${sidebarOpen ? 'is-open' : ''}`}>
        <button className="wa-sidebar__close" onClick={() => setSidebarOpen(false)} aria-label="Cerrar menú"><X /></button>
        <div className="wa-brand"><strong>SODI</strong><span>BODAS</span></div>
        <nav aria-label="Navegación principal">
          {navItems.map((item) => <button key={item.id} className={view === item.id ? 'is-active' : ''} onClick={() => selectView(item.id)}><item.icon size={19} />{item.label}</button>)}
        </nav>
        <a className="wa-sidebar__support" href={SODI_SUPPORT_WHATSAPP} target="_blank" rel="noreferrer"><Headphones size={18} /><span><strong>Soporte SODI</strong><small>Ayuda y sugerencias</small></span></a>
        <div className="wa-sidebar__profile"><span>M</span><div><strong>Mirta</strong><small>Administradora</small></div><MoreHorizontal size={18} /></div>
      </aside>

      <main className="wa-main">
        <header className="wa-topbar">
          <button className="wa-icon-button wa-menu-button" onClick={() => setSidebarOpen(true)} aria-label="Abrir menú"><Menu /></button>
          <div><p className="wa-eyebrow">Mirta & Guillermo · 13.11.2026</p><h1>{view === 'resumen' ? 'Hola, Mirta' : navItems.find((item) => item.id === view)?.label}</h1></div>
          <div className="wa-topbar__actions">
            <a className="wa-button wa-button--quiet" href={`/boda/${slug}`} target="_blank" rel="noreferrer"><Eye size={18} />Ver invitación</a>
            <button className="wa-button wa-button--primary" onClick={shareDemo}><Share2 size={18} />Compartir demo</button>
            <button className="wa-icon-button" aria-label="Notificaciones"><Bell size={19} /></button>
            <span className="wa-avatar">M</span>
          </div>
        </header>

        {loading ? <div className="wa-loading"><RefreshCw className="wa-spin" />Preparando tu panel…</div> : (
          <div className="wa-content">
            {view === 'resumen' && <>
              <section className="wa-progress-panel">
                <div><p className="wa-eyebrow">Planificación general</p><h2>Todo va tomando forma</h2><p>{guestGoal ? <>Ya asignaste <strong>{stats.passes} de {guestGoal}</strong> lugares.</> : <>Definí el cupo total para medir el avance de tu lista.</>}</p><div className="wa-progress-panel__actions">{nextGuest && <button className="wa-button wa-button--primary" onClick={() => { setView('envios'); }}><Send size={18} />Continuar enviando</button>}<button className="wa-button wa-button--outline" onClick={() => setCreateOpen(true)}><UserPlus size={18} />Agregar invitados</button>{!guestGoal && <button className="wa-button wa-button--outline" onClick={() => setView('configuracion')}><Settings size={18} />Definir cupo</button>}</div></div>
                <ProgressRing value={capacityProgress} />
                <div className="wa-progress-panel__note"><Sparkles size={22} /><span>{guestGoal ? remainingCapacity > 0 ? `Te quedan ${remainingCapacity} lugares por asignar` : remainingCapacity === 0 ? '¡Completaste el cupo planificado!' : `Superaste el cupo por ${Math.abs(remainingCapacity)}` : 'Configurá el cupo total de personas'}</span></div>
              </section>

              <section className="wa-metrics">
                <article><span className="wa-metric-icon wa-metric-icon--rose"><Mail /></span><div><strong>{stats.sent} / {guests.length}</strong><span>invitaciones enviadas</span></div></article>
                <article><span className="wa-metric-icon"><Users /></span><div><strong>{stats.passes}{guestGoal ? ` / ${guestGoal}` : ''}</strong><span>{guestGoal ? 'lugares planificados' : 'lugares asignados'}</span>{!guestGoal && <button className="wa-metric-link" onClick={() => setView('configuracion')}>Definir cupo total</button>}</div></article>
                <article><span className="wa-metric-icon wa-metric-icon--green"><CheckCircle2 /></span><div><strong>{stats.confirmed}</strong><span>personas confirmadas</span></div></article>
                <article><span className="wa-metric-icon wa-metric-icon--gold"><Activity /></span><div><strong>{stats.pending}</strong><span>respuestas pendientes</span></div></article>
              </section>

              <div className="wa-dashboard-grid">
                <section className="wa-panel wa-distribution"><div className="wa-panel__heading"><div><p className="wa-eyebrow">Estado de la lista</p><h2>Distribución</h2></div><div className="wa-chart-toggle"><button className={chartMode === 'lugares' ? 'is-active' : ''} onClick={() => setChartMode('lugares')}>Lugares</button><button className={chartMode === 'invitaciones' ? 'is-active' : ''} onClick={() => setChartMode('invitaciones')}>Invitaciones</button></div></div>
                  <div className="wa-chart-content"><DonutChart segments={chartSegments} centerValue={chartMode === 'lugares' ? guestGoal ? `${stats.passes}/${guestGoal}` : String(stats.passes) : `${stats.sent}/${guests.length}`} centerLabel={chartMode === 'lugares' ? 'asignados' : 'enviadas'} /><div className="wa-chart-legend">{chartSegments.map((segment) => <span key={segment.label}><i className={`is-${segment.tone}`} /><span>{segment.label}</span><strong>{segment.value}</strong></span>)}</div></div>
                  {chartMode === 'lugares' && guestGoal > 0 && <button className="wa-capacity-note" onClick={() => setView('configuracion')}>{stats.passes <= guestGoal ? `Quedan ${guestGoal - stats.passes} lugares por asignar` : `El cupo está superado por ${stats.passes - guestGoal}`}</button>}
                </section>

                <section className="wa-panel wa-next-step"><p className="wa-eyebrow">Tu próximo paso</p><Sparkles size={26} /><h2>{stats.unsent ? `Hay ${stats.unsent} invitaciones listas para enviar` : stats.pending ? 'Todas enviadas: esperemos las respuestas' : '¡La lista está al día!'}</h2><p>Podés detenerte y continuar cuando quieras.</p>{nextGuest ? <button className="wa-button wa-button--primary wa-button--block" onClick={() => openWhatsApp(nextGuest)}><MessageCircle size={18} />Enviar siguiente por WhatsApp</button> : <button className="wa-button wa-button--outline wa-button--block" onClick={() => setCreateOpen(true)}><Plus size={18} />Crear invitación</button>}</section>

                <section className="wa-panel wa-activity"><div className="wa-panel__heading"><div><p className="wa-eyebrow">Últimos movimientos</p><h2>Actividad y respuestas</h2></div><button onClick={() => setView('respuestas')}>Ver todas</button></div>
                  <div className="wa-activity__list">{guests.length ? guests.slice(0, 4).map((guest) => <div key={guest.id}><span className={`wa-status-dot is-${guest.estado}`} /><div><strong>{guest.nombre}</strong><small>{guest.estado === 'confirmado' ? `Confirmó ${guest.respuesta?.pasesConfirmados || guest.pases} personas` : guest.estado === 'rechazado' ? 'Avisó que no asistirá' : guest.vistoEn ? 'Abrió su invitación' : guest.enviado ? 'Esperando su respuesta' : 'Lista para enviar'}</small></div><span className={`wa-status is-${guest.estado}`}>{statusLabel(guest)}</span></div>) : <div className="wa-empty-inline">La actividad aparecerá cuando empieces a crear y enviar invitaciones.</div>}</div>
                </section>

                <section className="wa-panel wa-preferences"><div className="wa-panel__heading"><div><p className="wa-eyebrow">Respuestas</p><h2>Preferencias</h2></div><Utensils size={20} /></div>{menuStats.length ? <ul>{menuStats.slice(0, 5).map(([menu, count]) => <li key={menu}><span>{menu}</span><strong>{count}</strong></li>)}</ul> : <div className="wa-empty-inline">Las opciones de menú aparecerán cuando lleguen confirmaciones.</div>}<button className="wa-text-button" onClick={() => setView('respuestas')}>Ver todas las respuestas <ChevronRight size={16} /></button></section>

                <section className="wa-panel wa-quick-actions"><p className="wa-eyebrow">Atajos</p><h2>Acciones rápidas</h2><div><button onClick={() => setCreateOpen(true)}><UserPlus />Crear invitaciones</button><button onClick={() => { setCreateMode('bulk'); setCreateOpen(true); }}><FileUp />Importar lista</button><button onClick={() => setView('configuracion')}><Pencil />Editar mensaje</button><button onClick={() => setView('envios')}><Bell />Ver pendientes</button></div></section>
              </div>
            </>}

            {view === 'invitados' && <section className="wa-view">
              <div className="wa-view__heading"><div><p className="wa-eyebrow">Tu lista</p><h2>{guests.length} invitaciones · {stats.passes} lugares</h2><p>Buscá, corregí y administrá cada invitación desde un solo lugar.</p></div><div><button className="wa-button wa-button--outline" onClick={() => { setCreateMode('bulk'); setCreateOpen(true); }}><FileUp size={18} />Crear varias</button><button className="wa-button wa-button--primary" onClick={() => { setCreateMode('single'); setCreateOpen(true); }}><Plus size={18} />Nueva invitación</button></div></div>
              <div className="wa-list-tools"><label><Search size={18} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar por nombre o teléfono" /></label><div>{(['todos', 'sin-enviar', 'confirmados', 'pendientes', 'rechazados'] as Filter[]).map((item) => <button key={item} className={filter === item ? 'is-active' : ''} onClick={() => setFilter(item)}>{item === 'todos' ? 'Todos' : item === 'sin-enviar' ? 'Por enviar' : item === 'confirmados' ? 'Asisten' : item === 'rechazados' ? 'No asisten' : 'Pendientes'}</button>)}</div></div>
              <GuestList guests={filteredGuests} onWhatsApp={openWhatsApp} onCopy={copyInvitation} onToggle={handleToggleSent} onDelete={handleDelete} />
            </section>}

            {view === 'envios' && <section className="wa-view">
              <div className="wa-view__heading"><div><p className="wa-eyebrow">Envíos por WhatsApp</p><h2>{stats.unsent ? `${stats.unsent} invitaciones por enviar` : 'Todos los envíos están al día'}</h2><p>Avanzá de a una. El panel guarda tu progreso para que continúes cuando quieras.</p></div><button className="wa-button wa-button--outline" onClick={() => setView('configuracion')}><Pencil size={18} />Editar mensaje</button></div>
              <div className="wa-send-layout"><div className="wa-panel wa-send-preview"><p className="wa-eyebrow">Mensaje actual</p><h2>Así llegará la invitación</h2><div className="wa-chat-preview"><strong>{sampleGuest.nombre}</strong><p>{buildMessage(messageTemplate, sampleGuest, `${publicOrigin}/boda/${slug}?i=...`)}</p></div><button className="wa-text-button" onClick={() => setView('configuracion')}>Modificar mensaje <ChevronRight size={16} /></button></div><div className="wa-send-queue"><h3>Lista para enviar</h3>{guests.filter((guest) => !guest.enviado).length ? guests.filter((guest) => !guest.enviado).map((guest, index) => <article key={guest.id}><span>{index + 1}</span><div><strong>{guest.nombre}</strong><small>{formatPases(guest.pases)} · {guest.telefono || 'Sin teléfono cargado'}</small></div><button className="wa-button wa-button--primary" onClick={() => openWhatsApp(guest)}><MessageCircle size={17} />Enviar</button></article>) : <div className="wa-empty-state"><CheckCircle2 /><h3>Terminaste los envíos</h3><p>Cuando agregues nuevos invitados aparecerán acá.</p></div>}</div></div>
            </section>}

            {view === 'respuestas' && <section className="wa-view"><div className="wa-view__heading"><div><p className="wa-eyebrow">RSVP</p><h2>Respuestas y preferencias</h2><p>Todo lo que necesitás comunicarle al salón, sin revisar mensajes uno por uno.</p></div><button className="wa-button wa-button--outline" onClick={exportCSV}><Download size={18} />Descargar lista</button></div><section className="wa-metrics wa-metrics--compact"><article><span className="wa-metric-icon wa-metric-icon--green"><Check /></span><div><strong>{stats.confirmed}</strong><span>personas confirmadas</span></div></article><article><span className="wa-metric-icon wa-metric-icon--rose"><X /></span><div><strong>{stats.declined}</strong><span>lugares liberados</span></div></article><article><span className="wa-metric-icon wa-metric-icon--gold"><Activity /></span><div><strong>{stats.pending}</strong><span>invitaciones pendientes</span></div></article></section><GuestList guests={guests.filter((guest) => guest.estado !== 'pendiente')} onWhatsApp={openWhatsApp} onCopy={copyInvitation} onToggle={handleToggleSent} onDelete={handleDelete} detailed /></section>}

            {view === 'invitacion' && <section className="wa-view"><div className="wa-view__heading"><div><p className="wa-eyebrow">Vista pública</p><h2>La invitación de Mirta & Guillermo</h2><p>Esta vista no contiene datos personales y podés compartirla como demostración.</p></div><div><button className="wa-button wa-button--outline" onClick={shareDemo}><Share2 size={18} />Compartir demo</button><a className="wa-button wa-button--primary" href={`/boda/${slug}`} target="_blank" rel="noreferrer"><Eye size={18} />Abrir completa</a></div></div><div className="wa-preview-frame"><iframe src={`/boda/${slug}`} title="Vista previa de la invitación" /></div></section>}

            {view === 'configuracion' && <section className="wa-view"><div className="wa-view__heading"><div><p className="wa-eyebrow">Personalización</p><h2>Preferencias del panel</h2><p>Definí el cupo de invitados y el mensaje que se completa automáticamente al enviar.</p></div></div><div className="wa-settings-grid"><section className="wa-panel wa-goal-setting"><span className="wa-setting-icon"><Users /></span><div><p className="wa-eyebrow">Planificación</p><h3>Cupo total de invitados</h3><p>La cantidad máxima de personas que pensás invitar.</p></div><label><span>Personas</span><input type="number" min="1" max="2000" value={guestGoal || ''} onChange={(event) => setGuestGoal(Number(event.target.value) || 0)} placeholder="Ej: 100" inputMode="numeric" /></label><button className="wa-button wa-button--primary" onClick={saveGuestGoal} disabled={goalSaving || guestGoal < 1}><Check size={18} />{goalSaving ? 'Guardando…' : 'Guardar cupo'}</button></section><section className="wa-panel wa-support-panel"><span className="wa-setting-icon"><Headphones /></span><div><p className="wa-eyebrow">Estamos para ayudarte</p><h3>Soporte SODI</h3><p>¿Tenés una duda o una sugerencia para mejorar el panel?</p></div><div><a className="wa-button wa-button--outline" href={SODI_SUPPORT_WHATSAPP} target="_blank" rel="noreferrer"><MessageCircle size={18} />WhatsApp</a><a className="wa-button wa-button--quiet" href="mailto:contacto@sodi.com.ar"><Mail size={18} />contacto@sodi.com.ar</a></div></section></div><div className="wa-section-heading"><p className="wa-eyebrow">Mensaje de invitación</p><h2>WhatsApp personalizado</h2><p>Escribilo con tus palabras. El nombre, los lugares y el enlace se completan solos.</p></div><div className="wa-message-editor"><section className="wa-panel"><label htmlFor="message-template">Mensaje predeterminado</label><div className="wa-variable-row"><span>Insertar:</span>{['{nombre}', '{pases}', '{enlace}'].map((variable) => <button key={variable} onClick={() => insertVariable(variable)}>{variable.replace(/[{}]/g, '')}</button>)}</div><textarea id="message-template" ref={messageRef} value={messageTemplate} onChange={(event) => setMessageTemplate(event.target.value)} rows={10} /><div className="wa-editor-actions"><button className="wa-button wa-button--primary" onClick={saveMessage} disabled={messageSaving}><Check size={18} />{messageSaving ? 'Guardando…' : 'Guardar mensaje'}</button><button className="wa-button wa-button--quiet" onClick={() => setMessageTemplate(defaultMessage)}><RefreshCw size={17} />Restaurar original</button></div><p className="wa-editor-help"><Link2 size={16} />El enlace personal está protegido: el mensaje no se guarda si falta la variable “enlace”.</p></section><section className="wa-panel wa-message-preview"><p className="wa-eyebrow">Vista previa</p><h3>{sampleGuest.nombre}</h3><div>{buildMessage(messageTemplate, sampleGuest, `${publicOrigin}/boda/${slug}?i=...`)}</div></section></div><section className="wa-panel wa-account-panel"><div><Settings /><span><strong>Herramientas del panel</strong><small>Exportá una copia o cerrá tu sesión de forma segura.</small></span></div><div><button className="wa-button wa-button--outline" onClick={exportCSV}><Download size={18} />Descargar lista</button><button className="wa-button wa-button--danger" onClick={logout}><LogOut size={18} />Cerrar sesión</button></div></section></section>}
          </div>
        )}
      </main>

      <nav className="wa-mobile-nav" aria-label="Navegación móvil">{mobileNavItems.map((item) => <button key={item.id} className={view === item.id ? 'is-active' : ''} onClick={() => selectView(item.id)}><item.icon /><span>{item.label}</span></button>)}</nav>
      <button className="wa-mobile-add" onClick={() => setCreateOpen(true)} aria-label="Crear invitación"><Plus /></button>

      {createOpen && <div className="wa-modal" role="dialog" aria-modal="true" aria-labelledby="create-title"><section className="wa-modal__card"><button className="wa-modal__close" onClick={() => setCreateOpen(false)} aria-label="Cerrar"><X /></button><p className="wa-eyebrow">Agregar invitados</p><h2 id="create-title">Crear invitaciones</h2><div className="wa-segmented"><button className={createMode === 'single' ? 'is-active' : ''} onClick={() => setCreateMode('single')}><UserPlus />Una invitación</button><button className={createMode === 'bulk' ? 'is-active' : ''} onClick={() => setCreateMode('bulk')}><ListChecks />Crear varias</button></div><form onSubmit={handleCreate}>{createMode === 'single' ? <div className="wa-form-grid"><label className="is-wide">Nombre o familia<input value={newName} onChange={(event) => setNewName(event.target.value)} placeholder="Ej: Familia Pérez" required /></label><label>Lugares<input type="number" min="1" max="20" value={newPasses} onChange={(event) => setNewPasses(Number(event.target.value) || 1)} required /></label><label>WhatsApp<input value={newPhone} onChange={(event) => setNewPhone(event.target.value)} placeholder="Ej: 1162337552" inputMode="tel" /></label></div> : <><label>Una invitación por línea</label><textarea value={bulkText} onChange={(event) => setBulkText(event.target.value)} rows={8} placeholder={'Familia Pérez - 4 - 1155551234\nJulieta Gómez - 2 - 1166667890\nMartín López - 1'} required /><div className="wa-bulk-summary"><ClipboardList /><span><strong>{bulkText.split('\n').filter((line) => line.trim()).length} invitaciones</strong><small>Formato: nombre - lugares - teléfono</small></span></div></>}<button className="wa-button wa-button--primary wa-button--block" disabled={saving}>{saving ? 'Creando invitaciones…' : createMode === 'single' ? 'Crear invitación' : 'Crear todas las invitaciones'}</button></form></section></div>}

      {pendingSentGuest && <div className="wa-modal" role="dialog" aria-modal="true"><section className="wa-modal__card wa-confirm-send"><span className="wa-confirm-send__icon"><MessageCircle /></span><p className="wa-eyebrow">Seguimiento</p><h2>¿Pudiste enviarle la invitación a {pendingSentGuest.nombre}?</h2><p>WhatsApp no nos avisa si finalmente tocaste “Enviar”. Confirmalo para mantener la lista al día.</p><div><button className="wa-button wa-button--primary" onClick={async () => { await handleToggleSent(pendingSentGuest, true); setPendingSentGuest(null); }}><Check size={18} />Sí, fue enviada</button><button className="wa-button wa-button--quiet" onClick={() => setPendingSentGuest(null)}>Todavía no</button></div></section></div>}
    </div>
  );
}

function GuestList({ guests, onWhatsApp, onCopy, onToggle, onDelete, detailed = false }: { guests: Guest[]; onWhatsApp: (guest: Guest) => void; onCopy: (guest: Guest) => void; onToggle: (guest: Guest, sent: boolean) => void; onDelete: (guest: Guest) => void; detailed?: boolean }) {
  if (!guests.length) return <div className="wa-empty-state"><Users /><h3>No hay invitaciones en esta sección</h3><p>Probá otro filtro o creá una nueva invitación.</p></div>;
  return <div className="wa-guest-list">{guests.map((guest) => <article key={guest.id} className="wa-guest-card"><div className="wa-guest-card__avatar">{guest.nombre.charAt(0).toUpperCase()}</div><div className="wa-guest-card__main"><div><h3>{guest.nombre}</h3><span className={`wa-status is-${guest.estado}`}>{statusLabel(guest)}</span></div><p>{formatPases(guest.pases)} · {guest.telefono || 'Sin teléfono'}</p>{detailed && guest.respuesta && <div className="wa-guest-card__details"><span><Users />{guest.respuesta.pasesConfirmados} asistentes</span><span><Utensils />{guest.respuesta.menu || 'Menú sin definir'}</span>{guest.respuesta.cancion && <span><Music2 />{guest.respuesta.cancion}</span>}{guest.respuesta.notas && <span><Gift />{guest.respuesta.notas}</span>}</div>}</div><div className="wa-guest-card__meta"><span>{guest.vistoEn ? 'Invitación abierta' : guest.enviado ? 'Enviada, sin abrir' : 'Todavía no enviada'}</span><small>{guest.enviadoEn ? new Date(guest.enviadoEn).toLocaleDateString('es-AR') : ''}</small></div><div className="wa-guest-card__actions"><button className="wa-button wa-button--whatsapp" onClick={() => onWhatsApp(guest)}><MessageCircle size={17} />{guest.enviado ? 'Reenviar' : 'Enviar'}</button><button className="wa-icon-button" onClick={() => onCopy(guest)} aria-label={`Copiar enlace de ${guest.nombre}`}><Copy size={17} /></button><button className="wa-icon-button" onClick={() => onToggle(guest, !guest.enviado)} aria-label={guest.enviado ? 'Marcar como no enviada' : 'Marcar como enviada'}>{guest.enviado ? <RefreshCw size={17} /> : <Check size={17} />}</button><button className="wa-icon-button wa-icon-button--danger" onClick={() => onDelete(guest)} aria-label={`Eliminar invitación de ${guest.nombre}`}><Trash2 size={17} /></button></div></article>)}</div>;
}
