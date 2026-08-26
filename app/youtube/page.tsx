
import Header from '../../components/Header'


export default function YouTubePage() {
  return (
    <main className="container" >
      <Header />
      <h1>YouTube 테스트</h1>

      <div
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '900px',
          aspectRatio: '16 / 9',
          marginTop: '20px',
        }}
      >
        {/*
        <iframe
          src="https://www.youtube.com/embed/Fprf4p1hFYw"
          title="YouTube video player"
          style={{
            width: '100%',
            height: '100%',
            border: 'none',
          }}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />

        <br/>
        */}
        - T Square
        <iframe
          src="https://www.youtube.com/embed/RR1CEyHL7uE?si=wLlXXF1reWoyglld" 
          title="YouTube video player"           
          style={{
            width: '100%',
            height: '100%',
            border: 'none',            
          }}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
          allowFullScreen
        />
        
        <br/>
        - JPOP
        <iframe
          src="https://www.youtube.com/embed/B8RDImvf5DU?si=FWpjOzxojMAQDBKt" 
          title="YouTube video player"           
          style={{
            width: '100%',
            height: '100%',
            border: 'none',            
          }}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
          allowFullScreen
        />
        
        <br/>
        - Strings
        <iframe
          src="https://www.youtube.com/embed/xjYQlmpS69k?si=BEIsy92wpvHkHCvi" 
          title="YouTube video player"           
          style={{
            width: '100%',
            height: '100%',
            border: 'none',            
          }}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
          allowFullScreen
        />

      </div>
    </main>
  )
}

