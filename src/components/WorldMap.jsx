import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet'
import countries from 'i18n-iso-countries'
import koLocale from 'i18n-iso-countries/langs/ko.json'
import 'leaflet/dist/leaflet.css'
import './WorldMap.css'

// 한국어 번역 로케일 등록
countries.registerLocale(koLocale)

export default function WorldMap({ onCountryClick }) {
  const [geoData, setGeoData] = useState(null)

  useEffect(() => {
    // 고해상도(50m) 세계 국가 GeoJSON 데이터 가져오기
    fetch('https://d2ad6b4ur7yvpq.cloudfront.net/naturalearth-3.3.0/ne_50m_admin_0_countries.geojson')
      .then(response => response.json())
      .then(data => setGeoData(data))
      .catch(err => console.error("GeoJSON 로드 실패:", err))
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
          const iso2 = feature.properties.iso_a2 || feature.properties['ISO3166-1-Alpha-2']
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
            data={geoData} 
            style={style} 
            onEachFeature={onEachFeature} 
          />
        )}
      </MapContainer>
    </div>
  )
}
