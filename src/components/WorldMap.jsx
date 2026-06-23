import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, GeoJSON, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import './WorldMap.css'

export default function WorldMap({ onCountryClick }) {
  const [geoData, setGeoData] = useState(null)

  useEffect(() => {
    // 세계 국가 GeoJSON 데이터 가져오기
    fetch('https://raw.githubusercontent.com/datasets/geo-countries/master/data/countries.geojson')
      .then(response => response.json())
      .then(data => setGeoData(data))
      .catch(err => console.error("GeoJSON 로드 실패:", err))
  }, [])

  const style = (feature) => {
    return {
      fillColor: 'transparent',
      weight: 2,
      opacity: 0,
      color: 'transparent', // 기본적으로 선 안보이게
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
        layer.setStyle({
          weight: 2,
          opacity: 0,
          color: 'transparent',
          fillColor: 'transparent',
          fillOpacity: 0.1
        })
      },
      click: (e) => {
        if (onCountryClick) {
          onCountryClick(feature.properties)
        }
      }
    })
  }

  return (
    <MapContainer 
      center={[20, 0]} 
      zoom={2} 
      minZoom={2}
      className="leaflet-container"
      maxBounds={[[-90, -180], [90, 180]]}
    >
      {/* 지형도 타일 레이어 */}
      <TileLayer
        attribution='Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a>'
        url="https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png"
      />
      
      {/* 국가 경계 폴리곤 레이어 */}
      {geoData && (
        <GeoJSON 
          data={geoData} 
          style={style} 
          onEachFeature={onEachFeature} 
        />
      )}
    </MapContainer>
  )
}
