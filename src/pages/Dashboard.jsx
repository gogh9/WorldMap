import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useNavigate, Link } from 'react-router-dom'
import { Edit2, Trash2, ArrowLeft } from 'lucide-react'
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
        // Filter out system messages
        const filteredData = (data || []).filter(
          item => !item.content.includes('이 나라의 이름을 최초로 등록했습니다! 🎉')
        )
        setRecords(filteredData)
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
        ) : filteredRecords.length === 0 ? (
          <div className="empty-state">
            <p>아직 작성된 기록이 없습니다.</p>
          </div>
        ) : (
          <div className="records-grid">
            {filteredRecords.map(record => {
              // Can edit if admin, or if it's their own record
              const canEdit = isAdmin || record.author_name === user.user_metadata?.full_name

              return (
                <div key={record.id} className="record-card">
                  <div className="record-header">
                    <div className="author-info">
                      <img src={record.author_avatar} alt="avatar" className="author-avatar" />
                      <div className="author-details">
                        <span className="author-name">{formatDisplayName(record.author_name)}</span>
                        <span className="record-country">{record.country_name || '이름 없는 나라'}</span>
                      </div>
                    </div>
                    <span className="record-date">
                      {new Date(record.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  
                  <div className="record-content">
                    {record.content}
                  </div>
                  
                  {canEdit && (
                    <div className="record-actions">
                      <button onClick={() => handleEditClick(record)} className="action-btn edit-btn">
                        <Edit2 size={14} /> 수정
                      </button>
                      <button onClick={() => handleDelete(record.id)} className="action-btn delete-btn">
                        <Trash2 size={14} /> 삭제
                      </button>
                    </div>
                  )}
                </div>
              )
            })}
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
