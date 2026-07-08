import { useEffect, useState, useMemo } from 'react'
import { ComposableMap, Geographies, Geography, ZoomableGroup, Marker, Sphere, Graticule } from 'react-simple-maps'
import { geoCentroid, geoNaturalEarth1 } from 'd3-geo'
import countries from 'i18n-iso-countries'
import koLocale from 'i18n-iso-countries/langs/ko.json'
import { dbService } from '../lib/dbService'
import { formatDisplayName } from '../utils/nameFormat'
import { COUNTRY_ALIASES } from '../utils/countryValidator'
import './WorldMap.css'

// 한국어 번역 로케일 등록
countries.registerLocale(koLocale)

const geoUrl = "/ne_50m_admin_0_countries.geojson"

const mapWidth = 800;
const mapHeight = 600;
const projection = geoNaturalEarth1()
  .translate([mapWidth / 2, mapHeight / 2])
  .scale(160)

const OCEANS_CONFIG = [
  { id: 'ocean_pacific_west', linkId: 'ocean_pacific', nameKo: '태평양', nameEn: 'Pacific Ocean (West)', coordinates: [150, 20] },
  { id: 'ocean_pacific_east', linkId: 'ocean_pacific', nameKo: '태평양', nameEn: 'Pacific Ocean (East)', coordinates: [-160, -10] },
  { id: 'ocean_atlantic', linkId: 'ocean_atlantic', nameKo: '대서양', nameEn: 'Atlantic Ocean', coordinates: [-30, 20] },
  { id: 'ocean_indian', linkId: 'ocean_indian', nameKo: '인도양', nameEn: 'Indian Ocean', coordinates: [80, -15] },
  { id: 'ocean_arctic', linkId: 'ocean_arctic', nameKo: '북극해', nameEn: 'Arctic Ocean', coordinates: [0, 85] },
  { id: 'ocean_antarctic', linkId: 'ocean_antarctic', nameKo: '남극해', nameEn: 'Southern Ocean', coordinates: [0, -68] },
];

