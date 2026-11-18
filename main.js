(function () {
  'use strict';
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var AREAS = ['Multimodal medical AI', 'Retinal fundus imaging', 'ECG', 'Interpretable deep learning', 'Explainable AI', 'Biomedical NLP', 'Legal NLP', 'LLM evaluation', 'Temporal robustness', 'LLM agents', 'Inverse reinforcement learning'];

  /* ---------- clock (Patiala is on IST) */
  var clock = document.getElementById('clock');
  var fmt = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit' });
  var tick = function () { clock.textContent = fmt.format(new Date()); };
  tick(); setInterval(tick, 15000);

  /* ---------- top bar + reveals */
  var bar = document.getElementById('topbar');
  var io = new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { threshold: 0.15, rootMargin: '0px 0px -5% 0px' });
  document.querySelectorAll('.title, .rv').forEach(function (n) { io.observe(n); });

  /* ---------- cards: the lime fill grows from where the pointer enters */
  document.querySelectorAll('.card').forEach(function (c) {
    c.addEventListener('pointerenter', function (e) {
      var r = c.getBoundingClientRect();
      c.style.setProperty('--mx', (e.clientX - r.left) + 'px'); c.style.setProperty('--my', (e.clientY - r.top) + 'px');
    });
  });

  /* ---------- marquees driven by time and by how fast the page is scrolled */
  var bands = [].map.call(document.querySelectorAll('.mq'), function (m) {
    var inner = m.firstElementChild, html = AREAS.map(function (a) { return '<span>' + a + '</span>'; }).join('');
    inner.innerHTML = html + html;
    return { el: inner, speed: parseFloat(m.dataset.speed), x: 0, half: 0 };
  });
  var measure = function () { bands.forEach(function (b) { b.half = b.el.scrollWidth / 2; }); };
  measure(); addEventListener('resize', measure);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(measure);

  /* ---------- the name: text drawn to a texture, bent by a ripple that follows the pointer */
  var box = document.getElementById('name'), canvas = document.getElementById('gl'), gl = null;
  var mouse = { x: 0.5, y: 0.5, tx: 0.5, ty: 0.5, v: 0 };
  function initGL() {
    if (!window.THREE) return;
    var renderer;
    try { renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true, premultipliedAlpha: false }); } catch (e) { return; }
    var scene = new THREE.Scene(), cam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    var tc = document.createElement('canvas'), ctx = tc.getContext('2d'), tex = new THREE.CanvasTexture(tc);
    tex.minFilter = THREE.LinearFilter; tex.generateMipmaps = false;
    var mat = new THREE.ShaderMaterial({
      transparent: true,
      uniforms: { t: { value: tex }, m: { value: new THREE.Vector2(0.5, 0.5) }, v: { value: 0 }, time: { value: 0 }, asp: { value: 4 }, p: { value: reduce ? 1.2 : 0 } },
      vertexShader: 'varying vec2 u; void main(){ u = uv; gl_Position = vec4(position, 1.0); }',
      fragmentShader: [
        'precision highp float; uniform sampler2D t; uniform vec2 m; uniform float v, time, asp, p; varying vec2 u;',
        'void main(){',
        '  vec2 q = u; vec2 dl = (q - m) * vec2(asp, 1.0); float d = length(dl);',
        '  float rip = sin(d * 24.0 - time * 5.0) * exp(-d * 4.2) * (0.004 + v * 0.07);',
        '  q += normalize(dl + 1e-5) * rip / vec2(asp, 1.0);',
        '  q.x += sin(q.y * 7.0 + time * 0.9) * 0.0018;',
        '  float a = texture2D(t, q).a;',
        '  vec2 off = vec2(0.0035 + v * 0.03, -0.012 - v * 0.05);',
        '  float b = texture2D(t, q + off).a;',
        '  float rev = 1.0 - smoothstep(p - 0.12, p, u.y);',
        '  vec3 ink = vec3(0.957, 0.957, 0.937), lime = vec3(0.839, 1.0, 0.247);',
        '  gl_FragColor = vec4(mix(lime, ink, a), max(a, b) * rev);',
        '}'].join('\n')
    });
    scene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), mat));

    var draw = function () {
      var w = canvas.clientWidth || box.clientWidth, h = canvas.clientHeight || box.clientHeight * 1.16;
      if (!w || !h) return;
      renderer.setPixelRatio(Math.min(devicePixelRatio, 2)); renderer.setSize(w, h, false);
      tc.width = 2048; tc.height = Math.round(2048 * h / w);
      ctx.clearRect(0, 0, tc.width, tc.height);
      ctx.font = '400 100px Anton'; var mt = ctx.measureText('AKSHAT');
      var asc = mt.actualBoundingBoxAscent || 80, desc = mt.actualBoundingBoxDescent || 0;
      var s = Math.min(tc.width * 0.975 / mt.width, tc.height * 0.9 / (asc + desc));
      ctx.font = '400 ' + (100 * s) + 'px Anton'; ctx.fillStyle = '#fff'; ctx.textAlign = 'center';
      ctx.fillText('AKSHAT', tc.width / 2, tc.height / 2 + (asc - desc) * s / 2);
      // texture storage is fixed-size, so a resized canvas needs a fresh texture
      tex.dispose(); tex = new THREE.CanvasTexture(tc); tex.minFilter = THREE.LinearFilter; tex.generateMipmaps = false;
      mat.uniforms.t.value = tex; mat.uniforms.asp.value = w / h;
    };
    var ready = function () { draw(); box.classList.add('gl'); };
    if (document.fonts && document.fonts.load) document.fonts.load('400 100px Anton').then(ready, ready); else ready();
    addEventListener('resize', draw);
    box.addEventListener('pointermove', function (e) {
      var r = canvas.getBoundingClientRect();
      mouse.tx = (e.clientX - r.left) / r.width; mouse.ty = 1 - (e.clientY - r.top) / r.height;
    });
    gl = { renderer: renderer, scene: scene, cam: cam, mat: mat };
  }
  initGL();

  /* ---------- one loop for everything that moves */
  var last = performance.now(), lastY = scrollY, sv = 0, t0 = last, heroOn = true;
  new IntersectionObserver(function (e) { heroOn = e[0].isIntersecting; }).observe(box);
  function frame(now) {
    var dt = Math.min(0.05, (now - last) / 1000); last = now;
    var dy = scrollY - lastY; lastY = scrollY; sv += (dy / Math.max(dt, 0.001) - sv) * 0.12;
    bar.classList.toggle('on', scrollY > 40);
    bands.forEach(function (b) {
      if (!b.half) return;
      var dir = b.speed < 0 ? -1 : 1;
      b.x += (b.speed + dir * Math.abs(sv) * 0.35) * dt;
      b.x = ((b.x % b.half) + b.half) % b.half;
      b.el.style.transform = 'translate3d(' + (-b.x) + 'px,0,0) skewX(' + Math.max(-14, Math.min(14, -sv * 0.008 * dir)) + 'deg)';
    });
    if (gl && heroOn) {
      var px = mouse.x, py = mouse.y;
      mouse.x += (mouse.tx - mouse.x) * 0.12; mouse.y += (mouse.ty - mouse.y) * 0.12;
      var sp = Math.hypot(mouse.x - px, mouse.y - py) / Math.max(dt, 0.001);
      mouse.v += (Math.min(1, sp * 0.5) - mouse.v) * 0.08;
      var u = gl.mat.uniforms; u.m.value.set(mouse.x, mouse.y); u.v.value = mouse.v; u.time.value = (now - t0) / 1000;
      u.p.value = reduce ? 1.2 : Math.min(1.2, (now - t0) / 1000 * 0.95);   // reveal is tied to the clock, not the frame rate
      gl.renderer.render(gl.scene, gl.cam);
    }
    if (!reduce) requestAnimationFrame(frame);
  }
  if (reduce) { measure(); frame(performance.now()); setTimeout(function () { frame(performance.now()); }, 500); }
  else requestAnimationFrame(frame);
})();
