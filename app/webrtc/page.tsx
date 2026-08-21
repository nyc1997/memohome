'use client'

import { useEffect, useRef, useState } from 'react'
import { supabase } from '../../lib/supabase'
import Header from '../../components/Header'

export default function WebRTCPage() {
  const peerRef = useRef<RTCPeerConnection | null>(null)
  const dataChannelRef = useRef<RTCDataChannel | null>(null)
  const realtimeRef = useRef<any>(null)

  const [roomId, setRoomId] = useState('test123')
  const [status, setStatus] = useState('방에 입장하세요')
  const [message, setMessage] = useState('')
  const [received, setReceived] = useState<string[]>([])
  const [joined, setJoined] = useState(false)

  const [file, setFile] =
  useState<File | null>(null)

  const [fileProgress, setFileProgress] =  useState(0)
  const [transferSpeed, setTransferSpeed] = useState(0)

  const [receivedAudioUrl, setReceivedAudioUrl] =
  useState<string | null>(null)

  const [receivedFileName, setReceivedFileName] =
  useState('')

  const incomingFileRef =
      useRef<{
        name: string
        size: number
        chunks: ArrayBuffer[]
        received: number
      } | null>(null)

  // -------------------------
  // WebRTC 생성
  // -------------------------

  function createPeer() {
    const peer = new RTCPeerConnection({
      iceServers: [
        {
          urls: 'stun:stun.l.google.com:19302',
        },
      ],
    })

    peer.onconnectionstatechange = () => {
      console.log(
        'connectionState:',
        peer.connectionState
      )

      setStatus(peer.connectionState)
    }

    peer.oniceconnectionstatechange = () => {
      console.log(
        'iceConnectionState:',
        peer.iceConnectionState
      )
    }

    peerRef.current = peer

    return peer
  }

  // -------------------------
  // DataChannel
  // -------------------------

  function setupDataChannel(
    channel: RTCDataChannel
  ) {
    dataChannelRef.current = channel

    channel.onopen = () => {
      console.log('DataChannel open')
      setStatus('connected')
    }

    channel.onclose = () => {
      setStatus('연결 종료')
    }

    channel.onmessage = (event) => {
      setReceived((prev) => [
        ...prev,
        event.data,
      ])
    }

    channel.onmessage = async (event) => {

      // 일반 메시지
      if (typeof event.data === 'string') {

        let data: any

        try {
          data = JSON.parse(event.data)
        } catch {
          setReceived((prev) => [
            ...prev,
            event.data,
          ])

          return
        }


        // 파일 시작
        if (data.type === 'file-start') {

          incomingFileRef.current = {
            name: data.name,
            size: data.size,
            chunks: [],
            received: 0,
          }

          setFileProgress(0)

          return
        }


        // 파일 끝
        if (data.type === 'file-end') {
          const incoming =
            incomingFileRef.current

          if (!incoming) {
            return
          }

          const blob =
            new Blob(incoming.chunks)

          const url =
            URL.createObjectURL(blob)

          // 기존 Object URL 정리
          setReceivedAudioUrl(
            previousUrl => {
              if (previousUrl) {
                URL.revokeObjectURL(previousUrl)
              }

              return url
            }
          )

          setReceivedFileName(
            incoming.name
          )

          incomingFileRef.current =
            null

          setFileProgress(100)

          return
        }


        setReceived((prev) => [
          ...prev,
          event.data,
        ])

        return
      }


      // 파일 chunk
      const incoming =
        incomingFileRef.current

      if (!incoming) {
        return
      }


      const chunk =
        event.data instanceof ArrayBuffer
          ? event.data
          : await event.data.arrayBuffer()


      incoming.chunks.push(chunk)

      incoming.received +=
        chunk.byteLength


      setFileProgress(
        Math.round(
          incoming.received /
          incoming.size *
          100
        )
      )
    }
  }

  // -------------------------
  // 방 입장
  // -------------------------

  async function joinRoom() {
    if (joined) return

    const channel = supabase.channel(
      `webrtc-room-${roomId}`
    )

    realtimeRef.current = channel

    // -------------------------
    // Offer 수신
    // -------------------------

    channel.on(
      'broadcast',
      {
        event: 'offer',
      },
      async ({ payload }) => {
        console.log(
          'Offer received:',
          payload
        )

        // 이미 Peer가 있으면 무시
        if (peerRef.current) {
          return
        }

        const peer = createPeer()

        peer.ondatachannel = (event) => {
          setupDataChannel(
            event.channel
          )
        }

        await peer.setRemoteDescription(
          payload.offer
        )

        const answer =
          await peer.createAnswer()

        await peer.setLocalDescription(
          answer
        )

        await waitForIceGathering(
          peer
        )

        const localDescription =
          peer.localDescription

        if (!localDescription) {
          return
        }

        // Answer 전송
        await channel.send({
          type: 'broadcast',
          event: 'answer',
          payload: {
            answer: localDescription,
          },
        })

        setStatus(
          'Answer 전송 완료'
        )
      }
    )

    // -------------------------
    // Answer 수신
    // -------------------------

    channel.on(
      'broadcast',
      {
        event: 'answer',
      },
      async ({ payload }) => {
        console.log(
          'Answer received:',
          payload
        )

        const peer =
          peerRef.current

        if (!peer) {
          return
        }

        if (
          peer.currentRemoteDescription
        ) {
          return
        }

        await peer.setRemoteDescription(
          payload.answer
        )

        setStatus(
          'Answer 적용 완료'
        )
      }
    )

    // -------------------------
    // Realtime 연결
    // -------------------------

    await channel.subscribe(
      (status) => {
        console.log(
          'Realtime status:',
          status
        )

        if (
          status === 'SUBSCRIBED'
        ) {
          setJoined(true)
          setStatus(
            '방 입장 완료'
          )
        }
      }
    )
  }

  // -------------------------
  // A : Offer 생성
  // -------------------------

  async function createOffer() {
    if (!joined) {
      alert(
        '먼저 방에 입장하세요.'
      )
      return
    }

    if (peerRef.current) {
      return
    }

    const peer = createPeer()

    const dataChannel =
      peer.createDataChannel(
        'chat'
      )

    setupDataChannel(
      dataChannel
    )

    const offer =
      await peer.createOffer()

    await peer.setLocalDescription(
      offer
    )

    await waitForIceGathering(
      peer
    )

    const localDescription =
      peer.localDescription

    if (!localDescription) {
      return
    }

    console.log(
      'Sending offer:',
      localDescription
    )

    await realtimeRef.current.send({
      type: 'broadcast',
      event: 'offer',
      payload: {
        offer: localDescription,
      },
    })

    setStatus(
      'Offer 전송 완료 - B를 기다리는 중'
    )
  }

  // -------------------------
  // ICE gathering
  // -------------------------

  function waitForIceGathering(
    peer: RTCPeerConnection
  ) {
    return new Promise<void>(
      (resolve) => {
        if (
          peer.iceGatheringState ===
          'complete'
        ) {
          resolve()
          return
        }

        const check = () => {
          if (
            peer.iceGatheringState ===
            'complete'
          ) {
            peer.removeEventListener(
              'icegatheringstatechange',
              check
            )

            resolve()
          }
        }

        peer.addEventListener(
          'icegatheringstatechange',
          check
        )
      }
    )
  }

  // -------------------------
  // 메시지 전송
  // -------------------------

  function sendMessage() {
    const channel =
      dataChannelRef.current

    if (
      !channel ||
      channel.readyState !== 'open'
    ) {
      alert(
        'WebRTC 연결이 되어 있지 않습니다.'
      )

      return
    }

    if (!message) {
      return
    }

    channel.send(message)

    setMessage('')
  }

  async function sendFile() {
    const channel = dataChannelRef.current

    if (
      !channel ||
      channel.readyState !== 'open'
    ) {
      alert(
        'WebRTC 연결이 되어 있지 않습니다.'
      )
      return
    }

    if (!file) {
      alert('파일을 선택하세요.')
      return
    }

    setFileProgress(0)
    setTransferSpeed(0)

    const startTime = performance.now()

    channel.send(
      JSON.stringify({
        type: 'file-start',
        name: file.name,
        size: file.size,
      })
    )

    const chunkSize = 16 * 1024

    let offset = 0

    while (offset < file.size) {
      const chunk =
        await file
          .slice(
            offset,
            offset + chunkSize
          )
          .arrayBuffer()

      channel.send(chunk)

      offset += chunk.byteLength

      const elapsed =
        (performance.now() - startTime) / 1000

      const speed =
        elapsed > 0
          ? offset / elapsed / 1024 / 1024
          : 0

      setFileProgress(
        Math.round(
          (offset / file.size) * 100
        )
      )

      setTransferSpeed(speed)

      if (
        channel.bufferedAmount >
        1024 * 1024
      ) {
        await new Promise<void>(
          (resolve) => {
            const check = () => {
              if (
                channel.bufferedAmount <
                256 * 1024
              ) {
                channel.removeEventListener(
                  'bufferedamountlow',
                  check
                )

                resolve()
              }
            }

            channel.addEventListener(
              'bufferedamountlow',
              check
            )

            check()
          }
        )
      }
    }

    channel.send(
      JSON.stringify({
        type: 'file-end',
      })
    )

    setFileProgress(100)

    const totalTime =
      (performance.now() - startTime) / 1000

    const finalSpeed =
      totalTime > 0
        ? file.size /
          totalTime /
          1024 /
          1024
        : 0

    setTransferSpeed(finalSpeed)
  }

  // -------------------------
  // 정리
  // -------------------------

  useEffect(() => {
    return () => {
      realtimeRef.current?.unsubscribe()
      dataChannelRef.current?.close()
      peerRef.current?.close()
    }
  }, [])

  return (
    <main
      style={{
        maxWidth: '800px',
        margin: '0 auto',
        padding: '30px',
      }}
    >
      <Header />
      <h1>📡 WebRTC 테스트</h1>

      <div
        style={{
          marginTop: '20px',
        }}
      >
        <label>
          방 번호
        </label>

        <input
          value={roomId}
          onChange={(e) =>
            setRoomId(e.target.value)
          }
          disabled={joined}
          style={{
            display: 'block',
            width: '100%',
            padding: '10px',
            marginTop: '5px',
          }}
        />
      </div>

      <button
        onClick={joinRoom}
        disabled={joined}
        style={{
          marginTop: '10px',
          padding: '10px 20px',
        }}
      >
        방 입장
      </button>

      <p>
        상태:{' '}
        <strong>
          {status}
        </strong>
      </p>

      <hr />

      <button
        onClick={createOffer}
        disabled={!joined}
      >
        A로 연결 시작
      </button>

      <hr />
        <div
          style={{
            marginTop: '30px',
          }}
        >
          <h2>📁 파일 전송</h2>

          <input
            type="file"
            onChange={(e) => {
              setFile(
                e.target.files?.[0] ?? null
              )

              setFileProgress(0)
              setTransferSpeed(0)
            }}
          />

          <button
            onClick={sendFile}
            style={{
              marginLeft: '10px',
            }}
          >
            파일 전송
          </button>

          <div
            style={{
              marginTop: '15px',
            }}
          >
            진행률: {fileProgress}%
          </div>

          <div>
            전송 속도:{' '}
            {transferSpeed.toFixed(2)} MB/s
          </div>

          <progress
            value={fileProgress}
            max="100"
            style={{
              width: '100%',
              marginTop: '10px',
            }}
          />
        </div>
      <br/>
        {receivedAudioUrl && (
          <div
            style={{
              marginTop: '30px',
            }}
          >
            <h2>🎵 받은 음악</h2>

            <p>
              {receivedFileName}
            </p>

            <audio
              controls
              src={receivedAudioUrl}
              style={{
                width: '100%',
              }}
            />
          </div>
        )}

      <br/>

      <h2>메시지</h2>

      <div
        style={{
          display: 'flex',
          gap: '10px',
        }}
      >
        <input
          value={message}
          onChange={(e) =>
            setMessage(e.target.value)
          }
          placeholder="메시지 입력"
          style={{
            flex: 1,
            padding: '10px',
          }}
        />

        <button
          onClick={sendMessage}
        >
          전송
        </button>
      </div>

      <h3>
        받은 메시지
      </h3>

      {received.map(
        (item, index) => (
          <div key={index}>
            {item}
          </div>
        )
      )}
    </main>
  )
}