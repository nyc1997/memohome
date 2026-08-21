'use client'

import { useEffect, useRef, useState } from 'react'
import Header from '../../components/Header'

export default function MapPage() {

  const mapRef = useRef<HTMLDivElement | null>(null)

  const leafletMapRef = useRef<any>(null)
  const leafletRef = useRef<any>(null)
  const markerRef = useRef<any>(null)

  const [latitude, setLatitude] = useState<number | null>(null)
  const [longitude, setLongitude] = useState<number | null>(null)

  const [error, setError] = useState('')


  useEffect(() => {

    let cancelled = false

    async function initMap() {

      if (!mapRef.current) return

      const L = await import('leaflet')
      await import('leaflet/dist/leaflet.css')

      if (cancelled) return

      // 이미 지도가 만들어져 있다면 다시 만들지 않는다
      if (leafletMapRef.current) return

      leafletRef.current = L

      const map = L.map(mapRef.current)
        .setView([37.5665, 126.9780], 13)

      L.tileLayer(
        'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        {
          attribution:
            '&copy; OpenStreetMap contributors'
        }
      ).addTo(map)

      leafletMapRef.current = map
    }

    initMap()


    return () => {

      cancelled = true

      if (leafletMapRef.current) {

        leafletMapRef.current.remove()

        leafletMapRef.current = null
      }

      leafletRef.current = null
      markerRef.current = null
    }

  }, [])


  function getLocation() {

    setError('')

    if (!navigator.geolocation) {

      setError(
        '이 브라우저에서는 위치 기능을 지원하지 않습니다.'
      )

      return
    }


    navigator.geolocation.getCurrentPosition(

      (position) => {

        const lat = position.coords.latitude
        const lng = position.coords.longitude

        setLatitude(lat)
        setLongitude(lng)

        showLocationOnMap(lat, lng)
      },

      (error) => {

        console.error(error)

        setError(
          '현재 위치를 가져올 수 없습니다. 위치 권한을 확인해주세요.'
        )
      }
    )
  }


  function showLocationOnMap(
    lat: number,
    lng: number
  ) {

    const map = leafletMapRef.current
    const L = leafletRef.current

    if (!map || !L) return


    map.setView(
      [lat, lng],
      16
    )


    if (markerRef.current) {

      markerRef.current.remove()

      markerRef.current = null
    }


    const marker = L
      .marker([lat, lng])
      .addTo(map)


    marker
      .bindPopup('현재 위치')
      .openPopup()


    markerRef.current = marker
  }


  return (

    <main className="container">

      <Header />


      <section className="map-page">

        <h1>📍 지도 테스트</h1>


        <button
          type="button"
          className="action-button"
          onClick={getLocation}
        >
          현재 위치 가져오기
        </button>


        {latitude !== null &&
          longitude !== null && (

            <div className="location-result">

              <p>
                위도: {latitude}
              </p>

              <p>
                경도: {longitude}
              </p>

            </div>

          )}


        <div
          ref={mapRef}
          className="map-container"
        />


        {error && (

          <p className="map-error">
            {error}
          </p>

        )}

      </section>

    </main>
  )
}