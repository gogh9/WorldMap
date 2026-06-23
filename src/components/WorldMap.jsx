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
  const [mapStyle, setMapStyle] = useState('topo') // 'topo' or 'blank'

  useEffect(() => {
    // 세계 국가 GeoJSON 데이터 가져오기
    fetch('https://raw.githubusercontent.com/datasets/geo-countries/master/data/countries.geojson')
      .then(response => response.json())
      .then(data => setGeoData(data))
      .catch(err => console.error("GeoJSON 로드 실패:", err))
  }, [])

  const style = (feature) => {
    if (mapStyle === 'blank') {
      return {
        fillColor: 'white',
        weight: 1,
        opacity: 1,
        color: '#444', // 까만 테두리
        fillOpacity: 1
      }
    }
    return {
      fillColor: 'transparent',
      weight: 2,
      opacity: 0,
      color: 'transparent',
      fillOpacity: 0.1
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
          const iso2 = feature.properties['ISO3166-1-Alpha-2']
          const koreanName = countries.getName(iso2, 'ko') || feature.properties.name
          onCountryClick({ ...feature.properties, koreanName })
        }
      }
    })
  }

  return (
    <div className="map-wrapper">
      <div className="map-controls">
        <label>
          <input 
            type="radio" 
            name="mapStyle" 
            value="topo" 
            checked={mapStyle === 'topo'} 
            onChange={() => setMapStyle('topo')} 
          />
          지형도
        </label>
        <label>
          <input 
            type="radio" 
            name="mapStyle" 
            value="blank" 
            checked={mapStyle === 'blank'} 
            onChange={() => setMapStyle('blank')} 
          />
          백지도
        </label>
      </div>
      <MapContainer 
        center={[20, 0]} 
        zoom={2} 
        minZoom={2}
        className="leaflet-container"
        maxBounds={[[-90, -180], [90, 180]]}
      >
        {mapStyle === 'topo' && (
          <TileLayer
            attribution='Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a>'
            url="https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png"
          />
        )}
        
        {geoData && (
          <GeoJSON 
            key={mapStyle} // 스타일이 변경될 때 GeoJSON 레이어 리렌더링
            data={geoData} 
            style={style} 
            onEachFeature={onEachFeature} 
          />
        )}
      </MapContainer>
    </div>
  )
}
