import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useNavigate } from 'react-router-dom'
import './Login.css'

export default function Login() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // URL에 에러가 있는지 확인
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const queryParams = new URLSearchParams(window.location.search);
    const errorDescription = hashParams.get('error_description') || queryParams.get('error_description');
    
    if (errorDescription) {
      alert("로그인 에러 발생: " + decodeURIComponent(errorDescription).replace(/\+/g, ' '));
    }

    const returnTo = queryParams.get('returnTo') || '/';

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
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
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}${returnTo}`
        }
      })
      if (error) throw error
    } catch (error) {
      alert(error.error_description || error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-container">
      <div className="login-box">
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
      </div>
    </div>
  )
}
