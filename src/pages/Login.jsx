import { useEffect, useState } from 'react'
import { dbService } from '../lib/dbService'
import { useNavigate } from 'react-router-dom'
import { HelpCircle } from 'lucide-react'
import GlobalFooter from '../components/GlobalFooter'
import HelpModal from '../components/HelpModal'
import './Login.css'

export default function Login() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [isHelpOpen, setIsHelpOpen] = useState(false)

  const schoolName = import.meta.env.VITE_SCHOOL_NAME || '서울수색초등학교'
  const creatorName = import.meta.env.VITE_CREATOR_NAME || 'sota'

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

  return (
    <div className="login-container">
      {/* Floating help button top right */}
      <button 
        className="login-help-floating-btn" 
        onClick={() => setIsHelpOpen(true)}
        title="사용방법 안내"
      >
        <HelpCircle size={20} />
        <span>도움말</span>
      </button>

      <div className="login-main-content">
        <div className="login-box">
          <div className="school-tag">🏫 {schoolName}</div>
          <h1>🌎 세계 백지도 탐험</h1>
          <p>우리 반 친구들과 함께 세계 여러 나라를 조사해 보아요!</p>
          
          <button 
            className="google-login-btn" 
            onClick={handleGoogleLogin}
            disabled={loading}
          >
            <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google logo" width="20" />
            {loading ? '로그인 중...' : '구글 계정으로 시작하기'}
          </button>
          
          <div className="creator-tag">제작자: {creatorName}</div>
        </div>
      </div>

      <GlobalFooter />

      <HelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
    </div>
  )
}
