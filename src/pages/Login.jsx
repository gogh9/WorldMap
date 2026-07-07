import { useEffect, useState } from 'react'
import { dbService } from '../lib/dbService'
import { useNavigate } from 'react-router-dom'
import GlobalFooter from '../components/GlobalFooter'
import './Login.css'

export default function Login() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [studentName, setStudentName] = useState('')

  const schoolName = import.meta.env.VITE_SCHOOL_NAME || '서울수색초등학교'
  const creatorName = import.meta.env.VITE_CREATOR_NAME || '김세찬'

  const queryParams = new URLSearchParams(window.location.search)
  const returnToParam = queryParams.get('returnTo') || ''
  const showStudentLogin = returnToParam.includes('/map/')

  useEffect(() => {
    // Check if there is an error in URL
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const queryParams = new URLSearchParams(window.location.search);
    const errorDescription = hashParams.get('error_description') || queryParams.get('error_description');
    
    if (errorDescription) {
      alert("로그인 에러 발생: " + decodeURIComponent(errorDescription).replace(/\+/g, ' '));
    }

    const returnTo = queryParams.get('returnTo') || '/';

    const { data: authListener } = dbService.auth.onAuthStateChange((event, session) => {
      console.log("Auth Event:", event, "Session:", session)
      if (session) {
        navigate(returnTo)
      }
    })
    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [navigate])

  const handleGoogleLogin = async () => {
    try {
      setLoading(true)
      const queryParams = new URLSearchParams(window.location.search);
      const returnTo = queryParams.get('returnTo') || '/';
      
      const { error } = await dbService.auth.signInWithGoogle(returnTo)
      if (error) throw error
    } catch (error) {
      alert(error.error_description || error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleStudentLogin = async (e) => {
    e.preventDefault()
    if (!studentName.trim()) {
      alert("이름을 입력해 주세요!")
      return
    }
    try {
      setLoading(true)
      const queryParams = new URLSearchParams(window.location.search);
      const returnTo = queryParams.get('returnTo') || '/';
      
      const { error } = await dbService.auth.signInAsStudent(studentName.trim())
      if (error) throw error
      
      navigate(returnTo)
      window.location.reload()
    } catch (error) {
      alert(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-container">


      <div className="login-main-content">
        <div className="login-box">
          <h1>🗺️ 우리 반 백지도</h1>
          <p>우리 반 친구들과 함께 세계 여러 나라를 조사해 보아요!</p>
          
          <button 
            className="google-login-btn" 
            onClick={handleGoogleLogin}
            disabled={loading}
          >
            {loading ? '로그인 중...' : 'GOOGLE 로그인'}
          </button>

          {/* Student direct login alternative */}
          {showStudentLogin && (
            <form onSubmit={handleStudentLogin} style={{ marginTop: '24px', borderTop: '1px dashed #282828', paddingTop: '24px' }}>
              <div style={{ fontSize: '0.85rem', color: '#b3b3b3', marginBottom: '10px', textAlign: 'left', fontWeight: 600 }}>
                학생 이름으로 시작하기
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input 
                  type="text" 
                  placeholder="이름을 입력해 주세요" 
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  disabled={loading}
                  style={{
                    flex: 1,
                    padding: '12px 16px',
                    borderRadius: '30px',
                    border: '1px solid #333',
                    background: '#121212',
                    color: '#fff',
                    fontSize: '0.85rem',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
                <button 
                  type="submit"
                  disabled={loading}
                  style={{
                    padding: '12px 20px',
                    borderRadius: '30px',
                    border: 'none',
                    background: 'var(--primary-color)',
                    color: '#000',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                    transition: 'all 0.2s ease'
                  }}
                >
                  입장
                </button>
              </div>
            </form>
          )}
          
          <div className="creator-tag">powerd by sota / gogh999@gmail.com</div>
          <GlobalFooter inline={true} />
        </div>
      </div>
    </div>
  )
}
