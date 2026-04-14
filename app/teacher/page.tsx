'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
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

type ActionType = 'reward' | 'penalty'

export default function TeacherPage() {
  const router = useRouter()

  const [checkingAuth, setCheckingAuth] = useState(true)

  const [students, setStudents] = useState<Student[]>([])
  const [groups, setGroups] = useState<Group[]>([])

  const [loadingStudentId, setLoadingStudentId] = useState<string | null>(null)
  const [loadingGroupId, setLoadingGroupId] = useState<string | null>(null)
  const [changingGroupStudentId, setChangingGroupStudentId] = useState<string | null>(null)

  const [resettingStudents, setResettingStudents] = useState(false)
  const [resettingGroups, setResettingGroups] = useState(false)

  const [newStudentName, setNewStudentName] = useState('')
  const [newStudentGroupId, setNewStudentGroupId] = useState('')
  const [addingStudent, setAddingStudent] = useState(false)

  const [newGroupName, setNewGroupName] = useState('')
  const [addingGroup, setAddingGroup] = useState(false)

  const [editingStudentId, setEditingStudentId] = useState<string | null>(null)
  const [editingStudentName, setEditingStudentName] = useState('')
  const [savingStudentNameId, setSavingStudentNameId] = useState<string | null>(null)

  const [editingGroupId, setEditingGroupId] = useState<string | null>(null)
  const [editingGroupName, setEditingGroupName] = useState('')
  const [savingGroupNameId, setSavingGroupNameId] = useState<string | null>(null)

  const [deletingStudentId, setDeletingStudentId] = useState<string | null>(null)
  const [deletingGroupId, setDeletingGroupId] = useState<string | null>(null)

  const checkUser = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      router.push('/login')
      return
    }

    setCheckingAuth(false)
  }

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
    const init = async () => {
      await checkUser()
      await fetchData()
    }

    init()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const getGroupName = (groupId: string | null) => {
    if (!groupId) return '미배정'
    const found = groups.find((group) => group.id === groupId)
    return found ? found.name : '미배정'
  }

  const getScoreDiff = (reward: number, penalty: number) => reward - penalty

  const applyActionToStudent = async (
    student: Student,
    actionType: ActionType
  ) => {
    setLoadingStudentId(student.id)

    const nextReward =
      actionType === 'reward' ? student.reward_count + 1 : student.reward_count
    const nextPenalty =
      actionType === 'penalty' ? student.penalty_count + 1 : student.penalty_count

    const { error: updateError } = await supabase
      .from('students')
      .update({
        reward_count: nextReward,
        penalty_count: nextPenalty,
      })
      .eq('id', student.id)

    if (updateError) {
      console.error('학생 기록 업데이트 오류:', updateError)
      alert(`학생 기록 업데이트 오류: ${updateError.message}`)
      setLoadingStudentId(null)
      return
    }

    const { error: logError } = await supabase
      .from('score_logs')
      .insert([
        {
          target_type: 'student',
          target_id: student.id,
          points: 1,
          action_type: actionType,
        },
      ])

    if (logError) {
      console.error('학생 로그 저장 오류:', logError)
      alert(`학생 로그 저장 오류: ${logError.message}`)
    }

    await fetchData()
    setLoadingStudentId(null)
  }

  const applyActionToGroup = async (
    group: Group,
    actionType: ActionType
  ) => {
    setLoadingGroupId(group.id)

    const nextGroupReward =
      actionType === 'reward' ? group.reward_count + 1 : group.reward_count
    const nextGroupPenalty =
      actionType === 'penalty' ? group.penalty_count + 1 : group.penalty_count

    const { error: groupUpdateError } = await supabase
      .from('groups')
      .update({
        reward_count: nextGroupReward,
        penalty_count: nextGroupPenalty,
      })
      .eq('id', group.id)

    if (groupUpdateError) {
      console.error('모둠 기록 업데이트 오류:', groupUpdateError)
      alert(`모둠 기록 업데이트 오류: ${groupUpdateError.message}`)
      setLoadingGroupId(null)
      return
    }

    const { data: memberStudents, error: memberError } = await supabase
      .from('students')
      .select('id, reward_count, penalty_count')
      .eq('group_id', group.id)

    if (memberError) {
      console.error('모둠 학생 불러오기 오류:', memberError)
      alert(`모둠 학생 불러오기 오류: ${memberError.message}`)
      setLoadingGroupId(null)
      return
    }

    if (memberStudents && memberStudents.length > 0) {
      for (const member of memberStudents) {
        const updatedReward =
          actionType === 'reward' ? member.reward_count + 1 : member.reward_count
        const updatedPenalty =
          actionType === 'penalty' ? member.penalty_count + 1 : member.penalty_count

        const { error: studentUpdateError } = await supabase
          .from('students')
          .update({
            reward_count: updatedReward,
            penalty_count: updatedPenalty,
          })
          .eq('id', member.id)

        if (studentUpdateError) {
          console.error('모둠 소속 학생 기록 업데이트 오류:', studentUpdateError)
        }
      }
    }

    const logsToInsert = [
      {
        target_type: 'group',
        target_id: group.id,
        points: 1,
        action_type: actionType,
      },
      ...(memberStudents || []).map((member) => ({
        target_type: 'student',
        target_id: member.id,
        points: 1,
        action_type: actionType,
      })),
    ]

    const { error: logError } = await supabase
      .from('score_logs')
      .insert(logsToInsert)

    if (logError) {
      console.error('모둠 로그 저장 오류:', logError)
      alert(`모둠 로그 저장 오류: ${logError.message}`)
    }

    await fetchData()
    setLoadingGroupId(null)
  }

  const changeStudentGroup = async (
    studentId: string,
    oldGroupId: string | null,
    newGroupId: string | null
  ) => {
    if (oldGroupId === newGroupId) return

    setChangingGroupStudentId(studentId)

    const { error: changeError } = await supabase
      .from('students')
      .update({ group_id: newGroupId })
      .eq('id', studentId)

    if (changeError) {
      console.error('모둠 변경 오류:', changeError)
      alert(`모둠 변경 오류: ${changeError.message}`)
      setChangingGroupStudentId(null)
      return
    }

    const affectedGroupIds = [oldGroupId, newGroupId].filter(
      (value): value is string => !!value
    )

    const uniqueGroupIds = [...new Set(affectedGroupIds)]

    for (const groupId of uniqueGroupIds) {
      const { error: resetError } = await supabase
        .from('groups')
        .update({
          reward_count: 0,
          penalty_count: 0,
        })
        .eq('id', groupId)

      if (resetError) {
        console.error('모둠 초기화 오류:', resetError)
      }
    }

    await fetchData()
    setChangingGroupStudentId(null)
  }

  const resetAllStudentRecords = async () => {
    const ok = window.confirm('학생 전체 기록을 초기화할까요?')
    if (!ok) return

    setResettingStudents(true)

    const { error } = await supabase
      .from('students')
      .update({
        reward_count: 0,
        penalty_count: 0,
      })
      .neq('id', '')

    if (error) {
      console.error('학생 전체 초기화 오류:', error)
      alert(`학생 전체 초기화 오류: ${error.message}`)
    }

    await fetchData()
    setResettingStudents(false)
  }

  const resetAllGroupRecords = async () => {
    const ok = window.confirm('모둠 전체 기록을 초기화할까요?')
    if (!ok) return

    setResettingGroups(true)

    const { error } = await supabase
      .from('groups')
      .update({
        reward_count: 0,
        penalty_count: 0,
      })
      .neq('id', '')

    if (error) {
      console.error('모둠 전체 초기화 오류:', error)
      alert(`모둠 전체 초기화 오류: ${error.message}`)
    }

    await fetchData()
    setResettingGroups(false)
  }

  const addStudent = async () => {
    const trimmedName = newStudentName.trim()

    if (!trimmedName) {
      alert('학생 이름을 입력하세요.')
      return
    }

    setAddingStudent(true)

    const { error } = await supabase.from('students').insert([
      {
        name: trimmedName,
        group_id: newStudentGroupId || null,
        reward_count: 0,
        penalty_count: 0,
      },
    ])

    if (error) {
      console.error('학생 추가 오류:', error)
      alert(`학생 추가 오류: ${error.message}`)
      setAddingStudent(false)
      return
    }

    setNewStudentName('')
    setNewStudentGroupId('')
    await fetchData()
    setAddingStudent(false)
  }

  const addGroup = async () => {
    const trimmedName = newGroupName.trim()

    if (!trimmedName) {
      alert('모둠 이름을 입력하세요.')
      return
    }

    setAddingGroup(true)

    const { error } = await supabase.from('groups').insert([
      {
        name: trimmedName,
        reward_count: 0,
        penalty_count: 0,
      },
    ])

    if (error) {
      console.error('모둠 추가 오류:', error)
      alert(`모둠 추가 오류: ${error.message}`)
      setAddingGroup(false)
      return
    }

    setNewGroupName('')
    await fetchData()
    setAddingGroup(false)
  }

  const startEditStudentName = (student: Student) => {
    setEditingStudentId(student.id)
    setEditingStudentName(student.name)
  }

  const cancelEditStudentName = () => {
    setEditingStudentId(null)
    setEditingStudentName('')
  }

  const saveStudentName = async (studentId: string) => {
    const trimmedName = editingStudentName.trim()

    if (!trimmedName) {
      alert('학생 이름을 입력하세요.')
      return
    }

    setSavingStudentNameId(studentId)

    const { error } = await supabase
      .from('students')
      .update({ name: trimmedName })
      .eq('id', studentId)

    if (error) {
      console.error('학생 이름 수정 오류:', error)
      alert(`학생 이름 수정 오류: ${error.message}`)
      setSavingStudentNameId(null)
      return
    }

    setEditingStudentId(null)
    setEditingStudentName('')
    await fetchData()
    setSavingStudentNameId(null)
  }

  const startEditGroupName = (group: Group) => {
    setEditingGroupId(group.id)
    setEditingGroupName(group.name)
  }

  const cancelEditGroupName = () => {
    setEditingGroupId(null)
    setEditingGroupName('')
  }

  const saveGroupName = async (groupId: string) => {
    const trimmedName = editingGroupName.trim()

    if (!trimmedName) {
      alert('모둠 이름을 입력하세요.')
      return
    }

    setSavingGroupNameId(groupId)

    const { error } = await supabase
      .from('groups')
      .update({ name: trimmedName })
      .eq('id', groupId)

    if (error) {
      console.error('모둠 이름 수정 오류:', error)
      alert(`모둠 이름 수정 오류: ${error.message}`)
      setSavingGroupNameId(null)
      return
    }

    setEditingGroupId(null)
    setEditingGroupName('')
    await fetchData()
    setSavingGroupNameId(null)
  }

  const deleteStudent = async (studentId: string, studentName: string) => {
    const ok = window.confirm(`${studentName} 학생을 삭제할까요?`)
    if (!ok) return

    setDeletingStudentId(studentId)

    const { error } = await supabase
      .from('students')
      .delete()
      .eq('id', studentId)

    if (error) {
      console.error('학생 삭제 오류:', error)
      alert(`학생 삭제 오류: ${error.message}`)
      setDeletingStudentId(null)
      return
    }

    await fetchData()
    setDeletingStudentId(null)
  }

  const deleteGroup = async (groupId: string, groupName: string) => {
    const ok = window.confirm(
      `${groupName} 모둠을 삭제할까요?\n소속 학생들은 미배정으로 바뀝니다.`
    )
    if (!ok) return

    setDeletingGroupId(groupId)

    const { error: studentUpdateError } = await supabase
      .from('students')
      .update({ group_id: null })
      .eq('group_id', groupId)

    if (studentUpdateError) {
      console.error('모둠 삭제 전 학생 정리 오류:', studentUpdateError)
      alert(`모둠 삭제 전 학생 정리 오류: ${studentUpdateError.message}`)
      setDeletingGroupId(null)
      return
    }

    const { error: groupDeleteError } = await supabase
      .from('groups')
      .delete()
      .eq('id', groupId)

    if (groupDeleteError) {
      console.error('모둠 삭제 오류:', groupDeleteError)
      alert(`모둠 삭제 오류: ${groupDeleteError.message}`)
      setDeletingGroupId(null)
      return
    }

    await fetchData()
    setDeletingGroupId(null)
  }

  if (checkingAuth) {
    return (
      <main
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'Pretendard, Arial, sans-serif',
          background: 'linear-gradient(180deg, #f8fbff 0%, #eef6ff 100%)',
        }}
      >
        <div
          style={{
            backgroundColor: '#ffffff',
            padding: '24px 28px',
            borderRadius: '20px',
            boxShadow: '0 14px 34px rgba(37, 99, 235, 0.10)',
            fontSize: '18px',
            fontWeight: 700,
            color: '#334155',
          }}
        >
          로그인 상태 확인 중...
        </div>
      </main>
    )
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
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
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
              alignItems: 'flex-start',
              gap: '20px',
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
                교사 전용 관리 화면
              </div>

              <h1
                style={{
                  margin: 0,
                  fontSize: '42px',
                  lineHeight: 1.2,
                  color: '#0f172a',
                  fontWeight: 800,
                }}
              >
                교실 기록 관리
              </h1>

              <p
                style={{
                  margin: '12px 0 0 0',
                  fontSize: '19px',
                  color: '#475569',
                  lineHeight: 1.5,
                }}
              >
                학생과 모둠을 관리하고 👍 또는 ☁️ 기록을 빠르게 부여할 수 있어요.
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
              <div
                style={{
                  backgroundColor: '#f8fbff',
                  border: '1px solid #dbeafe',
                  borderRadius: '20px',
                  padding: '16px 18px',
                  minWidth: '180px',
                }}
              >
                <div
                  style={{
                    fontSize: '14px',
                    color: '#64748b',
                    fontWeight: 700,
                    marginBottom: '8px',
                  }}
                >
                  현재 학생 수
                </div>
                <div
                  style={{
                    fontSize: '30px',
                    fontWeight: 800,
                    color: '#0f172a',
                  }}
                >
                  {students.length}명
                </div>
              </div>

              <div
                style={{
                  backgroundColor: '#fffaf0',
                  border: '1px solid #fde68a',
                  borderRadius: '20px',
                  padding: '16px 18px',
                  minWidth: '180px',
                }}
              >
                <div
                  style={{
                    fontSize: '14px',
                    color: '#78716c',
                    fontWeight: 700,
                    marginBottom: '8px',
                  }}
                >
                  현재 모둠 수
                </div>
                <div
                  style={{
                    fontSize: '30px',
                    fontWeight: 800,
                    color: '#0f172a',
                  }}
                >
                  {groups.length}개
                </div>
              </div>

              <button
                onClick={handleLogout}
                style={{
                  padding: '16px 20px',
                  border: 'none',
                  borderRadius: '18px',
                  backgroundColor: '#ef4444',
                  color: '#fff',
                  fontWeight: 800,
                  fontSize: '15px',
                  cursor: 'pointer',
                  boxShadow: '0 10px 20px rgba(239, 68, 68, 0.22)',
                }}
              >
                로그아웃
              </button>
            </div>
          </div>
        </section>

        <section
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '18px',
            marginBottom: '22px',
          }}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '24px',
              padding: '22px',
              boxShadow: '0 12px 28px rgba(15, 23, 42, 0.06)',
              border: '1px solid #e8eef7',
            }}
          >
            <h2
              style={{
                margin: '0 0 14px 0',
                fontSize: '24px',
                color: '#0f172a',
                fontWeight: 800,
              }}
            >
              학생 추가
            </h2>

            <div style={{ display: 'grid', gap: '12px' }}>
              <input
                value={newStudentName}
                onChange={(e) => setNewStudentName(e.target.value)}
                placeholder="학생 이름 입력"
                style={{
                  padding: '14px 16px',
                  borderRadius: '14px',
                  border: '1px solid #cbd5e1',
                  fontSize: '16px',
                  outline: 'none',
                }}
              />

              <select
                value={newStudentGroupId}
                onChange={(e) => setNewStudentGroupId(e.target.value)}
                style={{
                  padding: '14px 16px',
                  borderRadius: '14px',
                  border: '1px solid #cbd5e1',
                  fontSize: '16px',
                  outline: 'none',
                }}
              >
                <option value="">미배정</option>
                {groups.map((group) => (
                  <option key={group.id} value={group.id}>
                    {group.name}
                  </option>
                ))}
              </select>

              <button
                onClick={addStudent}
                disabled={addingStudent}
                style={{
                  padding: '14px 18px',
                  border: 'none',
                  borderRadius: '14px',
                  backgroundColor: addingStudent ? '#cbd5e1' : '#2563eb',
                  color: '#fff',
                  fontWeight: 800,
                  fontSize: '15px',
                  cursor: addingStudent ? 'not-allowed' : 'pointer',
                }}
              >
                {addingStudent ? '추가 중...' : '학생 추가'}
              </button>
            </div>
          </div>

          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '24px',
              padding: '22px',
              boxShadow: '0 12px 28px rgba(15, 23, 42, 0.06)',
              border: '1px solid #e8eef7',
            }}
          >
            <h2
              style={{
                margin: '0 0 14px 0',
                fontSize: '24px',
                color: '#0f172a',
                fontWeight: 800,
              }}
            >
              모둠 추가
            </h2>

            <div style={{ display: 'grid', gap: '12px' }}>
              <input
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                placeholder="모둠 이름 입력"
                style={{
                  padding: '14px 16px',
                  borderRadius: '14px',
                  border: '1px solid #cbd5e1',
                  fontSize: '16px',
                  outline: 'none',
                }}
              />

              <button
                onClick={addGroup}
                disabled={addingGroup}
                style={{
                  padding: '14px 18px',
                  border: 'none',
                  borderRadius: '14px',
                  backgroundColor: addingGroup ? '#d6d3d1' : '#f59e0b',
                  color: '#fff',
                  fontWeight: 800,
                  fontSize: '15px',
                  cursor: addingGroup ? 'not-allowed' : 'pointer',
                }}
              >
                {addingGroup ? '추가 중...' : '모둠 추가'}
              </button>
            </div>
          </div>
        </section>

        <section
          style={{
            display: 'flex',
            gap: '12px',
            flexWrap: 'wrap',
            marginBottom: '28px',
          }}
        >
          <button
            onClick={resetAllStudentRecords}
            disabled={resettingStudents}
            style={{
              padding: '14px 18px',
              border: 'none',
              borderRadius: '16px',
              backgroundColor: resettingStudents ? '#cbd5e1' : '#2563eb',
              color: '#fff',
              fontWeight: 800,
              fontSize: '15px',
              cursor: resettingStudents ? 'not-allowed' : 'pointer',
            }}
          >
            {resettingStudents ? '학생 기록 초기화 중...' : '학생 기록 전체 초기화'}
          </button>

          <button
            onClick={resetAllGroupRecords}
            disabled={resettingGroups}
            style={{
              padding: '14px 18px',
              border: 'none',
              borderRadius: '16px',
              backgroundColor: resettingGroups ? '#d6d3d1' : '#f59e0b',
              color: '#fff',
              fontWeight: 800,
              fontSize: '15px',
              cursor: resettingGroups ? 'not-allowed' : 'pointer',
            }}
          >
            {resettingGroups ? '모둠 기록 초기화 중...' : '모둠 기록 전체 초기화'}
          </button>
        </section>

        <section style={{ marginBottom: '34px' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
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
              모둠 관리
            </h2>
            <div
              style={{
                color: '#64748b',
                fontSize: '16px',
                fontWeight: 600,
              }}
            >
              모둠 전체 현황과 빠른 관리 기능
            </div>
          </div>

          {groups.length === 0 ? (
            <div
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '22px',
                padding: '24px',
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
                gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                gap: '16px',
              }}
            >
              {groups.map((group) => {
                const total = getScoreDiff(group.reward_count, group.penalty_count)

                return (
                  <div
                    key={group.id}
                    style={{
                      backgroundColor: '#ffffff',
                      borderRadius: '24px',
                      padding: '20px',
                      boxShadow: '0 12px 28px rgba(15, 23, 42, 0.06)',
                      border: '1px solid #e8eef7',
                    }}
                  >
                    {editingGroupId === group.id ? (
                      <div style={{ display: 'grid', gap: '10px' }}>
                        <input
                          value={editingGroupName}
                          onChange={(e) => setEditingGroupName(e.target.value)}
                          style={{
                            padding: '12px 14px',
                            borderRadius: '14px',
                            border: '1px solid #cbd5e1',
                            fontSize: '16px',
                          }}
                        />
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                          <button
                            onClick={() => saveGroupName(group.id)}
                            disabled={savingGroupNameId === group.id}
                            style={{
                              padding: '11px 14px',
                              border: 'none',
                              borderRadius: '12px',
                              backgroundColor:
                                savingGroupNameId === group.id ? '#cbd5e1' : '#2563eb',
                              color: '#fff',
                              fontWeight: 800,
                              cursor:
                                savingGroupNameId === group.id
                                  ? 'not-allowed'
                                  : 'pointer',
                            }}
                          >
                            저장
                          </button>
                          <button
                            onClick={cancelEditGroupName}
                            style={{
                              padding: '11px 14px',
                              border: 'none',
                              borderRadius: '12px',
                              backgroundColor: '#94a3b8',
                              color: '#fff',
                              fontWeight: 800,
                              cursor: 'pointer',
                            }}
                          >
                            취소
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
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
                                backgroundColor: '#eff6ff',
                                color: '#1d4ed8',
                                borderRadius: '999px',
                                padding: '6px 12px',
                                fontWeight: 800,
                                fontSize: '14px',
                              }}
                            >
                              종합 {total >= 0 ? `+${total}` : total}
                            </div>
                          </div>
                        </div>

                        <div
                          style={{
                            display: 'grid',
                            gridTemplateColumns: '1fr 1fr',
                            gap: '10px',
                            marginBottom: '16px',
                          }}
                        >
                          <div
                            style={{
                              backgroundColor: '#f0fdf4',
                              borderRadius: '16px',
                              padding: '16px',
                              textAlign: 'center',
                              border: '1px solid #dcfce7',
                            }}
                          >
                            <div style={{ fontSize: '16px', marginBottom: '8px' }}>👍</div>
                            <div
                              style={{
                                fontSize: '30px',
                                fontWeight: 800,
                                color: '#166534',
                              }}
                            >
                              {group.reward_count}
                            </div>
                          </div>

                          <div
                            style={{
                              backgroundColor: '#f8fafc',
                              borderRadius: '16px',
                              padding: '16px',
                              textAlign: 'center',
                              border: '1px solid #e2e8f0',
                            }}
                          >
                            <div style={{ fontSize: '16px', marginBottom: '8px' }}>☁️</div>
                            <div
                              style={{
                                fontSize: '30px',
                                fontWeight: 800,
                                color: '#475569',
                              }}
                            >
                              {group.penalty_count}
                            </div>
                          </div>
                        </div>

                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                          <button
                            onClick={() => applyActionToGroup(group, 'reward')}
                            disabled={loadingGroupId === group.id}
                            style={{
                              padding: '11px 14px',
                              border: 'none',
                              borderRadius: '12px',
                              backgroundColor:
                                loadingGroupId === group.id ? '#cbd5e1' : '#16a34a',
                              color: '#fff',
                              fontWeight: 800,
                              cursor:
                                loadingGroupId === group.id ? 'not-allowed' : 'pointer',
                            }}
                          >
                            👍 주기
                          </button>

                          <button
                            onClick={() => applyActionToGroup(group, 'penalty')}
                            disabled={loadingGroupId === group.id}
                            style={{
                              padding: '11px 14px',
                              border: 'none',
                              borderRadius: '12px',
                              backgroundColor:
                                loadingGroupId === group.id ? '#cbd5e1' : '#64748b',
                              color: '#fff',
                              fontWeight: 800,
                              cursor:
                                loadingGroupId === group.id ? 'not-allowed' : 'pointer',
                            }}
                          >
                            ☁️ 주기
                          </button>

                          <button
                            onClick={() => startEditGroupName(group)}
                            style={{
                              padding: '11px 14px',
                              border: 'none',
                              borderRadius: '12px',
                              backgroundColor: '#2563eb',
                              color: '#fff',
                              fontWeight: 800,
                              cursor: 'pointer',
                            }}
                          >
                            이름 수정
                          </button>

                          <button
                            onClick={() => deleteGroup(group.id, group.name)}
                            disabled={deletingGroupId === group.id}
                            style={{
                              padding: '11px 14px',
                              border: 'none',
                              borderRadius: '12px',
                              backgroundColor:
                                deletingGroupId === group.id ? '#cbd5e1' : '#ef4444',
                              color: '#fff',
                              fontWeight: 800,
                              cursor:
                                deletingGroupId === group.id ? 'not-allowed' : 'pointer',
                            }}
                          >
                            {deletingGroupId === group.id ? '삭제 중...' : '삭제'}
                          </button>
                        </div>
                      </>
                    )}
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
              justifyContent: 'space-between',
              alignItems: 'center',
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
              학생 관리
            </h2>
            <div
              style={{
                color: '#64748b',
                fontSize: '16px',
                fontWeight: 600,
              }}
            >
              학생별 기록과 모둠 배정을 한 번에 관리
            </div>
          </div>

          {students.length === 0 ? (
            <div
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '22px',
                padding: '24px',
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
                display: 'grid',
                gap: '14px',
              }}
            >
              {students.map((student) => {
                const total = getScoreDiff(student.reward_count, student.penalty_count)

                return (
                  <div
                    key={student.id}
                    style={{
                      backgroundColor: '#ffffff',
                      borderRadius: '22px',
                      padding: '18px 20px',
                      boxShadow: '0 12px 28px rgba(15, 23, 42, 0.06)',
                      border: '1px solid #e8eef7',
                    }}
                  >
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '1.3fr 0.9fr 1.4fr',
                        gap: '16px',
                        alignItems: 'center',
                      }}
                    >
                      <div>
                        {editingStudentId === student.id ? (
                          <div style={{ display: 'grid', gap: '10px' }}>
                            <input
                              value={editingStudentName}
                              onChange={(e) => setEditingStudentName(e.target.value)}
                              style={{
                                padding: '12px 14px',
                                borderRadius: '14px',
                                border: '1px solid #cbd5e1',
                                fontSize: '16px',
                              }}
                            />
                            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                              <button
                                onClick={() => saveStudentName(student.id)}
                                disabled={savingStudentNameId === student.id}
                                style={{
                                  padding: '11px 14px',
                                  border: 'none',
                                  borderRadius: '12px',
                                  backgroundColor:
                                    savingStudentNameId === student.id
                                      ? '#cbd5e1'
                                      : '#2563eb',
                                  color: '#fff',
                                  fontWeight: 800,
                                  cursor:
                                    savingStudentNameId === student.id
                                      ? 'not-allowed'
                                      : 'pointer',
                                }}
                              >
                                저장
                              </button>
                              <button
                                onClick={cancelEditStudentName}
                                style={{
                                  padding: '11px 14px',
                                  border: 'none',
                                  borderRadius: '12px',
                                  backgroundColor: '#94a3b8',
                                  color: '#fff',
                                  fontWeight: 800,
                                  cursor: 'pointer',
                                }}
                              >
                                취소
                              </button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div
                              style={{
                                fontSize: '26px',
                                fontWeight: 800,
                                color: '#0f172a',
                                marginBottom: '8px',
                              }}
                            >
                              {student.name}
                            </div>

                            <div
                              style={{
                                display: 'flex',
                                gap: '8px',
                                flexWrap: 'wrap',
                                marginBottom: '10px',
                              }}
                            >
                              <span
                                style={{
                                  display: 'inline-block',
                                  backgroundColor: '#f1f5f9',
                                  color: '#334155',
                                  borderRadius: '999px',
                                  padding: '6px 12px',
                                  fontWeight: 800,
                                  fontSize: '14px',
                                }}
                              >
                                {getGroupName(student.group_id)}
                              </span>

                              <span
                                style={{
                                  display: 'inline-block',
                                  backgroundColor: '#eff6ff',
                                  color: total >= 0 ? '#16a34a' : '#ef4444',
                                  borderRadius: '999px',
                                  padding: '6px 12px',
                                  fontWeight: 800,
                                  fontSize: '14px',
                                }}
                              >
                                종합 {total >= 0 ? `+${total}` : total}
                              </span>
                            </div>

                            <div
                              style={{
                                display: 'flex',
                                gap: '10px',
                                flexWrap: 'wrap',
                              }}
                            >
                              <div
                                style={{
                                  backgroundColor: '#f0fdf4',
                                  border: '1px solid #dcfce7',
                                  borderRadius: '14px',
                                  padding: '10px 14px',
                                  minWidth: '90px',
                                  textAlign: 'center',
                                }}
                              >
                                <div style={{ fontSize: '15px', marginBottom: '4px' }}>👍</div>
                                <div
                                  style={{
                                    fontSize: '24px',
                                    fontWeight: 800,
                                    color: '#166534',
                                  }}
                                >
                                  {student.reward_count}
                                </div>
                              </div>

                              <div
                                style={{
                                  backgroundColor: '#f8fafc',
                                  border: '1px solid #e2e8f0',
                                  borderRadius: '14px',
                                  padding: '10px 14px',
                                  minWidth: '90px',
                                  textAlign: 'center',
                                }}
                              >
                                <div style={{ fontSize: '15px', marginBottom: '4px' }}>☁️</div>
                                <div
                                  style={{
                                    fontSize: '24px',
                                    fontWeight: 800,
                                    color: '#475569',
                                  }}
                                >
                                  {student.penalty_count}
                                </div>
                              </div>
                            </div>
                          </>
                        )}
                      </div>

                      <div>
                        <div
                          style={{
                            fontWeight: 800,
                            marginBottom: '8px',
                            color: '#334155',
                            fontSize: '15px',
                          }}
                        >
                          모둠 변경
                        </div>
                        <select
                          value={student.group_id ?? ''}
                          disabled={changingGroupStudentId === student.id}
                          onChange={(e) =>
                            changeStudentGroup(
                              student.id,
                              student.group_id,
                              e.target.value || null
                            )
                          }
                          style={{
                            width: '100%',
                            padding: '12px 14px',
                            borderRadius: '14px',
                            border: '1px solid #cbd5e1',
                            fontSize: '15px',
                            outline: 'none',
                            backgroundColor: '#fff',
                          }}
                        >
                          <option value="">미배정</option>
                          {groups.map((group) => (
                            <option key={group.id} value={group.id}>
                              {group.name}
                            </option>
                          ))}
                        </select>
                        <div
                          style={{
                            marginTop: '8px',
                            fontSize: '13px',
                            color: '#64748b',
                            lineHeight: 1.4,
                          }}
                        >
                          모둠 변경 시 관련 모둠 기록은 0으로 초기화됩니다.
                        </div>
                      </div>

                      <div
                        style={{
                          display: 'flex',
                          gap: '8px',
                          flexWrap: 'wrap',
                          justifyContent: 'flex-start',
                        }}
                      >
                        <button
                          onClick={() => applyActionToStudent(student, 'reward')}
                          disabled={loadingStudentId === student.id}
                          style={{
                            padding: '11px 14px',
                            border: 'none',
                            borderRadius: '12px',
                            backgroundColor:
                              loadingStudentId === student.id ? '#cbd5e1' : '#16a34a',
                            color: '#fff',
                            fontWeight: 800,
                            cursor:
                              loadingStudentId === student.id
                                ? 'not-allowed'
                                : 'pointer',
                          }}
                        >
                          👍 주기
                        </button>

                        <button
                          onClick={() => applyActionToStudent(student, 'penalty')}
                          disabled={loadingStudentId === student.id}
                          style={{
                            padding: '11px 14px',
                            border: 'none',
                            borderRadius: '12px',
                            backgroundColor:
                              loadingStudentId === student.id ? '#cbd5e1' : '#64748b',
                            color: '#fff',
                            fontWeight: 800,
                            cursor:
                              loadingStudentId === student.id
                                ? 'not-allowed'
                                : 'pointer',
                          }}
                        >
                          ☁️ 주기
                        </button>

                        <button
                          onClick={() => startEditStudentName(student)}
                          style={{
                            padding: '11px 14px',
                            border: 'none',
                            borderRadius: '12px',
                            backgroundColor: '#2563eb',
                            color: '#fff',
                            fontWeight: 800,
                            cursor: 'pointer',
                          }}
                        >
                          이름 수정
                        </button>

                        <button
                          onClick={() => deleteStudent(student.id, student.name)}
                          disabled={deletingStudentId === student.id}
                          style={{
                            padding: '11px 14px',
                            border: 'none',
                            borderRadius: '12px',
                            backgroundColor:
                              deletingStudentId === student.id ? '#cbd5e1' : '#ef4444',
                            color: '#fff',
                            fontWeight: 800,
                            cursor:
                              deletingStudentId === student.id
                                ? 'not-allowed'
                                : 'pointer',
                          }}
                        >
                          {deletingStudentId === student.id ? '삭제 중...' : '삭제'}
                        </button>
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