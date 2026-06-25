import { useEffect, useState, useMemo } from 'react'
import { ComposableMap, Geographies, Geography, ZoomableGroup, Marker, Sphere, Graticule } from 'react-simple-maps'
import { geoCentroid, geoEqualEarth } from 'd3-geo'
import countries from 'i18n-iso-countries'
import koLocale from 'i18n-iso-countries/langs/ko.json'
import { supabase } from '../lib/supabase'
import './WorldMap.css'

// 한국어 번역 로케일 등록
countries.registerLocale(koLocale)

const geoUrl = "https://d2ad6b4ur7yvpq.cloudfront.net/naturalearth-3.3.0/ne_50m_admin_0_countries.geojson"

export default function WorldMap({ onCountryClick, mapId }) {
  const [geoData, setGeoData] = useState(null)
  const [registeredCountries, setRegisteredCountries] = useState({})

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
        .select('link, country_name')
        
      if (mapId) {
        query = query.eq('map_id', mapId)
      }
      
      const { data, error } = await query
      
      if (data && !error) {
        const countryMap = {}
        data.forEach(item => {
           if (item.country_name) {
             countryMap[item.link] = item.country_name
           }
        })
        setRegisteredCountries(countryMap)
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
    return geoData.features.map(feature => {
      const iso2 = feature.properties.iso_a2 || feature.properties['ISO3166-1-Alpha-2']
      const customName = registeredCountries[iso2]
      return {
        iso2,
        name: customName,
        coordinates: geoCentroid(feature)
      }
    }).filter(d => d.name) // 이름이 있는 곳만 마커용으로 반환
  }, [geoData, registeredCountries])

  const mapWidth = 800;
  const mapHeight = 600;
  const projection = geoEqualEarth()
    .translate([mapWidth / 2, mapHeight / 2])
    .scale(160)

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
          {centroids.map(({ iso2, name, coordinates }) => (
            <Marker key={iso2} coordinates={coordinates}>
              <text
                textAnchor="middle"
                y={0}
                style={{
                  fontFamily: "system-ui",
                  fill: "#fff",
                  fontSize: 13,
                  fontWeight: 800,
                  pointerEvents: "none",
                  textShadow: "1px 1px 3px rgba(0,0,0,0.9), -1px -1px 3px rgba(0,0,0,0.9), 1px -1px 3px rgba(0,0,0,0.9), -1px 1px 3px rgba(0,0,0,0.9)"
                }}
              >
                {name}
              </text>
            </Marker>
          ))}
        </ZoomableGroup>
      </ComposableMap>
    </div>
  )
}
