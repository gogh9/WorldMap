import { useEffect, useState, useMemo } from 'react'
import { ComposableMap, Geographies, Geography, ZoomableGroup, Marker, Sphere, Graticule } from 'react-simple-maps'
import { geoCentroid, geoNaturalEarth1 } from 'd3-geo'
import countries from 'i18n-iso-countries'
import koLocale from 'i18n-iso-countries/langs/ko.json'
import { supabase } from '../lib/supabase'
import './WorldMap.css'

// 한국어 번역 로케일 등록
countries.registerLocale(koLocale)

const geoUrl = "https://d2ad6b4ur7yvpq.cloudfront.net/naturalearth-3.3.0/ne_50m_admin_0_countries.geojson"

const mapWidth = 800;
const mapHeight = 600;
const projection = geoNaturalEarth1()
  .translate([mapWidth / 2, mapHeight / 2])
  .scale(160)

export default function WorldMap({ onCountryClick, mapId }) {
  const [geoData, setGeoData] = useState(null)
  const [registeredCountries, setRegisteredCountries] = useState({})
  const [hoveredCountry, setHoveredCountry] = useState(null)

  useEffect(() => {
    // 고해상도(50m) 세계 국가 GeoJSON 데이터 가져오기
    fetch(geoUrl)
      .then(response => response.json())
      .then(data => setGeoData(data))
      .catch(err => console.error("GeoJSON 로드 실패:", err))

    // DB에서 등록된 나라 정보 가져오기
    const fetchCountries = async () => {
      let query = supabase
        .from('countries_data')
        .select('link, country_name, author_name, content')
        
      if (mapId) {
        query = query.eq('map_id', mapId)
      }
      
      const { data, error } = await query
      
      if (data && !error) {
        const countryStats = {}
        data.forEach(item => {
           if (item.country_name) {
             if (!countryStats[item.link]) {
               countryStats[item.link] = { name: item.country_name, authors: new Set() }
             }
             if (item.author_name && item.content && item.content.includes('등록했습니다! 🎉')) {
               countryStats[item.link].authors.add(item.author_name)
             }
           }
        })
        
        const formattedStats = {}
        Object.keys(countryStats).forEach(link => {
           formattedStats[link] = {
             name: countryStats[link].name,
             count: countryStats[link].authors.size || 0 // 0 if no one explicitly registered
           }
        })
        setRegisteredCountries(formattedStats)
      }
    }
    fetchCountries()

    // 실시간 업데이트 구독
    const channel = supabase.channel('countries_data_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'countries_data' }, payload => {
        fetchCountries()
      })
      .subscribe()
      
    return () => {
      supabase.removeChannel(channel)
    }
  }, [mapId])

  // 중심점 계산
  const centroids = useMemo(() => {
    if (!geoData) return []
    const list = geoData.features.map(feature => {
      const iso2 = feature.properties.iso_a2 || feature.properties['ISO3166-1-Alpha-2']
      const stats = registeredCountries[iso2]
      let customName = null
      
      if (stats && stats.count > 0) {
        if (stats.count >= 5) {
          customName = stats.name
        } else {
          const nameLen = stats.name.length;
          const unmaskedLen = Math.floor((stats.count / 5) * nameLen);
          const maskedLen = nameLen - unmaskedLen;
          const masked = "*".repeat(maskedLen) + stats.name.slice(maskedLen);
          customName = `${masked} (${stats.count}/5)`
        }
      }

      return {
        iso2,
        name: customName,
        coordinates: geoCentroid(feature)
      }
    }).filter(d => d.name) // 이름이 있는 곳만 마커용으로 반환

    // 글씨가 겹치지 않도록 밀어내는 로직 (간단한 충돌 해결)
    for (let i = 0; i < 50; i++) {
      let moved = false;
      for (let j = 0; j < list.length; j++) {
        for (let k = j + 1; k < list.length; k++) {
          const dx = list[j].coordinates[0] - list[k].coordinates[0];
          const dy = list[j].coordinates[1] - list[k].coordinates[1];
          const avgLat = (list[j].coordinates[1] + list[k].coordinates[1]) / 2;
          const cosLat = Math.max(0.2, Math.cos(avgLat * Math.PI / 180));
          
          // 폰트 크기(6)에 비례하는 필요 위경도 거리 (조정 가능)
          const minDx = ((list[j].name.length + list[k].name.length) * 0.7) / cosLat;
          const minDy = 2.0;

          if (Math.abs(dx) < minDx && Math.abs(dy) < minDy) {
            const overlapX = minDx - Math.abs(dx);
            const overlapY = minDy - Math.abs(dy);
            
            // 더 적게 겹친 방향으로 살짝씩 밀어냄
            if (overlapX < overlapY) {
              const push = (overlapX / 2 + 0.05) * Math.sign(dx || 1);
              list[j].coordinates[0] += push;
              list[k].coordinates[0] -= push;
            } else {
              const push = (overlapY / 2 + 0.05) * Math.sign(dy || 1);
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
  }, [geoData, registeredCountries])

  return (
    <div className="map-wrapper" style={{ background: "#f8f9fa", borderRadius: "8px", overflow: "hidden" }}>
      <ComposableMap projection={projection} width={mapWidth} height={mapHeight} style={{ width: "100%", height: "100%" }}>
        <ZoomableGroup center={[0, 0]} zoom={1} minZoom={1} maxZoom={10}>
          <Sphere stroke="#80deea" strokeWidth={1} fill="#aad3df" />
          <Graticule stroke="#b2ebf2" strokeWidth={0.5} />
          {geoData && (
            <Geographies geography={geoData}>
              {({ geographies }) =>
                geographies.map((geo) => {
                  const iso2 = geo.properties.iso_a2 || geo.properties['ISO3166-1-Alpha-2']
                  const isRegistered = !!registeredCountries[iso2]

                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      onClick={() => {
                        if (onCountryClick) {
                          onCountryClick({ ...geo.properties, countryId: iso2 })
                        }
                      }}
                      onMouseEnter={() => setHoveredCountry(iso2)}
                      onMouseLeave={() => setHoveredCountry(null)}
                      style={{
                        default: {
                          fill: isRegistered ? '#d1d5db' : '#f0f0f0',
                          stroke: '#444',
                          strokeWidth: 0.5,
                          outline: 'none',
                        },
                        hover: {
                          fill: '#80deea',
                          stroke: '#00838f',
                          strokeWidth: 1.5,
                          outline: 'none',
                          cursor: 'pointer',
                        },
                        pressed: {
                          fill: '#26c6da',
                          stroke: '#00838f',
                          strokeWidth: 1.5,
                          outline: 'none',
                        },
                      }}
                    />
                  )
                })
              }
            </Geographies>
          )}

          {/* 등록된 국가 이름 표시 */}
          {[...centroids]
            .sort((a, b) => (a.iso2 === hoveredCountry ? 1 : b.iso2 === hoveredCountry ? -1 : 0))
            .map(({ iso2, name, coordinates }) => {
            const isHovered = hoveredCountry === iso2;
            return (
              <Marker key={iso2} coordinates={coordinates}>
                <text
                  textAnchor="middle"
                  y={0}
                  style={{
                    fontFamily: "system-ui",
                    fill: isHovered ? "#ffeb3b" : "#fff",
                    fontSize: isHovered ? 8 : 6,
                    fontWeight: 800,
                    pointerEvents: "none",
                    textShadow: "1px 1px 3px rgba(0,0,0,0.9), -1px -1px 3px rgba(0,0,0,0.9), 1px -1px 3px rgba(0,0,0,0.9), -1px 1px 3px rgba(0,0,0,0.9)",
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
