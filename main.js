import * as THREE from './vendor/three.module.min.js';

const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const $ = (s, r = document) => r.querySelector(s);

/* ------------------------------------------------------------------ content */
const PROJECTS = [
  { name: 'CyberSOC-Agent', kind: 'Security · LLM agent', note: 'Third place, Techkriti ’26, IIT Kanpur', c: 'var(--red)',
    text: 'Insider threat detection and investigation. An ensemble of scenario rules, XGBoost with SHAP, Isolation Forest and an autoencoder scores risk; a ReAct LLM agent then investigates each alert and verifies every cited item against tool output.',
    stack: ['Python', 'XGBoost', 'SHAP', 'PyTorch', 'ChromaDB', 'FastAPI', 'React'] },
  { name: 'SunoSakhi', kind: 'Health · Voice', note: 'First place, Society Hackathon', c: 'var(--amber)', href: 'https://github.com/Aayush-Bindal/SunoSakhi',
    text: 'A voice-based health assistant that lets people without a smartphone ask health questions by phone in 12 regional languages. Team project; I built the FastAPI voice pipeline.',
    stack: ['Python', 'FastAPI', 'Exotel', 'Google Cloud Speech', 'Mistral 7B'] },
  { name: 'Forensic', kind: 'Digital forensics', note: 'Team project', c: 'var(--teal)',
    text: 'Acquisition, recovery and analysis of DVR/NVR surveillance evidence across vendors, with LLM-guided discovery of proprietary formats and YOLO-based event indexing.',
    stack: ['Rust', 'Python', 'React', 'Tauri', 'YOLO'] },
  { name: 'few-shot-anomaly-views', kind: 'Computer vision', note: 'Open source', c: 'var(--violet)', href: 'https://github.com/iakshatkaushik/few-shot-anomaly-views',
    text: 'Few-shot visual anomaly detection, comparing augmented views as nearest-neighbour memory against contrastive training on frozen DINOv2/DINOv3 features.',
    stack: ['Python', 'DINOv2', 'DINOv3'] },
];
const SKILLS = [
  ['Languages', [['python', 'Python'], ['c', 'C'], ['cpp', 'C++'], ['js', 'JavaScript'], ['rust', 'Rust'], ['bash', 'Bash']]],
  ['ML and data', [['pytorch', 'PyTorch'], ['sklearn', 'scikit-learn'], ['numpy', 'NumPy'], ['pandas', 'pandas'], ['opencv', 'OpenCV'], ['kaggle', 'Kaggle'], ['gemini', 'Gemini API']]],
  ['Web and backend', [['fastapi', 'FastAPI'], ['flask', 'Flask'], ['react', 'React'], ['vite', 'Vite'], ['tauri', 'Tauri'], ['postgres', 'PostgreSQL'], ['mysql', 'MySQL'], ['sqlite', 'SQLite'], ['sqlalchemy', 'SQLAlchemy']]],
  ['Tools and infra', [['linux', 'Linux'], ['git', 'Git'], ['github', 'GitHub'], ['aws', 'AWS EC2'], ['nginx', 'Nginx'], ['gcp', 'Google Cloud APIs'], ['latex', 'LaTeX']]],
];
const CHIPS = [
  ['Libraries', 'var(--red)', ['XGBoost', 'SHAP', 'Sentence Transformers', 'imbalanced-learn', 'ChromaDB', 'YOLO']],
  ['Methods', 'var(--amber)', ['Experimental design', 'Benchmarks & ablations', 'Hypothesis testing', 'Zero/few-shot LLM evaluation', 'Interpretability', 'Sparse autoencoders']],
];

const el = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; };

