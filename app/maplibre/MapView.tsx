
'use client'

import { useEffect, useRef, useState } from 'react'
import {
  Map,
  Marker,
  setWorkerUrl,
} from 'maplibre-gl'

import 'maplibre-gl/dist/maplibre-gl.css'

setWorkerUrl('/maplibre/maplibre-gl-worker.mjs')

export default function MapView() {

  const containerRef =
    useRef<HTMLDivElement | null>(null)

  const mapRef =
    useRef<any>(null)

  const markerRef =
    useRef<any>(null)

  const [location, setLocation] = useState<{
    latitude: number
    longitude: number
  } | null>(null)


  useEffect(() => {

    let cancelled = false

    async function createMap() {

      if (!containerRef.current) {
        return
      }

      if (cancelled) {
        return
      }

      if (mapRef.current) {
        return
      }


      const map =
        new Map({

          container:
            containerRef.current,

          style:
            'https://tiles.openfreemap.org/styles/bright',

          center: [
            127.1483,
            37.4821
          ],

          zoom: 14

        })


      console.log(
        '★ MapLibre 객체 생성:',
        map
      )


      map.on('load', () => {

        console.log(
          'MapLibre 지도 로딩 완료'
        )

      })


      map.on('error', (event: any) => {

        console.error(
          '🔥 MapLibre ERROR:',
          event
        )

      })


      mapRef.current = map
    }


    createMap()


    return () => {

      cancelled = true

      if (mapRef.current) {

        mapRef.current.remove()

        mapRef.current = null
      }

      markerRef.current = null

    }

  }, [])


  function getCurrentLocation() {

    if (!navigator.geolocation) {

      alert(
        '이 브라우저에서는 위치 기능을 사용할 수 없습니다.'
      )

      return
    }


    navigator.geolocation.getCurrentPosition(

      (position) => {

        const latitude =
          position.coords.latitude

        const longitude =
          position.coords.longitude


        console.log(
          '★ 현재 위치:',
          latitude,
          longitude
        )


        setLocation({
          latitude,
          longitude,
        })


        const map =
          mapRef.current

        if (!map) {
          return
        }


        map.flyTo({

          center: [
            longitude,
            latitude
          ],

          zoom: 16

        })


        if (markerRef.current) {

          markerRef.current.remove()

        }


        markerRef.current =
          new Marker()
            .setLngLat([
              longitude,
              latitude
            ])
            .addTo(map)

      },

      (error) => {

        console.error(
          '🔥 위치 가져오기 실패:',
          error
        )

        alert(
          '현재 위치를 가져오지 못했습니다.'
        )

      }

    )

  }


  return (

      <div>

        {/* 지도 */}

        <div
          ref={containerRef}
          className="map-container"
        />


        {/* 현재 위치 버튼 */}

        <div
          style={{
            marginTop: '10px'
          }}
        >

          <button
            onClick={getCurrentLocation}
          >
            📍 현재 위치
          </button>

        </div>


        {/* 현재 좌표 */}

        {location && (

          <div
            style={{
              marginTop: '10px'
            }}
          >

            위도: {location.latitude}

            <br />

            경도: {location.longitude}

          </div>

        )}


        {/* 지도 오버레이 테스트 목록 */}

        <div
            style={{
              marginTop: '20px'
            }}
          >
            <h3>
              지도 오버레이 테스트
            </h3>

            <ul>

              <li>
                📍 <strong>Marker</strong> — 특정 위치에 아이콘이나 핀 표시
              </li>

              <li>
                💬 <strong>Popup</strong> — 마커를 눌렀을 때 정보창 표시
              </li>

              <li>
                ➖ <strong>Line</strong> — 두 지점 이상을 선으로 연결하여 경로 표시
              </li>

              <li>
                ⬛ <strong>Polygon</strong> — 여러 지점을 연결해 특정 영역 표시
              </li>

              <li>
                ⭕ <strong>Circle</strong> — 특정 위치를 중심으로 반경 표시
              </li>

              <li>
                🔤 <strong>Symbol / Text</strong> — 지도 위에 문자나 아이콘 표시
              </li>

              <li>
                🖼️ <strong>Image</strong> — 특정 위치나 영역에 이미지 표시
              </li>

              <li>
                🧩 <strong>HTML Overlay</strong> — 지도 위에 HTML UI를 자유롭게 표시
              </li>

              <li>
                🗺️ <strong>GeoJSON Layer</strong> — 점·선·영역 등의 지도 데이터를 레이어로 표시
              </li>

              <li>
                🚗 <strong>Route</strong> — 실제 도로를 따라 두 지점 사이의 이동 경로 표시
                <br />
                <small>
                  필요한 서비스: OSRM / OpenRouteService
                </small>
              </li>
            </ul>
          </div>

      </div>

    )
}

