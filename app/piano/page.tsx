'use client'

import { useEffect, useRef, useState } from 'react'
import Header from '../../components/Header'

type SoundType =
  | 'piano'
  | 'organ'
  | 'synth'
  | 'bell'
  | 'soft'

type KeyNote = {
  name: string
  key: string
  semitone: number
  black?: boolean
}

const notes: KeyNote[] = [
  { name: 'C', key: 'A', semitone: 0 },
  { name: 'C#', key: 'W', semitone: 1, black: true },
  { name: 'D', key: 'S', semitone: 2 },
  { name: 'D#', key: 'E', semitone: 3, black: true },
  { name: 'E', key: 'D', semitone: 4 },
  { name: 'F', key: 'F', semitone: 5 },
  { name: 'F#', key: 'T', semitone: 6, black: true },
  { name: 'G', key: 'G', semitone: 7 },
  { name: 'G#', key: 'Y', semitone: 8, black: true },
  { name: 'A', key: 'H', semitone: 9 },
  { name: 'A#', key: 'U', semitone: 10, black: true },
  { name: 'B', key: 'J', semitone: 11 },
  { name: 'C', key: 'K', semitone: 12 },
]

const sounds: {
  id: SoundType
  name: string
}[] = [
  { id: 'piano', name: '🎹 Piano' },
  { id: 'organ', name: '🎛️ Organ' },
  { id: 'synth', name: '🎚️ Synth' },
  { id: 'bell', name: '🔔 Bell' },
  { id: 'soft', name: '🌊 Soft' },
]

