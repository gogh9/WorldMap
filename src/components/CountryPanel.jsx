import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import './CountryPanel.css'

export default function CountryPanel({ countryName, onClose, user }) {
  const [info, setInfo] = useState('')
  const [imageFile, setImageFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [savedData, setSavedData] = useState([])

  // 저장된 데이터 불러오기
  useEffect(() => {
    fetchData()
  }, [countryName])

  const fetchData = async () => {
    try {
      const { data, error } = await supabase
        .from('countries_data')
        .select('*')
        .eq('country_name', countryName)
        .order('created_at', { ascending: false })
      
      if (error) {
        // 테이블이 아직 없으면 무시
        if (error.code !== '42P01') console.error("Error fetching data:", error)
      } else {
        setSavedData(data || [])
      }
    } catch (err) {
      console.error(err)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!info.trim()) return

    setLoading(true)
    let imageUrl = null

    try {
      // 1. 이미지 파일이 있으면 Storage에 먼저 업로드
      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop()
        const fileName = `${Math.random()}.${fileExt}`
        const filePath = `${countryName}/${fileName}`

        const { error: uploadError } = await supabase.storage
          .from('country-images')
          .upload(filePath, imageFile)

        if (uploadError) throw uploadError

        const { data: publicUrlData } = supabase.storage
          .from('country-images')
          .getPublicUrl(filePath)
        
        imageUrl = publicUrlData.publicUrl
      }

      // 2. 데이터베이스에 기록 저장
      const { error } = await supabase
        .from('countries_data')
        .insert([
          { 
            country_name: countryName, 
            content: info, 
            image_url: imageUrl,
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
      } else {
        setInfo('')
        setImageFile(null)
        // file input 초기화를 위해 value 초기화가 필요하지만, 간단히 폼 리셋 효과를 위해 냅둠
        fetchData() // 목록 새로고침
      }
    } catch (err) {
      alert("업로드 중 오류 발생: " + err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <aside className="country-panel">
      <div className="panel-header">
        <h2>📍 {countryName}</h2>
        <button onClick={onClose} className="close-btn">닫기</button>
      </div>

      <div className="panel-content">
        <div className="records-section">
          <h3>우리 반 친구들의 기록</h3>
          {savedData.length === 0 ? (
            <p className="empty-msg">아직 기록된 내용이 없습니다. 첫 번째로 기록을 남겨보세요!</p>
          ) : (
            <div className="records-list">
              {savedData.map((item) => (
                <div key={item.id} className="record-card">
                  <div className="record-author">
                    <img src={item.author_avatar} alt="avatar" />
                    <span>{item.author_name}</span>
                  </div>
                  <p className="record-text">{item.content}</p>
                  {item.image_url && (
                    <div className="record-image">
                      <img src={item.image_url} alt="첨부 사진" />
                    </div>
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
            <div className="file-input-wrapper">
              <label>사진 첨부 (선택):</label>
              <input 
                type="file" 
                accept="image/*"
                onChange={(e) => setImageFile(e.target.files[0])}
              />
            </div>
            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? '저장 중...' : '기록 남기기'}
            </button>
          </form>
        </div>
      </div>
    </aside>
  )
}
