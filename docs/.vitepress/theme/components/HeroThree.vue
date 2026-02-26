<script setup>
import { onMounted, onUnmounted, ref } from 'vue'
import * as THREE from 'three'

const container = ref(null)
let scene, camera, renderer, clock, particles, lightningMesh
let mouseX = 0, mouseY = 0

const init = () => {
  if (!container.value) return

  scene = new THREE.Scene()
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
  camera.position.z = 5

  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  container.value.appendChild(renderer.domElement)

  clock = new THREE.Clock()

  // Particles
  const particlesCount = 2000
  const positions = new Float32Array(particlesCount * 3)
  for (let i = 0; i < particlesCount * 3; i++) {
    positions[i] = (Math.random() - 0.5) * 15
  }
  const particlesGeometry = new THREE.BufferGeometry()
  particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  const particlesMaterial = new THREE.PointsMaterial({
    size: 0.012,
    color: 0xffd700,
    transparent: true,
    opacity: 0.3,
    blending: THREE.AdditiveBlending
  })
  particles = new THREE.Points(particlesGeometry, particlesMaterial)
  scene.add(particles)

  // Orb
  const orbGeometry = new THREE.IcosahedronGeometry(1.2, 5)
  const orbMaterial = new THREE.MeshStandardMaterial({
    color: 0xffd700,
    wireframe: true,
    transparent: true,
    opacity: 0.1,
    emissive: 0xffb700,
    emissiveIntensity: 0.2
  })
  lightningMesh = new THREE.Mesh(orbGeometry, orbMaterial)
  scene.add(lightningMesh)

  const innerOrb = new THREE.Mesh(
    new THREE.SphereGeometry(0.6, 32, 32),
    new THREE.MeshBasicMaterial({ color: 0xffd700, transparent: true, opacity: 0.05 })
  )
  scene.add(innerOrb)

  const ambientLight = new THREE.AmbientLight(0x404040)
  scene.add(ambientLight)

  const pointLight = new THREE.PointLight(0xffd700, 15, 10)
  pointLight.position.set(2, 2, 2)
  scene.add(pointLight)

  const handleMouseMove = (e) => {
    mouseX = (e.clientX / window.innerWidth - 0.5)
    mouseY = (e.clientY / window.innerHeight - 0.5)
  }

  const handleResize = () => {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)
  }

  window.addEventListener('mousemove', handleMouseMove)
  window.addEventListener('resize', handleResize)

  const animate = () => {
    if (!renderer) return
    requestAnimationFrame(animate)
    const elapsedTime = clock.getElapsedTime()

    particles.rotation.y = elapsedTime * 0.03
    lightningMesh.rotation.y = elapsedTime * 0.2
    lightningMesh.rotation.z = elapsedTime * 0.15
    
    const scale = 1 + Math.sin(elapsedTime * 2) * 0.03
    lightningMesh.scale.set(scale, scale, scale)

    camera.position.x += (mouseX * 1.5 - camera.position.x) * 0.05
    camera.position.y += (-mouseY * 1.5 - camera.position.y) * 0.05
    camera.lookAt(scene.position)

    renderer.render(scene, camera)
  }

  animate()

  onUnmounted(() => {
    window.removeEventListener('mousemove', handleMouseMove)
    window.removeEventListener('resize', handleResize)
    renderer.dispose()
    renderer = null
  })
}

onMounted(() => {
  init()
})
</script>

<template>
  <div ref="container" class="three-container"></div>
</template>

<style scoped>
.three-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: -1;
  pointer-events: none;
  background: radial-gradient(circle at center, transparent 0%, rgba(5, 5, 10, 0.4) 100%);
}
</style>