export default function PianoPage() {
  const audioContextRef =
    useRef<AudioContext | null>(null)

  const [octave, setOctave] =
    useState(4)

  const octaveRef =
    useRef(4)

  const [sound, setSound] =
    useState<SoundType>('piano')

  const [pressedKeys, setPressedKeys] =
    useState<string[]>([])

  const activeNotes =
    useRef<
      Map<
        string,
        {
          oscillators: OscillatorNode[]
          gain: GainNode
        }
      >
    >(new Map())

  // 키보드의 실제 눌림 상태
  const keyboardPressed =
    useRef<
      Map<string, string>
    >(new Map())

  const getAudioContext = () => {
    if (!audioContextRef.current) {
      audioContextRef.current =
        new AudioContext()
    }

    return audioContextRef.current
  }

  const getFrequency = (
    semitone: number,
    currentOctave: number
  ) => {
    return (
      261.63 *
      Math.pow(
        2,
        (semitone +
          (currentOctave - 4) * 12) /
          12
      )
    )
  }

  const stopNoteById = (
    noteId: string
  ) => {
    const active =
      activeNotes.current.get(
        noteId
      )

    if (!active) return

    const context =
      getAudioContext()

    const {
      oscillators,
      gain,
    } = active

    gain.gain.cancelScheduledValues(
      context.currentTime
    )

    gain.gain.setValueAtTime(
      gain.gain.value,
      context.currentTime
    )

    gain.gain.exponentialRampToValueAtTime(
      0.001,
      context.currentTime + 0.15
    )

    oscillators.forEach(
      oscillator => {
        try {
          oscillator.stop(
            context.currentTime + 0.16
          )
        } catch {}
      }
    )

    activeNotes.current.delete(
      noteId
    )

    setPressedKeys(prev =>
      prev.filter(
        key => key !== noteId
      )
    )
  }

  const stopAllNotes = () => {
    const ids =
      Array.from(
        activeNotes.current.keys()
      )

    ids.forEach(
      stopNoteById
    )

    keyboardPressed.current.clear()
  }

  const playNote = (
    note: KeyNote
  ) => {
    const context =
      getAudioContext()

    if (
      context.state ===
      'suspended'
    ) {
      context.resume()
    }

    const currentOctave =
      octaveRef.current

    const noteId =
      `${note.name}${currentOctave}`

    if (
      activeNotes.current.has(
        noteId
      )
    ) {
      return
    }

    const frequency =
      getFrequency(
        note.semitone,
        currentOctave
      )

    const gain =
      context.createGain()

    gain.gain.setValueAtTime(
      0,
      context.currentTime
    )

    const oscillators:
      OscillatorNode[] = []

    const createOscillator = (
      type: OscillatorType,
      freq: number,
      volume: number
    ) => {
      const oscillator =
        context.createOscillator()

      const oscillatorGain =
        context.createGain()

      oscillator.type = type

      oscillator.frequency.value =
        freq

      oscillatorGain.gain.value =
        volume

      oscillator.connect(
        oscillatorGain
      )

      oscillatorGain.connect(
        gain
      )

      oscillator.start()

      oscillators.push(
        oscillator
      )
    }

    switch (sound) {
      case 'piano':
        createOscillator(
          'triangle',
          frequency,
          0.8
        )

        createOscillator(
          'sine',
          frequency * 2,
          0.15
        )

        gain.gain.linearRampToValueAtTime(
          0.35,
          context.currentTime + 0.01
        )
        break

      case 'organ':
        createOscillator(
          'sine',
          frequency,
          0.55
        )

        createOscillator(
          'sine',
          frequency * 2,
          0.25
        )

        createOscillator(
          'sine',
          frequency * 3,
          0.12
        )

        gain.gain.linearRampToValueAtTime(
          0.25,
          context.currentTime + 0.03
        )
        break

      case 'synth':
        createOscillator(
          'sawtooth',
          frequency,
          0.6
        )

        createOscillator(
          'square',
          frequency * 2,
          0.15
        )

        gain.gain.linearRampToValueAtTime(
          0.18,
          context.currentTime + 0.02
        )
        break

      case 'bell':
        createOscillator(
          'sine',
          frequency,
          0.7
        )

        createOscillator(
          'sine',
          frequency * 2.5,
          0.35
        )

        createOscillator(
          'sine',
          frequency * 4,
          0.15
        )

        gain.gain.linearRampToValueAtTime(
          0.3,
          context.currentTime + 0.005
        )
        break

      case 'soft':
        createOscillator(
          'sine',
          frequency,
          0.9
        )

        createOscillator(
          'triangle',
          frequency * 2,
          0.08
        )

        gain.gain.linearRampToValueAtTime(
          0.28,
          context.currentTime + 0.08
        )
        break
    }

    gain.connect(
      context.destination
    )

    activeNotes.current.set(
      noteId,
      {
        oscillators,
        gain,
      }
    )

    setPressedKeys(prev =>
      prev.includes(noteId)
        ? prev
        : [...prev, noteId]
    )

    return noteId
  }

  const changeOctave = (
    newOctave: number
  ) => {
    const limited =
      Math.max(
        1,
        Math.min(7, newOctave)
      )

    // 옥타브 변경 전에 현재 소리를 모두 정리
    stopAllNotes()

    octaveRef.current =
      limited

    setOctave(limited)
  }

  useEffect(() => {
    const handleKeyDown = (
      e: KeyboardEvent
    ) => {
      if (
        e.key === 'ArrowLeft'
      ) {
        e.preventDefault()

        changeOctave(
          octaveRef.current - 1
        )

        return
      }

      if (
        e.key === 'ArrowRight'
      ) {
        e.preventDefault()

        changeOctave(
          octaveRef.current + 1
        )

        return
      }

      if (e.repeat) return

      const key =
        e.key.toUpperCase()

      const note =
        notes.find(
          note =>
            note.key === key
        )

      if (!note) return

      const noteId =
        playNote(note)

      if (noteId) {
        keyboardPressed.current.set(
          key,
          noteId
        )
      }
    }

    const handleKeyUp = (
      e: KeyboardEvent
    ) => {
      const key =
        e.key.toUpperCase()

      const noteId =
        keyboardPressed.current.get(
          key
        )

      if (!noteId) return

      stopNoteById(noteId)

      keyboardPressed.current.delete(
        key
      )
    }

    window.addEventListener(
      'keydown',
      handleKeyDown
    )

    window.addEventListener(
      'keyup',
      handleKeyUp
    )

    return () => {
      window.removeEventListener(
        'keydown',
        handleKeyDown
      )

      window.removeEventListener(
        'keyup',
        handleKeyUp
      )

      stopAllNotes()
    }
  }, [sound])

  const getNoteName = (
    note: KeyNote
  ) => {
    return `${note.name}${octave}`
  }

  return (
    <main
      style={{
        maxWidth: '900px',
        width: '100%',
        boxSizing: 'border-box',
        margin: '0 auto',
        padding:
          '32px 20px 60px',
      }}
    >
      <Header />

      <br />

      <h1
        style={{
          fontSize: '28px',
          marginBottom: '10px',
        }}
      >
        🎹 건반
      </h1>

      <div
        style={{
          fontSize: '14px',
          color: '#777',
          marginBottom: '20px',
        }}
      >
        마우스로 누르거나 컴퓨터 키보드로 연주하세요.
      </div>

      {/* 음색 */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          flexWrap: 'wrap',
          marginBottom: '18px',
        }}
      >
        {sounds.map(item => {
          const selected =
            sound === item.id

          return (
            <button
              key={item.id}
              onClick={() =>
                setSound(item.id)
              }
              style={{
                padding:
                  '9px 13px',
                border: selected
                  ? '2px solid #222'
                  : '1px solid #ddd',
                borderRadius:
                  '8px',
                background:
                  selected
                    ? '#f2f2f2'
                    : 'white',
                fontSize: '14px',
                cursor: 'pointer',
              }}
            >
              {item.name}
            </button>
          )
        })}
      </div>

      {/* 옥타브 */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '20px',
        }}
      >
        <button
          onClick={() =>
            changeOctave(
              octave - 1
            )
          }
          style={{
            width: '36px',
            height: '36px',
            border:
              '1px solid #ddd',
            borderRadius: '7px',
            background: 'white',
            fontSize: '18px',
            cursor: 'pointer',
          }}
        >
          ←
        </button>

        <strong>
          Octave {octave}
        </strong>

        <button
          onClick={() =>
            changeOctave(
              octave + 1
            )
          }
          style={{
            width: '36px',
            height: '36px',
            border:
              '1px solid #ddd',
            borderRadius: '7px',
            background: 'white',
            fontSize: '18px',
            cursor: 'pointer',
          }}
        >
          →
        </button>

        <span
          style={{
            fontSize: '13px',
            color: '#888',
          }}
        >
          ← → 키로 변경
        </span>
      </div>

      {/* 건반 */}
      <div
        style={{
          position: 'relative',
          display: 'flex',
          width: '100%',
          height: '260px',
          userSelect: 'none',
          touchAction: 'none',
        }}
      >
        {/* 흰 건반 */}
        {notes
          .filter(
            note => !note.black
          )
          .map(note => {
            const noteId =
              `${note.name}${octave}`

            const pressed =
              pressedKeys.includes(
                noteId
              )

            return (
              <button
                key={note.key}
                onMouseDown={() =>
                  playNote(note)
                }
                onMouseUp={() =>
                  stopNoteById(
                    noteId
                  )
                }
                onMouseLeave={() =>
                  stopNoteById(
                    noteId
                  )
                }
                style={{
                  position:
                    'relative',
                  flex: 1,
                  height: '100%',
                  background:
                    pressed
                      ? '#ddd'
                      : 'white',
                  border:
                    '1px solid #aaa',
                  borderRadius:
                    '0 0 6px 6px',
                  cursor: 'pointer',
                  padding: 0,
                  display: 'flex',
                  flexDirection:
                    'column',
                  justifyContent:
                    'flex-end',
                  alignItems:
                    'center',
                  paddingBottom:
                    '16px',
                }}
              >
                <strong>
                  {getNoteName(
                    note
                  )}
                </strong>

                <span
                  style={{
                    fontSize: '12px',
                    color: '#888',
                    marginTop: '4px',
                  }}
                >
                  {note.key}
                </span>
              </button>
            )
          })}

        {/* 검은 건반 */}
        {notes
          .filter(
            note => note.black
          )
          .map(note => {
            const noteId =
              `${note.name}${octave}`

            const pressed =
              pressedKeys.includes(
                noteId
              )

            const whiteIndex =
              notes
                .filter(
                  n => !n.black
                )
                .findIndex(
                  n =>
                    n.semitone >
                    note.semitone
                )

            return (
              <button
                key={note.key}
                onMouseDown={() =>
                  playNote(note)
                }
                onMouseUp={() =>
                  stopNoteById(
                    noteId
                  )
                }
                onMouseLeave={() =>
                  stopNoteById(
                    noteId
                  )
                }
                style={{
                  position:
                    'absolute',
                  left: `calc(${whiteIndex} * (100% / 8) - (100% / 16))`,
                  top: 0,
                  width:
                    'calc(100% / 14)',
                  height: '62%',
                  zIndex: 2,
                  background:
                    pressed
                      ? '#555'
                      : '#111',
                  color: 'white',
                  border:
                    '1px solid #000',
                  borderRadius:
                    '0 0 5px 5px',
                  cursor: 'pointer',
                  padding: '8px 0',
                  display: 'flex',
                  flexDirection:
                    'column',
                  justifyContent:
                    'flex-end',
                  alignItems:
                    'center',
                }}
              >
                <strong
                  style={{
                    fontSize: '12px',
                  }}
                >
                  {getNoteName(
                    note
                  )}
                </strong>

                <span
                  style={{
                    fontSize: '10px',
                    color: '#ccc',
                    marginTop: '3px',
                  }}
                >
                  {note.key}
                </span>
              </button>
            )
          })}
      </div>
    </main>
  )
}