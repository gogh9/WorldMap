import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useNavigate } from 'react-router-dom'
import { LogOut } from 'lucide-react'
import WorldMap from '../components/WorldMap'
import './Home.css'

export default function Home() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [selectedCountry, setSelectedCountry] = useState(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate('/login')
      } else {
        setUser(session.user)
      }
    })

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        navigate('/login')
      } else {
        setUser(session.user)
      }
    })

    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [navigate])

  const handleLogout = async () => {
    await supabase.auth.signOut()
  }

  const handleCountryClick = (properties) => {
    console.log("Clicked:", properties)
    setSelectedCountry(properties.ADMIN || properties.name)
  }

  if (!user) return <div className="loading">로딩 중...</div>

  return (
    <div className="home-container">
      <nav className="navbar">
        <div className="nav-brand">🗺️ 우리 반 세계지도</div>
        <div className="nav-user">
          <img src={user.user_metadata.avatar_url} alt="Profile" className="avatar" />
          <span className="user-name">{user.user_metadata.full_name}님</span>
          <button onClick={handleLogout} className="logout-btn" title="로그아웃">
            <LogOut size={18} />
          </button>
        </div>
      </nav>
      
      <main className="content-area">
        <div className="map-section">
          <WorldMap onCountryClick={handleCountryClick} />
        </div>
        
        {selectedCountry && (
          <aside className="side-panel">
            <h2>{selectedCountry}</h2>
            <p>이곳에 정보 입력 폼이 추가될 예정입니다.</p>
            <button onClick={() => setSelectedCountry(null)} className="close-btn">닫기</button>
          </aside>
        )}
      </main>
    </div>
  )
}
