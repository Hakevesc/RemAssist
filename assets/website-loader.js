/* Rem Assist website loader - port of \"RemAssist Logo Icon Web-loader.html\" */
(async () => {
  const OVERLAY = document.getElementById('rem-loader');
  const STAGE = document.getElementById('rem-loader-stage');
  const BAR = document.getElementById('rem-loader-bar');
  const FALLBACK = document.getElementById('rem-loader-fallback');
  if (!OVERLAY || !STAGE) return;
  const clamp01 = (v) => Math.max(0, Math.min(1, v));
  const ramp = (t, a, b) => clamp01((t - a) / (b - a));
  const easeIOC = (x) => x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
  const easeOutQuint = (x) => 1 - Math.pow(1 - x, 5);
  const easeOutBack = (x) => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2); };
  let windowDone = false;
  addEventListener('load', () => { windowDone = true; }, { once: true });
  const t0 = performance.now();
  /* The reference sequence isn't finished until LEAD_IN + LOCK_START + LOCK_DUR
     = 4.5s. Fading at 3s cut it off mid-fill, so the settled logo was never
     actually seen. Hold until the lock/settle has landed. */
  const MIN_DISPLAY = 4700, MAX_DISPLAY = 9000;
  let progress = 0, fading = false, fadeStart = -1;
  const setBar = (p) => { if (BAR) BAR.style.width = Math.round(p * 100) + '%'; };
  try {
    const THREE = await import('three');
    const THREE_ADDON = await import('three/addons/loaders/SVGLoader.js');
    const SVGLoader = THREE_ADDON.SVGLoader;
    /* Logo SVG inlined so the loader works even when opened via file://
       (fetch() of local files is blocked by browsers). */
    const svgText = `<svg version="1.0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 311.2 382">
<path fill="#37BCF0" d="M173.5,13c7.6,0,15.2,0.6,22.7,2.1s9.7,3,9.4,8.3c-0.7,11.1-17.9,4.8-24.5,4.5C92.4,23.7,19.9,92.7,25.6,182.5 c0.5,8.8,4.8,20.8,5,28.1c0.1,4.5-3.7,8.5-8.3,8.1C12.2,217.9,9,176.9,10.6,157c5.6-64.1,55.2-121.9,117-138.5l15-3.1 c8-1.6,16.1-2.4,24.2-2.4H173.5L173.5,13z"/>
<path fill="#0E8FD8" d="M236.8,178.8c-2.4-2.1-2.5-6-3.3-9.3c-1-5.1-1.9-11.2-3-15.7c-1.9-7.6-5.9-15-10.6-21.1 c-27.7-36.1-88.8-29.6-107.4,12c-26.3,58.8,33.1,108.4,87.1,116.6c5.8,1.3,10.4-2.8,16-3.7c6.1-0.9,10.5-0.1,16.3,0.2 c12.5,0.2,18.1,13.1,10.9,22.8c-3.7,4.5-10.2,5.1-15.6,5.4c-14.1,0.7-15.8,0.2-26.2-7.3s-12.7-2.7-18.7-4.2 c-53-12.9-106.3-62.7-90.7-121.3c21.1-87.8,150.3-76.8,159.1,11.9c0.4,4.2,0.5,7.8-1.6,11C246.7,180.1,240.5,181.8,236.8,178.8 L236.8,178.8z"/>
<path fill="#05AEEE" d="M155.4,37.3c24.2-2,47.4,1.1,69.6,10.8c7,3.1,24,9.6,19.4,19.1c-5.5,11.3-19.1-0.4-26.8-3.7 C121,22,22.6,115.5,58.9,214.2c2.1,5.6,10.5,19.6,10.8,23.3c0.5,7.1-5.1,11.5-11.8,8.7c-7.5-3.1-18-33.7-20-42 C19.5,125.9,74.3,44.2,155.4,37.3z"/>
<path fill="#0B9CE0" d="M280.6,183c0.3-168-232.1-148.7-218.9-1.6c1.6,18.3,7.7,36,17.5,51.6c13.2,21,27.5,40.1,13.6,69.6 c-3.1,6.6-16.3,19.3-3.9,24.6c6.9,3,11.7-4.5,14.9-9.5c10.3-17,12.2-38.1,7.5-57.6c-2.5-10.4-7.2-20.1-13.2-28.9 c-28.8-42-26.6-78.7,2.1-119.5c44.6-53.5,133.9-36.6,156.7,28.5c6.9,19.7,3.8,37.2,11.2,56.8c2.2,5.8,15.6,30.7,14.4,34.4 c-0.8,2.3-12.2,2.9-15.6,4.4c-16.9,7.4-5.4,41.2-15.3,54.7c-5.9,8-18,4.7-26.5,5.5c-26.6,2.7-46.2,34.5-52.5,58 c-1.9,4.7-2.8,13.6,4,15.3c12.6,1.6,12.4-15.8,16.8-24c27-51.4,39.3-20.9,66.7-39.3c16.5-12.3,11.9-45.8,14.6-54.9 c29.3-3,27.8-18.4,20.8-35.3C291.4,206,280.7,183.2,280.6,183L280.6,183z"/>
</svg>`;
    const TRACE_START = 0.3, TRACE_STAGGER = 0.12, TRACE_DUR = 1.4;
    const FILL_OFFSET = 0.55, FILL_DUR = 1.1;
    const DISSOLVE_START_OFFSET = 1.15, DISSOLVE_DUR = 0.55;
    const LOCK_START = 3.4, LOCK_DUR = 0.9, IDLE = 1.0;
    /* Reference starts the clock at `performance.now() + 200`, i.e. a 200ms
       beat of empty stage before the droplet appears. */
    const LEAD_IN = 0.2;
    const COLORS = [0x37BCF0, 0x0E8FD8, 0x05AEEE, 0x0B9CE0];
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setClearColor(0x000000, 0);
    STAGE.appendChild(renderer.domElement);
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, 1, 10, 4000);
    /* Logo artboard is 311.2 x 382 world units. The camera frames 382*1.45 units
       of height, so an unscaled logo fills ~69% of the viewport — far too large
       for a page loader. baseScale shrinks it to a fixed, modest pixel size that
       stays centred and never overflows on narrow screens. */
    const LOGO_W = 311.2, LOGO_H = 382, FRAME = LOGO_H * 1.45;
    let baseScale = 1;
    function resize() {
      const w = STAGE.clientWidth || innerWidth, h = STAGE.clientHeight || innerHeight;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      const z = FRAME / (2 * Math.tan(THREE.MathUtils.degToRad(40 / 2)));
      camera.position.set(0, 0, z);
      camera.lookAt(0, 0, 0);
      /* Target height: ~24% of viewport height, clamped to a sane px range,
         and capped so the logo never exceeds 42% of the viewport width. */
      let targetPx = Math.max(130, Math.min(h * 0.24, 210));
      targetPx = Math.min(targetPx, (w * 0.42) / (LOGO_W / LOGO_H));
      const fullPx = h / 1.45; /* rendered height of the logo at scale 1 */
      baseScale = targetPx / fullPx;
    }
    resize();
    addEventListener('resize', resize);
    const V = 'attribute float lineDistance; uniform float uMaxDist; uniform float uProgress; uniform float uTail; varying float vAlpha; void main() { float head = uProgress * uMaxDist; float distBehind = head - lineDistance; vAlpha = 0.0; if (distBehind > 0.0) { vAlpha = 1.0 - smoothstep(0.0, uTail, distBehind); } gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }';
    /* NOTE: `#include <...>` is a preprocessor directive — three.js only
       resolves it when it starts its own line. Collapsing these fragment
       shaders onto one line made them fail to compile, so nothing rendered. */
    const VF = [
      'uniform vec3 uColor;',
      'uniform float uOpacity;',
      'varying float vAlpha;',
      'void main(){',
      '  gl_FragColor = vec4(uColor, vAlpha * uOpacity);',
      '  #include <colorspace_fragment>',
      '}'
    ].join('\n');
    const FF = 'varying vec2 vPos; void main(){ vPos = position.xy; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }';
    const FG = [
      'uniform float uProgress;',
      'uniform float uOpacity;',
      'uniform vec3 uColor;',
      'uniform vec2 uCenter;',
      'uniform float uRadius;',
      'varying vec2 vPos;',
      'void main(){',
      '  float d = distance(vPos, uCenter) / uRadius;',
      '  float edge = uProgress * 1.05;',
      '  float reveal = smoothstep(edge, edge - 0.18, d);',
      '  if (reveal <= 0.001) discard;',
      '  float rim = smoothstep(edge - 0.22, edge - 0.06, d) * (1.0 - smoothstep(edge - 0.06, edge + 0.02, d));',
      '  vec3 col = uColor + rim * 0.18;',
      '  gl_FragColor = vec4(col, reveal * uOpacity);',
      '  #include <colorspace_fragment>',
      '}'
    ].join('\n');
    const CX = 311.2 / 2, CY = 382 / 2;
    const data = new SVGLoader().parse(svgText);
    const ensureCCW = (p) => { if (THREE.ShapeUtils.isClockWise(p)) p.reverse(); return p; };
    const logoGroup = new THREE.Group();
    scene.add(logoGroup);
    const pieces = data.paths.map((path, i) => {
      const shape = SVGLoader.createShapes(path)[0];
      const pts = shape.getPoints(140);
      const localPts = ensureCCW(pts.map((q) => new THREE.Vector2(q.x - CX, -(q.y - CY))));
      const box = new THREE.Box2().setFromPoints(localPts);
      const center = box.getCenter(new THREE.Vector2());
      const size = box.getSize(new THREE.Vector2());
      const radius = (size.length() / 2) * 1.02;
      const lineGeo = new THREE.BufferGeometry().setFromPoints(localPts);
      const distances = new Float32Array(localPts.length);
      let totalDist = 0;
      for (let j = 0; j < localPts.length; j++) { if (j > 0) totalDist += localPts[j].distanceTo(localPts[j - 1]); distances[j] = totalDist; }
      lineGeo.setAttribute('lineDistance', new THREE.BufferAttribute(distances, 1));
      const strokeMat = new THREE.ShaderMaterial({ transparent: true, depthWrite: false, uniforms: { uColor: { value: new THREE.Color(COLORS[i]) }, uOpacity: { value: 1 }, uMaxDist: { value: totalDist }, uProgress: { value: 0 }, uTail: { value: totalDist * 0.18 } }, vertexShader: V, fragmentShader: VF });
      const lineMesh = new THREE.LineLoop(lineGeo, strokeMat);
      lineMesh.renderOrder = 2;
      const fillGeo = new THREE.ShapeGeometry(new THREE.Shape(localPts));
      const fillMat = new THREE.ShaderMaterial({ transparent: true, depthWrite: false, uniforms: { uColor: { value: new THREE.Color(COLORS[i]) }, uOpacity: { value: 1 }, uProgress: { value: 0 }, uCenter: { value: center.clone() }, uRadius: { value: radius } }, vertexShader: FF, fragmentShader: FG });
      const fillMesh = new THREE.Mesh(fillGeo, fillMat);
      fillMesh.renderOrder = 1;
      const group = new THREE.Group();
      group.add(fillMesh, lineMesh);
      logoGroup.add(group);
      return { group, strokeMat, fillMat };
    });
    /* Central droplet that kicks off the sequence (matches the reference). */
    const dropMat = new THREE.MeshBasicMaterial({ color: 0x37BCF0, transparent: true, opacity: 0 });
    const dropMesh = new THREE.Mesh(new THREE.CircleGeometry(8, 32), dropMat);
    dropMesh.position.z = 10;
    logoGroup.add(dropMesh);

    if (FALLBACK) FALLBACK.style.opacity = '0';
    setBar(0);
    function updateTimeline(t, tAbs, shrink) {
      const dropP = ramp(t, 0.0, 0.5);
      if (dropP > 0 && dropP < 1) {
        dropMesh.visible = true;
        dropMesh.scale.setScalar(0.4 + easeOutQuint(dropP) * 2.2);
        dropMat.opacity = (1 - dropP) * 0.95;
      } else {
        dropMesh.visible = false;
      }
      pieces.forEach((p, i) => {
        const st = TRACE_START + i * TRACE_STAGGER;
        p.strokeMat.uniforms.uProgress.value = easeOutQuint(ramp(t, st, st + TRACE_DUR));
        p.fillMat.uniforms.uProgress.value = easeIOC(ramp(t, st + FILL_OFFSET, st + FILL_OFFSET + FILL_DUR));
        p.strokeMat.uniforms.uOpacity.value = 1 - easeIOC(ramp(t, st + DISSOLVE_START_OFFSET, st + DISSOLVE_START_OFFSET + DISSOLVE_DUR));
      });
      const lockP = ramp(t, LOCK_START, LOCK_START + LOCK_DUR);
      let lockScale = 1, lockRot = 0;
      if (lockP > 0 && lockP < 1) {
        if (lockP < 0.35) { const sub = lockP / 0.35; lockScale = 1 - 0.05 * easeIOC(sub); lockRot = 0.04 * easeIOC(sub); }
        else { const sub = (lockP - 0.35) / 0.65; lockScale = 0.95 + 0.05 * easeOutBack(sub); lockRot = 0.04 * (1 - easeOutBack(sub)); }
      }
      const idleP = ramp(t, LOCK_START + LOCK_DUR, LOCK_START + LOCK_DUR + IDLE);
      const breathe = 1 + 0.012 * Math.sin(tAbs * 1.4) * idleP;
      const microRot = Math.sin(tAbs * 0.35) * 0.006 * idleP;
      logoGroup.scale.setScalar(shrink * lockScale * breathe);
      logoGroup.rotation.z = lockRot + microRot;
    }
    function frame(now) {
      const elapsed = (now - t0) / 1000;
      progress = Math.max(progress, ramp(elapsed, 0.2, 4.5)); /* bar lands with the lock */
      setBar(progress);
      if (!fading && ((windowDone && elapsed * 1000 >= MIN_DISPLAY) || elapsed * 1000 >= MAX_DISPLAY)) { fading = true; fadeStart = now; }
      if (fading) {
        const p = clamp01((now - fadeStart) / 900);
        OVERLAY.style.opacity = String(1 - easeIOC(p));
        if (p >= 1) { OVERLAY.style.display = 'none'; return; }
      }
      /* Play the sequence once and hold on the idle breathe, exactly like the
         reference. (Previously `elapsed % CYCLE` restarted the trace every
         5.3s, which the standalone demo never does.) */
      updateTimeline(elapsed - LEAD_IN, now / 1000, baseScale);
      renderer.render(scene, camera);
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  } catch (err) {
    console.warn('rem-loader WebGL fallback:', err);
    if (FALLBACK) FALLBACK.classList.add('pulse');
    const iv = setInterval(() => {
      const el = performance.now() - t0;
      setBar(ramp(el, 200, 3550));
      if ((windowDone && el >= MIN_DISPLAY) || el >= MAX_DISPLAY) {
        clearInterval(iv);
        OVERLAY.style.opacity = '0';
        setTimeout(() => { OVERLAY.style.display = 'none'; }, 700);
      }
    }, 200);
  }
})();