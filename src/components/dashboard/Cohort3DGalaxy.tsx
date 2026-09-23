'use client';
import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { StudentRecord } from '@/types/academic';
import { Box, Sparkles, RotateCw, ZoomIn, Eye, Layers } from 'lucide-react';
import StudentProfileDrawer from './StudentProfileDrawer';

interface Cohort3DGalaxyProps {
  students: StudentRecord[];
}

export default function Cohort3DGalaxy({ students }: Cohort3DGalaxyProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [hoveredStudent, setHoveredStudent] = useState<StudentRecord | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<StudentRecord | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [filterSection, setFilterSection] = useState<'ALL' | 'AURA' | 'ZEN' | 'NEO'>('ALL');

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    // Dimensions
    const width = mount.clientWidth;
    const height = 400;

    // Scene, Camera, Renderer
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0f172a); // Slate-900

    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    camera.position.set(0, 0, 85);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mount.appendChild(renderer.domElement);

    // Ambient & Directional Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0x60a5fa, 2, 120);
    pointLight.position.set(20, 30, 40);
    scene.add(pointLight);

    // Orbital rings for aesthetic reference
    const ringGeo1 = new THREE.RingGeometry(24, 24.3, 64);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x334155, side: THREE.DoubleSide });
    const ringMesh1 = new THREE.Mesh(ringGeo1, ringMat);
    ringMesh1.rotation.x = Math.PI / 2.5;
    scene.add(ringMesh1);

    const ringGeo2 = new THREE.RingGeometry(38, 38.3, 64);
    const ringMesh2 = new THREE.Mesh(ringGeo2, ringMat);
    ringMesh2.rotation.x = Math.PI / 2.5;
    scene.add(ringMesh2);

    // Group for nodes
    const cohortGroup = new THREE.Group();
    scene.add(cohortGroup);

    // Particle nodes for each student
    const nodeSpheres: { mesh: THREE.Mesh; student: StudentRecord }[] = [];
    const sphereGeo = new THREE.SphereGeometry(1.2, 16, 16);

    const activeList = students.filter((s) => {
      if (filterSection === 'ALL') return true;
      return (s.section || s.group) === filterSection;
    });

    activeList.forEach((student, i) => {
      const overall = student.currentPerformance?.overall?.value ?? 70;
      let colorHex = 0x3b82f6; // Blue (On track)

      if (overall >= 85) colorHex = 0x10b981; // Green (Achieved)
      else if (overall >= 70) colorHex = 0x3b82f6; // Blue
      else if (overall >= 60) colorHex = 0xf59e0b; // Amber (Watch)
      else colorHex = 0xef4444; // Rose (Critical)

      const mat = new THREE.MeshStandardMaterial({
        color: colorHex,
        roughness: 0.3,
        metalness: 0.2,
        emissive: colorHex,
        emissiveIntensity: 0.25,
      });

      const mesh = new THREE.Mesh(sphereGeo, mat);

      // Fibonacci sphere distribution modulated by score
      const phi = Math.acos(-1 + (2 * i) / Math.max(activeList.length, 1));
      const theta = Math.sqrt(Math.max(activeList.length, 1) * Math.PI) * phi;
      const radius = 22 + (100 - overall) * 0.25;

      mesh.position.x = radius * Math.cos(theta) * Math.sin(phi);
      mesh.position.y = radius * Math.sin(theta) * Math.sin(phi);
      mesh.position.z = radius * Math.cos(phi);

      cohortGroup.add(mesh);
      nodeSpheres.push({ mesh, student });
    });

    // Raycaster for hover & click
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    // Mouse drag rotation
    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };

    const onMouseMove = (e: MouseEvent) => {
      const rect = mount.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / height) * 2 + 1;

      if (isDragging) {
        const deltaX = e.clientX - prevMouseX;
        const deltaY = e.clientY - prevMouseY;
        cohortGroup.rotation.y += deltaX * 0.005;
        cohortGroup.rotation.x += deltaY * 0.005;
        prevMouseX = e.clientX;
        prevMouseY = e.clientY;
      }

      // Check intersection
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(nodeSpheres.map((n) => n.mesh));
      if (intersects.length > 0) {
        const hit = nodeSpheres.find((n) => n.mesh === intersects[0].object);
        if (hit) setHoveredStudent(hit.student);
      } else {
        setHoveredStudent(null);
      }
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    const onClick = () => {
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(nodeSpheres.map((n) => n.mesh));
      if (intersects.length > 0) {
        const hit = nodeSpheres.find((n) => n.mesh === intersects[0].object);
        if (hit) {
          setSelectedStudent(hit.student);
          setDrawerOpen(true);
        }
      }
    };

    mount.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    mount.addEventListener('click', onClick);

    // Animation Loop
    let animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      if (!isDragging) {
        cohortGroup.rotation.y += 0.002;
      }
      renderer.render(scene, camera);
    };
    animate();

    // Clean up
    return () => {
      cancelAnimationFrame(animId);
      mount.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      mount.removeEventListener('click', onClick);
      if (mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement);
      }
      renderer.dispose();
      sphereGeo.dispose();
      ringGeo1.dispose();
      ringGeo2.dispose();
    };
  }, [students, filterSection]);

  return (
    <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5 shadow-lg text-white relative overflow-hidden">
      {/* Header bar inside 3D canvas */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2 z-10 relative">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-600/30 border border-indigo-400/40 flex items-center justify-center text-indigo-400">
            <Box className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white">Class IX 3D Cohort Orbit</h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
                Three.js Interactive
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Orbital cluster of 160 students mapped by performance tiers
            </p>
          </div>
        </div>

        {/* Section filtering inside 3D */}
        <div className="flex items-center gap-1 bg-slate-800/80 p-1 rounded-xl text-xs">
          {(['ALL', 'AURA', 'ZEN', 'NEO'] as const).map((sec) => (
            <button
              key={sec}
              onClick={() => setFilterSection(sec)}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                filterSection === sec
                  ? 'bg-blue-600 text-white font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {sec}
            </button>
          ))}
        </div>
      </div>

      {/* Canvas container */}
      <div
        ref={mountRef}
        className="w-full h-[400px] cursor-grab active:cursor-grabbing relative"
      >
        {/* Floating Student Hover Pill */}
        {hoveredStudent && (
          <div className="absolute top-4 left-4 bg-slate-950/90 backdrop-blur-md border border-slate-700 p-3 rounded-xl shadow-xl z-20 pointer-events-none animate-in fade-in duration-150">
            <div className="flex items-center gap-2">
              <span className="font-bold text-xs text-white">{hoveredStudent.name}</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-blue-900/60 text-blue-300 font-mono">
                IX {hoveredStudent.section || hoveredStudent.group}
              </span>
            </div>
            <div className="text-xs text-slate-300 mt-1 flex items-center gap-3">
              <span>
                Score: <strong>{hoveredStudent.currentPerformance?.overall?.value}%</strong>
              </span>
              <span>
                Target: {hoveredStudent.schoolTarget?.overall?.value}%
              </span>
            </div>
            <span className="text-[10px] text-blue-400 mt-1 block">Click to open 360° Profile →</span>
          </div>
        )}

        {/* Legend Overlay at bottom */}
        <div className="absolute bottom-3 left-3 right-3 flex flex-wrap items-center justify-between text-[11px] text-slate-400 pointer-events-none bg-slate-950/60 backdrop-blur-xs p-2 rounded-lg border border-slate-800">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> 85%+ Achieved
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span> 70-84% On Track
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> 60-69% Watch
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span> &lt;60% Critical
            </span>
          </div>
          <span className="text-[10px] text-slate-400">Click & Drag to Rotate Orbit</span>
        </div>
      </div>

      {/* Student 360 Profile Drawer */}
      <StudentProfileDrawer
        student={selectedStudent}
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />
    </div>
  );
}
