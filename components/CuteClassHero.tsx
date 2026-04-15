type CuteClassHeroProps = {
  badge: string
  title: string
  subtitle: string
  rightStat1Label?: string
  rightStat1Value?: string | number
  rightStat2Label?: string
  rightStat2Value?: string | number
  action?: React.ReactNode
}

function Character({
  bg,
  body,
  hair,
  x,
  y,
  scale = 1,
}: {
  bg: string
  body: string
  hair: string
  x: string
  y: string
  scale?: number
}) {
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        bottom: y,
        transform: `scale(${scale})`,
        transformOrigin: 'bottom left',
      }}
    >
      <div
        style={{
          position: 'relative',
          width: '120px',
          height: '150px',
        }}
      >
        <div
          style={{
            position: 'absolute',
            left: '26px',
            top: '0',
            width: '68px',
            height: '68px',
            borderRadius: '50%',
            backgroundColor: '#ffe7c7',
            zIndex: 3,
          }}
        />
        <div
          style={{
            position: 'absolute',
            left: '18px',
            top: '0',
            width: '84px',
            height: '34px',
            borderRadius: '40px 40px 20px 20px',
            backgroundColor: hair,
            zIndex: 4,
          }}
        />
        <div
          style={{
            position: 'absolute',
            left: '40px',
            top: '28px',
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: '#111827',
            zIndex: 5,
          }}
        />
        <div
          style={{
            position: 'absolute',
            left: '68px',
            top: '28px',
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: '#111827',
            zIndex: 5,
          }}
        />
        <div
          style={{
            position: 'absolute',
            left: '52px',
            top: '42px',
            width: '16px',
            height: '8px',
            borderBottom: '3px solid #111827',
            borderRadius: '0 0 16px 16px',
            zIndex: 5,
          }}
        />
        <div
          style={{
            position: 'absolute',
            left: '18px',
            top: '58px',
            width: '84px',
            height: '70px',
            borderRadius: '26px',
            backgroundColor: body,
            zIndex: 2,
          }}
        />
        <div
          style={{
            position: 'absolute',
            left: '-2px',
            top: '70px',
            width: '36px',
            height: '14px',
            borderRadius: '999px',
            backgroundColor: '#ffe7c7',
            transform: 'rotate(-25deg)',
            zIndex: 1,
          }}
        />
        <div
          style={{
            position: 'absolute',
            right: '-2px',
            top: '70px',
            width: '36px',
            height: '14px',
            borderRadius: '999px',
            backgroundColor: '#ffe7c7',
            transform: 'rotate(25deg)',
            zIndex: 1,
          }}
        />
        <div
          style={{
            position: 'absolute',
            left: '26px',
            bottom: '8px',
            width: '18px',
            height: '44px',
            borderRadius: '999px',
            backgroundColor: bg,
            transform: 'rotate(8deg)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            left: '68px',
            bottom: '8px',
            width: '18px',
            height: '44px',
            borderRadius: '999px',
            backgroundColor: bg,
            transform: 'rotate(-8deg)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            left: '20px',
            bottom: '0',
            width: '26px',
            height: '10px',
            borderRadius: '999px',
            backgroundColor: '#111827',
          }}
        />
        <div
          style={{
            position: 'absolute',
            left: '64px',
            bottom: '0',
            width: '26px',
            height: '10px',
            borderRadius: '999px',
            backgroundColor: '#111827',
          }}
        />
      </div>
    </div>
  )
}

function Mascot({
  x,
  y,
  color,
  earColor,
  scale = 1,
}: {
  x: string
  y: string
  color: string
  earColor: string
  scale?: number
}) {
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        bottom: y,
        transform: `scale(${scale})`,
        transformOrigin: 'bottom left',
      }}
    >
      <div
        style={{
          position: 'relative',
          width: '90px',
          height: '90px',
        }}
      >
        <div
          style={{
            position: 'absolute',
            left: '10px',
            top: '10px',
            width: '70px',
            height: '70px',
            borderRadius: '50%',
            backgroundColor: color,
          }}
        />
        <div
          style={{
            position: 'absolute',
            left: '0',
            top: '0',
            width: '26px',
            height: '30px',
            borderRadius: '50% 50% 0 50%',
            backgroundColor: earColor,
            transform: 'rotate(-20deg)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            right: '0',
            top: '0',
            width: '26px',
            height: '30px',
            borderRadius: '50% 50% 50% 0',
            backgroundColor: earColor,
            transform: 'rotate(20deg)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            left: '28px',
            top: '34px',
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: '#111827',
          }}
        />
        <div
          style={{
            position: 'absolute',
            left: '50px',
            top: '34px',
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: '#111827',
          }}
        />
        <div
          style={{
            position: 'absolute',
            left: '38px',
            top: '46px',
            width: '12px',
            height: '8px',
            borderBottom: '3px solid #111827',
            borderRadius: '0 0 10px 10px',
          }}
        />
      </div>
    </div>
  )
}

