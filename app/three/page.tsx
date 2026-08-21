'use client'

import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import Header from '../../components/Header'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

export default function ThreePage() {
  const containerRef =
    useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container =
      containerRef.current

    if (!container) return

    // -----------------------
    // Scene
    // -----------------------

    const scene =
      new THREE.Scene()

    scene.background =
      new THREE.Color(0x111111)


    // -----------------------
    // Canvas size
    // -----------------------

    const width =
      container.clientWidth || 800

    const height = 600


    // -----------------------
    // Camera
    // -----------------------

    const camera =
      new THREE.PerspectiveCamera(
        45,
        width / height,
        0.1,
        1000
      )


    // -----------------------
    // Renderer
    // -----------------------

    const renderer =
      new THREE.WebGLRenderer({
        antialias: true,
      })

    renderer.setSize(
      width,
      height
    )

    renderer.setPixelRatio(
      Math.min(
        window.devicePixelRatio,
        2
      )
    )

    container.appendChild(
      renderer.domElement
    )


    // -----------------------
    // Controls
    // -----------------------

    const controls =
      new OrbitControls(
        camera,
        renderer.domElement
      )

    controls.enableDamping = true


    // -----------------------
    // Lights
    // -----------------------

    const hemisphereLight =
      new THREE.HemisphereLight(
        0xffffff,
        0x444444,
        2
      )

    scene.add(
      hemisphereLight
    )


    const directionalLight =
      new THREE.DirectionalLight(
        0xffffff,
        2
      )

    directionalLight.position.set(
      3,
      5,
      3
    )

    scene.add(
      directionalLight
    )


    // -----------------------
    // Load GLB
    // -----------------------

    const loader =
      new GLTFLoader()

    loader.load(
      '/models/test.glb',

      (gltf) => {
        const model =
          gltf.scene

        scene.add(model)


        // 모델 크기 계산
        const box =
          new THREE.Box3()
            .setFromObject(model)

        const size =
          box.getSize(
            new THREE.Vector3()
          )

        const center =
          box.getCenter(
            new THREE.Vector3()
          )


        // 모델 중심을 원점으로 이동
        model.position.x -=
          center.x

        model.position.y -=
          center.y

        model.position.z -=
          center.z


        // 모델 크기 조절
        const maxSize =
          Math.max(
            size.x,
            size.y,
            size.z
          )

        const targetSize = 3

        const scale =
          maxSize > 0
            ? targetSize / maxSize
            : 1

        model.scale.setScalar(
          scale
        )


        // 크기 조절 후 다시 계산
        const fittedBox =
          new THREE.Box3()
            .setFromObject(model)

        const fittedSize =
          fittedBox.getSize(
            new THREE.Vector3()
          )

        const fittedCenter =
          fittedBox.getCenter(
            new THREE.Vector3()
          )


        // 카메라 거리 계산
        const maxDimension =
          Math.max(
            fittedSize.x,
            fittedSize.y,
            fittedSize.z
          )

        const fov =
          THREE.MathUtils.degToRad(
            camera.fov
          )

        const distance =
          maxDimension /
          (
            2 *
            Math.tan(
              fov / 2
            )
          )


        // 카메라 위치
        camera.position.set(
          0,
          fittedCenter.y,
          Math.max(
            distance * 1.4,
            3
          )
        )


        // 모델을 바라봄
        camera.lookAt(
          fittedCenter
        )

        controls.target.copy(
          fittedCenter
        )

        controls.update()
      },

      undefined,

      (error) => {
        console.error(
          'GLB loading error:',
          error
        )
      }
    )


    // resize 

    const handleResize = () => {
      const newWidth =
        container.clientWidth

      const newHeight = 600

      camera.aspect =
        newWidth / newHeight

      camera.updateProjectionMatrix()

      renderer.setSize(
        newWidth,
        newHeight
      )
    }

    window.addEventListener(
      'resize',
      handleResize
    )

    // -----------------------
    // Animation
    // -----------------------

    let animationId: number

    const animate = () => {
      animationId =
        requestAnimationFrame(
          animate
        )

      controls.update()

      renderer.render(
        scene,
        camera
      )
    }

    animate()


    // -----------------------
    // Cleanup
    // -----------------------

    return () => {
      cancelAnimationFrame(
        animationId
      )

      window.removeEventListener(
        'resize',
        handleResize
      )

      controls.dispose()

      renderer.dispose()

      if (
        container.contains(
          renderer.domElement
        )
      ) {
        container.removeChild(
          renderer.domElement
        )
      }
    }
  }, [])


  return (
    <main
      style={{
        padding: '30px',
      }}
    >
      <Header />

      <h1>
        🌐 WebGL / Three.js 테스트
      </h1>

      <p>
        GLB 3D 모델 테스트
      </p>

      <div
        ref={containerRef}
        style={{
          width: '100%',
          height: '70vh',
        }}
      />
    </main>
  )
}