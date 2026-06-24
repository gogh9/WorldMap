import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useNavigate, Link } from 'react-router-dom'
import { Edit2, Trash2, ArrowLeft, Download } from 'lucide-react'
import { formatDisplayName } from '../utils/nameFormat'
import './Dashboard.css'

export default function Dashboard() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [filterAuthor, setFilterAuthor] = useState('ALL')
  
  // Edit state
  const [editingRecord, setEditingRecord] = useState(null)
  const [editCountryName, setEditCountryName] = useState('')
  const [editContent, setEditContent] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    let mounted = true

    const checkSessionAndFetchData = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (mounted) {
        if (!session) {
          navigate('/login')
          return
        }
        if (session.user.email !== 'gogh999@gmail.com') {
          navigate('/')
          return
        }
        setUser(session.user)
        fetchRecords()
      }
    }

    checkSessionAndFetchData()

    return () => {
      mounted = false
    }
  }, [navigate])

  const fetchRecords = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('countries_data')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (error) {
        if (error.code !== '42P01') console.error("Error fetching data:", error)
      } else {
        setRecords(data || [])
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm("정말 이 기록을 삭제하시겠습니까?")) return
    
    try {
      const { error } = await supabase.from('countries_data').delete().eq('id', id)
      if (error) throw error
      
      // Update local state instead of refetching to be faster
      setRecords(records.filter(record => record.id !== id))
    } catch (err) {
      alert("삭제 실패: " + err.message)
    }
  }

  const handleEditClick = (record) => {
    setEditingRecord(record)
    setEditCountryName(record.country_name || '')
    setEditContent(record.content || '')
  }

  const handleSaveEdit = async (e) => {
    e.preventDefault()
    if (!editContent.trim()) return

    setIsSaving(true)
    try {
      const { error } = await supabase
        .from('countries_data')
        .update({
          country_name: editCountryName,
          content: editContent
        })
        .eq('id', editingRecord.id)
        
      if (error) throw error
      
      // Update local state
      setRecords(records.map(record => 
        record.id === editingRecord.id 
          ? { ...record, country_name: editCountryName, content: editContent }
          : record
      ))
      
      setEditingRecord(null)
    } catch (err) {
      alert("수정 실패: " + err.message)
    } finally {
      setIsSaving(false)
    }
  }

  const isAdmin = user?.email === 'gogh999@gmail.com'

  // Get unique authors for filter
  const authors = [...new Set(records.map(r => r.author_name))].filter(Boolean)
  
  const filteredRecords = filterAuthor === 'ALL' 
    ? records 
    : records.filter(r => r.author_name === filterAuthor)

  // Group records by author
  const groupedRecords = filteredRecords.reduce((acc, record) => {
    const author = record.author_name || '익명 학생';
    if (!acc[author]) {
      acc[author] = {
        author_name: author,
        author_avatar: record.author_avatar,
        registrations: [],
        investigations: []
      };
    }
    
    if (record.content && record.content.includes('이 나라의 이름을 최초로 등록했습니다! 🎉')) {
      acc[author].registrations.push(record);
    } else {
      acc[author].investigations.push(record);
    }
    
    return acc;
  }, {});
  
  const displayGroups = Object.values(groupedRecords);

  const handleExportExcel = () => {
    // CSV 헤더
    const headers = ['작성자', '구분', '나라 이름', '작성 날짜', '내용'];
    
    // CSV 데이터
    const csvData = filteredRecords.map(record => {
      const author = formatDisplayName(record.author_name) || '익명 학생';
      const country = record.country_name || '이름 없는 나라';
      const date = new Date(record.created_at).toLocaleDateString();
      
      let category = '조사 내용';
      let cleanContent = record.content || '';
      
      if (cleanContent.includes('이 나라의 이름을 최초로 등록했습니다! 🎉')) {
        category = '나라 이름 등록';
        cleanContent = '이 나라의 이름을 최초로 등록했습니다! 🎉';
      }
      
      // 내용의 줄바꿈과 쉼표 처리 (큰따옴표로 감싸기)
      const content = `"${cleanContent.replace(/"/g, '""')}"`;
      
      return `${author},${category},${country},${date},${content}`;
    });

    // BOM(Byte Order Mark) 추가로 엑셀에서 한글 깨짐 방지
    const csvString = '\uFEFF' + [headers.join(','), ...csvData].join('\n');
    
    // Blob 생성 및 다운로드
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', '우리반_세계지도_기록.csv');
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }

  if (!user) return null

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="dashboard-title">
          <Link to="/" className="back-btn">
            <ArrowLeft size={16} />
            지도 화면으로
          </Link>
          <h1>모두의 기록 대시보드</h1>
        </div>
        <button onClick={handleExportExcel} className="export-btn" title="엑셀로 저장">
          <Download size={18} />
          <span>엑셀 저장</span>
        </button>
      </header>

      <main className="dashboard-content">
        <div className="filters">
          <select 
            className="filter-select"
            value={filterAuthor}
            onChange={(e) => setFilterAuthor(e.target.value)}
          >
            <option value="ALL">모든 학생</option>
            {authors.map(author => (
              <option key={author} value={author}>{formatDisplayName(author)}</option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="loading-state">기록을 불러오는 중입니다...</div>
        ) : displayGroups.length === 0 ? (
          <div className="empty-state">
            <p>아직 작성된 기록이 없습니다.</p>
          </div>
        ) : (
          <div className="students-grid">
            {displayGroups.map(group => (
              <div key={group.author_name} className="student-group-card">
                <div className="student-header">
                  <img src={group.author_avatar} alt="avatar" className="student-avatar" />
                  <h2 className="student-name">{formatDisplayName(group.author_name)}의 기록</h2>
                </div>
                
                <div className="student-records-list">
                  {group.registrations.length > 0 && (
                    <div className="record-category">
                      <h4 className="category-title">🎯 등록한 나라</h4>
                      <div className="category-items">
                        {group.registrations.map(record => {
                          const canEdit = isAdmin || record.author_name === user.user_metadata?.full_name;
                          return (
                            <div key={record.id} className="sub-record-card">
                              <div className="sub-record-header">
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  <span className="sub-record-country">{record.country_name || '이름 없는 나라'}</span>
                                  {canEdit && (
                                    <div className="sub-record-actions" style={{ marginTop: 0 }}>
                                      <button onClick={() => handleDelete(record.id)} className="action-btn delete-btn" style={{ flex: 0, padding: '4px 8px', fontSize: '11px' }}>
                                        <Trash2 size={12} /> 삭제
                                      </button>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {group.investigations.length > 0 && (
                    <div className="record-category">
                      <h4 className="category-title">📝 조사한 내용</h4>
                      <div className="category-items">
                        {group.investigations.map(record => {
                          const canEdit = isAdmin || record.author_name === user.user_metadata?.full_name;
                          return (
                            <div key={record.id} className="sub-record-card">
                              <div className="sub-record-header">
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  <span className="sub-record-country">{record.country_name || '이름 없는 나라'}</span>
                                  {canEdit && (
                                    <div className="sub-record-actions" style={{ marginTop: 0 }}>
                                      <button onClick={() => handleEditClick(record)} className="action-btn edit-btn" style={{ flex: 0, padding: '4px 8px', fontSize: '11px' }}>
                                        <Edit2 size={12} /> 수정
                                      </button>
                                      <button onClick={() => handleDelete(record.id)} className="action-btn delete-btn" style={{ flex: 0, padding: '4px 8px', fontSize: '11px' }}>
                                        <Trash2 size={12} /> 삭제
                                      </button>
                                    </div>
                                  )}
                                </div>
                              </div>
                              <div className="sub-record-content">
                                {record.content}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Edit Modal */}
      {editingRecord && (
        <div className="modal-overlay" onClick={() => setEditingRecord(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2>기록 수정하기</h2>
            <form onSubmit={handleSaveEdit} className="modal-form">
              <div className="form-group">
                <label>나라 이름</label>
                <input 
                  type="text" 
                  value={editCountryName}
                  onChange={(e) => setEditCountryName(e.target.value)}
                  placeholder="나라 이름을 입력하세요"
                />
              </div>
              <div className="form-group">
                <label>조사한 내용</label>
                <textarea 
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  placeholder="내용을 입력하세요"
                  required
                />
              </div>
              <div className="modal-actions">
                <button type="submit" className="save-btn" disabled={isSaving}>
                  {isSaving ? '저장 중...' : '저장하기'}
                </button>
                <button type="button" className="cancel-btn" onClick={() => setEditingRecord(null)}>
                  취소
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