const cards = $('#cards');
PROJECTS.forEach((p, i) => {
  const a = el(p.href ? 'a' : 'div', 'card reveal');
  if (p.href) { a.href = p.href; a.rel = 'noopener'; }
  a.style.setProperty('--c', p.c); a.style.setProperty('--rd', `${(i % 2) * 0.1}s`);
  const k = el('div', 'k'); k.append(el('span', '', p.kind), el('span', '', p.note));
  const st = el('div', 'stack'); p.stack.forEach(s => st.append(el('span', '', s)));
  a.append(k, el('h3', '', p.name), el('p', '', p.text), st);
  if (p.href) { const go = el('span', 'go', 'View on GitHub '); go.append(el('i', '', '↗')); a.append(go); }
  a.addEventListener('pointermove', e => { const r = a.getBoundingClientRect(); a.style.setProperty('--mx', `${e.clientX - r.left}px`); a.style.setProperty('--my', `${e.clientY - r.top}px`); });
  cards.append(a);
});

const rows = $('#skillrows');
SKILLS.forEach(([label, items]) => {
  const row = el('div', 'srow reveal'); const tiles = el('div', 'tiles');
  items.forEach(([id, name]) => { const t = el('span', 'tile'); t.dataset.n = name; const im = new Image(); im.src = `assets/skills/${id}.svg`; im.alt = name; im.loading = 'lazy'; t.append(im); tiles.append(t); });
  row.append(el('h3', '', label), tiles); rows.append(row);
});
CHIPS.forEach(([label, col, items]) => {
  const row = el('div', 'srow reveal'); const tiles = el('div', 'tiles');
  items.forEach((name, i) => { const c = el('span', 'chip'); c.style.setProperty('--cc', col); c.style.setProperty('--d', `${i * 0.45}s`); c.append(el('i'), document.createTextNode(name)); tiles.append(c); });
  row.append(el('h3', '', label), tiles); rows.append(row);
});

/* ------------------------------------------------------------------ chrome */
const nav = $('#nav');
const onScroll = () => nav.classList.toggle('scrolled', scrollY > innerHeight * 0.6);
addEventListener('scroll', onScroll, { passive: true }); onScroll();

const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
document.querySelectorAll('.reveal').forEach(n => io.observe(n));

// ECG trace
(() => {
  const svg = $('#ecg'), W = 1600, y = 50, beat = 230;
  const shape = [[0, 0], [.10, 0], [.14, -3], [.18, -5], [.22, -3], [.26, 0], [.33, 0], [.355, 4], [.385, -40], [.415, 11], [.44, 0], [.54, 0], [.59, -5], [.64, -9], [.69, -5], [.74, 0]];
  const pts = []; for (let x = 0; x < W; x += beat) shape.forEach(([fx, fy]) => { if (x + fx * beat <= W) pts.push([x + fx * beat, y + fy]); }); pts.push([W, y]);
  let L = 0; for (let i = 1; i < pts.length; i++) L += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
  const P = pts.map(p => p.join(',')).join(' ');
  svg.innerHTML = `<polyline class="base" points="${P}"/><polyline class="beat" points="${P}" stroke-dasharray="320 ${L}" stroke-dashoffset="320" style="--end:${-L}"/>`;
})();

/* ------------------------------------------------------------------ the eye */
const canvas = $('#eye');
let renderer;
try { renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true }); } catch (e) { canvas.style.display = 'none'; }

