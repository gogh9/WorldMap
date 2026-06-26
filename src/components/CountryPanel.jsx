import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { X, Save, Edit2, Trash2 } from 'lucide-react'
import { formatDisplayName } from '../utils/nameFormat'
import './CountryPanel.css'

export default function CountryPanel({ countryId, onClose, user, mapId, isTeacher }) {
  const [info, setInfo] = useState('')
  const [inputCountryName, setInputCountryName] = useState('')
  const [loading, setLoading] = useState(false)
  const [savedData, setSavedData] = useState([])
  const [editingId, setEditingId] = useState(null)
  const [editContent, setEditContent] = useState('')
  const [hasCountryName, setHasCountryName] = useState(false)
  const [countryMedal, setCountryMedal] = useState('🏅')

  const isAdmin = user?.email === 'gogh999@gmail.com' || isTeacher

  // 저장된 데이터 불러오기
  useEffect(() => {
    if (mapId) {
      fetchData()
    }
  }, [countryId, mapId])

  const fetchData = async () => {
    try {
      const { data, error } = await supabase
        .from('countries_data')
        .select('*')
        .eq('link', countryId)
        .eq('map_id', mapId)
        .order('created_at', { ascending: false })
      
      if (error) {
        if (error.code !== '42P01') console.error("Error fetching data:", error)
      } else {
        setSavedData(data || [])
        
        const nameCounts = {};
        (data || []).forEach(r => {
          if (r.country_name && r.content && r.content.includes('등록했습니다! 🎉') && r.author_name) {
            const name = r.country_name.trim();
            if (!nameCounts[name]) nameCounts[name] = new Set();
            nameCounts[name].add(r.author_name);
          }
        });

        let winningName = null;
        for (const [name, authorsSet] of Object.entries(nameCounts)) {
          if (authorsSet.size >= 5) {
            winningName = name;
            break;
          }
        }

        if (winningName) {
          setInputCountryName(winningName)
          setHasCountryName(true)
        } else {
          setInputCountryName('')
          setHasCountryName(false)
        }

        const { data: allCountries, error: err2 } = await supabase
          .from('countries_data')
          .select('link, created_at')
          .eq('map_id', mapId)
          .order('created_at', { ascending: true })
        
        let assignedMedal = '🏅';
        if (allCountries && !err2) {
          const MEDAL_TYPES = ['🥇', '🥈', '🥉', '🏅', '🎖️', '🏆', '💎', '🌟'];
          const firstRegs = [];
          const seen = new Set();
          for (const row of allCountries) {
            if (!seen.has(row.link)) {
              seen.add(row.link);
              firstRegs.push(row.link);
            }
          }
          
          const counts = {};
          MEDAL_TYPES.forEach(m => counts[m] = 0);
          
          for (const link of firstRegs) {
            let minCount = Infinity;
            for (const m of MEDAL_TYPES) if (counts[m] < minCount) minCount = counts[m];
            
            const candidates = MEDAL_TYPES.filter(m => counts[m] === minCount);
            
            let hash = 0;
            for (let i = 0; i < link.length; i++) hash = Math.imul(31, hash) + link.charCodeAt(i) | 0;
            const rngValue = Math.abs(hash) % candidates.length;
            
            const chosenMedal = candidates[rngValue];
            counts[chosenMedal]++;
            if (link === countryId) {
              assignedMedal = chosenMedal;
              break;
            }
          }
        }
        setCountryMedal(assignedMedal);
      }
    } catch (err) {
      console.error(err)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!inputCountryName.trim()) {
      alert("나라 이름을 먼저 입력해주세요!");
      return;
    }
    if (!info.trim()) return;

    setLoading(true)

    try {
      // 새 글 작성
      const { error } = await supabase
        .from('countries_data')
        .insert([
          { 
            country_name: inputCountryName, 
            content: info, 
            link: countryId,
            map_id: mapId,
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

      setInfo('')
      fetchData() // 목록 새로고침
    } catch (err) {
      alert("오류 발생: " + err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (item) => {
    setEditContent(item.content)
    setEditingId(item.id)
  }

  const saveEdit = async (id) => {
    if (!editContent.trim()) return;
    try {
      const { error } = await supabase
        .from('countries_data')
        .update({ content: editContent })
        .eq('id', id);
      if (error) throw error;
      setEditingId(null);
      fetchData();
    } catch (err) {
      alert("수정 실패: " + err.message);
    }
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

  const handleNameUpdate = async () => {
    if (!inputCountryName.trim()) {
      alert("나라 이름을 먼저 입력해주세요!");
      return;
    }
    try {
      const currentUserName = user?.user_metadata?.full_name || '익명 학생';
      const userAlreadyRegistered = savedData.some(r => 
        r.author_name === currentUserName && 
        r.content && 
        r.content.includes('등록했습니다! 🎉')
      );

      if (userAlreadyRegistered) {
        // Only update the current user's registration record!
        const { error } = await supabase
          .from('countries_data')
          .update({ country_name: inputCountryName })
          .eq('link', countryId)
          .eq('map_id', mapId)
          .eq('author_name', currentUserName)
          .like('content', '%등록했습니다! 🎉%');
        if (error && error.code !== '42P01') throw error;
        alert("나라 이름이 수정되었습니다!");
      } else {
        const isFirst = savedData.length === 0;
        const { error } = await supabase.from('countries_data').insert([{
          country_name: inputCountryName,
          content: `${currentUserName}님이 이 나라의 이름을 ${isFirst ? '최초로 ' : ''}등록했습니다! 🎉`,
          link: countryId,
          map_id: mapId,
          author_name: currentUserName,
          author_avatar: user?.user_metadata?.avatar_url || ''
        }]);
        if (error && error.code !== '42P01') throw error;

        alert("나라 이름 등록에 참여하셨습니다!");
      }
      
      alert("나라 이름이 적용되었습니다!");
      fetchData();
    } catch (err) {
      console.error(err);
    }
  }

  const handleAdminEditName = async () => {
    const newName = window.prompt("새로운 나라 이름을 입력하세요:", inputCountryName);
    if (newName && newName.trim() !== "") {
      try {
        const { error } = await supabase
          .from('countries_data')
          .update({ country_name: newName.trim() })
          .eq('link', countryId)
          .eq('map_id', mapId);
        if (error) throw error;
        alert("나라 이름이 수정되었습니다.");
        fetchData();
      } catch (err) {
        alert("수정 실패: " + err.message);
      }
    }
  }

  const handleAdminDeleteCountryName = async () => {
    if (!window.confirm("나라 이름을 초기화하시겠습니까? (학생들의 기록은 유지됩니다)")) return;
    try {
      const { error } = await supabase
        .from('countries_data')
        .update({ country_name: '' })
        .eq('link', countryId)
        .eq('map_id', mapId);
      if (error) throw error;
      alert("나라 이름이 초기화되었습니다.");
      fetchData();
    } catch (err) {
      alert("초기화 실패: " + err.message);
    }
  }

  // 시스템이 자동 생성한 '등록' 메시지는 목록에서 숨김
  const displayRecords = savedData.filter(item => !item.content.includes('등록했습니다! 🎉'))

  return (
    <aside className="country-panel">
      <div className="panel-header">
        {hasCountryName ? (
          <div className="header-title-container" style={{ display: 'flex', alignItems: 'flex-start', width: '100%', justifyContent: 'space-between' }}>
            <div className="header-title-row" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '8px', width: '100%' }}>
              <h2 className="country-title-display">{inputCountryName}</h2>
              <div className="discoverers-list">
                {(() => {
                  const regs = [...savedData].filter(r => r.content && r.content.includes('등록했습니다! 🎉')).reverse();
                  const RANDOM_ITEMS = ['🥇', '🥈', '🥉', '🏅', '🎖️', '🏆', '💎', '🌟', '👑', '🔮', '🎈', '🎉', '🍎', '🍀', '✨', '🔥'];
                  let countryHash = 0;
                  if (countryId) {
                    for(let i=0; i<countryId.length; i++) countryHash += countryId.charCodeAt(i);
                  }
                  return regs.map((reg, index) => {
                    const authorName = reg.author_name || '익명 학생';
                    const item = RANDOM_ITEMS[(index + countryHash) % RANDOM_ITEMS.length];
                    return (
                      <div key={reg.id} className="discoverer-badge" title={`${formatDisplayName(authorName)}님이 나라 이름 등록에 참여했습니다`}>
                        <span className="discoverer-emoji">{item}</span>
                        <span className="discoverer-name">{formatDisplayName(authorName)}</span>
                      </div>
                    )
                  })
                })()}
              </div>
            </div>
            {isAdmin && (
              <div className="admin-actions-header">
                <button className="edit-btn" onClick={handleAdminEditName}>
                  수정
                </button>
                <button className="delete-btn" onClick={handleAdminDeleteCountryName}>
                  삭제
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="header-input-group">
            <input 
              type="text" 
              className="country-name-input-header"
              placeholder="이 나라의 이름은?"
              value={inputCountryName}
              onChange={(e) => setInputCountryName(e.target.value)}
              required
            />
            <button className="name-apply-btn" onClick={handleNameUpdate}>입력</button>
          </div>
        )}
      </div>

      <div className="panel-content">
        <div className="records-section">
          <h3>우리 반 친구들의 기록</h3>
          {displayRecords.length > 0 && (
            <div className="records-list">
              {displayRecords.map((item) => (
                <div key={item.id} className="record-card">
                  <div className="record-header">
                    <div className="record-author">
                      <span>{formatDisplayName(item.author_name)}</span>
                    </div>
                    {(isAdmin || item.author_name === user?.user_metadata?.full_name) && (
                      <div className="admin-actions">
                        {editingId === item.id ? (
                          <>
                            <button onClick={() => saveEdit(item.id)} className="edit-btn">저장</button>
                            <button onClick={() => setEditingId(null)} className="delete-btn">취소</button>
                          </>
                        ) : (
                          <>
                            <button onClick={() => handleEdit(item)} className="edit-btn">수정</button>
                            <button onClick={() => handleDelete(item.id)} className="delete-btn">삭제</button>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                  {editingId === item.id ? (
                    <textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      style={{ 
                        width: '100%', 
                        height: '80px', 
                        padding: '12px', 
                        marginTop: '12px', 
                        borderRadius: '6px', 
                        background: 'var(--bg-elevated)', 
                        color: 'var(--text-color)', 
                        border: '1px solid var(--border-color)', 
                        resize: 'vertical',
                        fontFamily: 'inherit',
                        fontSize: '0.95rem'
                      }}
                    />
                  ) : (
                    <p className="record-text">{item.content}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="input-section">
          <h3>새로운 정보 기록하기</h3>
          <form onSubmit={handleSubmit}>
            <textarea 
              placeholder="이 나라에 대해 조사한 내용을 자유롭게 적어주세요!"
              value={info}
              onChange={(e) => setInfo(e.target.value)}
              required
            />
            <div className="form-actions">
              <button type="submit" className="submit-btn" disabled={loading}>
                {loading ? '저장 중...' : '기록'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </aside>
  )
}
