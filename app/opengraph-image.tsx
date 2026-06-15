import { ImageResponse } from 'next/og'

export const alt = 'دكان — متجرك على واتساب في دقيقتين'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image() {
  // Static (non-variable) Arabic TTF — satori can't parse variable fonts.
  const font = await fetch(
    'https://cdn.jsdelivr.net/gh/google/fonts@main/ofl/tajawal/Tajawal-Bold.ttf'
  ).then((r) => r.arrayBuffer())

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
          fontFamily: 'Tajawal',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
          <div
            style={{
              width: 130,
              height: 130,
              background: '#ffffff',
              borderRadius: 32,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#16a34a',
              fontSize: 88,
              fontWeight: 700,
            }}
          >
            د
          </div>
          <div style={{ color: '#ffffff', fontSize: 104, fontWeight: 700 }}>دكان</div>
        </div>
        <div style={{ color: '#dcfce7', fontSize: 42, marginTop: 36 }}>
          متجرك على واتساب في دقيقتين
        </div>
      </div>
    ),
    { ...size, fonts: [{ name: 'Tajawal', data: font, style: 'normal', weight: 700 }] }
  )
}
