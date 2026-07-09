import { useEffect, useState, useMemo } from 'react'
import { dbService } from '../lib/dbService'
import { useNavigate, Link } from 'react-router-dom'
import { Edit2, Trash2, ArrowLeft, Download, Plus, Copy, Map as MapIcon, ExternalLink, RefreshCcw, LogOut } from 'lucide-react'
import { formatDisplayName } from '../utils/nameFormat'
import { COUNTRY_ALIASES } from '../utils/countryValidator'
import GlobalFooter from '../components/GlobalFooter'
import './Dashboard.css'

export default function Dashboard() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [filterAuthor, setFilterAuthor] = useState('ALL')
  
  // Maps state
  const [myMaps, setMyMaps] = useState([])
  const [selectedMapId, setSelectedMapId] = useState(null)

  // Edit state
  const [editingRecord, setEditingRecord] = useState(null)
  const [editCountryName, setEditCountryName] = useState('')
  const [editContent, setEditContent] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  // Unentered countries state
  const [geoData, setGeoData] = useState(null)
  const [showUnentered, setShowUnentered] = useState(false)
  const [unenteredSearch, setUnenteredSearch] = useState('')

  useEffect(() => {
    let mounted = true

    const checkSessionAndFetchData = async () => {
      const { data: { session } } = await dbService.auth.getSession()
      
      if (mounted) {
        if (!session) {
          navigate('/login')
          return
        }
        setUser(session.user)
        
        const { data: maps } = await dbService.maps.getMaps(session.user.email)
          
        if (maps && maps.length > 0) {
          setMyMaps(maps)
          setSelectedMapId(maps[0].id)
          fetchRecords(session.user, maps[0].id)
        } else {
          fetchRecords(session.user, null)
        }
      }
    }

    checkSessionAndFetchData()

    return () => {
      mounted = false
    }
  }, [navigate])

  const fetchMyMaps = async (currentUser = user) => {
    if (!currentUser) return;
    try {
      const { data, error } = await dbService.maps.getMaps(currentUser.email)
      
      if (error) {
        console.error("Error fetching maps:", error)
      } else if (data) {
        setMyMaps(data)
      }
    } catch (err) {
      console.error(err)
    }
  }

  const fetchRecords = async (currentUser = user, mapId = selectedMapId) => {
    if (!currentUser) return;
    try {
      setLoading(true)
      let result
      if (mapId) {
        result = await dbService.countriesData.getAllCountriesData(mapId)
      } else {
        if (currentUser.email === 'gogh999@gmail.com') {
          setRecords([])
          setLoading(false)
          return
        }
        result = await dbService.countriesData.getAllCountriesData(null, currentUser.user_metadata?.full_name || '익명 학생')
      }
      
      const { data, error } = result
      
      if (error) {
        console.error("Error fetching data:", error)
      } else {
        setRecords(data || [])
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleMapSelect = (mapId) => {
    setSelectedMapId(mapId)
    fetchRecords(user, mapId)
  }

  const handleCreateMap = async () => {
    if (myMaps.length >= 3) return
    
    const autoName = `${myMaps.length + 1}회`
    
    try {
      const { error } = await dbService.maps.createMap(autoName, user.email)
      if (error) throw error
      
      fetchMyMaps()
    } catch (err) {
      alert("지도 생성 실패: " + err.message)
    }
  }

  const handleDeleteMap = async (mapId) => {
    if (!window.confirm("정말 이 지도를 삭제하시겠습니까? 관련된 학생들의 기록도 함께 삭제될 수 있습니다.")) return
    try {
      const { error } = await dbService.maps.deleteMap(mapId)
      if (error) throw error
      
      if (selectedMapId === mapId) {
        setSelectedMapId(null)
        fetchRecords(user, null)
      }
      fetchMyMaps()
    } catch (err) {
      alert("지도 삭제 실패: " + err.message)
    }
  }

  const handleResetMap = async (mapId) => {
    if (!window.confirm("정말 이 지도의 모든 학생 기록을 초기화하시겠습니까? (복구할 수 없습니다)")) return
    try {
      const { error } = await dbService.maps.resetMapCountriesData(mapId)
      if (error) throw error
      
      alert("지도의 모든 기록이 초기화되었습니다.")
      if (selectedMapId === mapId) {
        fetchRecords(user, mapId)
      }
    } catch (err) {
      alert("초기화 실패: " + err.message)
    }
  }

  const handleUpdateThreshold = async (mapId, newThreshold) => {
    try {
      setMyMaps(prev => prev.map(m => m.id === mapId ? { ...m, reveal_threshold: newThreshold } : m))
      const { error } = await dbService.maps.updateMap(mapId, { reveal_threshold: newThreshold })
      if (error) throw error
    } catch (err) {
      alert("설정 변경 실패: " + err.message)
      fetchMyMaps()
    }
  }

  const handleUpdateStudyMode = async (mapId, newMode) => {
    try {
      setMyMaps(prev => prev.map(m => m.id === mapId ? { ...m, study_mode: newMode } : m))
      const { error } = await dbService.maps.updateMap(mapId, { study_mode: newMode })
      if (error) throw error
    } catch (err) {
      alert("설정 변경 실패: " + err.message)
      fetchMyMaps()
    }
  }

  const handleToggleOceans = async (mapId, checked) => {
    try {
      setMyMaps(prev => prev.map(m => m.id === mapId ? { ...m, include_oceans: checked } : m))
      const { error } = await dbService.maps.updateMap(mapId, { include_oceans: checked })
      if (error) throw error
    } catch (err) {
      alert("설정 변경 실패: " + err.message)
      fetchMyMaps()
    }
  }

  const handleTogglePolar = async (mapId, checked) => {
    try {
      setMyMaps(prev => prev.map(m => m.id === mapId ? { ...m, include_polar: checked } : m))
      const { error } = await dbService.maps.updateMap(mapId, { include_polar: checked })
      if (error) throw error
    } catch (err) {
      alert("설정 변경 실패: " + err.message)
      fetchMyMaps()
    }
  }

  const handleToggleContinent = async (mapId, continentId, checked, currentAllowed = '') => {
    let allowedList = currentAllowed ? currentAllowed.split(',').map(s => s.trim()).filter(Boolean) : ['Asia', 'Europe', 'Africa', 'North America', 'South America', 'Oceania', 'Antarctica'];
    
    if (checked) {
      if (!allowedList.includes(continentId)) {
        allowedList.push(continentId);
      }
    } else {
      allowedList = allowedList.filter(c => c !== continentId);
    }
    
    const newListStr = allowedList.join(',');
    
    try {
      setMyMaps(prev => prev.map(m => m.id === mapId ? { ...m, allowed_continents: newListStr } : m))
      const { error } = await dbService.maps.updateMap(mapId, { allowed_continents: newListStr })
      if (error) throw error
    } catch (err) {
      alert("설정 변경 실패: " + err.message)
      fetchMyMaps()
    }
  }

  const copyMapLink = (mapId) => {
    const link = `${window.location.origin}/map/${mapId}`
    navigator.clipboard.writeText(link)
    alert("학생 초대 링크가 복사되었습니다!\n" + link)
  }

  const handleDelete = async (id) => {
    if (!window.confirm("정말 이 기록을 삭제하시겠습니까?")) return
    
    try {
      const { error } = await dbService.countriesData.deleteCountryData(id)
      if (error) throw error
      
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
      const updates = {
        country_name: editCountryName,
        content: editContent
      }
      const { error } = await dbService.countriesData.updateCountryData(editingRecord.id, updates)
        
      if (error) throw error
      
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

  const isGlobalAdmin = user?.email === 'gogh999@gmail.com'
  const selectedMap = myMaps.find(m => m.id === selectedMapId)
  const isTeacher = selectedMap && selectedMap.teacher_email === user?.email
  const isAdmin = isGlobalAdmin || isTeacher

  const uniqueAuthors = ['ALL', ...new Set(records.map(r => r.author_name || '익명 학생'))]

  const filteredRecords = records.filter(record => {
    if (filterAuthor === 'ALL') return true;
    return (record.author_name || '익명 학생') === filterAuthor;
  })

  const groupedRecords = filteredRecords.reduce((acc, record) => {
    const author = record.author_name || '익명 학생';
    if (!acc[author]) {
      acc[author] = {
        author_name: author,
        author_avatar: record.author_avatar,
        registrations: [],
        investigations: []
      };
    }
    
    if (record.content && record.content.includes('등록했습니다! 🎉')) {
      acc[author].registrations.push(record);
    } else {
      acc[author].investigations.push(record);
    }
    
    return acc;
  }, {});
  
  const displayGroups = Object.values(groupedRecords).map(group => {
    return {
      ...group,
      registrations: [...group.registrations].sort((a, b) => 
        (a.country_name || '').localeCompare(b.country_name || '', 'ko')
      ),
      investigations: [...group.investigations].sort((a, b) => 
        (a.country_name || '').localeCompare(b.country_name || '', 'ko')
      )
    };
  }).sort((a, b) => a.author_name.localeCompare(b.author_name, 'ko'));

  useEffect(() => {
    fetch("/ne_50m_admin_0_countries.geojson")
      .then(response => response.json())
      .then(data => setGeoData(data))
      .catch(err => console.error("GeoJSON 로드 실패:", err))
  }, [])

  const unenteredCountries = useMemo(() => {
    if (!selectedMapId) return [];
    const selectedMap = myMaps.find(m => m.id === selectedMapId);
    if (!selectedMap) return [];

    const studyMode = selectedMap.study_mode || 'countries';
    const includeOceans = selectedMap.include_oceans !== false;
    const includePolar = selectedMap.include_polar !== false;
    const allowedContinents = selectedMap.allowed_continents || 'Asia,Europe,Africa,North America,South America,Oceania,Antarctica';
    const allowedSet = new Set(allowedContinents.split(',').map(s => s.trim().toLowerCase()));

    const activeLinks = new Set();

    if (studyMode === 'continents') {
      if (allowedSet.has('asia')) activeLinks.add('continent_asia');
      if (allowedSet.has('europe')) activeLinks.add('continent_europe');
      if (allowedSet.has('africa')) activeLinks.add('continent_africa');
      if (allowedSet.has('north america')) activeLinks.add('continent_north_america');
      if (allowedSet.has('south america')) activeLinks.add('continent_south_america');
      if (allowedSet.has('oceania')) activeLinks.add('continent_oceania');
      if (includePolar && allowedSet.has('antarctica')) {
        activeLinks.add('continent_antarctica');
      }
    } else {
      // Countries mode
      if (!geoData) return [];
      geoData.features.forEach(f => {
        let iso2 = f.properties.iso_a2 || f.properties['ISO3166-1-Alpha-2'];
        if (f.properties.name === "Antarctica") iso2 = "AQ";
        if (f.properties.name === "Kosovo") iso2 = "XK";
        if (f.properties.name === "Somaliland") iso2 = "SO";

        const cont = f.properties.continent;
        const contNormalized = cont ? cont.toLowerCase() : '';

        if (iso2 && iso2 !== "-99") {
          if (iso2 === "AQ" && !includePolar) return;
          if (!allowedSet.has(contNormalized)) return;
          if (!COUNTRY_ALIASES[iso2]) return;

          activeLinks.add(iso2);
        }
      });
    }

    if (includeOceans) {
      activeLinks.add('ocean_pacific');
      activeLinks.add('ocean_atlantic');
      activeLinks.add('ocean_indian');
      activeLinks.add('ocean_arctic');
      activeLinks.add('ocean_antarctic');
    }

    if (includePolar) {
      activeLinks.add('polar_arctic');
      if (studyMode !== 'continents' && allowedSet.has('antarctica')) {
        activeLinks.add('AQ'); // Antarctica in country mode
      }
    }

    // A region is entered if there is at least one record with that link
    const enteredLinks = new Set(records.map(r => r.link).filter(Boolean));

    const unentered = [];
    activeLinks.forEach(link => {
      if (!enteredLinks.has(link)) {
        let name = '';
        if (COUNTRY_ALIASES[link]) {
          name = COUNTRY_ALIASES[link][0];
        } else if (link.startsWith('continent_')) {
          const contId = link.replace('continent_', '');
          const mapping = {
            'asia': '아시아',
            'europe': '유럽',
            'africa': '아프리카',
            'north_america': '북아메리카',
            'south_america': '남아메리카',
            'oceania': '오세아니아',
            'antarctica': '남극'
          };
          name = mapping[contId] || link;
        } else {
          name = link;
        }
        unentered.push({ id: link, name });
      }
    });

    return unentered.sort((a, b) => a.name.localeCompare(b.name, 'ko'));
  }, [selectedMapId, myMaps, records, geoData]);

  const filteredUnentered = useMemo(() => {
    const search = unenteredSearch.trim().toLowerCase();
    if (!search) return unenteredCountries;
    return unenteredCountries.filter(c => c.name.toLowerCase().includes(search));
  }, [unenteredCountries, unenteredSearch]);

  const handleExportMapExcel = async (mapId, mapName) => {
    try {
      const { data: mapRecords, error } = await dbService.countriesData.getAllCountriesData(mapId)
      if (error) throw error
      if (!mapRecords || mapRecords.length === 0) {
        alert("이 지도의 저장된 기록이 없습니다.")
        return
      }
      
      const headers = ['작성자', '구분', '나라/바다/대륙 이름', '작성 날짜', '내용'];
      const csvData = mapRecords.map(record => {
        const author = formatDisplayName(record.author_name) || '익명 학생';
        const country = record.country_name || '이름 없는 지역';
        const date = new Date(record.created_at).toLocaleDateString();
        
        let category = '조사 내용';
        let cleanContent = record.content || '';
        
        if (cleanContent.includes('등록했습니다! 🎉')) {
          category = '이름 등록';
          cleanContent = '이름 등록 참여 🎉';
        }
        
        if (record.link) {
          if (record.link.startsWith('ocean_')) {
            category = cleanContent.includes('등록했습니다! 🎉') ? '바다 이름 등록' : '바다 조사 내용';
          } else if (record.link.startsWith('continent_')) {
            category = cleanContent.includes('등록했습니다! 🎉') ? '대륙 이름 등록' : '대륙 조사 내용';
          } else if (record.link === 'polar_arctic' || record.link === 'AQ') {
            category = cleanContent.includes('등록했습니다! 🎉') ? '극지 이름 등록' : '극지 조사 내용';
          }
        }
        
        const content = `"${cleanContent.replace(/"/g, '""')}"`;
        return `${author},${category},${country},${date},${content}`;
      });

      const csvString = '\uFEFF' + [headers.join(','), ...csvData].join('\n');
      const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `우리반_세계지도_기록_${mapName}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (err) {
      alert("엑셀 저장 실패: " + err.message)
    }
  }

  if (!user) return null

  return (
    <div className="dashboard-page-wrapper" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', width: '100%' }}>
      <div className="dashboard-container" style={{ flex: 1 }}>
        <main className="dashboard-content">
          
          {/* Maps Management Section */}
          <div className="maps-section" style={{ marginBottom: '30px', background: 'var(--bg-elevated)', padding: '20px', borderRadius: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2>우리 반 세계지도</h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{user.email}</span>
                <button 
                  onClick={async () => { await dbService.auth.signOut(); navigate('/login'); }} 
                  className="logout-btn" 
                  title="로그아웃"
                  style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '4px' }}
                >
                  <LogOut size={18} />
                </button>
                {/* Global excel button removed */}
                {myMaps.length < 3 && (
                  <button onClick={handleCreateMap} className="create-map-btn" style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--primary-color)', color: '#000', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
                    <Plus size={16} /> 새 지도 만들기
                  </button>
                )}
              </div>
            </div>

            <div className="maps-list" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px' }}>
              
              {[...myMaps].sort((a, b) => new Date(a.created_at) - new Date(b.created_at)).map(map => (
                <div key={map.id} style={{ padding: '12px 14px', borderRadius: '8px', cursor: 'pointer', border: selectedMapId === map.id ? '2px solid var(--primary-color)' : '1px solid var(--border-color)', background: selectedMapId === map.id ? 'rgba(29, 185, 84, 0.1)' : 'var(--bg-color)', minWidth: '250px', position: 'relative' }}>
                  <div onClick={() => handleMapSelect(map.id)}>
                    <h3 style={{ margin: '0 0 2px 0', fontSize: '1.1rem' }}>
                      {`${map.name}(${new Date(map.created_at).toLocaleDateString()})`}
                    </h3>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span>접속 횟수 (학생):</span>
                      <strong style={{ color: 'var(--primary-color)' }}>{map.visit_count || 0}회</strong>
                    </div>
                  </div>
                  
                  <div style={{ marginBottom: '8px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ color: 'var(--text-muted)' }}>나라 이름 표시 조건:</span>
                      <select 
                        value={map.reveal_threshold || 5} 
                        onChange={(e) => handleUpdateThreshold(map.id, parseInt(e.target.value))}
                        onClick={(e) => e.stopPropagation()}
                        style={{ padding: '4px 8px', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'var(--bg-elevated)', color: 'var(--text-color)', cursor: 'pointer' }}
                      >
                        {[1,2,3,4,5,6,7,8].map(num => (
                          <option key={num} value={num}>{num}명 입력시</option>
                        ))}
                      </select>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'stretch' }}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleExportMapExcel(map.id, map.name)
                        }}
                        className="export-btn"
                        title="엑셀로 저장"
                        style={{
                          borderRadius: '4px',
                          padding: '4px 8px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '4px',
                          fontSize: '0.75rem',
                          fontWeight: 'bold',
                          cursor: 'pointer',
                          background: 'var(--primary-color)',
                          color: '#000',
                          border: 'none'
                        }}
                      >
                        <Download size={12} />
                        <span>엑셀 저장</span>
                      </button>

                      <button 
                        onClick={(e) => { 
                          e.stopPropagation(); 
                          const newActive = map.is_active === false ? true : false;
                          setMyMaps(prev => prev.map(m => m.id === map.id ? { ...m, is_active: newActive } : m));
                          dbService.maps.updateMap(map.id, { is_active: newActive }).then(({error}) => {
                            if(error) alert('상태 변경 실패: ' + error.message);
                          });
                        }}
                        style={{ 
                          padding: '4px 8px', 
                          borderRadius: '4px', 
                          border: 'none', 
                          background: map.is_active !== false ? 'var(--primary-color)' : '#ef4444', 
                          color: map.is_active !== false ? '#000' : '#fff', 
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '4px',
                          fontSize: '0.75rem',
                          fontWeight: 'bold',
                          minWidth: '75px'
                        }}
                      >
                        {map.is_active !== false ? '✅ 입력 가능' : '⏸️ 입력 중지'}
                      </button>
                    </div>
                  </div>
                  
                  <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.85rem', borderTop: '1px dashed var(--border-color)', paddingTop: '8px' }}>
                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '4px' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', color: 'var(--text-color)' }} onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={map.include_oceans !== false}
                          onChange={(e) => handleToggleOceans(map.id, e.target.checked)}
                          style={{ cursor: 'pointer' }}
                        />
                        <span>5대양 포함</span>
                      </label>

                      <label style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', color: 'var(--text-color)' }} onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={map.include_polar !== false}
                          onChange={(e) => handleTogglePolar(map.id, e.target.checked)}
                          style={{ cursor: 'pointer' }}
                        />
                        <span>북극/남극 포함</span>
                      </label>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '6px', borderTop: '1px dotted var(--border-color)', paddingTop: '6px' }}>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600 }}>입력 허용 대륙:</span>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 12px' }}>
                        {[
                          { id: 'Asia', nameKo: '아시아' },
                          { id: 'Europe', nameKo: '유럽' },
                          { id: 'Africa', nameKo: '아프리카' },
                          { id: 'North America', nameKo: '북아메리카' },
                          { id: 'South America', nameKo: '남아메리카' },
                          { id: 'Oceania', nameKo: '오세아니아' },
                          { id: 'Antarctica', nameKo: '남극' }
                        ].map(cont => {
                          const allowedStr = map.allowed_continents || 'Asia,Europe,Africa,North America,South America,Oceania,Antarctica';
                          const allowedList = allowedStr.split(',').map(s => s.trim()).filter(Boolean);
                          const isChecked = allowedList.includes(cont.id);
                          
                          return (
                            <label key={cont.id} style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', color: 'var(--text-color)', fontSize: '0.75rem' }} onClick={(e) => e.stopPropagation()}>
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={(e) => handleToggleContinent(map.id, cont.id, e.target.checked, map.allowed_continents)}
                                style={{ cursor: 'pointer' }}
                              />
                              <span>{cont.nameKo}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '8px', paddingTop: '8px', borderTop: '1px solid var(--border-color)' }}>
                    <button onClick={(e) => { e.stopPropagation(); copyMapLink(map.id); }} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', background: 'var(--primary-color)', color: '#000', border: 'none', padding: '8px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 'bold' }}>
                      <Copy size={16} /> 학생 배부용 링크 복사
                    </button>
                    <div style={{ display: 'flex', width: '100%', gap: '4px' }}>
                      <button onClick={(e) => { e.stopPropagation(); navigate(`/map/${map.id}`); }} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', background: 'transparent', border: '1px solid var(--primary-color)', color: 'var(--primary-color)', padding: '4px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem' }}>
                        <ExternalLink size={12} /> 지도 입장
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); handleResetMap(map.id); }} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', background: 'transparent', border: '1px solid #f59e0b', color: '#f59e0b', padding: '4px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem' }} title="기록 초기화">
                        <RefreshCcw size={12} /> 초기화
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); handleDeleteMap(map.id); }} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', background: 'transparent', border: '1px solid #ef4444', color: '#ef4444', padding: '4px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem' }} title="지도 삭제">
                        <Trash2 size={12} /> 삭제
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 아직 입력되지 않은 나라 목록 */}
          {selectedMapId && (
            <div className="unentered-section" style={{ marginBottom: '30px', background: 'var(--bg-elevated)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
              <div 
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
                onClick={() => setShowUnentered(!showUnentered)}
              >
                <h2 style={{ margin: 0, fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>🕵️ 아직 입력되지 않은 지역</span>
                  <span style={{ fontSize: '0.9rem', color: '#000', background: 'var(--primary-color)', padding: '2px 8px', borderRadius: '12px', fontWeight: 'bold' }}>
                    {unenteredCountries.length}개
                  </span>
                </h2>
                <button style={{ background: 'none', border: 'none', color: 'var(--text-color)', cursor: 'pointer', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  {showUnentered ? '접기 ▲' : '펼치기 ▼'}
                </button>
              </div>

              {showUnentered && (
                <div style={{ marginTop: '16px' }}>
                  <input 
                    type="text" 
                    placeholder="나라/바다/대륙 이름 검색..." 
                    value={unenteredSearch}
                    onChange={(e) => setUnenteredSearch(e.target.value)}
                    style={{ 
                      width: '100%', 
                      padding: '10px 16px', 
                      borderRadius: '8px', 
                      border: '1px solid var(--border-color)', 
                      background: 'var(--bg-color)', 
                      color: 'var(--text-color)',
                      marginBottom: '16px',
                      fontSize: '0.9rem',
                      outline: 'none'
                    }}
                  />
                  {filteredUnentered.length === 0 ? (
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textAlign: 'center', padding: '20px' }}>
                      검색 결과가 없거나 모든 지역이 입력되었습니다.
                    </div>
                  ) : (
                    <div style={{ 
                      display: 'grid', 
                      gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', 
                      gap: '8px',
                      maxHeight: '300px',
                      overflowY: 'auto',
                      paddingRight: '8px'
                    }}>
                      {filteredUnentered.map(c => (
                        <div 
                          key={c.id} 
                          style={{ 
                            padding: '8px 10px', 
                            background: 'rgba(255, 255, 255, 0.03)', 
                            border: '1px solid rgba(255, 255, 255, 0.08)',
                            borderRadius: '6px', 
                            fontSize: '0.85rem', 
                            textAlign: 'center',
                            color: 'var(--text-muted)',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          }}
                          title={c.name}
                        >
                          {c.name}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginBottom: '20px' }}>
            
            {records.length > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>작성자 필터:</span>
                <select 
                  value={filterAuthor} 
                  onChange={(e) => setFilterAuthor(e.target.value)}
                  style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-elevated)', color: 'var(--text-color)' }}
                >
                  {uniqueAuthors.map(author => (
                    <option key={author} value={author}>
                      {author === 'ALL' ? '전체 보기' : formatDisplayName(author)}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {loading ? (
            <div className="loading-state">기록을 불러오는 중입니다...</div>
          ) : displayGroups.length === 0 ? (
            <div className="empty-state">
              <p>아직 작성된 기록이 없습니다.</p>
            </div>
          ) : (
            <div className="students-grid">
              {displayGroups.map(group => (
                <div key={group.author_name} className="student-group-card">
                  <div className="student-header">
                    <h2 className="student-name">{formatDisplayName(group.author_name)}의 기록</h2>
                  </div>
                  
                  <div className="student-records-list">
                    {group.registrations.length > 0 && (
                      <div className="record-category">
                        <h4 className="category-title">🎯 등록한 나라</h4>
                        <div className="category-items" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '6px' }}>
                          {group.registrations.map(record => {
                            const canEdit = isAdmin || record.author_name === user.user_metadata?.full_name;
                            return (
                              <div key={record.id} className="sub-record-card" style={{ padding: '8px 10px', marginBottom: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', minWidth: 0 }}>
                                <div className="sub-record-header" style={{ marginBottom: 0, width: '100%', minWidth: 0 }}>
                                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', gap: '4px', minWidth: 0 }}>
                                    <span className="sub-record-country" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontSize: '0.9rem' }} title={record.country_name || '이름 없는 나라'}>
                                      {record.country_name || '이름 없는 나라'}
                                    </span>
                                    {canEdit && (
                                      <div className="sub-record-actions" style={{ marginTop: 0, flexShrink: 0 }}>
                                        <button onClick={() => handleEditClick(record)} className="action-btn edit-btn" style={{ padding: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="수정">
                                          <Edit2 size={12} />
                                        </button>
                                        <button onClick={() => handleDelete(record.id)} className="action-btn delete-btn" style={{ padding: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="삭제">
                                          <Trash2 size={12} />
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {group.investigations.length > 0 && (
                      <div className="record-category">
                        <h4 className="category-title">📝 조사한 내용</h4>
                        <div className="category-items">
                          {group.investigations.map(record => {
                            const canEdit = isAdmin || record.author_name === user.user_metadata?.full_name;
                            return (
                              <div key={record.id} className="sub-record-card">
                                <div className="sub-record-header">
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span className="sub-record-country">{record.country_name || '이름 없는 나라'}</span>
                                    {canEdit && (
                                      <div className="sub-record-actions" style={{ marginTop: 0 }}>
                                        <button onClick={() => handleEditClick(record)} className="action-btn edit-btn" style={{ flex: 0, padding: '4px 8px', fontSize: '11px' }}>
                                          <Edit2 size={12} /> 수정
                                        </button>
                                        <button onClick={() => handleDelete(record.id)} className="action-btn delete-btn" style={{ flex: 0, padding: '4px 8px', fontSize: '11px' }}>
                                          <Trash2 size={12} /> 삭제
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                </div>
                                <div className="sub-record-content" style={{ marginBottom: 0 }}>
                                  {record.content}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
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
                {(!editingRecord.content || !editingRecord.content.includes('등록했습니다! 🎉')) && (
                  <div className="form-group">
                    <label>내용</label>
                    <textarea 
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      placeholder="내용을 입력하세요"
                      rows={5}
                    />
                  </div>
                )}
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
      <GlobalFooter />
    </div>
  )
}
