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
          <svg width="130" height="130" viewBox="0 0 48 48">
            <rect width="48" height="48" rx="11" fill="#ffffff" />
            <rect x="11" y="20" width="26" height="23" rx="3" fill="#15803d" />
            <path d="M20 43 V30 a4 4 0 0 1 8 0 V43 Z" fill="#ffffff" />
            <path
              d="M6 12 a3 3 0 0 1 3 -3 H39 a3 3 0 0 1 3 3 V18 q-3.6 4 -7.2 0 q-3.6 4 -7.2 0 q-3.6 4 -7.2 0 q-3.6 4 -7.2 0 q-3.6 4 -7.2 0 Z"
              fill="#16a34a"
            />
          </svg>
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
