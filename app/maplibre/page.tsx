import Header from '../../components/Header'
import MapLibreClient from './MapLibreClient'

export default function MapLibrePage() {

  return (
    <main className="container">

      <Header />

      <section className="map-page">

        <h1>
          🗺️ MapLibre 테스트
        </h1>

        <MapLibreClient />

      </section>

    </main>
  )
}