export default function CuteClassHero({
  badge,
  title,
  subtitle,
  rightStat1Label,
  rightStat1Value,
  rightStat2Label,
  rightStat2Value,
  action,
}: CuteClassHeroProps) {
  return (
    <section
      style={{
        background: 'linear-gradient(180deg, #5b63e8 0%, #5560e6 100%)',
        borderRadius: '34px',
        padding: '34px 34px 26px',
        boxShadow: '0 24px 54px rgba(59, 77, 180, 0.22)',
        color: '#ffffff',
        marginBottom: '24px',
        position: 'relative',
        overflow: 'hidden',
        minHeight: '360px',
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: '28px',
            left: '28px',
            width: '14px',
            height: '14px',
            backgroundColor: '#60a5fa',
            transform: 'rotate(45deg)',
            borderRadius: '3px',
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: '54px',
            right: '90px',
            width: '12px',
            height: '12px',
            backgroundColor: '#ffffff',
            transform: 'rotate(30deg)',
            borderRadius: '2px',
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: '110px',
            right: '46px',
            width: '26px',
            height: '26px',
            backgroundColor: '#ffffff',
            transform: 'rotate(30deg)',
            borderRadius: '4px',
            opacity: 0.95,
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '80px',
            left: '-12px',
            width: '110px',
            height: '10px',
            backgroundColor: '#4ade80',
            borderRadius: '999px',
            transform: 'rotate(-10deg)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '110px',
            right: '-8px',
            width: '92px',
            height: '10px',
            backgroundColor: '#f472b6',
            borderRadius: '999px',
            transform: 'rotate(-16deg)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            left: '-80px',
            top: '90px',
            width: '180px',
            height: '180px',
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.08)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            right: '-60px',
            bottom: '70px',
            width: '180px',
            height: '180px',
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.08)',
          }}
        />
      </div>

      <div
        style={{
          position: 'relative',
          zIndex: 1,
          display: 'flex',
          justifyContent: 'space-between',
          gap: '20px',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ maxWidth: '640px' }}>
          <div
            style={{
              display: 'inline-block',
              backgroundColor: 'rgba(255,255,255,0.18)',
              padding: '9px 15px',
              borderRadius: '999px',
              fontWeight: 800,
              fontSize: '14px',
              marginBottom: '16px',
            }}
          >
            {badge}
          </div>

          <h1
            style={{
              margin: 0,
              fontSize: 'clamp(40px, 6vw, 76px)',
              lineHeight: 0.95,
              fontWeight: 900,
              letterSpacing: '-0.05em',
            }}
          >
            {title}
          </h1>

          <p
            style={{
              marginTop: '14px',
              fontSize: '20px',
              fontWeight: 700,
              color: 'rgba(255,255,255,0.92)',
              lineHeight: 1.5,
            }}
          >
            {subtitle}
          </p>
        </div>

        <div
          style={{
            display: 'flex',
            gap: '12px',
            flexWrap: 'wrap',
            alignItems: 'stretch',
          }}
        >
          {rightStat1Label ? (
            <div
              style={{
                backgroundColor: 'rgba(255,255,255,0.14)',
                borderRadius: '22px',
                padding: '16px 18px',
                minWidth: '150px',
              }}
            >
              <div style={{ fontSize: '14px', fontWeight: 700 }}>{rightStat1Label}</div>
              <div style={{ fontSize: '32px', fontWeight: 900, marginTop: '8px' }}>
                {rightStat1Value}
              </div>
            </div>
          ) : null}

          {rightStat2Label ? (
            <div
              style={{
                backgroundColor: 'rgba(255,255,255,0.14)',
                borderRadius: '22px',
                padding: '16px 18px',
                minWidth: '150px',
              }}
            >
              <div style={{ fontSize: '14px', fontWeight: 700 }}>{rightStat2Label}</div>
              <div style={{ fontSize: '32px', fontWeight: 900, marginTop: '8px' }}>
                {rightStat2Value}
              </div>
            </div>
          ) : null}

          {action}
        </div>
      </div>

      <div
        style={{
          position: 'relative',
          zIndex: 1,
          height: '170px',
          marginTop: '12px',
        }}
      >
        <Character
          x="5%"
          y="0"
          scale={0.92}
          bg="#c4b5fd"
          body="#f59e0b"
          hair="#7c3aed"
        />
        <Character
          x="26%"
          y="0"
          scale={1.12}
          bg="#dbeafe"
          body="#f472b6"
          hair="#4338ca"
        />
        <Character
          x="49%"
          y="0"
          scale={1}
          bg="#bfdbfe"
          body="#fde68a"
          hair="#111827"
        />
        <Mascot x="73%" y="18px" scale={1} color="#ddd6fe" earColor="#c4b5fd" />
        <Mascot x="84%" y="0" scale={0.88} color="#ffffff" earColor="#fde68a" />
      </div>
    </section>
  )
}