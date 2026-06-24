import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet'
import countries from 'i18n-iso-countries'
import koLocale from 'i18n-iso-countries/langs/ko.json'
import { supabase } from '../lib/supabase'
import 'leaflet/dist/leaflet.css'
import './WorldMap.css'

// 한국어 번역 로케일 등록
countries.registerLocale(koLocale)

export default function WorldMap({ onCountryClick }) {
  const [geoData, setGeoData] = useState(null)
  const [registeredCountries, setRegisteredCountries] = useState({})

  useEffect(() => {
    // 고해상도(50m) 세계 국가 GeoJSON 데이터 가져오기
    fetch('https://d2ad6b4ur7yvpq.cloudfront.net/naturalearth-3.3.0/ne_50m_admin_0_countries.geojson')
      .then(response => response.json())
      .then(data => setGeoData(data))
      .catch(err => console.error("GeoJSON 로드 실패:", err))

    // DB에서 등록된 나라 정보 가져오기
    const fetchCountries = async () => {
      const { data, error } = await supabase
        .from('countries_data')
        .select('link, country_name')
      
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
  }, [])

  const style = (feature) => {
    return {
      fillColor: 'white',
      weight: 1,
      opacity: 1,
      color: '#444',
      fillOpacity: 1
    }
  }

  const onEachFeature = (feature, layer) => {
    const iso2 = feature.properties.iso_a2 || feature.properties['ISO3166-1-Alpha-2']
    const customName = registeredCountries[iso2]

    if (customName) {
      layer.bindTooltip(customName, {
        permanent: true,
        direction: "center",
        className: "country-label"
      })
    }

    layer.on({
      mouseover: (e) => {
        const layer = e.target
        layer.setStyle({
          weight: 3,
          color: '#00838f',
          opacity: 1,
          fillColor: '#80deea',
          fillOpacity: 0.4
        })
        layer.bringToFront()
      },
      mouseout: (e) => {
        const layer = e.target
        layer.setStyle(style(feature))
      },
      click: (e) => {
        if (onCountryClick) {
          onCountryClick({ ...feature.properties, countryId: iso2 })
        }
      }
    })
  }

  return (
    <div className="map-wrapper">
      <MapContainer 
        center={[20, 0]} 
        zoom={2} 
        minZoom={2}
        className="leaflet-container"
        maxBounds={[[-90, -180], [90, 180]]}
      >
        {geoData && (
          <GeoJSON 
            key={JSON.stringify(registeredCountries)}
            data={geoData} 
            style={style} 
            onEachFeature={onEachFeature} 
          />
        )}
      </MapContainer>
    </div>
  )
}
