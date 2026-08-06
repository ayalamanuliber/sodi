'use client';

import React, { useEffect, useState, useRef, use } from 'react';
import Script from 'next/script';

interface GuestData {
  id: string;
  nombre: string;
  pases: number;
  estado: string;
  tipo?: 'completo' | 'solo-after' | 'solo-ceremonia';
  estilo?: 'oro' | 'esmeralda' | 'borgoña';
  respuesta?: any;
}

export default function DynamicBodaPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = use(params);
  const slug = resolvedParams.slug || 'mirta-y-guillermo';

  const [guest, setGuest] = useState<GuestData | null>(null);
  const [code, setCode] = useState<string>('');
  const [loadingGuest, setLoadingGuest] = useState(false);
  const [openingClosed, setOpeningClosed] = useState(false);
  const [musicPlaying, setMusicPlaying] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [searchError, setSearchError] = useState('');

  // Form State
  const [rsvpName, setRsvpName] = useState('');
  const [integrantes, setIntegrantes] = useState<string[]>(['']);
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

  // Map Modal State
  const [mapOpen, setMapOpen] = useState(false);
  const [mapTitle, setMapTitle] = useState('');
  const [mapIframeSrc, setMapIframeSrc] = useState('');
  const [mapAddress, setMapAddress] = useState('');
  const [mapExternalUrl, setMapExternalUrl] = useState('');

  const openMap = (title: string, iframeSrc: string, address: string, extUrl: string) => {
    setMapTitle(title);
    setMapIframeSrc(iframeSrc);
    setMapAddress(address);
    setMapExternalUrl(extUrl);
    setMapOpen(true);
  };

  // Countdown
  const [days, setDays] = useState('00');
  const [hours, setHours] = useState('00');
  const [minutes, setMinutes] = useState('00');

  const [showFloatingButton, setShowFloatingButton] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Scroll listener to hide/show floating RSVP button
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowFloatingButton(true);
      } else {
        setShowFloatingButton(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial check
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Audio Event Listeners for 100% sync
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onPlay = () => setMusicPlaying(true);
    const onPause = () => setMusicPlaying(false);

    audio.addEventListener('play', onPlay);
    audio.addEventListener('pause', onPause);

    return () => {
      audio.removeEventListener('play', onPlay);
      audio.removeEventListener('pause', onPause);
    };
  }, []);

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const c = searchParams.get('i') || searchParams.get('inv') || searchParams.get('code') || '';
    if (c) {
      setCode(c);
      setLoadingGuest(true);
      fetchGuest(c).finally(() => setLoadingGuest(false));
    }
  }, [slug]);

  const fetchGuest = async (c: string) => {
    setSearchError('');
    try {
      const res = await fetch(`/api/boda/invitados?slug=${encodeURIComponent(slug)}&code=${encodeURIComponent(c)}`);
      const data = await res.json();
      if (data.success && data.guest) {
        setGuest(data.guest);
        setRsvpName(data.guest.nombre);
        
        // If guest has already confirmed/responded previously, load their choices
        if (data.guest.respuesta) {
          const resp = data.guest.respuesta;
          setAttendance(resp.asistencia || 'confirmado');
          setPasesConfirmados(resp.pasesConfirmados ?? data.guest.pases);
          
          if (Array.isArray(resp.integrantes) && resp.integrantes.length > 0) {
            setIntegrantes(resp.integrantes);
          } else {
            setIntegrantes([data.guest.nombre, ...Array(Math.max(0, data.guest.pases - 1)).fill('')]);
          }
          
          setMenu(resp.menu || 'Tradicional');
          setNotes(resp.notas || resp.notes || '');
          setSong(resp.cancion || '');
          setSubmitted(true);
        } else {
          setPasesConfirmados(data.guest.pases);
          setIntegrantes([data.guest.nombre, ...Array(Math.max(0, data.guest.pases - 1)).fill('')]);
        }
        return true;
      } else {
        setSearchError('No encontramos tu invitación con ese código o apellido.');
        return false;
      }
    } catch (e) {
      console.error('Error loading guest data:', e);
      setSearchError('Ocurrió un error al buscar la invitación.');
      return false;
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
    if (audioRef.current.paused) {
      audioRef.current.play().then(() => setMusicPlaying(true)).catch(console.error);
    } else {
      audioRef.current.pause();
      setMusicPlaying(false);
    }
  };

  const handleOpenEnvelope = () => {
    setOpeningClosed(true);
    if (audioRef.current && audioRef.current.paused) {
      audioRef.current.play().then(() => setMusicPlaying(true)).catch(() => {});
    }
  };

  const handleSearchGuest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchInput.trim()) return;
    setSubmitting(true);
    const success = await fetchGuest(searchInput.trim());
    setSubmitting(false);
    if (success) {
      setSearchModalOpen(false);
    }
  };

  const handlePasesChange = (count: number) => {
    setPasesConfirmados(count);
    setIntegrantes(prev => {
      const next = [...prev];
      if (next.length < count) {
        while (next.length < count) {
          next.push('');
        }
      } else if (next.length > count) {
        next.splice(count);
      }
      return next;
    });
  };

  const handleRsvpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const filteredIntegrantes = attendance === 'confirmado' ? integrantes.filter(Boolean) : [];

    const payload = {
      slug,
      code: guest?.id || code || '',
      nombre: rsvpName,
      asistencia: attendance,
      pasesConfirmados: attendance === 'confirmado' ? pasesConfirmados : 0,
      integrantes: filteredIntegrantes,
      menu: resolvedMenu,
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

      const pasesMsg = attendance === 'confirmado' ? `Sí, confirmo (${pasesConfirmados} pases)` : 'No puedo asistir';
      const nombresMsg = attendance === 'confirmado' ? `\n• Nombres de los asistentes: ${filteredIntegrantes.join(', ')}` : '';
      const msg = `¡Hola Mirta! Confirmación de asistencia para la boda:\n\n• Grupo/Invitación: ${guest?.nombre || rsvpName}\n• Asistencia: ${pasesMsg}${nombresMsg}\n• Menú: ${resolvedMenu}${notes ? `\n• Comentario: ${notes}` : ''}${song ? `\n• Canción sugerida: ${song}` : ''}`;
      const waUrl = `https://api.whatsapp.com/send?phone=5491162337552&text=${encodeURIComponent(msg)}`;
      window.location.href = waUrl;
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

  const resolvedMenu = guest?.tipo === 'solo-after' ? 'Solo After-Party (Bebidas)' : menu;

  return (
    <>
      {/* Dynamic Style Overrides based on guest.estilo setting */}
      {guest?.estilo === 'borgoña' && (
        <style dangerouslySetInnerHTML={{ __html: `
          :root {
            --wine: #800020 !important;
            --wine-dark: #4a0012 !important;
            --ivory: #faf7f8 !important;
            --ivory-deep: #ebdbe0 !important;
            --champagne: #b58b48 !important;
            --champagne-light: #dec7a1 !important;
          }
        `}} />
      )}
      {guest?.estilo === 'esmeralda' && (
        <style dangerouslySetInnerHTML={{ __html: `
          :root {
            --wine: #137333 !important;
            --wine-dark: #094720 !important;
            --ivory: #f4fcf7 !important;
            --ivory-deep: #dbeef3 !important;
          }
        `}} />
      )}

      {/* Google Fonts */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;1,400&family=Italianno&family=Montserrat:wght@400;500;600&display=swap" rel="stylesheet" />
      <link rel="stylesheet" href="/boda/invitacion-premium-prod.css?v=20260806_wsp_fix_v3" />
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
              {loadingGuest
                ? 'Cargando tu invitación...'
                : guest
                ? `Especialmente para ${guest.nombre}`
                : 'Una invitación especial'}
            </p>
            <div className="envelope">
              <div className="envelope__back"></div>
              <div className="envelope__letter">
                <span className="monogram">M · G</span>
                <h1>Invitación de boda</h1>
                <p>13 de noviembre de 2026</p>
                {guest && <p style={{ fontSize: '0.85rem', color: 'var(--champagne)', marginTop: '4px', fontWeight: '500' }}>{guest.pases} pases reservados</p>}
              </div>
              <div className="envelope__front"></div>
              <button className="wax-seal" onClick={handleOpenEnvelope} type="button" aria-label="Abrir invitación">
                <span>M · G</span>
              </button>
            </div>
            <button className="opening__action" onClick={handleOpenEnvelope} type="button">
              <span>{loadingGuest ? 'Preparando...' : 'Abrir invitación'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Site Header with Integrated Audio Button */}
      <header className="site-header" id="siteHeader">
        <a className="site-header__brand" href="#hero">
          <span>M · G</span>
        </a>
        <div className="site-header__actions" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={toggleMusic}
            type="button"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: musicPlaying ? 'var(--wine)' : '#ffffff',
              color: musicPlaying ? '#ffffff' : 'var(--wine)',
              border: '1.5px solid var(--wine)',
              padding: '6px 14px',
              borderRadius: '20px',
              fontWeight: '600',
              fontSize: '0.8rem',
              cursor: 'pointer',
              transition: 'all 200ms ease'
            }}
          >
            <span>{musicPlaying ? '🔊 Pausar Música' : '🎵 Reproducir Música'}</span>
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
            {(!guest || !guest.tipo || guest.tipo === 'completo' || guest.tipo === 'solo-ceremonia') && (
              <article className="event">
                <span className="event__index">I</span>
                <p className="event__type">Ceremonia</p>
                <h3>Parroquia Santuario Nuestra Señora de la Medalla Milagrosa</h3>
                <p className="event__time">20:30 hs</p>
                <p className="event__address">Curapaligüe 1185, Parque Chacabuco, CABA</p>
                <button
                  type="button"
                  className="text-link"
                  style={{ background: 'none', border: 'none', cursor: 'pointer', outline: 'none' }}
                  onClick={() => openMap(
                    'Parroquia Medalla Milagrosa',
                    'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3282.684518731776!2d-58.4485542!3d-34.6373752!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x95bcca3ca2e01df7%3A0xcb13e9a597a7e376!2sSantuario%20Nuestra%20Se%C3%B1ora%20de%20la%20Medalla%20Milagrosa!5e0!3m2!1ses-419!2sar!4v1722971234567!5m2!1ses-419!2sar',
                    'Curapaligüe 1185, Parque Chacabuco, CABA',
                    'https://maps.google.com/?q=Curapalig%C3%BCe+1185,+Parque+Chacabuco,+CABA'
                  )}
                >
                  📍 Ver mapa e indicaciones
                </button>
              </article>
            )}

            {(!guest || !guest.tipo || guest.tipo === 'completo') && <div className="events__divider">❀</div>}

            {(!guest || !guest.tipo || guest.tipo === 'completo' || guest.tipo === 'solo-after') && (
              <article className="event" style={(!guest?.tipo || guest?.tipo === 'solo-after') ? { gridColumn: '1 / -1', margin: '0 auto', maxWidth: '500px' } : {}}>
                <span className="event__index">{guest?.tipo === 'solo-after' ? 'I' : 'II'}</span>
                <p className="event__type">Celebración & After-Party</p>
                <h3>Recepciones Craigmhor</h3>
                <p className="event__time">{guest?.tipo === 'solo-after' ? '23:30 hs' : '21:30 hs'}</p>
                <p className="event__address">Francisco Bilbao 2390, CABA</p>
                <button
                  type="button"
                  className="text-link"
                  style={{ background: 'none', border: 'none', cursor: 'pointer', outline: 'none' }}
                  onClick={() => openMap(
                    'Recepciones Craigmhor',
                    'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3282.7237893121516!2d-58.455243!3d-34.6363659!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x95bcca37719661cb%3A0xc3f8e5b6db7607ea!2sRecepciones%20Craigmhor!5e0!3m2!1ses-419!2sar!4v1722971234568!5m2!1ses-419!2sar',
                    'Francisco Bilbao 2390, CABA',
                    'https://maps.google.com/?q=Recepciones+Craigmhor,+Francisco+Bilbao+2390,+CABA'
                  )}
                >
                  📍 Ver mapa e indicaciones
                </button>
              </article>
            )}
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
              <div style={{ backgroundColor: 'var(--paper)', padding: '16px', borderRadius: '4px', marginBottom: '20px', borderLeft: '4px solid var(--champagne)', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                <p style={{ margin: 0, fontSize: '0.95rem', color: 'var(--ink)' }}>
                  <strong>Invitación para: {guest.nombre}</strong> ({guest.pases} {guest.pases === 1 ? 'pase reservado' : 'pases reservados'})
                </p>
              </div>
            )}
          </div>

          {submitted ? (
            <div style={{ padding: '36px 24px', textAlign: 'center', backgroundColor: 'var(--paper)', borderRadius: '4px', border: '1px solid var(--champagne-light)', color: 'var(--wine-dark)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
              <h3 style={{ fontFamily: 'var(--serif)', fontSize: '2rem', marginBottom: '8px', lineHeight: '1.2' }}>¡Asistencia Registrada! 🎉</h3>
              <p style={{ fontSize: '0.95rem', color: 'var(--ink-soft)', maxWidth: '400px', margin: '0 auto', lineHeight: '1.5' }}>
                Tu respuesta fue guardada con éxito en la lista oficial. Si tu navegador no te redirigió automáticamente, tocá el botón de abajo para enviarle la confirmación a Mirta por WhatsApp:
              </p>
              <a
                href={`https://api.whatsapp.com/send?phone=5491162337552&text=${encodeURIComponent(
                  `¡Hola Mirta! Confirmación de asistencia para la boda:\n\n• Grupo/Invitación: ${guest?.nombre || rsvpName}\n• Asistencia: ${attendance === 'confirmado' ? `Sí, confirmo (${pasesConfirmados} pases)` : 'No puedo asistir'}${attendance === 'confirmado' ? `\n• Nombres de los asistentes: ${integrantes.filter(Boolean).join(', ')}` : ''}${resolvedMenu ? `\n• Menú: ${resolvedMenu}` : ''}${notes ? `\n• Comentario: ${notes}` : ''}${song ? `\n• Canción sugerida: ${song}` : ''}`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="button button--wine"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', textDecoration: 'none', width: '100%', maxWidth: '320px', justifyContent: 'center', padding: '14px' }}
              >
                💬 Enviar Mensaje a Mirta
              </a>
              <button
                type="button"
                onClick={() => setSubmitted(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--champagne)',
                  fontSize: '0.88rem',
                  fontWeight: '600',
                  textDecoration: 'underline',
                  cursor: 'pointer',
                  marginTop: '8px'
                }}
              >
                ✏️ Modificar o corregir mis datos
              </button>
            </div>
          ) : guest ? (
            <form className="rsvp-form" onSubmit={handleRsvpSubmit}>
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
                    <label htmlFor="pasesConfirmados">Cantidad de personas asistiendo (Máximo {guest.pases}):</label>
                    <select
                      id="pasesConfirmados"
                      value={pasesConfirmados}
                      onChange={(e) => handlePasesChange(parseInt(e.target.value, 10))}
                    >
                      {Array.from({ length: guest.pases }, (_, i) => i + 1).map(n => (
                        <option key={n} value={n}>{n} {n === 1 ? 'persona' : 'personas'}</option>
                      ))}
                    </select>
                  </div>

                  {/* Dynamic Integrantes Names Input */}
                  {Array.from({ length: pasesConfirmados }).map((_, idx) => (
                    <div className="field field--full" key={idx}>
                      <label htmlFor={`integrante-${idx}`}>
                        {idx === 0 ? 'Nombre del invitado' : `Nombre del acompañante ${idx + 1}`}
                      </label>
                      <input
                        id={`integrante-${idx}`}
                        value={integrantes[idx] || ''}
                        onChange={(e) => {
                          const copy = [...integrantes];
                          copy[idx] = e.target.value;
                          setIntegrantes(copy);
                        }}
                        placeholder={idx === 0 ? "Tu nombre completo" : "Nombre completo del acompañante"}
                        required
                      />
                    </div>
                  ))}

                  {guest?.tipo !== 'solo-after' && (
                    <div className="field field--full">
                      <label htmlFor="rsvpMenu">Preferencia de menú</label>
                      <select id="rsvpMenu" value={menu} onChange={(e) => setMenu(e.target.value)}>
                        <option>Tradicional</option>
                        <option>Vegetariano</option>
                        <option>Vegano</option>
                        <option>Sin TACC</option>
                      </select>
                    </div>
                  )}

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
          ) : (
            <div style={{ padding: '40px 24px', textAlign: 'center', backgroundColor: 'var(--paper)', borderRadius: '4px', border: '1px solid rgba(182, 151, 99, 0.4)', maxWidth: '520px', margin: '0 auto', boxShadow: '0 10px 30px rgba(0,0,0,0.03)' }}>
              <h3 style={{ fontFamily: 'var(--serif)', fontSize: '1.8rem', color: 'var(--ink)', marginBottom: '12px', fontWeight: '400' }}>
                Buscá tu tarjeta de invitación
              </h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--ink-soft)', marginBottom: '24px', lineHeight: '1.5' }}>
                Ingresá tu apellido o el código asignado para acceder a tu invitación personalizada y confirmar tu asistencia.
              </p>
              <button
                type="button"
                className="button button--champagne"
                onClick={() => setSearchModalOpen(true)}
                style={{ width: '100%' }}
              >
                🔍 Encontrar mi invitación
              </button>
            </div>
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

      {/* Floating RSVP Button */}
      <a href="#rsvp" className={`floating-rsvp ${!showFloatingButton ? 'is-hidden' : ''}`}>
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
          <div style={{ padding: '20px 0' }}>
            <div className="field field--full" style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '8px' }}>Canción y Artista:</label>
              <input
                type="text"
                value={song}
                onChange={(e) => setSong(e.target.value)}
                placeholder="Ej: Ed Sheeran - Perfect"
              />
            </div>
            <button
              type="button"
              className="button button--wine"
              style={{ width: '100%' }}
              onClick={() => { setPlaylistOpen(false); alert('¡Canción guardada para sugerir en tu RSVP!'); }}
            >
              Guardar Sugerencia
            </button>
          </div>
        </dialog>
      )}

      {/* Search Code Modal - Completely Aligned with Theme */}
      {searchModalOpen && (
        <dialog className="modal" open>
          <div className="modal__header">
            <div>
              <p className="eyebrow">Ingreso Personalizado</p>
              <h2>Buscar mi invitación</h2>
            </div>
            <button className="icon-button" onClick={() => { setSearchModalOpen(false); setSearchError(''); }} type="button">✕</button>
          </div>
          <form onSubmit={handleSearchGuest} style={{ padding: '20px 0' }}>
            <div className="field field--full" style={{ marginBottom: '16px' }}>
              <label htmlFor="modalSearchInput">Apellido o código de invitación</label>
              <input
                id="modalSearchInput"
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Ej: Pérez o fam-perez"
                required
              />
            </div>
            {searchError && (
              <p style={{ color: '#c62828', fontSize: '0.88rem', marginBottom: '16px', fontWeight: '500' }}>
                {searchError}
              </p>
            )}
            <button type="submit" className="button button--wine" style={{ width: '100%' }} disabled={submitting}>
              {submitting ? 'Buscando...' : 'Acceder a mi Invitación'}
            </button>
          </form>
        </dialog>
      )}

      {/* Interactive Map Modal with Custom Styled Map and GPS link */}
      {mapOpen && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 99999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
            backgroundColor: 'rgba(20, 16, 12, 0.72)',
            backdropFilter: 'blur(6px)',
            WebkitBackdropFilter: 'blur(6px)',
          }}
          onClick={() => setMapOpen(false)}
        >
          <div 
            className="modal"
            style={{
              maxWidth: '600px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              margin: 'auto',
              animation: 'dialogIn 220ms ease both',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal__header">
              <div>
                <p className="eyebrow">Ubicación del evento</p>
                <h2 style={{ fontFamily: 'var(--serif)', fontSize: '1.8rem', fontWeight: 400, color: 'var(--ink)' }}>{mapTitle}</h2>
              </div>
              <button className="icon-button" onClick={() => setMapOpen(false)} type="button">✕</button>
            </div>
            <div style={{ padding: '16px 0 0' }}>
              <p className="modal__lead" style={{ marginBottom: '16px', fontSize: '0.9rem', color: 'var(--ink-soft)' }}>
                📍 <strong>Dirección:</strong> {mapAddress}
              </p>
              <div style={{ width: '100%', height: '320px', borderRadius: '4px', overflow: 'hidden', border: '1px solid rgba(182, 151, 99, 0.3)', marginBottom: '20px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                <iframe
                  src={mapIframeSrc}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen={false}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title={mapTitle}
                ></iframe>
              </div>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <a
                  href={mapExternalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="button button--wine"
                  style={{ flex: '1 1 200px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px', textDecoration: 'none', padding: '12px', fontSize: '0.8rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.1em' }}
                >
                  🗺️ Abrir en Google Maps / GPS
                </a>
                <button
                  type="button"
                  className="button button--champagne"
                  onClick={() => setMapOpen(false)}
                  style={{ flex: '1 1 100px', padding: '12px', fontSize: '0.8rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.1em' }}
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
