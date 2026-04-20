'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
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

type ActionType = 'reward' | 'penalty'

export default function TeacherPage() {
  const router = useRouter()

  const [checkingAuth, setCheckingAuth] = useState(true)

  const [students, setStudents] = useState<Student[]>([])
  const [groups, setGroups] = useState<Group[]>([])

  const [loadingStudentId, setLoadingStudentId] = useState<string | null>(null)
  const [loadingGroupId, setLoadingGroupId] = useState<string | null>(null)
  const [uploadingAvatarStudentId, setUploadingAvatarStudentId] = useState<string | null>(null)

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

  const [editingScoreStudentId, setEditingScoreStudentId] = useState<string | null>(null)
  const [editingRewardValue, setEditingRewardValue] = useState('')
  const [editingPenaltyValue, setEditingPenaltyValue] = useState('')
  const [savingScoreStudentId, setSavingScoreStudentId] = useState<string | null>(null)

  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const [previewStudentName, setPreviewStudentName] = useState('')

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

  const updateStudentScore = async (
    student: Student,
    actionType: ActionType,
    amount: number
  ) => {
    setLoadingStudentId(student.id)

    const currentValue =
      actionType === 'reward' ? student.reward_count : student.penalty_count
    const nextValue = Math.max(0, currentValue + amount)

    const updatePayload =
      actionType === 'reward'
        ? { reward_count: nextValue }
        : { penalty_count: nextValue }

    const { error: updateError } = await supabase
      .from('students')
      .update(updatePayload)
      .eq('id', student.id)

    if (updateError) {
      alert(`학생 점수 수정 오류: ${updateError.message}`)
      setLoadingStudentId(null)
      return
    }

    const actualDelta = nextValue - currentValue

    if (actualDelta !== 0) {
      const { error: logError } = await supabase
        .from('score_logs')
        .insert([
          {
            target_type: 'student',
            target_id: student.id,
            points: actualDelta,
            action_type: actionType,
          },
        ])

      if (logError) {
        alert(`학생 로그 저장 오류: ${logError.message}`)
      }
    }

    await fetchData()
    setLoadingStudentId(null)
  }

  const updateGroupScore = async (
    group: Group,
    actionType: ActionType,
    amount: number
  ) => {
    setLoadingGroupId(group.id)

    const currentGroupValue =
      actionType === 'reward' ? group.reward_count : group.penalty_count
    const nextGroupValue = Math.max(0, currentGroupValue + amount)

    const groupPayload =
      actionType === 'reward'
        ? { reward_count: nextGroupValue }
        : { penalty_count: nextGroupValue }

    const { error: groupUpdateError } = await supabase
      .from('groups')
      .update(groupPayload)
      .eq('id', group.id)

    if (groupUpdateError) {
      alert(`모둠 점수 수정 오류: ${groupUpdateError.message}`)
      setLoadingGroupId(null)
      return
    }

    const actualGroupDelta = nextGroupValue - currentGroupValue

    const { data: memberStudents, error: memberError } = await supabase
      .from('students')
      .select('id, reward_count, penalty_count')
      .eq('group_id', group.id)

    if (memberError) {
      alert(`모둠 학생 불러오기 오류: ${memberError.message}`)
      setLoadingGroupId(null)
      return
    }

    const studentLogRows: {
      target_type: 'student'
      target_id: string
      points: number
      action_type: ActionType
    }[] = []

    if (memberStudents && memberStudents.length > 0 && actualGroupDelta !== 0) {
      for (const member of memberStudents) {
        const currentStudentValue =
          actionType === 'reward' ? member.reward_count : member.penalty_count
        const nextStudentValue = Math.max(0, currentStudentValue + actualGroupDelta)
        const actualStudentDelta = nextStudentValue - currentStudentValue

        const studentPayload =
          actionType === 'reward'
            ? { reward_count: nextStudentValue }
            : { penalty_count: nextStudentValue }

        const { error: studentUpdateError } = await supabase
          .from('students')
          .update(studentPayload)
          .eq('id', member.id)

        if (studentUpdateError) {
          console.error('모둠 소속 학생 점수 수정 오류:', studentUpdateError)
        } else if (actualStudentDelta !== 0) {
          studentLogRows.push({
            target_type: 'student',
            target_id: member.id,
            points: actualStudentDelta,
            action_type: actionType,
          })
        }
      }
    }

    const logsToInsert = [
      ...(actualGroupDelta !== 0
        ? [
            {
              target_type: 'group' as const,
              target_id: group.id,
              points: actualGroupDelta,
              action_type: actionType,
            },
          ]
        : []),
      ...studentLogRows,
    ]

    if (logsToInsert.length > 0) {
      const { error: logError } = await supabase
        .from('score_logs')
        .insert(logsToInsert)

      if (logError) {
        alert(`모둠 로그 저장 오류: ${logError.message}`)
      }
    }

    await fetchData()
    setLoadingGroupId(null)
  }

  const startEditStudentScore = (student: Student) => {
    setEditingScoreStudentId(student.id)
    setEditingRewardValue(String(student.reward_count))
    setEditingPenaltyValue(String(student.penalty_count))
  }

  const cancelEditStudentScore = () => {
    setEditingScoreStudentId(null)
    setEditingRewardValue('')
    setEditingPenaltyValue('')
  }

  const saveStudentScore = async (student: Student) => {
    const rewardValue = Number(editingRewardValue)
    const penaltyValue = Number(editingPenaltyValue)

    if (
      Number.isNaN(rewardValue) ||
      Number.isNaN(penaltyValue) ||
      rewardValue < 0 ||
      penaltyValue < 0
    ) {
      alert('0 이상의 숫자만 입력하세요.')
      return
    }

    setSavingScoreStudentId(student.id)

    const { error: updateError } = await supabase
      .from('students')
      .update({
        reward_count: rewardValue,
        penalty_count: penaltyValue,
      })
      .eq('id', student.id)

    if (updateError) {
      alert(`학생 점수 직접 수정 오류: ${updateError.message}`)
      setSavingScoreStudentId(null)
      return
    }

    const rewardDelta = rewardValue - student.reward_count
    const penaltyDelta = penaltyValue - student.penalty_count

    const logsToInsert: {
      target_type: 'student'
      target_id: string
      points: number
      action_type: ActionType
    }[] = []

    if (rewardDelta !== 0) {
      logsToInsert.push({
        target_type: 'student',
        target_id: student.id,
        points: rewardDelta,
        action_type: 'reward',
      })
    }

    if (penaltyDelta !== 0) {
      logsToInsert.push({
        target_type: 'student',
        target_id: student.id,
        points: penaltyDelta,
        action_type: 'penalty',
      })
    }

    if (logsToInsert.length > 0) {
      const { error: logError } = await supabase
        .from('score_logs')
        .insert(logsToInsert)

      if (logError) {
        alert(`학생 점수 수정 로그 저장 오류: ${logError.message}`)
      }
    }

    await fetchData()
    setEditingScoreStudentId(null)
    setEditingRewardValue('')
    setEditingPenaltyValue('')
    setSavingScoreStudentId(null)
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
      alert(`모둠 변경 오류: ${changeError.message}`)
      setChangingGroupStudentId(null)
      return
    }

    const affectedGroupIds = [oldGroupId, newGroupId].filter(
      (value): value is string => !!value
    )

    const uniqueGroupIds = [...new Set(affectedGroupIds)]

    for (const groupId of uniqueGroupIds) {
      await supabase
        .from('groups')
        .update({
          reward_count: 0,
          penalty_count: 0,
        })
        .eq('id', groupId)
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
      .not('id', 'is', null)

    if (error) {
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
      .not('id', 'is', null)

    if (error) {
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
      alert(`학생 추가 오류: ${error.message}`)
      setAddingStudent(false)
      return
    }

    setNewStudentName('')
    setNewStudentGroupId('')
    await fetchData()
    setAddingStudent(false)
  }

  const uploadStudentAvatar = async (studentId: string, file: File) => {
    try {
      setUploadingAvatarStudentId(studentId)

      const fileExt = file.name.split('.').pop() || 'png'
      const timestamp = Date.now()
      const filePath = `${studentId}/${timestamp}.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from('student-avatars')
        .upload(filePath, file, {
          upsert: true,
          contentType: file.type,
        })

      if (uploadError) {
        alert(`이미지 업로드 오류: ${uploadError.message}`)
        setUploadingAvatarStudentId(null)
        return
      }

      const { data } = supabase.storage
        .from('student-avatars')
        .getPublicUrl(filePath)

      const publicUrl = `${data.publicUrl}?t=${timestamp}`

      const { error: updateError } = await supabase
        .from('students')
        .update({ avatar_url: publicUrl })
        .eq('id', studentId)

      if (updateError) {
        alert(`학생 이미지 저장 오류: ${updateError.message}`)
        setUploadingAvatarStudentId(null)
        return
      }

      // 교사 화면에 즉시 반영
      setStudents((prev) =>
        prev.map((student) =>
          student.id === studentId
            ? { ...student, avatar_url: publicUrl }
            : student
        )
      )

      // 필요하면 서버값 한 번 더 동기화
      await fetchData()

      setUploadingAvatarStudentId(null)
    } catch (error) {
      console.error(error)
      alert('이미지 업로드 중 오류가 발생했습니다.')
      setUploadingAvatarStudentId(null)
    }
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
      alert(`모둠 삭제 전 학생 정리 오류: ${studentUpdateError.message}`)
      setDeletingGroupId(null)
      return
    }

    const { error: groupDeleteError } = await supabase
      .from('groups')
      .delete()
      .eq('id', groupId)

    if (groupDeleteError) {
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
          background:
            'linear-gradient(180deg, #dbeafe 0%, #c7e0ff 45%, #eaf4ff 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'Pretendard, Arial, sans-serif',
        }}
      >
        <div
          style={{
            backgroundColor: '#ffffff',
            padding: '24px 30px',
            borderRadius: '22px',
            fontWeight: 900,
            color: '#334155',
            boxShadow: '0 14px 30px rgba(15, 23, 42, 0.08)',
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
          'linear-gradient(180deg, #dbeafe 0%, #c7e0ff 45%, #eaf4ff 100%)',
        fontFamily: 'Pretendard, Arial, sans-serif',
        padding: '28px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div style={{ maxWidth: '1360px', margin: '0 auto' }}>
        <CuteClassHero
          badge="교사 화면"
          title="CLASS MANAGER"
          subtitle="학생과 모둠을 쉽고 빠르게 관리해요"
          rightStat1Label="학생 수"
          rightStat1Value={students.length}
          rightStat2Label="모둠 수"
          rightStat2Value={groups.length}
          action={
            <button
              onClick={handleLogout}
              style={{
                padding: '16px 20px',
                border: 'none',
                borderRadius: '18px',
                backgroundColor: '#111827',
                color: '#fff',
                fontWeight: 900,
                fontSize: '15px',
                cursor: 'pointer',
                boxShadow: '0 10px 18px rgba(0,0,0,0.12)',
              }}
            >
              로그아웃
            </button>
          }
        />

        <section
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '16px',
            marginBottom: '20px',
          }}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '24px',
              padding: '22px',
              boxShadow: '0 14px 30px rgba(15, 23, 42, 0.08)',
            }}
          >
            <h2
              style={{
                margin: '0 0 14px 0',
                fontSize: '24px',
                fontWeight: 900,
                color: '#0f172a',
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

              <button
                onClick={addStudent}
                disabled={addingStudent}
                style={{
                  padding: '14px 18px',
                  border: 'none',
                  borderRadius: '14px',
                  backgroundColor: addingStudent ? '#cbd5e1' : '#2563eb',
                  color: '#fff',
                  fontWeight: 900,
                  cursor: addingStudent ? 'not-allowed' : 'pointer',
                }}
              >
                학생 추가
              </button>
            </div>
          </div>

          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '24px',
              padding: '22px',
              boxShadow: '0 14px 30px rgba(15, 23, 42, 0.08)',
            }}
          >
            <h2
              style={{
                margin: '0 0 14px 0',
                fontSize: '24px',
                fontWeight: 900,
                color: '#0f172a',
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
                }}
              />

              <button
                onClick={addGroup}
                disabled={addingGroup}
                style={{
                  padding: '14px 18px',
                  border: 'none',
                  borderRadius: '14px',
                  backgroundColor: addingGroup ? '#cbd5e1' : '#7c3aed',
                  color: '#fff',
                  fontWeight: 900,
                  cursor: addingGroup ? 'not-allowed' : 'pointer',
                }}
              >
                모둠 추가
              </button>
            </div>
          </div>
        </section>

        <section
          style={{
            display: 'flex',
            gap: '12px',
            flexWrap: 'wrap',
            marginBottom: '26px',
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
              fontWeight: 900,
              cursor: resettingStudents ? 'not-allowed' : 'pointer',
            }}
          >
            학생 기록 전체 초기화
          </button>

          <button
            onClick={resetAllGroupRecords}
            disabled={resettingGroups}
            style={{
              padding: '14px 18px',
              border: 'none',
              borderRadius: '16px',
              backgroundColor: resettingGroups ? '#cbd5e1' : '#7c3aed',
              color: '#fff',
              fontWeight: 900,
              cursor: resettingGroups ? 'not-allowed' : 'pointer',
            }}
          >
            모둠 기록 전체 초기화
          </button>
        </section>

        <section style={{ marginBottom: '28px' }}>
          <h2
            style={{
              margin: '0 0 14px 0',
              fontSize: '28px',
              fontWeight: 900,
              color: '#1e293b',
            }}
          >
            모둠 관리
          </h2>

          {groups.length === 0 ? (
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
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '16px',
              }}
            >
              {groups.map((group) => {

                return (
                  <div
                    key={group.id}
                    style={{
                      backgroundColor: '#ffffff',
                      borderRadius: '24px',
                      padding: '20px',
                      boxShadow: '0 14px 30px rgba(15, 23, 42, 0.08)',
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
                            style={softActionButton(savingGroupNameId === group.id)}
                          >
                            저장
                          </button>
                          <button
                            onClick={cancelEditGroupName}
                            style={softSecondaryButton()}
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
                            marginBottom: '14px',
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
                          </div>
                        </div>

                        <div
                          style={{
                            display: 'grid',
                            gridTemplateColumns: '1fr 1fr',
                            gap: '12px',
                            marginBottom: '14px',
                          }}
                        >
                          <div
                            style={{
                              backgroundColor: '#f0fdf4',
                              borderRadius: '18px',
                              padding: '16px',
                              textAlign: 'center',
                            }}
                          >
                            <div>☀️</div>
                            <div
                              style={{
                                marginTop: '8px',
                                fontSize: '28px',
                                fontWeight: 900,
                                color: '#166534',
                              }}
                            >
                              {group.reward_count}
                            </div>
                            <div
                              style={{
                                marginTop: '4px',
                                fontSize: '13px',
                                fontWeight: 700,
                                color: '#166534',
                              }}
                            >
                              점
                            </div>
                          </div>

                          <div
                            style={{
                              backgroundColor: '#f8fafc',
                              borderRadius: '18px',
                              padding: '16px',
                              textAlign: 'center',
                            }}
                          >
                            <div>☁️</div>
                            <div
                              style={{
                                marginTop: '8px',
                                fontSize: '28px',
                                fontWeight: 900,
                                color: '#475569',
                              }}
                            >
                              {group.penalty_count}
                            </div>
                            <div
                              style={{
                                marginTop: '4px',
                                fontSize: '13px',
                                fontWeight: 700,
                                color: '#475569',
                              }}
                            >
                              점
                            </div>
                          </div>
                        </div>

                        <div
                          style={{
                            display: 'flex',
                            gap: '8px',
                            flexWrap: 'wrap',
                            marginBottom: '10px',
                            justifyContent: 'center',
                          }}
                        >
                          <button
                            onClick={() => updateGroupScore(group, 'reward', 5)}
                            disabled={loadingGroupId === group.id}
                            style={{
                              ...softEmojiButton(loadingGroupId === group.id),
                              backgroundColor: loadingGroupId === group.id ? '#e2e8f0' : '#dcfce7',
                              color: loadingGroupId === group.id ? '#94a3b8' : '#15803d',
                            }}
                            title="상점 5점"
                          >
                            ⭐
                          </button>
                          <button
                            onClick={() => updateGroupScore(group, 'reward', 1)}
                            disabled={loadingGroupId === group.id}
                            style={{
                              ...softEmojiButton(loadingGroupId === group.id),
                              backgroundColor: loadingGroupId === group.id ? '#e2e8f0' : '#dcfce7',
                              color: loadingGroupId === group.id ? '#94a3b8' : '#16a34a',
                            }}
                            title="상점 1점"
                          >
                            ☀️
                          </button>
                          <button
                            onClick={() => updateGroupScore(group, 'penalty', 1)}
                            disabled={loadingGroupId === group.id}
                            style={{
                              ...softEmojiButton(loadingGroupId === group.id),
                              backgroundColor: loadingGroupId === group.id ? '#e2e8f0' : '#eef2ff',
                              color: loadingGroupId === group.id ? '#94a3b8' : '#64748b',
                            }}
                            title="벌점 1점"
                          >
                            ☁️
                          </button>
                        </div>

                        <div
                          style={{
                            display: 'flex',
                            gap: '8px',
                            flexWrap: 'wrap',
                            justifyContent: 'center',
                          }}
                        >
                          <button
                            onClick={() => startEditGroupName(group)}
                            style={softActionButton(false)}
                          >
                            이름 수정
                          </button>

                          <button
                            onClick={() => deleteGroup(group.id, group.name)}
                            disabled={deletingGroupId === group.id}
                            style={softDangerButton(deletingGroupId === group.id)}
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
          <h2
            style={{
              margin: '0 0 14px 0',
              fontSize: '28px',
              fontWeight: 900,
              color: '#1e293b',
            }}
          >
            학생 관리
          </h2>

          {students.length === 0 ? (
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
                gridTemplateColumns: 'repeat(auto-fit, minmax(430px, 1fr))',
                gap: '16px',
              }}
            >              
              {students.map((student) => {

                                return (
                                  <div
                                    key={student.id}
                                    style={{
                                      backgroundColor: '#ffffff',
                                      borderRadius: '28px',
                                      padding: '20px',
                                      border: '1px solid #dbeafe',
                                      boxShadow: '0 14px 30px rgba(15, 23, 42, 0.08)',
                                    }}
                                  >
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
                                            style={softActionButton(savingStudentNameId === student.id)}
                                          >
                                            저장
                                          </button>
                                          <button
                                            onClick={cancelEditStudentName}
                                            style={softSecondaryButton()}
                                          >
                                            취소
                                          </button>
                                        </div>
                                      </div>
                                    ) : editingScoreStudentId === student.id ? (
                                      <div
                                        style={{
                                          display: 'grid',
                                          gap: '10px',
                                          backgroundColor: '#f8fbff',
                                          border: '1px solid #dbeafe',
                                          borderRadius: '18px',
                                          padding: '14px',
                                        }}
                                      >
                                        <div
                                          style={{
                                            fontSize: '20px',
                                            fontWeight: 900,
                                            color: '#0f172a',
                                          }}
                                        >
                                          {student.name}
                                        </div>
                                        
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                          <div>
                                            <div
                                              style={{
                                                marginBottom: '6px',
                                                fontSize: '14px',
                                                fontWeight: 800,
                                                color: '#166534',
                                              }}
                                            >
                                              ☀️ 총점
                                            </div>
                                            <input
                                              type="number"
                                              min={0}
                                              value={editingRewardValue}
                                              onChange={(e) => setEditingRewardValue(e.target.value)}
                                              style={{
                                                width: '100%',
                                                padding: '10px 12px',
                                                borderRadius: '12px',
                                                border: '1px solid #cbd5e1',
                                                fontSize: '15px',
                                              }}
                                            />
                                          </div>
                                            
                                          <div>
                                            <div
                                              style={{
                                                marginBottom: '6px',
                                                fontSize: '14px',
                                                fontWeight: 800,
                                                color: '#475569',
                                              }}
                                            >
                                              ☁️ 총점
                                            </div>
                                            <input
                                              type="number"
                                              min={0}
                                              value={editingPenaltyValue}
                                              onChange={(e) => setEditingPenaltyValue(e.target.value)}
                                              style={{
                                                width: '100%',
                                                padding: '10px 12px',
                                                borderRadius: '12px',
                                                border: '1px solid #cbd5e1',
                                                fontSize: '15px',
                                              }}
                                            />
                                          </div>
                                        </div>
                                            
                                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                          <button
                                            onClick={() => saveStudentScore(student)}
                                            disabled={savingScoreStudentId === student.id}
                                            style={softActionButton(savingScoreStudentId === student.id)}
                                          >
                                            저장
                                          </button>
                                          <button
                                            onClick={cancelEditStudentScore}
                                            style={softSecondaryButton()}
                                          >
                                            취소
                                          </button>
                                        </div>
                                      </div>
                                    ) : (
                                      <div
                                        style={{
                                          display: 'grid',
                                          gridTemplateColumns: '120px 1fr',
                                          gap: '16px',
                                          alignItems: 'start',
                                        }}
                                      >
                                        <div style={{ display: 'grid', gap: '10px', justifyItems: 'center' }}>
                                          <button
                                            type="button"
                                            onClick={() => {
                                              if (student.avatar_url) {
                                                setPreviewImage(student.avatar_url)
                                                setPreviewStudentName(student.name)
                                              }
                                            }}
                                            style={{
                                              width: '96px',
                                              height: '96px',
                                              borderRadius: '24px',
                                              overflow: 'hidden',
                                              border: '4px solid #dbeafe',
                                              backgroundColor: '#f8fbff',
                                              display: 'flex',
                                              alignItems: 'center',
                                              justifyContent: 'center',
                                              cursor: student.avatar_url ? 'pointer' : 'default',
                                              boxShadow: student.avatar_url ? '0 10px 24px rgba(0,0,0,0.12)' : 'none',
                                              padding: 0,
                                            }}
                                            title={student.avatar_url ? '클릭하면 크게 볼 수 있어요.' : ''}
                                          >
                                            {student.avatar_url ? (
                                              <img
                                                key={student.avatar_url}
                                                src={student.avatar_url}
                                                alt={student.name}
                                                onClick={() => {
                                                  if (student.avatar_url) {
                                                    setPreviewImage(student.avatar_url)
                                                    setPreviewStudentName(student.name)
                                                  }
                                                }}
                                                style={{
                                                  width: '100%',
                                                  height: '100%',
                                                  objectFit: 'cover',
                                                  display: 'block',
                                                }}
                                              />
                                            ) : (
                                              <div style={{ fontSize: '32px' }}>🖼️</div>
                                            )}
                                          </button>
                                          
                                          <label
                                            style={{
                                              width: '100%',
                                              textAlign: 'center',
                                              padding: '10px 12px',
                                              borderRadius: '14px',
                                              backgroundColor: '#dbeafe',
                                              color: '#1d4ed8',
                                              fontWeight: 800,
                                              fontSize: '14px',
                                              cursor: 'pointer',
                                            }}
                                          >
                                            {uploadingAvatarStudentId === student.id ? '업로드 중...' : '이미지 넣기'}
                                            <input
                                              type="file"
                                              accept="image/*"
                                              style={{ display: 'none' }}
                                              onChange={(e) => {
                                                const file = e.target.files?.[0]
                                                if (file) {
                                                  uploadStudentAvatar(student.id, file)
                                                }
                                              }}
                                            />
                                          </label>
                                            
                                          <div
                                            style={{
                                              display: 'grid',
                                              gridTemplateColumns: '1fr 1fr',
                                              gap: '10px',
                                              width: '100%',
                                            }}
                                          >
                                            <div
                                              style={{
                                                backgroundColor: '#f0fdf4',
                                                borderRadius: '16px',
                                                padding: '10px 8px',
                                                textAlign: 'center',
                                              }}
                                            >
                                              <div style={{ fontSize: '18px' }}>☀️</div>
                                              <div
                                                style={{
                                                  marginTop: '4px',
                                                  fontSize: '18px',
                                                  fontWeight: 900,
                                                  color: '#166534',
                                                }}
                                              >
                                                {student.reward_count}
                                              </div>
                                              <div
                                                style={{
                                                  marginTop: '2px',
                                                  fontSize: '11px',
                                                  fontWeight: 700,
                                                  color: '#166534',
                                                }}
                                              >
                                                점
                                              </div>
                                            </div>
                                              
                                            <div
                                              style={{
                                                backgroundColor: '#f8fafc',
                                                borderRadius: '16px',
                                                padding: '10px 8px',
                                                textAlign: 'center',
                                              }}
                                            >
                                              <div style={{ fontSize: '18px' }}>☁️</div>
                                              <div
                                                style={{
                                                  marginTop: '4px',
                                                  fontSize: '18px',
                                                  fontWeight: 900,
                                                  color: '#475569',
                                                }}
                                              >
                                                {student.penalty_count}
                                              </div>
                                              <div
                                                style={{
                                                  marginTop: '2px',
                                                  fontSize: '11px',
                                                  fontWeight: 700,
                                                  color: '#475569',
                                                }}
                                              >
                                                점
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                              
                                        <div style={{ display: 'grid', gap: '12px', minWidth: 0 }}>
                                          <div>
                                            <button
                                              onClick={() => startEditStudentScore(student)}
                                              style={{
                                                background: 'none',
                                                border: 'none',
                                                padding: 0,
                                                textAlign: 'left',
                                                cursor: 'pointer',
                                              }}
                                              title="학생 이름을 클릭하면 점수를 직접 수정할 수 있어요."
                                            >
                                              <div
                                                style={{
                                                  fontSize: '24px',
                                                  fontWeight: 900,
                                                  color: '#0f172a',
                                                  lineHeight: 1.2,
                                                }}
                                              >
                                                {student.name}
                                              </div>
                                            </button>
                                              
                                            <div
                                              style={{
                                                marginTop: '8px',
                                                display: 'inline-block',
                                                backgroundColor: '#eef2ff',
                                                color: '#4f46e5',
                                                borderRadius: '999px',
                                                padding: '6px 12px',
                                                fontWeight: 800,
                                                fontSize: '13px',
                                              }}
                                            >
                                              {getGroupName(student.group_id)}
                                            </div>
                                          </div>
                                            
                                          <div>
                                            <div
                                              style={{
                                                fontWeight: 900,
                                                marginBottom: '8px',
                                                color: '#334155',
                                                fontSize: '14px',
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
                                          </div>
                                            
                                          <div
                                            style={{
                                              display: 'grid',
                                              gap: '10px',
                                              justifyItems: 'center',
                                            }}
                                          >
                                            <div
                                              style={{
                                                display: 'flex',
                                                gap: '10px',
                                                flexWrap: 'wrap',
                                                justifyContent: 'center',
                                              }}
                                            >
                                              <button
                                                onClick={() => updateStudentScore(student, 'reward', 5)}
                                                disabled={loadingStudentId === student.id}
                                                style={{
                                                  ...softEmojiButton(loadingStudentId === student.id),
                                                  backgroundColor: loadingStudentId === student.id ? '#e2e8f0' : '#dcfce7',
                                                  color: loadingStudentId === student.id ? '#94a3b8' : '#15803d',
                                                }}
                                                title="상점 5점"
                                              >
                                                ⭐
                                              </button>
                                              
                                              <button
                                                onClick={() => updateStudentScore(student, 'reward', 1)}
                                                disabled={loadingStudentId === student.id}
                                                style={{
                                                  ...softEmojiButton(loadingStudentId === student.id),
                                                  backgroundColor: loadingStudentId === student.id ? '#e2e8f0' : '#dcfce7',
                                                  color: loadingStudentId === student.id ? '#94a3b8' : '#16a34a',
                                                }}
                                                title="상점 1점"
                                              >
                                                ☀️
                                              </button>
                                              
                                              <button
                                                onClick={() => updateStudentScore(student, 'penalty', 1)}
                                                disabled={loadingStudentId === student.id}
                                                style={{
                                                  ...softEmojiButton(loadingStudentId === student.id),
                                                  backgroundColor: loadingStudentId === student.id ? '#e2e8f0' : '#eef2ff',
                                                  color: loadingStudentId === student.id ? '#94a3b8' : '#64748b',
                                                }}
                                                title="벌점 1점"
                                              >
                                                ☁️
                                              </button>
                                            </div>
                                            
                                            <div
                                              style={{
                                                display: 'flex',
                                                gap: '10px',
                                                flexWrap: 'wrap',
                                                justifyContent: 'center',
                                              }}
                                            >
                                              <button
                                                onClick={() => startEditStudentName(student)}
                                                style={softActionButton(false)}
                                              >
                                                이름 수정
                                              </button>
                                            
                                              <button
                                                onClick={() => deleteStudent(student.id, student.name)}
                                                disabled={deletingStudentId === student.id}
                                                style={softDangerButton(deletingStudentId === student.id)}
                                              >
                                                {deletingStudentId === student.id ? '삭제 중...' : '삭제'}
                                              </button>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    )}
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

function smallActionButton(
  backgroundColor: string,
  disabled: boolean,
  color = '#ffffff'
) {
  return {
    padding: '11px 14px',
    border: 'none',
    borderRadius: '14px',
    backgroundColor: disabled ? '#e2e8f0' : backgroundColor,
    color,
    fontWeight: 900 as const,
    cursor: disabled ? 'not-allowed' : 'pointer',
    boxShadow: disabled ? 'none' : '0 6px 14px rgba(15, 23, 42, 0.06)',
  }
}

function emojiButtonStyle(backgroundColor: string, disabled: boolean) {
  return {
    width: '52px',
    height: '52px',
    border: 'none',
    borderRadius: '18px',
    backgroundColor: disabled ? '#e2e8f0' : backgroundColor,
    color: '#ffffff',
    fontSize: '24px',
    fontWeight: 900 as const,
    cursor: disabled ? 'not-allowed' : 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: disabled ? 'none' : '0 6px 14px rgba(15, 23, 42, 0.06)',
  }
}

function softActionButton(disabled: boolean) {
  return {
    padding: '12px 18px',
    border: 'none',
    borderRadius: '16px',
    backgroundColor: disabled ? '#e2e8f0' : '#dbeafe',
    color: disabled ? '#94a3b8' : '#1d4ed8',
    fontWeight: 900 as const,
    fontSize: '15px',
    cursor: disabled ? 'not-allowed' : 'pointer',
    boxShadow: disabled ? 'none' : '0 6px 14px rgba(37, 99, 235, 0.10)',
  }
}

function softSecondaryButton() {
  return {
    padding: '12px 18px',
    border: 'none',
    borderRadius: '16px',
    backgroundColor: '#e0f2fe',
    color: '#0369a1',
    fontWeight: 900 as const,
    fontSize: '15px',
    cursor: 'pointer',
    boxShadow: '0 6px 14px rgba(14, 165, 233, 0.10)',
  }
}

function softDangerButton(disabled: boolean) {
  return {
    padding: '12px 18px',
    border: 'none',
    borderRadius: '16px',
    backgroundColor: disabled ? '#e2e8f0' : '#fee2e2',
    color: disabled ? '#94a3b8' : '#dc2626',
    fontWeight: 900 as const,
    fontSize: '15px',
    cursor: disabled ? 'not-allowed' : 'pointer',
    boxShadow: disabled ? 'none' : '0 6px 14px rgba(239, 68, 68, 0.10)',
  }
}

function softEmojiButton(disabled: boolean) {
  return {
    width: '58px',
    height: '58px',
    border: 'none',
    borderRadius: '18px',
    backgroundColor: disabled ? '#e2e8f0' : '#dcfce7',
    color: disabled ? '#94a3b8' : '#15803d',
    fontSize: '26px',
    fontWeight: 900 as const,
    cursor: disabled ? 'not-allowed' : 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: disabled ? 'none' : '0 6px 14px rgba(34, 197, 94, 0.10)',
  }
}