export default function WorldMap({ 
  onCountryClick, 
  mapId, 
  revealThreshold = 5, 
  currentUser, 
  onProgressUpdate,
  studyMode = 'countries',
  includeOceans = true,
  includePolar = true,
  allowedContinents = 'Asia,Europe,Africa,North America,South America,Oceania,Antarctica'
}) {
  const [geoData, setGeoData] = useState(null)
  const [registeredCountries, setRegisteredCountries] = useState({})
  const [hoveredCountry, setHoveredCountry] = useState(null)
  const [position, setPosition] = useState({ coordinates: [0, 0], zoom: 1 })

  const allowedSet = useMemo(() => {
    return new Set(allowedContinents.split(',').map(s => s.trim().toLowerCase()));
  }, [allowedContinents]);

  useEffect(() => {
    if (onProgressUpdate && geoData) {
      let activeLinks = new Set();
      
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
            
            // 제외: 사전에 키가 존재하지 않는 국가(속령 등)는 분모에서 배제
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

      const total = activeLinks.size;
      let completed = 0;
      activeLinks.forEach(link => {
        if (registeredCountries[link] && registeredCountries[link].count >= revealThreshold) {
          completed++;
        }
      });
      onProgressUpdate({ completed, total });
    }
  }, [geoData, registeredCountries, revealThreshold, onProgressUpdate, studyMode, includeOceans, includePolar, allowedSet]);

  useEffect(() => {
    // 고해상도(50m) 세계 국가 GeoJSON 데이터 가져오기
    fetch(geoUrl)
      .then(response => response.json())
      .then(data => setGeoData(data))
      .catch(err => console.error("GeoJSON 로드 실패:", err))

    // DB에서 등록된 나라 정보 가져오기
    const fetchCountries = async () => {
      if (!mapId) return
      const { data, error } = await dbService.countriesData.getAllCountriesData(mapId)
      
      if (data && !error) {
        const countryStats = {}
        data.forEach(item => {
           if (item.country_name && item.link) {
             if (!countryStats[item.link]) {
               countryStats[item.link] = {
                 allAuthors: new Set(),
                 nameCounts: {}
               }
             }
             if (item.author_name && item.content && item.content.includes('등록했습니다! 🎉')) {
               const name = item.country_name.trim()
               countryStats[item.link].allAuthors.add(item.author_name)
               if (!countryStats[item.link].nameCounts[name]) {
                 countryStats[item.link].nameCounts[name] = 0
               }
               countryStats[item.link].nameCounts[name]++
             }
           }
        })
        
        const formattedStats = {}
        Object.keys(countryStats).forEach(link => {
           let maxVotes = 0;
           let maxName = '';
           Object.entries(countryStats[link].nameCounts).forEach(([name, votes]) => {
             if (votes > maxVotes) {
               maxVotes = votes;
               maxName = name;
             }
           });
           
           if (maxName) {
             formattedStats[link] = {
               name: maxName,
               count: countryStats[link].allAuthors.size,
               authors: countryStats[link].allAuthors
             }
           }
        })
        setRegisteredCountries(formattedStats)
      }
    }
    fetchCountries()

    // 실시간 업데이트 구독
    const sub = dbService.countriesData.subscribeCountriesData(mapId, () => {
      fetchCountries()
    })
      
    return () => {
      sub.unsubscribe()
    }
  }, [mapId])

  // 중심점 계산
  const centroids = useMemo(() => {
    if (studyMode === 'continents') {
      const CONTINENTS_CONFIG = {
        'continent_asia': { name: '아시아', coordinates: [90, 35] },
        'continent_europe': { name: '유럽', coordinates: [20, 50] },
        'continent_africa': { name: '아프리카', coordinates: [20, 10] },
        'continent_north_america': { name: '북아메리카', coordinates: [-100, 40] },
        'continent_south_america': { name: '남아메리카', coordinates: [-60, -15] },
        'continent_oceania': { name: '오세아니아', coordinates: [135, -25] },
        'continent_antarctica': { name: '남극', coordinates: [0, -82] }
      };

      const list = [];
      Object.entries(CONTINENTS_CONFIG).forEach(([key, config]) => {
        if (!includePolar && key === 'continent_antarctica') return;
        
        const contName = key.replace('continent_', '').replace('_', ' ');
        if (!allowedSet.has(contName)) return;

        const stats = registeredCountries[key];
        let customName = null;
        if (stats && stats.count > 0) {
          if (stats.count >= revealThreshold) {
            customName = stats.name;
          } else {
            const nameLen = stats.name.length;
            const unmaskedLen = Math.floor((stats.count / revealThreshold) * nameLen);
            const maskedLen = nameLen - unmaskedLen;
            const masked = "*".repeat(maskedLen) + stats.name.slice(maskedLen);
            customName = `${masked} (${stats.count}/${revealThreshold})`;
          }
          list.push({
            iso2: key,
            name: customName,
            coordinates: config.coordinates
          });
        }
      });
      return list;
    }

    if (!geoData) return []
    const seen = new Set()
    const list = []
    
    // 일부 영토가 떨어져 있어 수학적 중심점이 이상하게 나오는 나라들의 중심점 수동 보정 (경도, 위도)
    const CENTROID_OVERRIDES = {
      "FR": [2.2137, 46.2276], // 프랑스
      "US": [-95.7129, 37.0902], // 미국
      "RU": [90.0, 60.0], // 러시아
      "NL": [5.2913, 52.1326], // 네덜란드
      "GB": [-3.4360, 55.3781], // 영국
      "AQ": [0, -82], // 남극
    }
    
    geoData.features.forEach(feature => {
      let iso2 = feature.properties.iso_a2 || feature.properties['ISO3166-1-Alpha-2']
      if (feature.properties.name === "Antarctica") iso2 = "AQ";
      if (feature.properties.name === "Kosovo") iso2 = "XK";
      if (feature.properties.name === "Somaliland") iso2 = "SO";
      if (!iso2 || seen.has(iso2)) return;
      if (iso2 === 'AQ' && !includePolar) return;
      
      const cont = feature.properties.continent;
      const contNormalized = cont ? cont.toLowerCase() : '';
      if (!allowedSet.has(contNormalized)) return;

      const stats = registeredCountries[iso2]
      let customName = null
      
      if (stats && stats.count > 0) {
        seen.add(iso2);

        if (stats.count >= revealThreshold) {
          customName = stats.name
        } else {
          const nameLen = stats.name.length;
          const unmaskedLen = Math.floor((stats.count / revealThreshold) * nameLen);
          const maskedLen = nameLen - unmaskedLen;
          const masked = "*".repeat(maskedLen) + stats.name.slice(maskedLen);
          customName = `${masked} (${stats.count}/${revealThreshold})`
        }
        
        list.push({
          iso2,
          name: customName,
          coordinates: CENTROID_OVERRIDES[iso2] || geoCentroid(feature)
        })
      }
    })

    // 글씨가 겹치지 않도록 밀어내는 로직 (간단한 충돌 해결)
    for (let i = 0; i < 50; i++) {
      let moved = false;
      for (let j = 0; j < list.length; j++) {
        for (let k = j + 1; k < list.length; k++) {
          const dx = list[j].coordinates[0] - list[k].coordinates[0];
          const dy = list[j].coordinates[1] - list[k].coordinates[1];
          const avgLat = (list[j].coordinates[1] + list[k].coordinates[1]) / 2;
          const cosLat = Math.max(0.2, Math.cos(avgLat * Math.PI / 180));
          
          // 폰트 크기에 비례하는 필요 위경도 거리 (줌 레벨에 따라 겹침 허용 거리 축소)
          const minDx = (((list[j].name.length + list[k].name.length) * 0.7) / cosLat) / position.zoom;
          const minDy = 2.0 / position.zoom;

          if (Math.abs(dx) < minDx && Math.abs(dy) < minDy) {
            const overlapX = minDx - Math.abs(dx);
            const overlapY = minDy - Math.abs(dy);
            
            // 더 적게 겹친 방향으로 살짝씩 밀어냄
            if (overlapX < overlapY) {
              const push = (overlapX / 2 + 0.05 / position.zoom) * Math.sign(dx || 1);
              list[j].coordinates[0] += push;
              list[k].coordinates[0] -= push;
            } else {
              const push = (overlapY / 2 + 0.05 / position.zoom) * Math.sign(dy || 1);
              list[j].coordinates[1] += push;
              list[k].coordinates[1] -= push;
            }
            moved = true;
          }
        }
      }
      if (!moved) break;
    }
    
    return list;
  }, [geoData, registeredCountries, position.zoom, revealThreshold, currentUser, studyMode, includePolar, allowedSet])

  return (
    <div className="map-wrapper" style={{ background: "#f8f9fa", borderRadius: "8px", overflow: "hidden" }}>
      <ComposableMap projection={projection} width={mapWidth} height={mapHeight} style={{ width: "100%", height: "100%" }}>
        <ZoomableGroup 
          center={position.coordinates} 
          zoom={position.zoom} 
          onMoveEnd={setPosition} 
          minZoom={1} 
          maxZoom={10}
        >
          <Sphere stroke="#80deea" strokeWidth={1} fill="#aad3df" />
          <Graticule stroke="#b2ebf2" strokeWidth={0.5} />
          {geoData && (
            <Geographies geography={geoData}>
              {({ geographies }) =>
                geographies.map((geo) => {
                  let iso2 = geo.properties.iso_a2 || geo.properties['ISO3166-1-Alpha-2']
                  if (geo.properties.name === "Antarctica") iso2 = "AQ"
                  if (geo.properties.name === "Kosovo") iso2 = "XK"
                  if (geo.properties.name === "Somaliland") iso2 = "SO"
                  
                  let isRegistered = false
                  let continentKey = null
                  if (studyMode === 'continents') {
                    if (geo.properties.continent) {
                      continentKey = `continent_${geo.properties.continent.toLowerCase().replace(/\s+/g, '_')}`
                      isRegistered = !!registeredCountries[continentKey]
                    }
                  } else {
                    isRegistered = !!registeredCountries[iso2]
                  }

                  const continentColors = {
                    'North America': '#81c784',
                    'South America': '#4db6ac',
                    'Europe': '#7986cb',
                    'Africa': '#ffb74d',
                    'Asia': '#ba68c8',
                    'Oceania': '#4dd0e1',
                    'Antarctica': '#e0e0e0'
                  };
                  
                  const isPolarAntarctica = iso2 === 'AQ';
                  const isPolarAntarcticaDisabled = isPolarAntarctica && !includePolar;
                  const isContinentAllowed = geo.properties.continent ? allowedSet.has(geo.properties.continent.toLowerCase()) : true;
                  const isCountryInAliases = studyMode === 'continents' ? true : (iso2 && !!COUNTRY_ALIASES[iso2]);
                  const isDisabled = !isContinentAllowed || isPolarAntarcticaDisabled || !isCountryInAliases;

                  let defaultFill = !isRegistered ? '#ff6b6b' : (continentColors[geo.properties.continent] || '#d1d5db');
                  let hoverFill = !isRegistered ? '#ff5252' : '#80deea';
                  let pressedFill = !isRegistered ? '#ff1744' : '#26c6da';

                  if (isDisabled) {
                    defaultFill = '#e5e7eb';
                    hoverFill = '#e5e7eb';
                    pressedFill = '#e5e7eb';
                  }

                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      onClick={() => {
                        if (isDisabled) return;
                        if (onCountryClick) {
                          if (studyMode === 'continents') {
                            onCountryClick({ ...geo.properties, countryId: continentKey, type: 'continent' })
                          } else {
                            onCountryClick({ ...geo.properties, countryId: iso2, type: 'country' })
                          }
                        }
                      }}
                      onMouseEnter={() => {
                        if (isDisabled) return;
                        setHoveredCountry(studyMode === 'continents' ? continentKey : iso2)
                      }}
                      onMouseLeave={() => setHoveredCountry(null)}
                      style={{
                        default: {
                          fill: defaultFill,
                          stroke: '#444',
                          strokeWidth: 0.5,
                          outline: 'none',
                        },
                        hover: {
                          fill: hoverFill,
                          stroke: isDisabled ? '#444' : '#00838f',
                          strokeWidth: isDisabled ? 0.5 : 1.5,
                          outline: 'none',
                          cursor: isDisabled ? 'default' : 'pointer',
                        },
                        pressed: {
                          fill: pressedFill,
                          stroke: isDisabled ? '#444' : '#00838f',
                          strokeWidth: isDisabled ? 0.5 : 1.5,
                          outline: 'none',
                        },
                      }}
                    />
                  )
                })
              }
            </Geographies>
          )}

          {/* 5대양 마커 표시 */}
          {includeOceans && OCEANS_CONFIG.map(ocean => {
            const isRegistered = !!registeredCountries[ocean.linkId];
            const stats = registeredCountries[ocean.linkId];
            let displayName = '';
            
            if (stats && stats.count > 0) {
              if (stats.count >= revealThreshold) {
                displayName = stats.name;
              } else {
                const nameLen = stats.name.length;
                const unmaskedLen = Math.floor((stats.count / revealThreshold) * nameLen);
                const maskedLen = nameLen - unmaskedLen;
                const masked = "*".repeat(maskedLen) + stats.name.slice(maskedLen);
                displayName = `${masked} (${stats.count}/${revealThreshold})`;
              }
            }

            return (
              <Marker key={ocean.id} coordinates={ocean.coordinates}>
                <g
                  onClick={() => {
                    if (onCountryClick) {
                      onCountryClick({ name: ocean.nameKo, countryId: ocean.linkId, type: 'ocean' });
                    }
                  }}
                  onMouseEnter={() => setHoveredCountry(ocean.linkId)}
                  onMouseLeave={() => setHoveredCountry(null)}
                  style={{ cursor: 'pointer' }}
                >
                  <circle
                    r={14 / position.zoom}
                    fill={isRegistered ? '#00bcd4' : '#ffb74d'}
                    stroke="#fff"
                    strokeWidth={2 / position.zoom}
                    opacity={0.9}
                    style={{ transition: 'all 0.2s ease-in-out' }}
                  />
                  <text
                    y={-(20 / position.zoom)}
                    textAnchor="middle"
                    style={{
                      fontFamily: "system-ui",
                      fill: '#fff',
                      fontSize: (11 + position.zoom * 0.5) / position.zoom,
                      fontWeight: 800,
                      pointerEvents: "none",
                      textShadow: `${1/position.zoom}px ${1/position.zoom}px ${2/position.zoom}px rgba(0,0,0,0.8)`
                    }}
                  >
                    {displayName || `🌊 ?`}
                  </text>
                </g>
              </Marker>
            );
          })}

          {/* 북극 마커 제거됨 */}

          {/* 등록된 국가/대륙 이름 표시 */}
          {[...centroids]
            .sort((a, b) => (a.iso2 === hoveredCountry ? 1 : b.iso2 === hoveredCountry ? -1 : 0))
            .map(({ iso2, name, coordinates }, idx) => {
            const isHovered = hoveredCountry === iso2;
            return (
              <Marker key={`${iso2}-${idx}`} coordinates={coordinates}>
                <text
                  textAnchor="middle"
                  y={0}
                  style={{
                    fontFamily: "system-ui",
                    fill: isHovered ? "#ffeb3b" : "#fff",
                    fontSize: ((isHovered ? 10 : 8) + position.zoom * 1.5) / position.zoom,
                    fontWeight: 800,
                    pointerEvents: "none",
                    textShadow: `${(1 + position.zoom * 0.2)/position.zoom}px ${(1 + position.zoom * 0.2)/position.zoom}px ${(3 + position.zoom * 0.5)/position.zoom}px rgba(0,0,0,0.9), -${(1 + position.zoom * 0.2)/position.zoom}px -${(1 + position.zoom * 0.2)/position.zoom}px ${(3 + position.zoom * 0.5)/position.zoom}px rgba(0,0,0,0.9), ${(1 + position.zoom * 0.2)/position.zoom}px -${(1 + position.zoom * 0.2)/position.zoom}px ${(3 + position.zoom * 0.5)/position.zoom}px rgba(0,0,0,0.9), -${(1 + position.zoom * 0.2)/position.zoom}px ${(1 + position.zoom * 0.2)/position.zoom}px ${(3 + position.zoom * 0.5)/position.zoom}px rgba(0,0,0,0.9)`,
                    transition: "all 0.2s ease-in-out",
                    zIndex: isHovered ? 10 : 1
                  }}
                >
                  {name}
                </text>
              </Marker>
            )
          })}
        </ZoomableGroup>
      </ComposableMap>
    </div>
  )
}
