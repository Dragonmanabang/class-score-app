'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import CuteClassHero from '@/components/CuteClassHero'

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

  return (
    <main
      style={{
        minHeight: '100vh',
        background:
          'linear-gradient(180deg, #dbeafe 0%, #c7e0ff 45%, #eaf4ff 100%)',
        fontFamily: 'Pretendard, Arial, sans-serif',
        padding: '28px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div style={{ maxWidth: '1320px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
        <CuteClassHero
          badge="학생 화면"
          title="CLASS BOARD"
          subtitle="우리 반 기록을 한눈에 확인해요"
          rightStat1Label="학생 수"
          rightStat1Value={students.length}
          rightStat2Label="모둠 수"
          rightStat2Value={groups.length}
        />

        <section style={{ marginBottom: '26px' }}>
          <h2
            style={{
              margin: '0 0 14px 0',
              fontSize: '28px',
              fontWeight: 900,
              color: '#1e293b',
            }}
          >
            모둠 현황
          </h2>

          {sortedGroups.length === 0 ? (
            <div
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '24px',
                padding: '24px',
                color: '#64748b',
                fontWeight: 700,
              }}
            >
              등록된 모둠이 없습니다.
            </div>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                gap: '16px',
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
                      padding: '20px',
                      boxShadow: '0 14px 30px rgba(15, 23, 42, 0.08)',
                      border: '1px solid #e2e8f0',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        gap: '12px',
                        marginBottom: '16px',
                      }}
                    >
                      <div>
                        <div
                          style={{
                            fontSize: '26px',
                            fontWeight: 900,
                            color: '#0f172a',
                          }}
                        >
                          {group.name}
                        </div>
                        <div
                          style={{
                            marginTop: '8px',
                            display: 'inline-block',
                            backgroundColor: '#eef2ff',
                            color: '#4338ca',
                            borderRadius: '999px',
                            padding: '6px 12px',
                            fontWeight: 800,
                            fontSize: '13px',
                          }}
                        >
                          {index + 1}위
                        </div>
                      </div>


                    </div>

                    <div
                      style={{
                        backgroundColor: '#f7faff',
                        border: '1px solid #e2e8f0',
                        borderRadius: '18px',
                        padding: '18px',
                        textAlign: 'center',
                      }}
                    >
                      <div style={{ fontSize: '18px' }}>☀️</div>
                      <div
                        style={{
                          marginTop: '8px',
                          fontSize: '32px',
                          fontWeight: 900,
                          color: total >= 0 ? '#166534' : '#ef4444',
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

        <section>
          <h2
            style={{
              margin: '0 0 14px 0',
              fontSize: '28px',
              fontWeight: 900,
              color: '#1e293b',
            }}
          >
            학생 현황
          </h2>

          {sortedStudents.length === 0 ? (
            <div
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '24px',
                padding: '24px',
                color: '#64748b',
                fontWeight: 700,
              }}
            >
              등록된 학생이 없습니다.
            </div>
          ) : (
            <div
              style={{
                display: 'grid',
                gap: '14px',
              }}
            >
              {sortedStudents.map((student, index) => {
                const total = student.reward_count - student.penalty_count

                return (
                  <div
                    key={student.id}
                    style={{
                      backgroundColor: '#ffffff',
                      borderRadius: '22px',
                      padding: '18px 20px',
                      boxShadow: '0 14px 30px rgba(15, 23, 42, 0.08)',
                      border: '1px solid #e2e8f0',
                    }}
                  >
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '76px 1.8fr 1fr',                        
                        gap: '14px',
                        alignItems: 'center',
                      }}
                    >
                      <div
                        style={{
                          width: '58px',
                          height: '58px',
                          borderRadius: '50%',
                          backgroundColor: '#eef2ff',
                          color: '#4338ca',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 900,
                          fontSize: '22px',
                        }}
                      >
                        {index + 1}
                      </div>

                      <div>
                        <div
                          style={{
                            fontSize: '24px',
                            fontWeight: 900,
                            color: '#0f172a',
                          }}
                        >
                          {student.name}
                        </div>
                        <div
                          style={{
                            marginTop: '8px',
                            display: 'inline-block',
                            backgroundColor: '#f1f5f9',
                            color: '#334155',
                            borderRadius: '999px',
                            padding: '6px 12px',
                            fontWeight: 800,
                            fontSize: '13px',
                          }}
                        >
                          {getGroupName(student.group_id)}
                        </div>
                      </div>

                      <div
                        style={{
                          backgroundColor: '#f7faff',
                          borderRadius: '16px',
                          padding: '14px',
                          textAlign: 'center',
                          border: '1px solid #e2e8f0',
                        }}
                      >
                        <div
                          style={{
                            fontSize: '18px',
                            fontWeight: 800,
                            color: '#6366f1',
                          }}
                        >
                          ☀️
                        </div>
                        <div
                          style={{
                            marginTop: '6px',
                            fontSize: '28px',
                            fontWeight: 900,
                            color: total >= 0 ? '#16a34a' : '#ef4444',
                          }}
                        >
                          {total >= 0 ? `+${total}` : total}
                        </div>
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