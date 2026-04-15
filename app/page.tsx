import Link from 'next/link'

export default function HomePage() {
  return (
    <main
      style={{
        minHeight: '100vh',
        margin: 0,
        background:
          'linear-gradient(180deg, #dbeafe 0%, #c7e0ff 45%, #eaf4ff 100%)',
        fontFamily: 'Pretendard, Arial, sans-serif',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          overflow: 'hidden',
          pointerEvents: 'none',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: '70px',
            left: '70px',
            width: '18px',
            height: '18px',
            backgroundColor: '#6366f1',
            transform: 'rotate(45deg)',
            borderRadius: '4px',
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: '120px',
            left: '190px',
            width: '16px',
            height: '16px',
            backgroundColor: '#4ade80',
            transform: 'rotate(25deg)',
            borderRadius: '4px',
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: '60px',
            right: '190px',
            width: '12px',
            height: '12px',
            backgroundColor: '#ffffff',
            transform: 'rotate(20deg)',
            borderRadius: '2px',
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: '140px',
            right: '120px',
            width: '34px',
            height: '34px',
            backgroundColor: '#ffffff',
            transform: 'rotate(35deg)',
            borderRadius: '4px',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '120px',
            left: '-20px',
            width: '120px',
            height: '12px',
            backgroundColor: '#4ade80',
            borderRadius: '999px',
            transform: 'rotate(-10deg)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '180px',
            right: '10px',
            width: '90px',
            height: '10px',
            backgroundColor: '#f472b6',
            borderRadius: '999px',
            transform: 'rotate(-18deg)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '90px',
            right: '-10px',
            width: '100px',
            height: '30px',
            backgroundColor: '#4ade80',
            borderRadius: '24px 24px 0 24px',
            transform: 'rotate(-18deg)',
            opacity: 0.9,
          }}
        />
      </div>

      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px 24px',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <section
          style={{
            width: '100%',
            maxWidth: '1180px',
            background: 'linear-gradient(180deg, #5b63e8 0%, #5560e6 100%)',
            borderRadius: '28px',
            padding: '46px 42px 28px',
            boxShadow: '0 20px 50px rgba(59, 77, 180, 0.22)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              position: 'absolute',
              left: '-60px',
              top: '140px',
              width: '180px',
              height: '180px',
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.08)',
            }}
          />
          <div
            style={{
              position: 'absolute',
              right: '-50px',
              bottom: '90px',
              width: '170px',
              height: '170px',
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.08)',
            }}
          />
          <div
            style={{
              position: 'absolute',
              left: '43%',
              bottom: '70px',
              width: '180px',
              height: '180px',
              borderRadius: '30px',
              background: 'rgba(43,54,175,0.18)',
              transform: 'rotate(22deg)',
            }}
          />

          <div
            style={{
              position: 'relative',
              zIndex: 2,
              display: 'flex',
              flexDirection: 'column',
              minHeight: '620px',
            }}
          >
            <div style={{ textAlign: 'center', marginTop: '10px' }}>
              <div
                style={{
                  fontSize: 'clamp(88px, 17vw, 250px)',
                  lineHeight: 0.9,
                  fontWeight: 900,
                  letterSpacing: '-0.06em',
                  color: '#f8f8fc',
                  textTransform: 'uppercase',
                  userSelect: 'none',
                }}
              >
                CLASS
              </div>

              <div
                style={{
                  marginTop: '18px',
                  fontSize: 'clamp(20px, 2.1vw, 34px)',
                  fontWeight: 800,
                  color: '#ffffff',
                }}
              >
                우리 반을 가장 즐겁게 기록하는 방법
              </div>

              <div
                style={{
                  marginTop: '12px',
                  fontSize: 'clamp(14px, 1.2vw, 18px)',
                  color: 'rgba(255,255,255,0.88)',
                  fontWeight: 600,
                }}
              >
                학생 화면은 크게 보여주고, 교사 화면은 빠르게 관리할 수 있어요.
              </div>
            </div>

            <div
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'flex-end',
                justifyContent: 'center',
                gap: '18px',
                paddingTop: '30px',
                flexWrap: 'wrap',
              }}
            >
              <div
                style={{
                  width: '120px',
                  height: '120px',
                  borderRadius: '50%',
                  background: '#fb923c',
                  boxShadow: 'inset 0 -10px 0 rgba(0,0,0,0.08)',
                }}
              />
              <div
                style={{
                  width: '190px',
                  height: '190px',
                  borderRadius: '40px',
                  background: '#f472b6',
                  boxShadow: 'inset 0 -12px 0 rgba(0,0,0,0.08)',
                }}
              />
              <div
                style={{
                  width: '160px',
                  height: '160px',
                  borderRadius: '50%',
                  background: '#bfdbfe',
                  boxShadow: 'inset 0 -10px 0 rgba(0,0,0,0.08)',
                }}
              />
              <div
                style={{
                  width: '140px',
                  height: '140px',
                  borderRadius: '32px',
                  background: '#fde68a',
                  boxShadow: 'inset 0 -10px 0 rgba(0,0,0,0.08)',
                }}
              />
            </div>

            <div
              style={{
                marginTop: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '14px',
                flexWrap: 'wrap',
              }}
            >
              <Link
                href="/student"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minWidth: '150px',
                  padding: '14px 22px',
                  borderRadius: '14px',
                  backgroundColor: '#111827',
                  color: '#ffffff',
                  textDecoration: 'none',
                  fontWeight: 800,
                  fontSize: '16px',
                  boxShadow: '0 10px 18px rgba(0,0,0,0.15)',
                }}
              >
                학생 화면
              </Link>

              <div
                style={{
                  flex: 1,
                  minWidth: '240px',
                  textAlign: 'center',
                  color: '#ffffff',
                  fontWeight: 800,
                  fontSize: 'clamp(16px, 1.3vw, 22px)',
                }}
              >
                교실에서 바로 쓰는 우리 반 기록판
              </div>

              <Link
                href="/login"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minWidth: '150px',
                  padding: '14px 22px',
                  borderRadius: '14px',
                  backgroundColor: '#ffffff',
                  color: '#1f2937',
                  textDecoration: 'none',
                  fontWeight: 800,
                  fontSize: '16px',
                  boxShadow: '0 10px 18px rgba(0,0,0,0.08)',
                }}
              >
                교사 로그인
              </Link>
            </div>

            <div
              style={{
                marginTop: '18px',
                display: 'grid',
                gridTemplateColumns: '1fr 1fr 1fr 1fr',
                gap: '10px',
              }}
            >
              {[1, 2, 3, 4].map((item) => (
                <div
                  key={item}
                  style={{
                    height: '6px',
                    borderRadius: '999px',
                    backgroundColor:
                      item === 1 ? '#ffffff' : 'rgba(255,255,255,0.28)',
                  }}
                />
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}