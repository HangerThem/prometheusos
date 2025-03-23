import { useEffect, useRef } from "react"
import * as THREE from "three"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls"
import { usePins } from "../context/usePins"
import gsap from "gsap"
import { useOnlineStatus } from "../hooks/useOnlineStatus"

const latLongToVector3 = (lat: number, lon: number, radius: number) => {
  const phi = (90 - lat) * (Math.PI / 180)
  const theta = (lon + 180) * (Math.PI / 180)
  const x = -radius * Math.sin(phi) * Math.cos(theta)
  const z = radius * Math.sin(phi) * Math.sin(theta)
  const y = radius * Math.cos(phi)
  return new THREE.Vector3(x, y, z)
}

export function Earth() {
  const mountRef = useRef<HTMLDivElement>(null)
  const { pins, selectedPinId } = usePins()
  const pinsGroupRef = useRef<THREE.Group | null>(null)
  const controlsRef = useRef<OrbitControls | null>(null)
  const earthMeshRef = useRef<THREE.Mesh | null>(null)
  const pinMeshesRef = useRef<Map<string, THREE.Mesh>>(new Map())
  const { isOnline, publicData } = useOnlineStatus()

  useEffect(() => {
    if (!mountRef.current) return

    const scene = new THREE.Scene()
    scene.background = new THREE.Color("#0a0a0a")
    const width = mountRef.current.clientWidth
    const height = mountRef.current.clientHeight
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000)
    camera.position.z = 2.75

    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize(width, height)
    mountRef.current.appendChild(renderer.domElement)

    const radius = 1
    const segments = 64
    const sphereGeometry = new THREE.SphereGeometry(radius, segments, segments)
    const textureLoader = new THREE.TextureLoader()
    const earthTexture = textureLoader.load("/textures/earth_landocean_4K.png")
    const sphereMaterial = new THREE.MeshPhongMaterial({
      map: earthTexture,
      transparent: true,
      alphaTest: 0.5,
      depthWrite: true,
    })
    const earthMesh = new THREE.Mesh(sphereGeometry, sphereMaterial)
    scene.add(earthMesh)
    earthMeshRef.current = earthMesh

    const ambientLight = new THREE.AmbientLight("#ffffff", 0.5)
    scene.add(ambientLight)
    const directionalLight = new THREE.DirectionalLight("#ffffff", 1)
    directionalLight.position.set(5, 3, 5)
    scene.add(directionalLight)

    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.05
    controls.rotateSpeed = 0.5
    controls.enableZoom = true
    controls.minDistance = 1.5
    controls.maxDistance = 5
    controls.zoomSpeed = 0.5
    controls.enablePan = false
    controlsRef.current = controls

    let isAutoRotating = true
    let userInteracted = false

    controls.addEventListener("start", () => {
      isAutoRotating = false
      userInteracted = true
    })

    controls.addEventListener("end", () => {
      setTimeout(() => {
        if (userInteracted) {
          isAutoRotating = true
          userInteracted = false
        }
      }, 2000)
    })

    const pinsGroup = new THREE.Group()
    earthMesh.add(pinsGroup)
    pinsGroupRef.current = pinsGroup

    const baseCircleRadius = 1
    const circleSegments = 64
    const circlePoints: THREE.Vector3[] = []
    for (let i = 0; i <= circleSegments; i++) {
      const theta = (i / circleSegments) * Math.PI * 2
      circlePoints.push(
        new THREE.Vector3(
          Math.cos(theta) * baseCircleRadius,
          Math.sin(theta) * baseCircleRadius,
          0
        )
      )
    }
    const circleGeometry = new THREE.BufferGeometry().setFromPoints(
      circlePoints
    )
    const circleMaterial = new THREE.LineBasicMaterial({
      color: "#aaaaaa",
      linewidth: 2,
    })
    const circleLine = new THREE.LineLoop(circleGeometry, circleMaterial)
    scene.add(circleLine)

    const animate = () => {
      requestAnimationFrame(animate)
      controls.update()

      if (isAutoRotating && !selectedPinId) {
        earthMesh.rotation.y += 0.0025
      }

      const d = camera.position.distanceTo(earthMesh.position)
      const clampedD = Math.max(d, radius + 0.001)

      const h = (radius * radius) / clampedD
      const R_outline =
        radius * Math.sqrt(1 - (radius * radius) / (clampedD * clampedD))

      const direction = new THREE.Vector3()
        .subVectors(camera.position, earthMesh.position)
        .normalize()
      const circlePos = new THREE.Vector3().copy(direction).multiplyScalar(h)
      circleLine.position.copy(earthMesh.position).add(circlePos)

      circleLine.lookAt(camera.position)

      const scaleFactor = R_outline / baseCircleRadius
      circleLine.scale.set(scaleFactor, scaleFactor, scaleFactor)

      renderer.render(scene, camera)
    }
    animate()

    const handleResize = () => {
      const width = mountRef.current.clientWidth
      const height = mountRef.current.clientHeight

      camera.aspect = width / height
      camera.updateProjectionMatrix()
      renderer.setSize(width, height)
    }

    window.addEventListener("resize", handleResize)

    return () => {
      window.removeEventListener("resize", handleResize)
      mountRef.current.removeChild(renderer.domElement)
      controls.dispose()
    }
  }, [])

  useEffect(() => {
    if (!pinsGroupRef.current) return
    const pinsGroup = pinsGroupRef.current
    pinsGroup.clear()
    pinMeshesRef.current.clear()
    const defaultCircleRadius = 0.025

    pins.forEach((pin) => {
      const pinGeometry = new THREE.CircleGeometry(defaultCircleRadius, 32)
      const pinMaterial = new THREE.MeshBasicMaterial({
        color: pin.color ?? "#EF1F1F",
        side: THREE.BackSide,
      })
      const pinMesh = new THREE.Mesh(pinGeometry, pinMaterial)

      const pinDistance = 1
      const pos = latLongToVector3(pin.lat, pin.lon, pinDistance)
      pinMesh.position.copy(pos)
      pinMesh.lookAt(new THREE.Vector3(0, 0, 0))
      pinMesh.userData = { pinId: pin.id }

      if (pin.id) {
        pinMeshesRef.current.set(pin.id, pinMesh)
      }

      pinsGroup.add(pinMesh)
    })
  }, [pins])

  useEffect(() => {
    if (!selectedPinId || !controlsRef.current || !earthMeshRef.current) return

    const pinMesh = pinMeshesRef.current.get(selectedPinId)
    if (!pinMesh) return

    const earthMesh = earthMeshRef.current
    earthMesh.rotation.y = 0

    const pinWorldPos = new THREE.Vector3()
    pinMesh.getWorldPosition(pinWorldPos)

    const directionVector = pinWorldPos.clone().normalize()
    const targetPosition = directionVector.multiplyScalar(2.2)

    const controls = controlsRef.current
    gsap.to(controls.object.position, {
      x: targetPosition.x,
      y: targetPosition.y,
      z: targetPosition.z,
      duration: 1.5,
      ease: "power2.inOut",
      onUpdate: () => {
        controls.update()
      },
    })

    const originalScale = pinMesh.scale.clone()
    const pulseAnimation = () => {
      gsap.to(pinMesh.scale, {
        x: originalScale.x * 1.5,
        y: originalScale.y * 1.5,
        z: originalScale.z * 1.5,
        duration: 0.8,
        ease: "power1.inOut",
        yoyo: true,
        repeat: -1,
      })
    }

    pulseAnimation()

    return () => {
      gsap.killTweensOf(pinMesh.scale)
      pinMesh.scale.copy(originalScale)
    }
  }, [selectedPinId])

  return (
    <div className="relative w-full h-full">
      <div
        ref={mountRef}
        className={`w-full h-[92.5%] ${!isOnline && "opacity-10"}`}
      />
      <div className="text-zinc-200 text-center font-bold my-auto">
        {publicData?.ip || "IP Unavailable"}
      </div>
      {!isOnline && (
        <div className="absolute top-0 left-0 w-full h-full text-zinc-200 pointer-events-none flex items-center justify-center uppercase font-bold text-4xl">
          Offline
        </div>
      )}
    </div>
  )
}
