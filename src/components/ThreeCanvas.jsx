import { useEffect, useRef } from "react";
import * as THREE from "three";

export default function ThreeCanvas() {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // 1. Scene Setup
    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;
    
    const scene = THREE.Scene ? new THREE.Scene() : null;
    if (!scene) return; // Guard in case of headless imports

    // Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.z = 8;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    containerRef.current.appendChild(renderer.domElement);

    // 2. Objects Creation
    // Outer Wireframe Mesh (Violet)
    const geometry = new THREE.IcosahedronGeometry(2, 1);
    const material = new THREE.MeshBasicMaterial({
      color: 0x8b5cf6, // Violet accent
      wireframe: true,
      transparent: true,
      opacity: 0.35,
    });
    const wireframeMesh = new THREE.Mesh(geometry, material);
    scene.add(wireframeMesh);

    // Inner Nodes/Particles (Teal Emerald)
    const particleCount = 60;
    const particleGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
      // Position points randomly on a sphere of radius 1.8
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      const r = 1.8;

      positions[i] = r * Math.sin(phi) * Math.cos(theta);
      positions[i + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i + 2] = r * Math.cos(phi);
    }

    particleGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

    // Particle material (Teal glowing dots)
    const particleMaterial = new THREE.PointsMaterial({
      color: 0x00f5d4, // Neon Teal
      size: 0.12,
      transparent: true,
      opacity: 0.9,
    });

    const pointCloud = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(pointCloud);

    // Inner Core Glow Sphere
    const coreGeometry = new THREE.SphereGeometry(0.8, 16, 16);
    const coreMaterial = new THREE.MeshBasicMaterial({
      color: 0x0d9488,
      transparent: true,
      opacity: 0.15,
    });
    const coreMesh = new THREE.Mesh(coreGeometry, coreMaterial);
    scene.add(coreMesh);

    // 3. Mouse Movement Tracking (Interactive Tilt)
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const onMouseMove = (event) => {
      // Normalize mouse coordinates (-1 to 1)
      mouseX = (event.clientX / window.innerWidth) * 2 - 1;
      mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
    };

    window.addEventListener("mousemove", onMouseMove);

    // 4. Resize Handling
    const onResize = () => {
      if (!containerRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", onResize);

    // 5. Animation Loop
    const clock = new THREE.Clock();

    const animate = () => {
      const elapsedTime = clock.getElapsedTime();

      // Spin Mesh & Cloud
      wireframeMesh.rotation.y = elapsedTime * 0.05;
      wireframeMesh.rotation.x = elapsedTime * 0.03;

      pointCloud.rotation.y = -elapsedTime * 0.08;
      pointCloud.rotation.x = -elapsedTime * 0.04;

      // Smoothly interpolate camera tilt towards target cursor position (lerp)
      targetX = mouseX * 0.8;
      targetY = mouseY * 0.8;

      wireframeMesh.rotation.z += (targetX - wireframeMesh.rotation.z) * 0.05;
      wireframeMesh.rotation.x += (targetY - wireframeMesh.rotation.x) * 0.05;

      pointCloud.rotation.z += (targetX - pointCloud.rotation.z) * 0.05;
      pointCloud.rotation.x += (targetY - pointCloud.rotation.x) * 0.05;

      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    };

    animate();

    // 6. Cleanup
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("resize", onResize);
      
      // Dispose materials & geometries
      geometry.dispose();
      material.dispose();
      particleGeometry.dispose();
      particleMaterial.dispose();
      coreGeometry.dispose();
      coreMaterial.dispose();
      
      renderer.dispose();
      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement);
      }
    };
  }, []);

  return <div ref={containerRef} className="three-canvas-container" />;
}
