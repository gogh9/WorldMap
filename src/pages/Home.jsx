import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useNavigate, useParams } from 'react-router-dom'
import { LogOut, LayoutDashboard } from 'lucide-react'
import WorldMap from '../components/WorldMap'
import CountryPanel from '../components/CountryPanel'
import { formatDisplayName } from '../utils/nameFormat'
import './Home.css'

export default function Home() {
  const navigate = useNavigate()
  const { mapId } = useParams()
  const [user, setUser] = useState(null)
  const [selectedCountry, setSelectedCountry] = useState(null)
  const [mapName, setMapName] = useState('우리 반 세계지도')
  const [isTeacher, setIsTeacher] = useState(false)

  useEffect(() => {
    if (user && !mapId) {
      navigate('/dashboard')
    }
  }, [user, mapId, navigate])

  useEffect(() => {
    if (mapId) {
      const fetchMapDetails = async () => {
        const { data } = await supabase
          .from('maps')
          .select('name, teacher_email')
          .eq('id', mapId)
          .single()
        
        if (data) {
          setMapName(data.name)
          if (user && data.teacher_email === user.email) {
            setIsTeacher(true)
          }
        }
      }
      if (user) {
        fetchMapDetails()
      }
    }
  }, [mapId, user])

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
        <WorldMap onCountryClick={handleCountryClick} mapId={mapId} />
      </main>
      
      <aside className="right-sidebar">
        <header className="sidebar-header">
          <div className="nav-brand">🗺️ {mapName}</div>
          <div className="nav-user">
            <span className="user-name">{formatDisplayName(user.user_metadata.full_name)}</span>
            <button onClick={() => navigate('/dashboard')} className="dashboard-btn" title={user.email === 'gogh999@gmail.com' ? "전체 대시보드" : "내 기록 보기"} style={{ background: 'transparent', border: 'none', color: '#a7a7a7', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'color 0.2s', padding: '4px' }} onMouseEnter={(e) => e.currentTarget.style.color = '#fff'} onMouseLeave={(e) => e.currentTarget.style.color = '#a7a7a7'}>
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
              mapId={mapId}
              isTeacher={isTeacher}
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
