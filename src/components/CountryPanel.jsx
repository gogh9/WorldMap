import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import './CountryPanel.css'

export default function CountryPanel({ countryId, onClose, user }) {
  const [info, setInfo] = useState('')
  const [inputCountryName, setInputCountryName] = useState('')
  const [loading, setLoading] = useState(false)
  const [savedData, setSavedData] = useState([])
  const [editingId, setEditingId] = useState(null)

  const isAdmin = user?.email === 'gogh999@gmail.com'

  // 저장된 데이터 불러오기
  useEffect(() => {
    fetchData()
  }, [countryId])

  const fetchData = async () => {
    try {
      const { data, error } = await supabase
        .from('countries_data')
        .select('*')
        .eq('link', countryId) // link 열을 고유 ID 저장소로 사용
        .order('created_at', { ascending: false })
      
      if (error) {
        if (error.code !== '42P01') console.error("Error fetching data:", error)
      } else {
        setSavedData(data || [])
        if (data && data.length > 0) {
          setInputCountryName(data[0].country_name)
        } else {
          setInputCountryName('')
        }
      }
    } catch (err) {
      console.error(err)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!info.trim() || !inputCountryName.trim()) return

    setLoading(true)

    try {
      if (editingId) {
        // 수정 모드
        const { error } = await supabase
          .from('countries_data')
          .update({
            country_name: inputCountryName,
            content: info
          })
          .eq('id', editingId)
          
        if (error) throw error
      } else {
        // 새 글 작성
        const { error } = await supabase
          .from('countries_data')
          .insert([
            { 
              country_name: inputCountryName, 
              content: info, 
              link: countryId, // 고유 ID를 link에 몰래 저장
              author_name: user?.user_metadata?.full_name || '익명 학생',
              author_avatar: user?.user_metadata?.avatar_url || ''
            }
          ])

        if (error) {
          if (error.code === '42P01') {
            alert('Supabase에 countries_data 테이블이 아직 생성되지 않았습니다!')
          } else {
            throw error
          }
        }
      }

      setInfo('')
      // setInputCountryName('') -> 삭제 (이름은 그대로 유지)
      setEditingId(null)
      fetchData() // 목록 새로고침
    } catch (err) {
      alert("오류 발생: " + err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (item) => {
    setInputCountryName(item.country_name)
    setInfo(item.content)
    setEditingId(item.id)
  }

  const handleDelete = async (id) => {
    if (!window.confirm("정말 이 기록을 삭제하시겠습니까?")) return
    try {
      const { error } = await supabase.from('countries_data').delete().eq('id', id)
      if (error) throw error
      fetchData()
    } catch (err) {
      alert("삭제 실패: " + err.message)
    }
  }

  const cancelEdit = () => {
    setInfo('')
    // setInputCountryName('') -> 취소해도 이름은 유지
    setEditingId(null)
  }

  const handleNameUpdate = async () => {
    if (!inputCountryName.trim()) {
      alert("나라 이름을 먼저 입력해주세요!");
      return;
    }
    try {
      if (savedData.length === 0) {
        // 아무 기록이 없을 때 '입력'을 누르면 최초 발견자 기록 생성
        const { error } = await supabase.from('countries_data').insert([{
          country_name: inputCountryName,
          content: `${user?.user_metadata?.full_name}님이 이 나라의 이름을 최초로 등록했습니다! 🎉`,
          link: countryId,
          author_name: user?.user_metadata?.full_name || '익명 학생',
          author_avatar: user?.user_metadata?.avatar_url || ''
        }]);
        if (error && error.code !== '42P01') throw error;
      } else {
        // 이미 기록이 있으면 이름만 일괄 업데이트
        const { error } = await supabase
          .from('countries_data')
          .update({ country_name: inputCountryName })
          .eq('link', countryId);
        if (error && error.code !== '42P01') throw error;
      }
      
      alert("나라 이름이 적용되었습니다!");
      fetchData();
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <aside className="country-panel">
      <div className="panel-header">
        <div className="header-top-row">
          <div className="header-input-group">
            <input 
              type="text" 
              className="country-name-input-header"
              placeholder="이 나라의 이름은?"
              value={inputCountryName}
              onChange={(e) => setInputCountryName(e.target.value)}
              required
            />
            <button className="name-apply-btn" onClick={handleNameUpdate}>
              {savedData.length > 0 ? '수정' : '입력'}
            </button>
          </div>
          <button onClick={onClose} className="close-btn">닫기</button>
        </div>
        {savedData.length > 0 && (
          <div className="discoverer-info">
            🏅 {savedData[savedData.length - 1].author_name}님이 등록한 나라입니다
          </div>
        )}
      </div>

      <div className="panel-content">
        <div className="records-section">
          <h3>우리 반 친구들의 기록</h3>
          {savedData.length > 0 && (
            <div className="records-list">
              {savedData.map((item) => (
                <div key={item.id} className="record-card">
                  <div className="record-header">
                    <div className="record-author">
                      <img src={item.author_avatar} alt="avatar" />
                      <span>{item.author_name}</span>
                    </div>
                    {isAdmin && (
                      <div className="admin-actions">
                        <button onClick={() => handleEdit(item)} className="edit-btn">수정</button>
                        <button onClick={() => handleDelete(item.id)} className="delete-btn">삭제</button>
                      </div>
                    )}
                  </div>
                  <h4 className="record-country-title">{item.country_name}</h4>
                  <p className="record-text">{item.content}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="input-section">
          <h3>{editingId ? '✏️ 정보 수정하기' : '새로운 정보 기록하기'}</h3>
          <form onSubmit={handleSubmit}>
            <textarea 
              placeholder="이 나라에 대해 조사한 내용을 자유롭게 적어주세요!"
              value={info}
              onChange={(e) => setInfo(e.target.value)}
              required
            />
            <div className="form-actions">
              <button type="submit" className="submit-btn" disabled={loading}>
                {loading ? '저장 중...' : (editingId ? '수정 완료' : '기록 남기기')}
              </button>
              {editingId && (
                <button type="button" className="cancel-btn" onClick={cancelEdit}>
                  취소
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </aside>
  )
}
