import { ImageResponse } from 'next/og';

export const alt = 'Invitación al casamiento de Mirta y Guillermo';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          width: '100%',
          height: '100%',
          background: '#f7f3eb',
          color: '#183326',
        }}
      >
        <div
          style={{
            position: 'relative',
            display: 'flex',
            width: '54%',
            height: '100%',
            overflow: 'hidden',
          }}
        >
          <img
            src="https://www.sodi.com.ar/boda/assets/portada.jpg"
            alt=""
            width="648"
            height="1036"
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: 'center 14%',
            }}
          />
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              background: 'linear-gradient(90deg, rgba(17,35,27,0.08), rgba(17,35,27,0.42))',
            }}
          />
        </div>

        <div
          style={{
            display: 'flex',
            width: '46%',
            height: '100%',
            flexDirection: 'column',
            justifyContent: 'center',
            padding: '58px 62px 50px',
            borderLeft: '1px solid #c79b55',
          }}
        >
          <div
            style={{
              display: 'flex',
              marginBottom: 22,
              color: '#9a753b',
              fontSize: 16,
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: 4,
            }}
          >
            Nos casamos
          </div>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              fontFamily: 'Georgia, serif',
              fontSize: 72,
              lineHeight: 0.94,
            }}
          >
            <span>Mirta <span style={{ color: '#b58a46' }}>&</span></span>
            <span>Guillermo</span>
          </div>
          <div style={{ display: 'flex', width: 72, height: 2, margin: '30px 0 24px', background: '#c79b55' }} />
          <div
            style={{
              display: 'flex',
              fontFamily: 'Georgia, serif',
              fontSize: 25,
              color: '#3d493f',
            }}
          >
            Viernes 13 de noviembre de 2026
          </div>
          <div
            style={{
              display: 'flex',
              marginTop: 52,
              color: '#52685a',
              fontSize: 14,
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: 3,
            }}
          >
            Invitación digital · SODI Bodas
          </div>
        </div>
      </div>
    ),
    size,
  );
}
