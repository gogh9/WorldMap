import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useNavigate } from 'react-router-dom'
import { LogOut } from 'lucide-react'
import WorldMap from '../components/WorldMap'
import CountryPanel from '../components/CountryPanel'
import './Home.css'

export default function Home() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [selectedCountry, setSelectedCountry] = useState(null)

  useEffect(() => {
    let mounted = true

    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (mounted) {
        // Supabase v2 PKCE(?code=) 또는 Implicit(#access_token=) 방식일 경우 대기
        const isAuthCallback = window.location.search.includes('code=') || 
                               window.location.hash.includes('access_token=') || 
                               window.location.search.includes('error=');
        
        if (!session && !isAuthCallback) {
          navigate('/login')
        } else if (session) {
          setUser(session.user)
        }
      }
    }

    checkSession()

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (mounted) {
        const isAuthCallback = window.location.search.includes('code=') || 
                               window.location.hash.includes('access_token=');
                               
        if (!session && !isAuthCallback) {
          navigate('/login')
        } else if (session) {
          setUser(session.user)
        }
      }
    })

    return () => {
      mounted = false
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
          <CountryPanel 
            countryName={selectedCountry} 
            user={user} 
            onClose={() => setSelectedCountry(null)} 
          />
        )}
      </main>
    </div>
  )
}
