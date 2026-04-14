'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

type Student = {
  id: string
  name: string
  group_id: string | null
  reward_count: number
  penalty_count: number
}

type Group = {
  id: string
  name: string
  reward_count: number
  penalty_count: number
}

export default function StudentPage() {
  const [students, setStudents] = useState<Student[]>([])
  const [groups, setGroups] = useState<Group[]>([])

  const fetchData = async () => {
    const { data: studentData, error: studentError } = await supabase
      .from('students')
      .select('id, name, group_id, reward_count, penalty_count')
      .order('name', { ascending: true })

    if (studentError) {
      console.error('학생 불러오기 오류:', studentError)
    } else {
      setStudents(studentData || [])
    }

    const { data: groupData, error: groupError } = await supabase
      .from('groups')
      .select('id, name, reward_count, penalty_count')
      .order('name', { ascending: true })

    if (groupError) {
      console.error('모둠 불러오기 오류:', groupError)
    } else {
      setGroups(groupData || [])
    }
  }

  useEffect(() => {
    fetchData()

    const interval = setInterval(() => {
      fetchData()
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  const getGroupName = (groupId: string | null) => {
    if (!groupId) return '미배정'
    const found = groups.find((group) => group.id === groupId)
    return found ? found.name : '미배정'
  }

  const sortedGroups = [...groups].sort((a, b) => {
    const aTotal = a.reward_count - a.penalty_count
    const bTotal = b.reward_count - b.penalty_count
    return bTotal - aTotal
  })

  const sortedStudents = [...students].sort((a, b) => {
    const aTotal = a.reward_count - a.penalty_count
    const bTotal = b.reward_count - b.penalty_count
    return bTotal - aTotal
  })

  const getGroupBadgeColor = (index: number) => {
    const colors = ['#2563eb', '#16a34a', '#f59e0b', '#ef4444', '#7c3aed', '#0f766e']
    return colors[index % colors.length]
  }

  return (
    <main
      style={{
        minHeight: '100vh',
        background:
          'linear-gradient(180deg, #f8fbff 0%, #eef6ff 45%, #f9fbff 100%)',
        padding: '28px',
        fontFamily: 'Pretendard, Arial, sans-serif',
      }}
    >
      <div
        style={{
          maxWidth: '1400px',
          margin: '0 auto',
        }}
      >
        <section
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '28px',
            padding: '28px 32px',
            boxShadow: '0 18px 40px rgba(37, 99, 235, 0.10)',
            marginBottom: '24px',
            border: '1px solid #e5eefc',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '16px',
              flexWrap: 'wrap',
            }}
          >
            <div>
              <div
                style={{
                  display: 'inline-block',
                  backgroundColor: '#dbeafe',
                  color: '#1d4ed8',
                  padding: '8px 14px',
                  borderRadius: '999px',
                  fontWeight: 700,
                  fontSize: '15px',
                  marginBottom: '14px',
                }}
              >
                우리 반 현황판
              </div>

              <h1
                style={{
                  margin: 0,
                  fontSize: '44px',
                  lineHeight: 1.2,
                  color: '#0f172a',
                  fontWeight: 800,
                }}
              >
                모둠과 학생 기록 보기
              </h1>

              <p
                style={{
                  margin: '12px 0 0 0',
                  fontSize: '20px',
                  color: '#475569',
                  lineHeight: 1.5,
                }}
              >
                모둠별 기록과 학생별 기록을 한눈에 확인할 수 있어요.
              </p>
            </div>

            <div
              style={{
                minWidth: '240px',
                backgroundColor: '#f8fbff',
                border: '1px solid #dbeafe',
                borderRadius: '22px',
                padding: '18px 20px',
              }}
            >
              <div
                style={{
                  fontSize: '15px',
                  color: '#64748b',
                  marginBottom: '8px',
                  fontWeight: 700,
                }}
              >
                현재 인원
              </div>
              <div
                style={{
                  fontSize: '34px',
                  fontWeight: 800,
                  color: '#0f172a',
                  marginBottom: '6px',
                }}
              >
                {students.length}명
              </div>
              <div
                style={{
                  fontSize: '16px',
                  color: '#64748b',
                }}
              >
                모둠 {groups.length}개 운영 중
              </div>
            </div>
          </div>
        </section>

        <section style={{ marginBottom: '32px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '12px',
              marginBottom: '16px',
            }}
          >
            <h2
              style={{
                margin: 0,
                fontSize: '32px',
                color: '#0f172a',
                fontWeight: 800,
              }}
            >
              모둠 현황
            </h2>

            <div
              style={{
                fontSize: '17px',
                color: '#64748b',
                fontWeight: 600,
              }}
            >
              모둠 카드가 먼저 크게 보이도록 구성했어요.
            </div>
          </div>

          {sortedGroups.length === 0 ? (
            <div
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '22px',
                padding: '28px',
                border: '1px solid #e5e7eb',
                color: '#64748b',
                fontSize: '18px',
              }}
            >
              등록된 모둠이 없습니다.
            </div>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '18px',
              }}
            >
              {sortedGroups.map((group, index) => {
                const total = group.reward_count - group.penalty_count

                return (
                  <div
                    key={group.id}
                    style={{
                      backgroundColor: '#ffffff',
                      borderRadius: '24px',
                      padding: '22px',
                      boxShadow: '0 12px 28px rgba(15, 23, 42, 0.06)',
                      border: '1px solid #e8eef7',
                      position: 'relative',
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '8px',
                        backgroundColor: getGroupBadgeColor(index),
                      }}
                    />

                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        gap: '12px',
                        marginBottom: '18px',
                      }}
                    >
                      <div>
                        <div
                          style={{
                            fontSize: '28px',
                            fontWeight: 800,
                            color: '#0f172a',
                            marginBottom: '8px',
                          }}
                        >
                          {group.name}
                        </div>
                        <div
                          style={{
                            display: 'inline-block',
                            backgroundColor: '#f1f5f9',
                            color: '#334155',
                            borderRadius: '999px',
                            padding: '6px 12px',
                            fontWeight: 700,
                            fontSize: '14px',
                          }}
                        >
                          순위 {index + 1}
                        </div>
                      </div>

                      <div
                        style={{
                          minWidth: '82px',
                          textAlign: 'center',
                          backgroundColor: '#eff6ff',
                          borderRadius: '18px',
                          padding: '10px 12px',
                        }}
                      >
                        <div
                          style={{
                            fontSize: '13px',
                            color: '#64748b',
                            fontWeight: 700,
                            marginBottom: '6px',
                          }}
                        >
                          종합
                        </div>
                        <div
                          style={{
                            fontSize: '28px',
                            fontWeight: 800,
                            color: total >= 0 ? '#16a34a' : '#ef4444',
                          }}
                        >
                          {total >= 0 ? `+${total}` : total}
                        </div>
                      </div>
                    </div>

                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: '12px',
                      }}
                    >
                      <div
                        style={{
                          backgroundColor: '#f0fdf4',
                          borderRadius: '18px',
                          padding: '18px',
                          border: '1px solid #dcfce7',
                        }}
                      >
                        <div
                          style={{
                            fontSize: '18px',
                            marginBottom: '10px',
                          }}
                        >
                          👍
                        </div>
                        <div
                          style={{
                            fontSize: '32px',
                            fontWeight: 800,
                            color: '#166534',
                            lineHeight: 1,
                          }}
                        >
                          {group.reward_count}
                        </div>
                        <div
                          style={{
                            marginTop: '8px',
                            color: '#166534',
                            fontWeight: 700,
                            fontSize: '15px',
                          }}
                        >
                          받은 횟수
                        </div>
                      </div>

                      <div
                        style={{
                          backgroundColor: '#f8fafc',
                          borderRadius: '18px',
                          padding: '18px',
                          border: '1px solid #e2e8f0',
                        }}
                      >
                        <div
                          style={{
                            fontSize: '18px',
                            marginBottom: '10px',
                          }}
                        >
                          ☁️
                        </div>
                        <div
                          style={{
                            fontSize: '32px',
                            fontWeight: 800,
                            color: '#475569',
                            lineHeight: 1,
                          }}
                        >
                          {group.penalty_count}
                        </div>
                        <div
                          style={{
                            marginTop: '8px',
                            color: '#475569',
                            fontWeight: 700,
                            fontSize: '15px',
                          }}
                        >
                          받은 횟수
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </section>

        <section>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '12px',
              marginBottom: '16px',
            }}
          >
            <h2
              style={{
                margin: 0,
                fontSize: '32px',
                color: '#0f172a',
                fontWeight: 800,
              }}
            >
              학생 현황
            </h2>

            <div
              style={{
                fontSize: '17px',
                color: '#64748b',
                fontWeight: 600,
              }}
            >
              받은 기록이 많은 순서대로 정렬됩니다.
            </div>
          </div>

          {sortedStudents.length === 0 ? (
            <div
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '22px',
                padding: '28px',
                border: '1px solid #e5e7eb',
                color: '#64748b',
                fontSize: '18px',
              }}
            >
              등록된 학생이 없습니다.
            </div>
          ) : (
            <div
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '24px',
                padding: '12px',
                boxShadow: '0 12px 28px rgba(15, 23, 42, 0.06)',
                border: '1px solid #e8eef7',
              }}
            >
              {sortedStudents.map((student, index) => {
                const total = student.reward_count - student.penalty_count

                return (
                  <div
                    key={student.id}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '90px 1.5fr 1fr 1fr 1fr',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '16px 18px',
                      borderBottom:
                        index === sortedStudents.length - 1
                          ? 'none'
                          : '1px solid #eef2f7',
                    }}
                  >
                    <div>
                      <div
                        style={{
                          width: '58px',
                          height: '58px',
                          borderRadius: '50%',
                          backgroundColor: '#dbeafe',
                          color: '#1d4ed8',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 800,
                          fontSize: '22px',
                        }}
                      >
                        {index + 1}
                      </div>
                    </div>

                    <div>
                      <div
                        style={{
                          fontSize: '24px',
                          fontWeight: 800,
                          color: '#0f172a',
                          marginBottom: '6px',
                        }}
                      >
                        {student.name}
                      </div>
                      <div
                        style={{
                          display: 'inline-block',
                          backgroundColor: '#f1f5f9',
                          color: '#334155',
                          borderRadius: '999px',
                          padding: '6px 12px',
                          fontWeight: 700,
                          fontSize: '14px',
                        }}
                      >
                        {getGroupName(student.group_id)}
                      </div>
                    </div>

                    <div
                      style={{
                        backgroundColor: '#f0fdf4',
                        borderRadius: '18px',
                        padding: '14px 16px',
                        textAlign: 'center',
                      }}
                    >
                      <div style={{ fontSize: '16px', marginBottom: '8px' }}>👍</div>
                      <div
                        style={{
                          fontSize: '28px',
                          fontWeight: 800,
                          color: '#166534',
                          lineHeight: 1,
                        }}
                      >
                        {student.reward_count}
                      </div>
                    </div>

                    <div
                      style={{
                        backgroundColor: '#f8fafc',
                        borderRadius: '18px',
                        padding: '14px 16px',
                        textAlign: 'center',
                      }}
                    >
                      <div style={{ fontSize: '16px', marginBottom: '8px' }}>☁️</div>
                      <div
                        style={{
                          fontSize: '28px',
                          fontWeight: 800,
                          color: '#475569',
                          lineHeight: 1,
                        }}
                      >
                        {student.penalty_count}
                      </div>
                    </div>

                    <div
                      style={{
                        backgroundColor: '#eff6ff',
                        borderRadius: '18px',
                        padding: '14px 16px',
                        textAlign: 'center',
                      }}
                    >
                      <div
                        style={{
                          fontSize: '14px',
                          color: '#64748b',
                          marginBottom: '8px',
                          fontWeight: 700,
                        }}
                      >
                        종합
                      </div>
                      <div
                        style={{
                          fontSize: '30px',
                          fontWeight: 800,
                          color: total >= 0 ? '#16a34a' : '#ef4444',
                          lineHeight: 1,
                        }}
                      >
                        {total >= 0 ? `+${total}` : total}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  )
}