import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { AlertTriangle } from 'lucide-react';

// Planner'daki GLB yerleştirme davranışının birebir kopyası: model bounding box'ına
// göre hedef kutunun ölçüsüne üç eksende ayrı ayrı ezilir (DoorGLB / GLBMesh ile aynı).
// Admin yüklediği GLB'nin client'ta NASIL görüneceğini kaydetmeden önce burada görür —
// kapak yerine ağaç yüklerse ağacın kapak oranlarına ezildiğini hemen fark eder.

// "door" modu: örnek kapak slotu (50×180 cm, 18 mm)
const DOOR_W = 0.5;
const DOOR_H = 1.8;
const DOOR_T = 0.018;

// Kapak ince bir paneldir: derinliği, en/boy ortalamasının bu oranından büyükse
// model muhtemelen kapak değildir (ör. ağaç, sandalye) — engellemeyen uyarı gösterilir.
const FLATNESS_WARN_RATIO = 0.35;

interface GlbPreviewProps {
  /** CDN'deki .glb dosyasının tam URL'i */
  url: string;
  /**
   * "door": kapak slotuna (50×180 cm, 18 mm) ezilir + panel oranı uyarısı gösterilir.
   * "product": ürün varsayılan ölçülerine (targetCm) ezilir — planner'daki GLBMesh davranışı.
   */
  mode?: 'door' | 'product';
  /** product modunda hedef kutu (cm). Eksik/0 ise model doğal oranlarında gösterilir. */
  targetCm?: { width?: number; height?: number; depth?: number };
  className?: string;
}

export const GlbPreview: React.FC<GlbPreviewProps> = ({ url, mode = 'door', targetCm, className }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [aspectWarning, setAspectWarning] = useState(false);

  const tw = mode === 'door' ? DOOR_W : (Number(targetCm?.width) || 0) / 100;
  const th = mode === 'door' ? DOOR_H : (Number(targetCm?.height) || 0) / 100;
  const td = mode === 'door' ? DOOR_T : (Number(targetCm?.depth) || 0) / 100;
  const hasTarget = tw > 0 && th > 0 && td > 0;

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount || !url) return;

    setError(null);
    setAspectWarning(false);

    const width = mount.clientWidth || 280;
    const height = 220;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf5f2ec);

    // Kamera, hedef kutunun boyutuna göre konumlanır — 50cm'lik kapak da 3m'lik dolap da
    // kadraja sığar (hedef yoksa 1m'lik doğal kutu varsayılır).
    const frameH = hasTarget ? th : 1;
    const frameMax = hasTarget ? Math.max(tw, th, td) : 1;
    const camera = new THREE.PerspectiveCamera(35, width / height, 0.01, 50);
    camera.position.set(frameMax * 0.6, frameH * 0.65, frameMax * 1.9 + 0.4);
    camera.lookAt(0, frameH / 2, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mount.appendChild(renderer.domElement);

    scene.add(new THREE.AmbientLight(0xffffff, 1.1));
    const dir = new THREE.DirectionalLight(0xffffff, 1.4);
    dir.position.set(2, 3, 2);
    scene.add(dir);

    // Referans: modelin ezileceği hedef kutuyu temsil eden ince çerçeve
    let slotFrame: THREE.LineSegments | null = null;
    if (hasTarget) {
      slotFrame = new THREE.LineSegments(
        new THREE.EdgesGeometry(new THREE.BoxGeometry(tw, th, td)),
        new THREE.LineBasicMaterial({ color: 0x8a7a63 })
      );
      slotFrame.position.set(0, th / 2, 0);
      scene.add(slotFrame);
    }

    let frameId = 0;
    let disposed = false;
    const group = new THREE.Group();
    scene.add(group);

    const loader = new GLTFLoader();
    loader.load(
      url,
      (gltf) => {
        if (disposed) return;
        const model = gltf.scene;
        const box = new THREE.Box3().setFromObject(model);
        const size = new THREE.Vector3();
        box.getSize(size);
        const center = new THREE.Vector3();
        box.getCenter(center);

        if (mode === 'door') {
          // Oran kontrolü: ham modelin derinliği en/boy ortalamasına göre büyükse uyar
          const flatness = size.z / Math.max((size.x + size.y) / 2, 0.001);
          setAspectWarning(flatness > FLATNESS_WARN_RATIO);
        }

        if (hasTarget) {
          const sx = size.x > 0.001 ? tw / size.x : 1;
          const sy = size.y > 0.001 ? th / size.y : 1;
          const sz = size.z > 0.001 ? td / size.z : 1;
          model.scale.set(sx, sy, sz);
          model.position.set(-center.x * sx, th / 2 - center.y * sy, -center.z * sz);
        } else {
          // Hedef ölçü yok — modeli doğal oranlarıyla 1m'lik kadraja uniform sığdır
          const maxDim = Math.max(size.x, size.y, size.z, 0.001);
          const s = 1 / maxDim;
          model.scale.setScalar(s);
          model.position.set(-center.x * s, (size.y * s) / 2 - center.y * s, -center.z * s);
        }
        group.add(model);
      },
      undefined,
      () => {
        if (!disposed) setError('GLB dosyası yüklenemedi ya da bozuk — client\'ta yedek görünüme geri düşülür.');
      }
    );

    const animate = () => {
      frameId = requestAnimationFrame(animate);
      group.rotation.y += 0.004;
      if (slotFrame) slotFrame.rotation.y = group.rotation.y;
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      disposed = true;
      cancelAnimationFrame(frameId);
      renderer.dispose();
      scene.traverse((obj) => {
        const mesh = obj as THREE.Mesh;
        if (mesh.isMesh) {
          mesh.geometry?.dispose();
          const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
          mats.forEach((m) => m?.dispose());
        }
      });
      mount.removeChild(renderer.domElement);
    };
  }, [url, mode, tw, th, td, hasTarget]);

  if (!url) return null;

  return (
    <div className={className}>
      <div ref={mountRef} className="rounded-md border border-border overflow-hidden" />
      <p className="text-xs text-muted-foreground mt-1.5">
        {mode === 'door'
          ? 'Client önizlemesi: model, kapak slotuna (50×180 cm, 18 mm) ezilerek yerleştirilir.'
          : hasTarget
            ? `Client önizlemesi: model, ürünün varsayılan ölçülerine (${Math.round(tw * 100)}×${Math.round(th * 100)}×${Math.round(td * 100)} cm) ezilerek yerleştirilir.`
            : 'Client önizlemesi: varsayılan ölçüler girilmediği için model doğal oranlarında gösteriliyor.'}
      </p>
      {aspectWarning && (
        <p className="text-xs text-amber-600 mt-1 flex items-start gap-1.5">
          <AlertTriangle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
          Bu model kapak oranlarında görünmüyor (derinliği bir panele göre çok fazla).
          Client'ta 18 mm kalınlığa ezileceği için beklenmedik görünebilir — yine de
          kaydedebilirsiniz.
        </p>
      )}
      {error && (
        <p className="text-xs text-destructive mt-1 flex items-start gap-1.5">
          <AlertTriangle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
};
