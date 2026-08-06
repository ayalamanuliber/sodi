'use client';

import React, { useEffect, useState, useRef, use } from 'react';
import Script from 'next/script';

interface GuestData {
  id: string;
  nombre: string;
  pases: number;
  estado: string;
  respuesta?: any;
}

export default function DynamicBodaPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = use(params);
  const slug = resolvedParams.slug || 'mirta-y-guillermo';

  const [guest, setGuest] = useState<GuestData | null>(null);
  const [code, setCode] = useState<string>('');
  const [openingClosed, setOpeningClosed] = useState(false);
  const [musicPlaying, setMusicPlaying] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [searchInput, setSearchInput] = useState('');

  // Form State
  const [rsvpName, setRsvpName] = useState('');
  const [attendance, setAttendance] = useState<'confirmado' | 'no'>('confirmado');
  const [pasesConfirmados, setPasesConfirmados] = useState(1);
  const [menu, setMenu] = useState('Tradicional');
  const [notes, setNotes] = useState('');
  const [song, setSong] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Modals
  const [giftsOpen, setGiftsOpen] = useState(false);
  const [playlistOpen, setPlaylistOpen] = useState(false);
  const [copyToast, setCopyToast] = useState('');

  // Countdown
  const [days, setDays] = useState('00');
  const [hours, setHours] = useState('00');
  const [minutes, setMinutes] = useState('00');

  const audioRef = useRef<HTMLAudioElement | null>(null);

  const STORAGE_KEY = `sodi_boda_guests_${slug}`;

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const c = searchParams.get('i') || searchParams.get('inv') || searchParams.get('code') || '';
    if (c) {
      setCode(c);
      fetchGuest(c);
    }
  }, [slug]);

  const fetchGuest = async (c: string) => {
    try {
      const res = await fetch(`/api/boda/invitados?slug=${encodeURIComponent(slug)}&code=${encodeURIComponent(c)}`);
      const data = await res.json();
      if (data.success && data.guest) {
        setGuest(data.guest);
        setRsvpName(data.guest.nombre);
        setPasesConfirmados(data.guest.pases);

        // Update local storage so admin panel on same browser updates instantly
        if (typeof window !== 'undefined') {
          try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
              const list: any[] = JSON.parse(stored);
              const idx = list.findIndex(g => g.id.toLowerCase() === c.toLowerCase());
              if (idx !== -1) {
                list[idx].vistoEn = data.guest.vistoEn || new Date().toISOString();
                localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
              }
            }
          } catch (e) {}
        }
      }
    } catch (e) {
      console.error('Error loading guest data:', e);
    }
  };

  useEffect(() => {
    const targetDate = new Date('2026-11-13T20:30:00-03:00').getTime();
    const updateCountdown = () => {
      const now = new Date().getTime();
      const diff = targetDate - now;
      if (diff <= 0) {
        setDays('00');
        setHours('00');
        setMinutes('00');
        return;
      }
      const d = Math.floor(diff / (1000 * 60 * 60 * 24));
      const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      setDays(String(d).padStart(2, '0'));
      setHours(String(h).padStart(2, '0'));
      setMinutes(String(m).padStart(2, '0'));
    };
    updateCountdown();
    const timer = setInterval(updateCountdown, 10000);
    return () => clearInterval(timer);
  }, []);

  const toggleMusic = () => {
    if (!audioRef.current) return;
    if (musicPlaying) {
      audioRef.current.pause();
      setMusicPlaying(false);
    } else {
      audioRef.current.play().then(() => setMusicPlaying(true)).catch(console.error);
    }
  };

  const handleOpenEnvelope = () => {
    setOpeningClosed(true);
    if (audioRef.current && !musicPlaying) {
      audioRef.current.play().then(() => setMusicPlaying(true)).catch(() => {});
    }
  };

  const handleSearchGuest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchInput.trim()) return;
    fetchGuest(searchInput.trim());
    setSearchModalOpen(false);
  };

  const handleRsvpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const payload = {
      slug,
      code: guest?.id || code || '',
      nombre: rsvpName,
      asistencia: attendance,
      pasesConfirmados: attendance === 'confirmado' ? pasesConfirmados : 0,
      integrantes: [rsvpName],
      menu,
      notas: notes,
      cancion: song
    };

    try {
      await fetch('/api/boda/rsvp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      setSubmitted(true);

      // Also update local storage if available
      if (typeof window !== 'undefined' && (guest?.id || code)) {
        try {
          const stored = localStorage.getItem(STORAGE_KEY);
          if (stored) {
            const list: any[] = JSON.parse(stored);
            const targetId = guest?.id || code;
            const idx = list.findIndex(g => g.id.toLowerCase() === targetId.toLowerCase());
            if (idx !== -1) {
              list[idx].estado = attendance;
              list[idx].respuesta = {
                asistencia: attendance,
                pasesConfirmados: attendance === 'confirmado' ? pasesConfirmados : 0,
                integrantes: [rsvpName],
                menu,
                notas: notes,
                cancion: song,
                fechaRespuesta: new Date().toISOString()
              };
              localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
            }
          }
        } catch (e) {}
      }

      const pasesMsg = attendance === 'confirmado' ? `Sí, confirmo (${pasesConfirmados} pases)` : 'No puedo asistir';
      const msg = `¡Hola Mirta! Confirmación de asistencia para la boda:\n\n• Invitado: ${rsvpName}\n• Asistencia: ${pasesMsg}\n• Menú: ${menu}${notes ? `\n• Comentario: ${notes}` : ''}${song ? `\n• Canción sugerida: ${song}` : ''}`;
      const waUrl = `https://api.whatsapp.com/send?phone=5491162337552&text=${encodeURIComponent(msg)}`;
      window.open(waUrl, '_blank');
    } catch (e) {
      alert('Ocurrió un error al enviar tu confirmación.');
    } finally {
      setSubmitting(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopyToast(`¡${label} copiado al portapapeles!`);
    setTimeout(() => setCopyToast(''), 3000);
  };

  return (
    <>
      {/* Google Fonts */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;1,400&family=Italianno&family=Montserrat:wght@400;500;600&display=swap" rel="stylesheet" />
      <link rel="stylesheet" href="/boda/invitacion-premium-prod.css?v=20260805" />
      <Script src="https://unpkg.com/lucide@latest/dist/umd/lucide.min.js" strategy="afterInteractive" />

      {/* Audio Element */}
      <audio ref={audioRef} src="/boda/assets/perfect-ed-sheeran.mp3" preload="auto" loop />

      {/* Envelope Overlay */}
      {!openingClosed && (
        <div className="opening" id="envelopeLayer" role="dialog" aria-modal="true">
          <div className="opening__ambient opening__ambient--left"></div>
          <div className="opening__ambient opening__ambient--right"></div>
          <div className="envelope-scene">
            <p className="opening__eyebrow">
              {guest ? `Especialmente para ${guest.nombre}` : 'Una invitación especial'}
            </p>
            <div className="envelope">
              <div className="envelope__back"></div>
              <div className="envelope__letter">
                <span className="monogram">M · G</span>
                <h1>Invitación de boda</h1>
                <p>13 de noviembre de 2026</p>
                {guest && <p style={{ fontSize: '0.85rem', color: '#8b6f4e', marginTop: '4px' }}>{guest.pases} pases reservados</p>}
              </div>
              <div className="envelope__front"></div>
              <button className="wax-seal" onClick={handleOpenEnvelope} type="button" aria-label="Abrir invitación">
                <span>M · G</span>
              </button>
            </div>
            <button className="opening__action" onClick={handleOpenEnvelope} type="button">
              <span>Abrir invitación</span>
            </button>
          </div>
        </div>
      )}

      {/* Site Header with Clean Integrated Audio Button */}
      <header className="site-header" id="siteHeader">
        <a className="site-header__brand" href="#hero">
          <span>M · G</span>
        </a>
        <div className="site-header__actions" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Header Music Button - Clean and unobtrusive */}
          <button
            onClick={toggleMusic}
            type="button"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: musicPlaying ? '#355844' : '#ffffff',
              color: musicPlaying ? '#ffffff' : '#355844',
              border: '1.5px solid #355844',
              padding: '6px 12px',
              borderRadius: '20px',
              fontWeight: '600',
              fontSize: '0.8rem',
              cursor: 'pointer'
            }}
          >
            <span>{musicPlaying ? '🔊 Música' : '🎵 Música'}</span>
          </button>

          <a href="#rsvp" className="header-rsvp">Confirmar</a>
        </div>
      </header>

      <main id="mainContent">
        {/* Hero */}
        <section className="hero" id="hero">
          <img className="hero__image" src="/boda/assets/couple-portada.png" alt="Mirta y Guillermo" />
          <div className="hero__shade"></div>
          <div className="hero__content">
            {guest ? (
              <p className="hero__kicker">¡Hola {guest.nombre}! Tienen {guest.pases} pases reservados</p>
            ) : (
              <p className="hero__kicker">Nos casamos</p>
            )}
            <h1 id="coupleNames">Mirta <span>&</span> Guillermo</h1>
            <div className="hero__rule"></div>
            <p className="hero__date">Viernes 13 de noviembre de 2026</p>
            <blockquote>Hay momentos que merecen celebrarse con quienes forman parte de nuestra historia.</blockquote>
            <a href="#rsvp" className="button button--champagne">
              Confirmar asistencia
            </a>
          </div>
        </section>

        {/* Story */}
        <section className="story section-shell" id="story">
          <figure className="story__media">
            <img src="/boda/assets/couple-current.jpg" alt="Mirta y Guillermo" loading="lazy" />
          </figure>
          <div className="story__copy">
            <span className="section-number">01</span>
            <p className="eyebrow">Nuestra celebración</p>
            <h2>Una historia compartida,<br />una noche para celebrar.</h2>
            <p>Queremos reunir a las personas que forman parte de nuestro camino y brindar juntos por todo lo vivido y por lo que viene.</p>
          </div>
        </section>

        {/* Events */}
        <section className="events section-shell">
          <div className="section-heading">
            <p className="eyebrow">Dónde y cuándo</p>
            <h2>El día que elegimos</h2>
          </div>
          <div className="events__grid">
            <article className="event">
              <span className="event__index">I</span>
              <p className="event__type">Ceremonia</p>
              <h3>Parroquia Santuario Nuestra Señora de la Medalla Milagrosa</h3>
              <p className="event__time">20:30 hs</p>
              <p className="event__address">Curapaligüe 1185, Parque Chacabuco, CABA</p>
              <a className="text-link" href="https://maps.google.com/?q=Curapalig%C3%BCe+1185,+Parque+Chacabuco,+CABA" target="_blank" rel="noopener noreferrer">
                📍 Abrir ubicación en Google Maps
              </a>
            </article>
            <div className="events__divider">❀</div>
            <article className="event">
              <span className="event__index">II</span>
              <p className="event__type">Celebración</p>
              <h3>Recepciones Craigmhor</h3>
              <p className="event__time">21:30 hs</p>
              <p className="event__address">Francisco Bilbao 2390, CABA</p>
              <a className="text-link" href="https://maps.google.com/?q=Recepciones+Craigmhor,+Francisco+Bilbao+2390,+CABA" target="_blank" rel="noopener noreferrer">
                📍 Abrir ubicación en Google Maps
              </a>
            </article>
          </div>
        </section>

        {/* Gallery */}
        <section className="gallery">
          <div className="gallery__heading">
            <p className="eyebrow">Nuestra historia</p>
            <h2>Instantes que guardamos</h2>
          </div>
          <div className="gallery__grid">
            <figure className="gallery__item gallery__item--portrait">
              <img src="/boda/assets/couple-hero.jpg" alt="Recuerdo" loading="lazy" />
            </figure>
            <figure className="gallery__item gallery__item--wide gallery__item--mono">
              <img src="/boda/assets/couple-mono.jpg" alt="Recuerdo" loading="lazy" />
            </figure>
            <figure className="gallery__item gallery__item--detail">
              <img src="/boda/assets/couple-current.jpg" alt="Recuerdo" loading="lazy" />
            </figure>
            <figure className="gallery__item gallery__item--dinner">
              <img src="/boda/assets/table-candle.jpg" alt="Mesa" loading="lazy" />
            </figure>
          </div>
        </section>

        {/* Countdown */}
        <section className="countdown">
          <img className="countdown__image" src="/boda/assets/couple-mono.jpg" alt="" loading="lazy" />
          <div className="countdown__shade"></div>
          <div className="countdown__content">
            <p className="eyebrow">Faltan</p>
            <div className="countdown__numbers">
              <div><strong>{days}</strong><span>Días</span></div>
              <div><strong>{hours}</strong><span>Horas</span></div>
              <div><strong>{minutes}</strong><span>Minutos</span></div>
            </div>
          </div>
        </section>

        {/* Important Details */}
        <section className="details section-shell">
          <div className="section-heading">
            <p className="eyebrow">Todo lo necesario</p>
            <h2>Información importante</h2>
          </div>
          <div className="details__grid">
            <article className="detail detail--dress">
              <h3>Dress code</h3>
              <p>Formal elegante</p>
              <div className="dress-code-note">
                <span className="dress-code-swatch" style={{ backgroundColor: '#14213d' }}></span>
                <span>Azul marino reservado para el novio</span>
              </div>
            </article>
            <button className="detail detail--button" onClick={() => setGiftsOpen(true)} type="button">
              <h3>Regalos</h3>
              <p>Datos bancarios</p>
            </button>
            <button className="detail detail--button" onClick={() => setPlaylistOpen(true)} type="button">
              <h3>Playlist</h3>
              <p>Sugerí una canción</p>
            </button>
          </div>
        </section>

        {/* RSVP Section */}
        <section className="rsvp" id="rsvp">
          <div className="rsvp__intro">
            <span className="section-number">03</span>
            <p className="eyebrow">Nos encantaría contar con vos</p>
            <h2>Confirmar asistencia</h2>
            <p className="rsvp__deadline">Confirmar antes del 13 de octubre de 2026</p>
            {guest && (
              <div style={{ backgroundColor: '#fff', padding: '12px', borderRadius: '8px', marginBottom: '16px', borderLeft: '4px solid #8b6f4e' }}>
                <strong>Invitación para: {guest.nombre}</strong> ({guest.pases} pases máximos permitidos)
              </div>
            )}
          </div>

          {submitted ? (
            <div style={{ padding: '30px', textAlign: 'center', backgroundColor: '#e8f5e9', borderRadius: '12px', color: '#2e7d32' }}>
              <h3>¡Gracias por confirmar tu asistencia! 🎉</h3>
              <p>Tu respuesta fue registrada y enviada a Mirta por WhatsApp.</p>
            </div>
          ) : (
            <form className="rsvp-form" onSubmit={handleRsvpSubmit}>
              <div className="field field--full">
                <label htmlFor="rsvpName">Nombre y apellido</label>
                <input
                  id="rsvpName"
                  name="name"
                  value={rsvpName}
                  onChange={(e) => setRsvpName(e.target.value)}
                  required
                />
              </div>

              <fieldset className="attendance field--full">
                <legend>¿Vas a acompañarnos?</legend>
                <label>
                  <input
                    type="radio"
                    name="attendance"
                    value="confirmado"
                    checked={attendance === 'confirmado'}
                    onChange={() => setAttendance('confirmado')}
                  />
                  <span>Sí, confirmo</span>
                </label>
                <label>
                  <input
                    type="radio"
                    name="attendance"
                    value="no"
                    checked={attendance === 'no'}
                    onChange={() => setAttendance('no')}
                  />
                  <span>No puedo asistir</span>
                </label>
              </fieldset>

              {attendance === 'confirmado' && (
                <>
                  <div className="field field--full">
                    <label htmlFor="pasesConfirmados">Cantidad de personas asistiendo (Máximo {guest ? guest.pases : 10}):</label>
                    <select
                      id="pasesConfirmados"
                      value={pasesConfirmados}
                      onChange={(e) => setPasesConfirmados(parseInt(e.target.value, 10))}
                    >
                      {Array.from({ length: guest ? guest.pases : 10 }, (_, i) => i + 1).map(n => (
                        <option key={n} value={n}>{n} {n === 1 ? 'persona' : 'personas'}</option>
                      ))}
                    </select>
                  </div>

                  <div className="field field--full">
                    <label htmlFor="rsvpMenu">Preferencia de menú</label>
                    <select id="rsvpMenu" value={menu} onChange={(e) => setMenu(e.target.value)}>
                      <option>Tradicional</option>
                      <option>Vegetariano</option>
                      <option>Vegano</option>
                      <option>Sin TACC</option>
                    </select>
                  </div>

                  <div className="field field--full">
                    <label htmlFor="rsvpNotes">Alergias o comentarios</label>
                    <input id="rsvpNotes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Opcional" />
                  </div>
                </>
              )}

              <button className="button button--wine field--full" type="submit" disabled={submitting}>
                {submitting ? 'Enviando...' : 'Confirmar y Enviar por WhatsApp'}
              </button>
            </form>
          )}

          {!guest && (
            <p style={{ marginTop: '20px', textAlign: 'center', fontSize: '0.9rem' }}>
              ¿Buscás tu invitación personalizada? <button type="button" onClick={() => setSearchModalOpen(true)} style={{ background: 'none', border: 'none', color: '#8b6f4e', textDecoration: 'underline', cursor: 'pointer' }}>Ingresá tu código o apellido</button>
            </p>
          )}
        </section>

        {/* Closing */}
        <section className="closing">
          <img src="/boda/assets/couple-garden.jpg" alt="Mirta y Guillermo" loading="lazy" />
          <div className="closing__shade"></div>
          <div className="closing__content">
            <p className="eyebrow">Mirta & Guillermo</p>
            <h2>Gracias por ser parte<br />de nuestra historia.</h2>
            <a href="#rsvp" className="button button--champagne">Confirmar asistencia</a>
          </div>
        </section>
      </main>

      {/* Floating RSVP Button - Clean and unobstructed at bottom */}
      <a href="#rsvp" className="floating-rsvp">
        Confirmar asistencia
      </a>

      {/* Gifts Modal */}
      {giftsOpen && (
        <dialog className="modal" open>
          <div className="modal__header">
            <div>
              <p className="eyebrow">Mesa de regalos</p>
              <h2>El mejor regalo es compartir</h2>
            </div>
            <button className="icon-button" onClick={() => setGiftsOpen(false)} type="button">✕</button>
          </div>
          <p className="modal__lead">Tu presencia es lo más importante. Si deseás hacernos un regalo, podés usar estos datos.</p>
          <div className="bank-data">
            <div>
              <span>Alias</span>
              <strong>boda.mirta.guille</strong>
              <button type="button" onClick={() => copyToClipboard('boda.mirta.guille', 'Alias')}>Copiar</button>
            </div>
            <div>
              <span>CBU</span>
              <strong>0070012345678901234567</strong>
              <button type="button" onClick={() => copyToClipboard('0070012345678901234567', 'CBU')}>Copiar</button>
            </div>
          </div>
          {copyToast && <p style={{ color: '#2e7d32', marginTop: '10px', fontSize: '0.9rem' }}>{copyToast}</p>}
        </dialog>
      )}

      {/* Playlist Modal */}
      {playlistOpen && (
        <dialog className="modal" open>
          <div className="modal__header">
            <div>
              <p className="eyebrow">Playlist colaborativa</p>
              <h2>¿Qué canción no puede faltar?</h2>
            </div>
            <button className="icon-button" onClick={() => setPlaylistOpen(false)} type="button">✕</button>
          </div>
          <div style={{ padding: '16px 0' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.9rem' }}>Canción y Artista:</label>
            <input
              type="text"
              value={song}
              onChange={(e) => setSong(e.target.value)}
              placeholder="Ej: Ed Sheeran - Perfect"
              style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc' }}
            />
            <button
              type="button"
              className="button button--wine"
              style={{ marginTop: '12px', width: '100%' }}
              onClick={() => { setPlaylistOpen(false); alert('¡Canción guardada para sugerir en tu RSVP!'); }}
            >
              Guardar Sugerencia
            </button>
          </div>
        </dialog>
      )}

      {/* Search Code Modal */}
      {searchModalOpen && (
        <dialog className="modal" open>
          <div className="modal__header">
            <div>
              <p className="eyebrow">Buscar mi invitación</p>
              <h2>Ingresá tu código o apellido</h2>
            </div>
            <button className="icon-button" onClick={() => setSearchModalOpen(false)} type="button">✕</button>
          </div>
          <form onSubmit={handleSearchGuest} style={{ padding: '16px 0' }}>
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Ej: fam-perez o Carlos"
              style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc', marginBottom: '12px' }}
              required
            />
            <button type="submit" className="button button--wine" style={{ width: '100%' }}>
              Buscar Invitación
            </button>
          </form>
        </dialog>
      )}
    </>
  );
}