if (renderer) {
  const hero = $('#top');
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 50);
  camera.position.set(0, 0, 6);
  const rig = new THREE.Group(); scene.add(rig);     // position / scale
  const eye = new THREE.Group(); rig.add(eye);       // rotation
  const css = n => getComputedStyle(document.documentElement).getPropertyValue(n).trim();

  // --- eyeball: the photograph projected onto the front hemisphere
  const tex = new THREE.TextureLoader().load('assets/fundus.jpg');
  tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 8;
  const dir = (px, py) => { const x = (px / 960 - 0.5) / 0.485, y = (0.5 - py / 960) / 0.485; return new THREE.Vector3(x, y, Math.sqrt(Math.max(0, 1 - x * x - y * y))); };
  const ANCH = { disc: dir(152, 440), fovea: dir(486, 482), vessel: dir(556, 287) };
  const eyeMat = new THREE.ShaderMaterial({
    uniforms: { map: { value: tex }, uTime: { value: 0 }, uFovea: { value: ANCH.fovea }, uRim: { value: new THREE.Color('#ffb38a') } },
    vertexShader: `varying vec3 vN; varying vec3 vVN;
      void main(){ vN = normal; vVN = normalize(normalMatrix * normal); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: `uniform sampler2D map; uniform float uTime; uniform vec3 uFovea; uniform vec3 uRim; varying vec3 vN; varying vec3 vVN;
      void main(){
        vec3 n = normalize(vN);
        vec3 photo = texture2D(map, 0.5 + n.xy * 0.485).rgb;
        float front = smoothstep(-0.02, 0.22, n.z);
        vec3 back = mix(vec3(0.16, 0.035, 0.03), vec3(0.42, 0.11, 0.07), smoothstep(-1.0, 0.1, n.z));
        vec3 col = mix(back, photo, front);
        float d = acos(clamp(dot(n, normalize(uFovea)), -1.0, 1.0));
        float ph = fract(uTime * 0.11);
        float ring = smoothstep(0.045, 0.0, abs(d - ph * 1.5)) * (1.0 - ph);
        col += ring * vec3(1.0, 0.82, 0.5) * 0.26 * front;
        float fr = pow(1.0 - abs(vVN.z), 2.6);
        col = mix(col, uRim, fr * 0.55);
        col *= 0.82 + 0.18 * smoothstep(-0.4, 0.9, vVN.z);
        gl_FragColor = vec4(col, 1.0);
        #include <colorspace_fragment>
      }`,
  });
  eye.add(new THREE.Mesh(new THREE.SphereGeometry(1, 96, 96), eyeMat));

  // --- orbits with signals travelling along them
  const inkCol = new THREE.Color(css('--muted') || '#9299a3');
  const orbits = [];
  [[1.22, 0.5, 0.2, '--red'], [1.46, -0.9, 0.5, '--amber'], [1.74, 1.25, -0.35, '--teal']].forEach(([r, rx, rz, cv], i) => {
    const g = new THREE.Group(); g.rotation.set(rx, 0, rz);
    const pts = []; for (let k = 0; k <= 200; k++) { const a = k / 200 * Math.PI * 2; pts.push(new THREE.Vector3(Math.cos(a) * r, 0, Math.sin(a) * r)); }
    g.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), new THREE.LineBasicMaterial({ color: inkCol, transparent: true, opacity: 0.28 })));
    const dots = [];
    for (let k = 0; k < 2 + i; k++) { const m = new THREE.Mesh(new THREE.SphereGeometry(0.022, 12, 12), new THREE.MeshBasicMaterial({ color: new THREE.Color(css(cv) || '#f47067') })); g.add(m); dots.push([m, Math.random() * 6.28, (0.25 + Math.random() * 0.25) * (i % 2 ? -1 : 1)]); }
    rig.add(g); orbits.push({ g, r, dots });
  });

  // --- dust
  const N = 900, pos = new Float32Array(N * 3);
  for (let i = 0; i < N; i++) { const v = new THREE.Vector3().randomDirection().multiplyScalar(1.5 + Math.random() * 2.6); pos.set([v.x, v.y, v.z], i * 3); }
  const dustGeo = new THREE.BufferGeometry(); dustGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const dust = new THREE.Points(dustGeo, new THREE.PointsMaterial({ color: inkCol, size: 0.016, transparent: true, opacity: 0.55, sizeAttenuation: true }));
  rig.add(dust);

  // --- layout
  let W = 0, H = 0, baseX = 0, baseY = 0, baseS = 1;
  const resize = () => {
    W = hero.clientWidth; H = hero.clientHeight;
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2)); renderer.setSize(W, H, false);
    camera.aspect = W / H; camera.updateProjectionMatrix();
    const wide = W > 860;
    const halfH = Math.tan(THREE.MathUtils.degToRad(16)) * 6, halfW = halfH * camera.aspect;
    baseS = wide ? Math.min(1.08, halfW * 0.37) : Math.min(0.82, halfW * 0.72);
    baseX = wide ? halfW * 0.46 : 0; baseY = wide ? 0.05 : halfH * 0.42;
  };
  addEventListener('resize', resize); resize();

  // --- interaction: pointer parallax + drag with inertia
  const ptr = { x: 0, y: 0 }; let dragging = false, lx = 0, ly = 0, vx = 0, vy = 0, yaw = -0.42, pitch = 0.06;
  addEventListener('pointermove', e => { ptr.x = e.clientX / innerWidth * 2 - 1; ptr.y = e.clientY / innerHeight * 2 - 1;
    if (dragging) { vx = (e.clientX - lx) * 0.006; vy = (e.clientY - ly) * 0.006; yaw += vx; pitch += vy; lx = e.clientX; ly = e.clientY; } });
  canvas.addEventListener('pointerdown', e => { dragging = true; lx = e.clientX; ly = e.clientY; vx = vy = 0; });
  addEventListener('pointerup', () => { dragging = false; });

  // --- annotation tags
  const tags = [...document.querySelectorAll('.tag')].map(n => ({ n, v: ANCH[n.dataset.k] }));
  const wp = new THREE.Vector3(), wn = new THREE.Vector3(), toCam = new THREE.Vector3();
  const placeTags = () => tags.forEach(({ n, v }) => {
    wp.copy(v).multiplyScalar(1.005); eye.localToWorld(wp);
    wn.copy(v).transformDirection(eye.matrixWorld); toCam.copy(camera.position).sub(wp).normalize();
    const facing = wn.dot(toCam);
    wp.project(camera);
    n.style.transform = `translate(${(wp.x * 0.5 + 0.5) * W}px, ${(-wp.y * 0.5 + 0.5) * H}px)`;
    n.classList.toggle('on', facing > 0.3 && scrollY < H * 0.5);
  });

  const clock = new THREE.Clock(); let px = 0, py = 0, visible = true, intro = 0;
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; }).observe(hero);
  const frame = () => {
    const t = clock.getElapsedTime(), sc = Math.min(1, scrollY / Math.max(1, H));
    intro += (1 - intro) * 0.035;
    px += (ptr.x - px) * 0.05; py += (ptr.y - py) * 0.05;
    if (!dragging) { yaw += vx; pitch += vy; vx *= 0.94; vy *= 0.94; yaw += (-0.42 - yaw) * 0.012; pitch += (0.06 - pitch) * 0.012; }
    pitch = THREE.MathUtils.clamp(pitch, -1.1, 1.1);
    eye.rotation.y = yaw + Math.sin(t * 0.32) * 0.16 + px * 0.34 + sc * 1.5 + (1 - intro) * -2.2;
    eye.rotation.x = pitch + Math.cos(t * 0.27) * 0.05 + py * 0.2;
    rig.position.set(baseX, baseY + sc * 1.3, 0);
    rig.scale.setScalar(baseS * (0.55 + 0.45 * intro) * (1 - sc * 0.25));
    eyeMat.uniforms.uTime.value = t;
    orbits.forEach(({ g, r, dots }, i) => { g.rotation.y = t * 0.06 * (i % 2 ? -1 : 1) + px * 0.2; dots.forEach(d => { const a = d[1] + t * d[2]; d[0].position.set(Math.cos(a) * r, 0, Math.sin(a) * r); }); });
    dust.rotation.y = t * 0.018 + px * 0.08; dust.rotation.x = py * 0.05;
    canvas.style.opacity = String(1 - sc * 0.85);
    renderer.render(scene, camera);
    placeTags();
  };
  if (reduce) { intro = 1; tex.onUpdate = null; const once = () => { intro = 1; frame(); }; once(); setTimeout(once, 600); addEventListener('resize', once); }
  else renderer.setAnimationLoop(() => { if (visible) frame(); });
}
