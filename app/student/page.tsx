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
  avatar_url: string | null
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
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const [previewStudentName, setPreviewStudentName] = useState('')

  const fetchData = async () => {
    const { data: studentData, error: studentError } = await supabase
      .from('students')
      .select('id, name, group_id, reward_count, penalty_count, avatar_url')
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
                                              gap: '12px',
                                            }}
                                          >
                                            {sortedGroups.map((group, index) => {
                                              const total = group.reward_count - group.penalty_count
                                            
                                              return (
                                                <div
                                                  key={group.id}
                                                  style={{
                                                    backgroundColor: '#f8fbff',
                                                    borderRadius: '28px',
                                                    padding: '16px 18px',
                                                    border: '1px solid #e6edf7',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'space-between',
                                                    gap: '18px',
                                                    boxShadow: '0 8px 20px rgba(15, 23, 42, 0.04)',
                                                  }}
                                                >
                                                  <div
                                                    style={{
                                                      display: 'flex',
                                                      flexDirection: 'column',
                                                      alignItems: 'flex-start',
                                                      justifyContent: 'center',
                                                      minWidth: 0,
                                                      flex: 1,
                                                      gap: '10px',
                                                    }}
                                                  >
                                                    <div
                                                      style={{
                                                        fontSize: '44px',
                                                        fontWeight: 900,
                                                        color: '#0f172a',
                                                        lineHeight: 1,
                                                        wordBreak: 'keep-all',
                                                      }}
                                                    >
                                                      {group.name}
                                                    </div>
                                                    
                                                    <div
                                                      style={{
                                                        display: 'inline-block',
                                                        backgroundColor: '#eef2ff',
                                                        color: '#4f46e5',
                                                        borderRadius: '999px',
                                                        padding: '6px 14px',
                                                        fontSize: '24px',
                                                        fontWeight: 900,
                                                        lineHeight: 1,
                                                      }}
                                                    >
                                                      {index + 1}위
                                                    </div>
                                                  </div>
                                                    
                                                  <div
                                                    style={{
                                                      width: '150px',
                                                      borderRadius: '24px',
                                                      backgroundColor: '#ffffff',
                                                      border: '1px solid #e2e8f0',
                                                      padding: '16px 12px',
                                                      textAlign: 'center',
                                                      boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.8)',
                                                      flexShrink: 0,
                                                    }}
                                                  >
                                                    <div style={{ fontSize: '44px', lineHeight: 1 }}>☀️</div>
                                                    <div
                                                      style={{
                                                        marginTop: '10px',
                                                        fontSize: '48px',
                                                        fontWeight: 900,
                                                        color: total >= 0 ? '#22c55e' : '#ef4444',
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
                gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
                gap: '12px',
              }}
            >
                            {sortedStudents.map((student) => {
                              const total = student.reward_count - student.penalty_count

                              return (
                                <div
                                  key={student.id}
                                  style={{
                                    backgroundColor: '#f8fbff',
                                    borderRadius: '28px',
                                    padding: '18px 22px',
                                    border: '1px solid #e6edf7',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    gap: '18px',
                                    boxShadow: '0 8px 20px rgba(15, 23, 42, 0.04)',
                                  }}
                                >
                                  <div
                                    style={{
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '18px',
                                      minWidth: 0,
                                      flex: 1,
                                    }}
                                  >
                                    <div
                                      style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '10px',
                                        minWidth: '150px',
                                        flexShrink: 0,
                                      }}
                                    >
                                      <div
                                        onClick={() => {
                                          if (student.avatar_url) {
                                            setPreviewImage(student.avatar_url)
                                            setPreviewStudentName(student.name)
                                          }
                                        }}
                                        style={{
                                          width: '120px',
                                          height: '120px',
                                          borderRadius: '20px',
                                          overflow: 'hidden',
                                          border: '4px solid #d8ecff',
                                          backgroundColor: '#edf7ff',
                                          display: 'flex',
                                          alignItems: 'center',
                                          justifyContent: 'center',
                                          cursor: student.avatar_url ? 'pointer' : 'default',
                                          boxShadow: student.avatar_url ? '0 10px 24px rgba(0,0,0,0.12)' : 'none',
                                        }}
                                        title={student.avatar_url ? '클릭하면 크게 볼 수 있어요.' : ''}
                                      >
                                        {student.avatar_url ? (
                                          <img
                                            key={student.avatar_url}
                                            src={student.avatar_url}
                                            alt={student.name}
                                            style={{
                                              width: '100%',
                                              height: '100%',
                                              objectFit: 'cover',
                                            }}
                                          />
                                        ) : (
                                          <div style={{ fontSize: '36px' }}>🖼️</div>
                                        )}
                                      </div>
                                      
                                      <div
                                        style={{
                                          display: 'flex',
                                          alignItems: 'center',
                                          gap: '8px',
                                          flexWrap: 'wrap',
                                          justifyContent: 'center',
                                        }}
                                      >
                                        <span
                                          style={{
                                            display: 'inline-block',
                                            backgroundColor: '#eef2ff',
                                            color: '#4f46e5',
                                            borderRadius: '999px',
                                            padding: '4px 10px',
                                            fontSize: '13px',
                                            fontWeight: 800,
                                          }}
                                        >
                                          {getGroupName(student.group_id)}
                                        </span>
                                        
                                        <span
                                          style={{
                                            fontSize: '28px',
                                            fontWeight: 900,
                                            color: '#0f172a',
                                            lineHeight: 1.1,
                                            wordBreak: 'keep-all',
                                          }}
                                        >
                                          {student.name}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                        
                                                      <div
                                                        style={{
                                                          width: '160px',
                                                          minHeight: '190px',
                                                          borderRadius: '26px',
                                                          backgroundColor: '#ffffff',
                                                          border: '1px solid #e2e8f0',
                                                          padding: '20px 14px',
                                                          textAlign: 'center',
                                                          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.8)',
                                                          flexShrink: 0,
                                                          display: 'flex',
                                                          flexDirection: 'column',
                                                          alignItems: 'center',
                                                          justifyContent: 'center',
                                                        }}
                                                      >
                                                        <div
                                                          style={{
                                                            fontSize: '56px',
                                                            lineHeight: 1,
                                                          }}
                                                        >
                                                          ☀️
                                                        </div>
                                                        
                                                        <div
                                                          style={{
                                                            marginTop: '12px',
                                                            fontSize: '56px',
                                                            fontWeight: 900,
                                                            color: total >= 0 ? '#22c55e' : '#ef4444',
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

      {previewImage && (
        <div
          onClick={() => setPreviewImage(null)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.82)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
            zIndex: 9999,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: 'relative',
              maxWidth: '92vw',
              maxHeight: '92vh',
              display: 'grid',
              gap: '12px',
              justifyItems: 'center',
            }}
          >
            <button
              onClick={() => setPreviewImage(null)}
              style={{
                position: 'absolute',
                top: '-10px',
                right: '-10px',
                width: '44px',
                height: '44px',
                borderRadius: '999px',
                border: 'none',
                backgroundColor: '#ffffff',
                color: '#0f172a',
                fontSize: '22px',
                fontWeight: 900,
                cursor: 'pointer',
                boxShadow: '0 10px 24px rgba(0,0,0,0.18)',
              }}
            >
              ×
            </button>

            <img
              src={previewImage}
              alt={previewStudentName}
              style={{
                maxWidth: '92vw',
                maxHeight: '80vh',
                borderRadius: '24px',
                objectFit: 'contain',
                backgroundColor: '#ffffff',
                boxShadow: '0 20px 60px rgba(0,0,0,0.35)',
              }}
            />

            <div
              style={{
                color: '#ffffff',
                fontSize: '22px',
                fontWeight: 900,
                textAlign: 'center',
              }}
            >
              {previewStudentName}
            </div>
          </div>
        </div>
      )}
    </main>
  )
}