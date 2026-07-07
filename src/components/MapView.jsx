import { useEffect } from 'react'
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet'
import L from 'leaflet'
import { categoryColor } from '../data/categories.js'

const EL_PASO = [31.78, -106.45]

// A colored teardrop pin as a Leaflet divIcon, tinted by category.
function pinIcon(color, active) {
  const size = active ? 46 : 36
  return L.divIcon({
    className: 'elp-pin',
    html: `
      <svg width="${size}" height="${size * 1.3}" viewBox="0 0 24 32" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 0C5.4 0 0 5.4 0 12c0 9 12 20 12 20s12-11 12-20C24 5.4 18.6 0 12 0z"
              fill="${color}" stroke="#ffffff" stroke-width="1.5"/>
        <circle cx="12" cy="12" r="4.5" fill="#ffffff"/>
      </svg>`,
    iconSize: [size, size * 1.3],
    iconAnchor: [size / 2, size * 1.3],
  })
}

// An event can be placed on the map only if it has real numeric coordinates.
const hasCoords = (e) => Number.isFinite(e.lat) && Number.isFinite(e.lng)

// Pans/zooms the map when the selected event changes.
function FlyTo({ event }) {
  const map = useMap()
  useEffect(() => {
    if (event && hasCoords(event)) {
      map.flyTo([event.lat, event.lng], 15, { duration: 1.1 })
    }
  }, [event, map])
  return null
}

export default function MapView({ events, selectedId, onSelectPin }) {
  const selected = events.find((e) => e.id === selectedId) || null
  // Skip events without coordinates so a missing lat/lng never crashes Leaflet.
  const pins = events.filter(hasCoords)

  return (
    <MapContainer
      center={EL_PASO}
      zoom={11}
      scrollWheelZoom
      className="map"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {pins.map((e) => (
        <Marker
          key={e.id}
          position={[e.lat, e.lng]}
          icon={pinIcon(categoryColor(e.category), e.id === selectedId)}
          eventHandlers={{ click: () => onSelectPin(e.id) }}
        />
      ))}
      <FlyTo event={selected} />
    </MapContainer>
  )
}
