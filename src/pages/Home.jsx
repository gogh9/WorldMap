import { useEffect, useState } from 'react'
import { dbService } from '../lib/dbService'
import { useNavigate, useParams } from 'react-router-dom'
import { LogOut, LayoutDashboard, HelpCircle } from 'lucide-react'
import WorldMap from '../components/WorldMap'
import CountryPanel from '../components/CountryPanel'
import GlobalFooter from '../components/GlobalFooter'
import HelpModal from '../components/HelpModal'
import { formatDisplayName } from '../utils/nameFormat'
import './Home.css'

export default function Home() {
  const navigate = useNavigate()
  const { mapId } = useParams()
  const [user, setUser] = useState(null)
  const [selectedCountry, setSelectedCountry] = useState(null)
  const [mapName, setMapName] = useState('우리 반 세계지도')
  const [revealThreshold, setRevealThreshold] = useState(5)
  const [isActive, setIsActive] = useState(true)
  const [isTeacher, setIsTeacher] = useState(false)
  const [progress, setProgress] = useState({ completed: 0, total: 0 })
  const [studyMode, setStudyMode] = useState('countries')
  const [includeOceans, setIncludeOceans] = useState(true)
  const [includePolar, setIncludePolar] = useState(true)
  const [allowedContinents, setAllowedContinents] = useState('Asia,Europe,Africa,North America,South America,Oceania,Antarctica')
  const [isHelpOpen, setIsHelpOpen] = useState(false)

  const creatorEmail = 'gogh9@susaek.sen.es.kr'
  const creatorName = import.meta.env.VITE_CREATOR_NAME || 'sota'

  useEffect(() => {
    if (user && !mapId) {
      navigate('/dashboard')
    }
  }, [user, mapId, navigate])

  useEffect(() => {
    if (mapId) {
      const fetchMapDetails = async () => {
        const { data } = await dbService.maps.getMap(mapId)
        
        if (data) {
          setMapName(data.name)
          setRevealThreshold(data.reveal_threshold || 5)
          setIsActive(data.is_active !== false)
          setStudyMode(data.study_mode || 'countries')
          setIncludeOceans(data.include_oceans !== false)
          setIncludePolar(data.include_polar !== false)
          setAllowedContinents(data.allowed_continents || 'Asia,Europe,Africa,North America,South America,Oceania,Antarctica')
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
      const { data: { session } } = await dbService.auth.getSession()
      if (mounted) {
        const isAuthCallback = window.location.search.includes('code=') || 
                               window.location.hash.includes('access_token=') || 
                               window.location.search.includes('error=');
        
        if (!session && !isAuthCallback) {
          navigate(`/login?returnTo=${encodeURIComponent(window.location.pathname)}`)
        } else if (session) {
          setUser(session.user)
        }
      }
    }

    checkSession()

    const { data: authListener } = dbService.auth.onAuthStateChange((event, session) => {
      if (mounted) {
        const isAuthCallback = window.location.search.includes('code=') || 
                               window.location.hash.includes('access_token=');
                               
        if (!session && !isAuthCallback) {
          navigate(`/login?returnTo=${encodeURIComponent(window.location.pathname)}`)
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
    await dbService.auth.signOut()
  }

  const handleCountryClick = (properties) => {
    setSelectedCountry(properties.countryId || properties.name)
  }

  if (!user) return <div className="loading">로딩 중...</div>

  return (
    <div className="home-page-wrapper" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', width: '100%' }}>
      <div className="home-container" style={{ flex: 1 }}>
        <main className="map-section">
          <WorldMap 
            onCountryClick={handleCountryClick} 
            mapId={mapId} 
            revealThreshold={revealThreshold} 
            currentUser={user} 
            onProgressUpdate={setProgress}
            studyMode={studyMode}
            includeOceans={includeOceans}
            includePolar={includePolar}
            allowedContinents={allowedContinents}
          />
        </main>
        
        <aside className="right-sidebar">
          <header className="sidebar-header" style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'stretch' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', width: '100%' }}>
              <div className="nav-brand" style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                우리반 백지도 🗺️ {mapName}
              </div>
              <div className="nav-user">
                <span className="user-name">{formatDisplayName(user.user_metadata.full_name)}</span>
                
                <button 
                  onClick={() => setIsHelpOpen(true)} 
                  className="help-btn" 
                  title="사용방법 안내"
                >
                  <HelpCircle size={18} />
                </button>

                <button 
                  onClick={() => navigate('/dashboard')} 
                  className="dashboard-btn" 
                  title="대시보드"
                >
                  <LayoutDashboard size={18} />
                </button>
                
                <button 
                  onClick={handleLogout} 
                  className="logout-btn" 
                  title="로그아웃"
                >
                  <LogOut size={18} />
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div className="nav-subtitle" style={{ fontSize: '11px', color: '#888', fontWeight: 500, textAlign: 'right' }}>
                Built by {creatorName} / {creatorEmail}
              </div>
              {progress.total > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', background: 'rgba(30, 215, 96, 0.05)', border: '1px solid rgba(30, 215, 96, 0.2)', padding: '8px 10px', borderRadius: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', color: 'var(--text-color)', fontWeight: 600 }}>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '11px' }}>완료율</span>
                    <span style={{ color: 'var(--primary-color)' }}>
                      {progress.completed} / {progress.total} ({((progress.completed / progress.total) * 100).toFixed(1)}%)
                    </span>
                  </div>
                  <div style={{ width: '100%', height: '4px', backgroundColor: 'rgba(255, 255, 255, 0.1)', borderRadius: '2px', overflow: 'hidden' }}>
                    <div style={{ width: `${(progress.completed / progress.total) * 100}%`, height: '100%', backgroundColor: 'var(--primary-color)', transition: 'width 0.3s ease' }}></div>
                  </div>
                </div>
              )}
            </div>
          </header>

          <div className="sidebar-content">
            {selectedCountry ? (
              <CountryPanel 
                countryId={selectedCountry} 
                user={user} 
                mapId={mapId}
                isTeacher={isTeacher}
                revealThreshold={revealThreshold}
                isActive={isActive}
                studyMode={studyMode}
                includeOceans={includeOceans}
                includePolar={includePolar}
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
      <GlobalFooter />
      <HelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
    </div>
  )
}
