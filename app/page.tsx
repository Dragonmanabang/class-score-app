import Link from 'next/link'

export default function HomePage() {
  return (
    <main
      style={{
        minHeight: '100vh',
        background:
          'linear-gradient(180deg, #f8fbff 0%, #eef6ff 45%, #f9fbff 100%)',
        padding: '28px',
        fontFamily: 'Pretendard, Arial, sans-serif',
        display: 'flex',
        alignItems: 'center',
      }}
    >
      <div
        style={{
          maxWidth: '1200px',
          width: '100%',
          margin: '0 auto',
        }}
      >
        <section
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '32px',
            padding: '40px 42px',
            boxShadow: '0 18px 40px rgba(37, 99, 235, 0.10)',
            border: '1px solid #e5eefc',
            overflow: 'hidden',
            position: 'relative',
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: '-120px',
              right: '-80px',
              width: '320px',
              height: '320px',
              background:
                'radial-gradient(circle, rgba(37,99,235,0.14) 0%, rgba(37,99,235,0.05) 40%, rgba(37,99,235,0) 70%)',
              pointerEvents: 'none',
            }}
          />

          <div
            style={{
              position: 'absolute',
              bottom: '-120px',
              left: '-80px',
              width: '280px',
              height: '280px',
              background:
                'radial-gradient(circle, rgba(245,158,11,0.12) 0%, rgba(245,158,11,0.04) 40%, rgba(245,158,11,0) 70%)',
              pointerEvents: 'none',
            }}
          />

          <div
            style={{
              position: 'relative',
              zIndex: 1,
            }}
          >
            <div
              style={{
                display: 'inline-block',
                backgroundColor: '#dbeafe',
                color: '#1d4ed8',
                padding: '8px 14px',
                borderRadius: '999px',
                fontWeight: 700,
                fontSize: '15px',
                marginBottom: '18px',
              }}
            >
              우리 반 기록 관리 앱
            </div>

            <h1
              style={{
                margin: 0,
                fontSize: '52px',
                lineHeight: 1.18,
                color: '#0f172a',
                fontWeight: 800,
                maxWidth: '760px',
              }}
            >
              교실 기록을 쉽고 빠르게 관리하는
              <br />
              우리 반 전용 화면
            </h1>

            <p
              style={{
                margin: '18px 0 0 0',
                fontSize: '21px',
                color: '#475569',
                lineHeight: 1.6,
                maxWidth: '760px',
              }}
            >
              학생 현황은 크게 보여주고, 교사 화면에서는 학생과 모둠을 편하게 관리할 수 있어요.
            </p>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                gap: '18px',
                marginTop: '30px',
                marginBottom: '28px',
              }}
            >
              <div
                style={{
                  backgroundColor: '#f8fbff',
                  border: '1px solid #dbeafe',
                  borderRadius: '24px',
                  padding: '22px',
                }}
              >
                <div
                  style={{
                    fontSize: '34px',
                    marginBottom: '10px',
                  }}
                >
                  🖥️
                </div>
                <div
                  style={{
                    fontSize: '24px',
                    fontWeight: 800,
                    color: '#0f172a',
                    marginBottom: '8px',
                  }}
                >
                  학생 화면
                </div>
                <div
                  style={{
                    fontSize: '17px',
                    color: '#475569',
                    lineHeight: 1.6,
                  }}
                >
                  모둠과 학생의 현재 기록을 전자칠판처럼 크게 보여주는 화면입니다.
                </div>
              </div>

              <div
                style={{
                  backgroundColor: '#fffaf0',
                  border: '1px solid #fde68a',
                  borderRadius: '24px',
                  padding: '22px',
                }}
              >
                <div
                  style={{
                    fontSize: '34px',
                    marginBottom: '10px',
                  }}
                >
                  👩‍🏫
                </div>
                <div
                  style={{
                    fontSize: '24px',
                    fontWeight: 800,
                    color: '#0f172a',
                    marginBottom: '8px',
                  }}
                >
                  교사 화면
                </div>
                <div
                  style={{
                    fontSize: '17px',
                    color: '#475569',
                    lineHeight: 1.6,
                  }}
                >
                  학생 추가, 모둠 관리, 기록 부여, 초기화까지 할 수 있는 관리 화면입니다.
                </div>
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                gap: '16px',
                flexWrap: 'wrap',
              }}
            >
              <Link
                href="/student"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '18px 28px',
                  borderRadius: '18px',
                  backgroundColor: '#2563eb',
                  color: '#ffffff',
                  textDecoration: 'none',
                  fontWeight: 800,
                  fontSize: '18px',
                  boxShadow: '0 14px 28px rgba(37, 99, 235, 0.24)',
                  minWidth: '220px',
                }}
              >
                학생 화면 열기
              </Link>

              <Link
                href="/login"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '18px 28px',
                  borderRadius: '18px',
                  backgroundColor: '#16a34a',
                  color: '#ffffff',
                  textDecoration: 'none',
                  fontWeight: 800,
                  fontSize: '18px',
                  boxShadow: '0 14px 28px rgba(22, 163, 74, 0.20)',
                  minWidth: '220px',
                }}
              >
                교사 로그인
              </Link>
            </div>
          </div>
        </section>

        <section
          style={{
            marginTop: '22px',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '16px',
          }}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '22px',
              padding: '20px',
              boxShadow: '0 12px 28px rgba(15, 23, 42, 0.06)',
              border: '1px solid #e8eef7',
            }}
          >
            <div
              style={{
                fontSize: '16px',
                color: '#64748b',
                fontWeight: 700,
                marginBottom: '8px',
              }}
            >
              보기 쉬운 화면
            </div>
            <div
              style={{
                fontSize: '18px',
                color: '#0f172a',
                fontWeight: 700,
                lineHeight: 1.5,
              }}
            >
              전자칠판과 PC에서 멀리서도 잘 보이도록 크게 구성했습니다.
            </div>
          </div>

          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '22px',
              padding: '20px',
              boxShadow: '0 12px 28px rgba(15, 23, 42, 0.06)',
              border: '1px solid #e8eef7',
            }}
          >
            <div
              style={{
                fontSize: '16px',
                color: '#64748b',
                fontWeight: 700,
                marginBottom: '8px',
              }}
            >
              빠른 관리
            </div>
            <div
              style={{
                fontSize: '18px',
                color: '#0f172a',
                fontWeight: 700,
                lineHeight: 1.5,
              }}
            >
              학생 추가, 모둠 변경, 기록 부여, 초기화를 빠르게 처리할 수 있습니다.
            </div>
          </div>

          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '22px',
              padding: '20px',
              boxShadow: '0 12px 28px rgba(15, 23, 42, 0.06)',
              border: '1px solid #e8eef7',
            }}
          >
            <div
              style={{
                fontSize: '16px',
                color: '#64748b',
                fontWeight: 700,
                marginBottom: '8px',
              }}
            >
              안전한 접근
            </div>
            <div
              style={{
                fontSize: '18px',
                color: '#0f172a',
                fontWeight: 700,
                lineHeight: 1.5,
              }}
            >
              학생은 보기만 가능하고, 교사만 로그인 후 수정할 수 있습니다.
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}