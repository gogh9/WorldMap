import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useNavigate } from 'react-router-dom'
import { LogOut, LayoutDashboard } from 'lucide-react'
import WorldMap from '../components/WorldMap'
import CountryPanel from '../components/CountryPanel'
import { formatDisplayName } from '../utils/nameFormat'
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
    setSelectedCountry(properties.countryId || properties.name)
  }

  if (!user) return <div className="loading">로딩 중...</div>

  return (
    <div className="home-container">
      <main className="map-section">
        <WorldMap onCountryClick={handleCountryClick} />
      </main>
      
      <aside className="right-sidebar">
        <header className="sidebar-header">
          <div className="nav-brand">🗺️ 우리 반 세계지도</div>
          <div className="nav-user">
            <img src={user.user_metadata.avatar_url} alt="Profile" className="avatar" />
            <span className="user-name">{formatDisplayName(user.user_metadata.full_name)}님</span>
            <button onClick={() => navigate('/dashboard')} className="dashboard-btn" title="대시보드" style={{ background: 'transparent', border: 'none', color: '#a7a7a7', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'color 0.2s', padding: '4px' }} onMouseEnter={(e) => e.currentTarget.style.color = '#fff'} onMouseLeave={(e) => e.currentTarget.style.color = '#a7a7a7'}>
              <LayoutDashboard size={18} />
            </button>
            <button onClick={handleLogout} className="logout-btn" title="로그아웃">
              <LogOut size={18} />
            </button>
          </div>
        </header>

        <div className="sidebar-content">
          {selectedCountry ? (
            <CountryPanel 
              countryId={selectedCountry} 
              user={user} 
              onClose={() => setSelectedCountry(null)} 
            />
          ) : (
            <div className="empty-selection">
              <p>👆 지도에서 원하는 나라를 클릭해보세요!</p>
            </div>
          )}
        </div>
      </aside>
    </div>
  )
}
