const EMOJIS = ['😂','❤️','🔥'];
const fallbackData = [
  { num: '01', title: 'Dashboard Overview', desc: 'Real-time analytics and performance metrics at a glance.', gradient: 'linear-gradient(135deg, #1a0a2e, #2d1b69, #0f0c29)', iconColor: '#7b2ff7', icon: '📊' },
  { num: '02', title: 'Test Results', desc: 'Detailed test reports with pass/fail indicators and trends.', gradient: 'linear-gradient(135deg, #0a1628, #0c2340, #001a33)', iconColor: '#00e676', icon: '✅' },
  { num: '03', title: 'Performance Monitor', desc: 'Live tracking of speed, uptime, and response times.', gradient: 'linear-gradient(135deg, #1a0a0a, #3d0c0c, #2a0000)', iconColor: '#ff003c', icon: '⚡' },
  { num: '04', title: 'User Analytics', desc: 'Comprehensive user behavior insights and patterns.', gradient: 'linear-gradient(135deg, #0a1a1a, #003333, #001a1a)', iconColor: '#00bcd4', icon: '📈' },
  { num: '05', title: 'Alert Center', desc: 'Smart notifications and real-time alert management.', gradient: 'linear-gradient(135deg, #1a1000, #3d2800, #2a1a00)', iconColor: '#ff9800', icon: '🔔' },
  { num: '06', title: 'Settings & Config', desc: 'Fine-tune every parameter with precision controls.', gradient: 'linear-gradient(135deg, #0f0a1a, #1a1040, #0a0020)', iconColor: '#e040fb', icon: '⚙️' }
];
let screenshotData = [...fallbackData];

// ===== MUSKU BUGS DATA - yaha bugs edit karo (user bolega tab update karna) =====
const muskuBugs = [
  { id: 'BUG-001', title: 'Chat profile me S2 show hota hai', desc: 'Chat section me profile name/avatar me hamesha "S2" dikhta hai, chahe dusra user ho. Profile mapping ka issue hai.', severity: 'major', status: 'open', date: '2026-05-02' },
  { id: 'BUG-002', title: 'Color auto changes', desc: 'Theme / accent color apne aap change ho jata hai, bina user ke select kiye. Random gradient switch hota hai.', severity: 'major', status: 'open', date: '2026-05-02' },
  { id: 'BUG-003', title: 'Mobile lag problem', desc: 'Mobile device pe scrolling aur carousel me lag / jank feel hota hai, specially low-end phones pe.', severity: 'critical', status: 'open', date: '2026-05-02' },
  { id: 'BUG-004', title: 'Mobile live connection issue', desc: 'Mobile pe live connection kabhi-kabhi disconnect ho jata hai, reconnect karna padta hai. Network stable hone par bhi hota hai.', severity: 'critical', status: 'open', date: '2026-05-02' },
  { id: 'BUG-005', title: 'Some more issues', desc: 'Chhote-mote UI glitches, spacing aur animation me kabhi-kabhi flicker. Full audit ke baad fix kiya jayega.', severity: 'minor', status: 'open', date: '2026-05-02' }
];
// severity: 'critical' | 'major' | 'minor' | 'fixed'

function getCounts(idx) {
  function rand15to29() { return 15 + Math.floor(Math.random() * 15); }
  try {
    const v = JSON.parse(localStorage.getItem(`musku_react_${idx}`));
    if (v && typeof v['😂'] === 'number') {
      let needNew = false;
      const vals = EMOJIS.map(e => v[e]);
      const allSame = vals.every(val => val === vals[0]);
      const outOfRange = vals.some(val => val < 15 || val >= 30);
      if (allSame || outOfRange) needNew = true;
      else { for (const e of EMOJIS) { if ((v[e]||0) < 15) needNew = true; } }
      if (needNew) {
        let a,b,c; do { a=rand15to29(); b=rand15to29(); c=rand15to29(); } while (a===b && b===c);
        const nc = { '😂': a, '❤️': b, '🔥': c };
        localStorage.setItem(`musku_react_${idx}`, JSON.stringify(nc));
        return nc;
      }
      return v;
    }
  } catch {}
  let a,b,c; do { a=rand15to29(); b=rand15to29(); c=rand15to29(); } while (a===b && b===c);
  const randomCounts = { '😂': a, '❤️': b, '🔥': c };
  localStorage.setItem(`musku_react_${idx}`, JSON.stringify(randomCounts));
  return randomCounts;
}
function saveCounts(idx, counts) { localStorage.setItem(`musku_react_${idx}`, JSON.stringify(counts)); }
function emojiBarHtml(idx) {
  const c = getCounts(idx);
  return `<div class="emoji-bar" data-idx="${idx}">${EMOJIS.map(e=>`<button class="emoji-btn" data-emoji="${e}" data-idx="${idx}"><span>${e}</span><span class="emoji-count">${c[e]||0}</span></button>`).join('')}</div>`;
}
function handleEmojiClick(idx, emoji, btn) {
  const counts = getCounts(idx);
  counts[emoji] = (counts[emoji]||0) + 1;
  saveCounts(idx, counts);
  document.querySelectorAll(`.emoji-bar[data-idx="${idx}"] .emoji-btn[data-emoji="${emoji}"] .emoji-count`).forEach(el=> el.textContent = counts[emoji]);
  document.querySelectorAll(`.emoji-btn[data-idx="${idx}"][data-emoji="${emoji}"]`).forEach(b=> { b.classList.add('liked','reacting'); setTimeout(()=>b.classList.remove('reacting'),500); });
  const floatEl = document.createElement('span');
  floatEl.className = 'emoji-float';
  floatEl.textContent = emoji;
  btn.style.position = 'relative';
  btn.appendChild(floatEl);
  setTimeout(()=> floatEl.remove(), 900);
}

async function findImageSrc(index) {
  const folders = ['images'];
  const exts = ['png','jpg','jpeg','webp','gif','PNG','JPG','JPEG','WEBP'];
  for (const folder of folders) {
    for (const ext of exts) {
      const url = `${folder}/${index}.${ext}`;
      try {
        const res = await fetch(url, { method: 'HEAD' });
        if (res.ok) return url;
      } catch {}
    }
  }
  return null;
}

async function buildScreenshotData() {
  const MAX = 55;
  const checks = [];
  for (let i = 1; i <= MAX; i++) {
    checks.push(findImageSrc(i).then(src => ({ i, src })));
  }
  const results = await Promise.all(checks);
  const found = [];
  // keep sequential order, stop after gap of 2 misses after first found
  let consecutiveMiss = 0;
  for (const { i, src } of results.sort((a,b)=>a.i-b.i)) {
    if (src) {
      consecutiveMiss = 0;
      const fb = fallbackData[(i - 1) % fallbackData.length];
      found.push({ num: String(i).padStart(2,'0'), title: `Screenshot ${i}`, desc: `Preview ${i}`, gradient: fb.gradient, iconColor: fb.iconColor, icon: fb.icon, imgSrc: src });
    } else {
      if (found.length > 0) {
        consecutiveMiss++;
        if (consecutiveMiss >= 2) {
          // check if any later has src
          const hasLater = results.some(r => r.i > i && r.src);
          if (!hasLater) break;
        }
      }
    }
  }
  if (found.length > 0) {
    screenshotData = found;
    // rebuild UI with real images (instant fallback already shown)
    const needsRebuild = true;
    if (needsRebuild) {
      currentSlide = 0;
      mobileCurrentSlide = 0;
      generateSlides();
      // restart autoplay after rebuild
      clearInterval(autoPlayInterval);
      startAutoPlay();
    }
  }
}

let currentSlide = 0;
let mobileCurrentSlide = 0;
let autoPlayInterval;
let touchStartX = 0;
let touchEndX = 0;
let isDragging = false;
let startX = 0;

const slideTrack = document.getElementById('slideTrack');
const carouselDots = document.getElementById('carouselDots');
const mobileTrack = document.getElementById('mobileTrack');
const mobileDots = document.getElementById('mobileDots');
const screenshotCarousel = document.querySelector('.screenshot-carousel');

function imgHtml(item, isModal) {
  if (item.imgSrc) {
    return `<img src="${item.imgSrc}" alt="Screenshot ${item.num}" style="width:100%;height:100%;object-fit:cover;display:block;" loading="lazy" onerror="this.style.display='none'">`;
  }
  return '';
}

function openModal(index) {
  const item = screenshotData[index];
  const modal = document.getElementById('imgModal');
  const body = document.getElementById('imgModalBody');
  const counts = getCounts(index);
  const emojiBar = `<div class="emoji-bar" data-idx="${index}" style="position:relative;transform:none;left:auto;bottom:auto;margin-top:14px;">${EMOJIS.map(e=>`<button class="emoji-btn" data-emoji="${e}" data-idx="${index}"><span>${e}</span><span class="emoji-count">${counts[e]||0}</span></button>`).join('')}</div>`;
  if (item.imgSrc) {
    body.innerHTML = `
      <div class="modal-screen" style="background: #000; padding:0; overflow:hidden; min-height:auto;">
        <img src="${item.imgSrc}" alt="Screenshot ${item.num}" style="width:100%;height:auto;max-height:68vh;object-fit:contain;display:block;">
      </div>
      <div style="padding:12px; display:flex; justify-content:center; background: #111;">${emojiBar}</div>
      <p style="text-align:center; padding:8px; font-size:11px; color: rgba(255,255,255,0.35)">Screenshot ${item.num} / 0${screenshotData.length} • Tap outside to close</p>
    `;
  } else {
    body.innerHTML = `
      <div class="modal-screen" style="background: ${item.gradient}">
        <span class="modal-num">${item.num}</span>
        <div class="modal-icon" style="background: ${item.iconColor}22; color: ${item.iconColor}; border: 1px solid ${item.iconColor}30">${item.icon}</div>
        <h3 style="color: ${item.iconColor}">${item.title}</h3>
        <p>${item.desc}</p>
        <div style="margin-top:18px; width: 90%; height: 1px; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)"></div>
        <p style="margin-top:10px; font-size:11px; color: rgba(255,255,255,0.35)">Screenshot ${item.num} / 0${screenshotData.length}</p>
        ${emojiBar}
      </div>
    `;
  }
  body.querySelectorAll('.emoji-btn').forEach(btn=>{
    btn.addEventListener('click', (e)=>{
      e.stopPropagation();
      handleEmojiClick(index, btn.dataset.emoji, btn);
      // update count in modal also already done via global selector
    });
  });
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
  clearInterval(autoPlayInterval);
}
function closeModal() {
  const modal = document.getElementById('imgModal');
  modal.classList.remove('open');
  // keep body locked if menu still open
  if (!navLinks || !navLinks.classList.contains('active')) document.body.style.overflow = '';
  startAutoPlay();
}

function createSlideEl(item, i) {
  const slide = document.createElement('div');
  slide.className = 'slide';
  slide.dataset.index = i;
  if (item.imgSrc) {
    slide.innerHTML = `
      <div class="slide-bg" style="background: #000; padding:0;">
        <img src="${item.imgSrc}" alt="Screenshot ${item.num}" style="width:100%;height:100%;object-fit:cover;display:block;" loading="lazy">
        <span style="position:absolute; bottom:46px; left:50%; transform:translateX(-50%); background:rgba(0,0,0,0.6); backdrop-filter:blur(6px); padding:4px 10px; border-radius:20px; font-size:11px; font-weight:600; color:#fff; border:1px solid rgba(255,255,255,0.15);">${item.num}</span>
      </div>
      ${emojiBarHtml(i)}
    `;
  } else {
    slide.innerHTML = `
      <div class="slide-bg" style="background: ${item.gradient}">
        <span class="slide-number">${item.num}</span>
        <div class="screen-mockup">
          <div class="screen-notch"></div>
          <div class="screen-content">
            <div class="mockup-icon" style="background: ${item.iconColor}20; color: ${item.iconColor}">${item.icon}</div>
            <h4 style="color: ${item.iconColor}">${item.title}</h4>
            <p>${item.desc}</p>
          </div>
        </div>
      </div>
      ${emojiBarHtml(i)}
    `;
  }
  slide.addEventListener('click', () => {
    if (pcDragged) return;
    if (i === currentSlide) openModal(i);
    else goToSlide(i);
  });
  slide.querySelectorAll('.emoji-btn').forEach(btn=>{
    btn.addEventListener('click', (e)=>{
      e.stopPropagation();
      handleEmojiClick(i, btn.dataset.emoji, btn);
    });
  });
  return slide;
}

function generateSlides() {
  slideTrack.innerHTML = '';
  mobileTrack.innerHTML = '';
  carouselDots.innerHTML = '';
  mobileDots.innerHTML = '';

  const lastItem = screenshotData[screenshotData.length - 1];
  const firstItem = screenshotData[0];
  const cloneLast = createSlideEl(lastItem, screenshotData.length - 1);
  cloneLast.dataset.clone = 'last';
  slideTrack.appendChild(cloneLast);

  screenshotData.forEach((item, i) => {
    const slide = createSlideEl(item, i);
    slideTrack.appendChild(slide);

    const mobileSlide = document.createElement('div');
    mobileSlide.className = 'mobile-slide';
    if (item.imgSrc) {
      mobileSlide.innerHTML = `
        <div class="mobile-slide-inner" style="background:#000; padding:0; overflow:hidden;">
          <img src="${item.imgSrc}" alt="Screenshot ${item.num}" style="width:100%;height:320px;object-fit:cover;display:block;" loading="lazy">
          <div style="position:absolute; bottom:56px; left:50%; transform:translateX(-50%); background:rgba(0,0,0,0.65); padding:4px 12px; border-radius:20px; font-size:12px; font-weight:700; color:#fff; border:1px solid rgba(255,255,255,0.15);">${item.num}</div>
          ${emojiBarHtml(i)}
        </div>
      `;
    } else {
      mobileSlide.innerHTML = `
        <div class="mobile-slide-inner" style="background: ${item.gradient}">
          <span class="mobile-slide-number">${item.num}</span>
          <div class="mobile-screen">
            <div class="mobile-notch"></div>
            <div class="mobile-screen-content">
              <div class="mobile-icon" style="color: ${item.iconColor}">${item.icon}</div>
              <h4 style="color: ${item.iconColor}">${item.title}</h4>
              <p>${item.desc}</p>
            </div>
          </div>
          <div class="mobile-slide-info">
            <h3>${item.title}</h3>
            <p>${item.desc}</p>
          </div>
          ${emojiBarHtml(i)}
        </div>
      `;
    }
    const mobileInner = mobileSlide.querySelector('.mobile-slide-inner');
    mobileInner.style.cursor = 'pointer';
    mobileInner.addEventListener('click', () => openModal(i));
    mobileSlide.querySelectorAll('.emoji-btn').forEach(btn=>{
      btn.addEventListener('click', (e)=>{
        e.stopPropagation();
        handleEmojiClick(i, btn.dataset.emoji, btn);
      });
    });
    mobileTrack.appendChild(mobileSlide);
  });

  const cloneFirst = createSlideEl(firstItem, 0);
  cloneFirst.dataset.clone = 'first';
  slideTrack.appendChild(cloneFirst);
  slideTrack.insertBefore(cloneLast, slideTrack.firstChild);

  for (let i = 0; i < screenshotData.length; i++) {
    const dot = document.createElement('button');
    dot.className = `carousel-dot${i === 0 ? ' active' : ''}`;
    dot.onclick = () => goToSlide(i);
    carouselDots.appendChild(dot);

    const mDot = document.createElement('button');
    mDot.className = `mobile-dot${i === 0 ? ' active' : ''}`;
    mDot.onclick = () => mobileGoToSlide(i);
    mobileDots.appendChild(mDot);
  }
  updateCarousel();
}

function moveSlide(dir) {
  currentSlide = (currentSlide + dir + screenshotData.length) % screenshotData.length;
  updateCarousel();
  resetAutoPlay();
}

function goToSlide(index) {
  currentSlide = index;
  updateCarousel();
  resetAutoPlay();
}

function updateCarousel() {
  const slides = document.querySelectorAll('.slide');
  const slideWidth = 300;
  const gap = 22;
  const viewportWidth = screenshotCarousel ? screenshotCarousel.clientWidth : 900;
  const centerOffset = (viewportWidth / 2) - (slideWidth / 2);
  const extendedIndex = currentSlide + 1;
  const translateX = centerOffset - extendedIndex * (slideWidth + gap);
  slideTrack.style.transform = `translateX(${translateX}px)`;

  slides.forEach((slide, pos) => {
    slide.classList.remove('active', 'prev-slide', 'next-slide');
    let realIndex;
    if (pos === 0) realIndex = screenshotData.length - 1;
    else if (pos === slides.length - 1) realIndex = 0;
    else realIndex = pos - 1;
    if (realIndex === currentSlide) slide.classList.add('active');
    else if (realIndex === (currentSlide - 1 + screenshotData.length) % screenshotData.length) slide.classList.add('prev-slide');
    else if (realIndex === (currentSlide + 1) % screenshotData.length) slide.classList.add('next-slide');
  });

  document.querySelectorAll('.carousel-dot').forEach((dot, i) => {
    dot.classList.toggle('active', i === currentSlide);
  });
}

function startAutoPlay() {
  clearInterval(autoPlayInterval);
  autoPlayInterval = setInterval(() => {
    currentSlide = (currentSlide + 1) % screenshotData.length;
    updateCarousel();
  }, 3500);
}

function resetAutoPlay() {
  clearInterval(autoPlayInterval);
  startAutoPlay();
}

// Desktop drag/swipe
let pcStartX = 0, pcIsDragging = false, pcDragged = false, pcStartTranslate = 0;

function getPcTranslateX() {
  const style = window.getComputedStyle(slideTrack);
  const t = style.transform;
  if (t === 'none') return 0;
  try {
    const matrix = new DOMMatrixReadOnly(t);
    return matrix.m41;
  } catch {
    const m = t.match(/matrix.*\((.+)\)/);
    if (m) return parseFloat(m[1].split(', ')[4]) || 0;
    return 0;
  }
}

if (screenshotCarousel) {
  screenshotCarousel.addEventListener('mousedown', (e) => {
    pcIsDragging = true; pcDragged = false;
    pcStartX = e.clientX;
    pcStartTranslate = getPcTranslateX();
    slideTrack.style.transition = 'none';
    screenshotCarousel.style.cursor = 'grabbing';
  });
  window.addEventListener('mouseup', (e) => {
    if (!pcIsDragging) return;
    pcIsDragging = false;
    slideTrack.style.transition = '';
    screenshotCarousel.style.cursor = 'grab';
    const diff = e.clientX - pcStartX;
    if (Math.abs(diff) > 60) {
      pcDragged = true;
      if (diff < 0) moveSlide(1);
      else moveSlide(-1);
      setTimeout(() => pcDragged = false, 150);
    } else {
      updateCarousel();
    }
  });
  window.addEventListener('mousemove', (e) => {
    if (!pcIsDragging) return;
    const diff = e.clientX - pcStartX;
    if (Math.abs(diff) > 8) pcDragged = true;
    slideTrack.style.transform = `translateX(${pcStartTranslate + diff}px)`;
  });

  screenshotCarousel.addEventListener('touchstart', (e) => {
    pcIsDragging = true; pcDragged = false;
    pcStartX = e.touches[0].clientX;
    pcStartTranslate = getPcTranslateX();
    slideTrack.style.transition = 'none';
  }, { passive: true });
  screenshotCarousel.addEventListener('touchmove', (e) => {
    if (!pcIsDragging) return;
    const diff = e.touches[0].clientX - pcStartX;
    if (Math.abs(diff) > 8) pcDragged = true;
    slideTrack.style.transform = `translateX(${pcStartTranslate + diff}px)`;
  }, { passive: true });
  screenshotCarousel.addEventListener('touchend', (e) => {
    if (!pcIsDragging) return;
    pcIsDragging = false;
    slideTrack.style.transition = '';
    const endX = e.changedTouches[0].clientX;
    const diff = endX - pcStartX;
    if (Math.abs(diff) > 50) {
      pcDragged = true;
      if (diff < 0) moveSlide(1);
      else moveSlide(-1);
      setTimeout(() => pcDragged = false, 150);
    } else {
      updateCarousel();
    }
  });
  window.addEventListener('resize', updateCarousel);
}

function mobileMove(dir) {
  mobileCurrentSlide = (mobileCurrentSlide + dir + screenshotData.length) % screenshotData.length;
  updateMobileCarousel();
}
function mobileGoToSlide(index) {
  mobileCurrentSlide = index;
  updateMobileCarousel();
}
function updateMobileCarousel() {
  mobileTrack.style.transform = `translateX(-${mobileCurrentSlide * 100}%)`;
  document.querySelectorAll('.mobile-dot').forEach((dot, i) => {
    dot.classList.toggle('active', i === mobileCurrentSlide);
  });
}

document.getElementById('mobileCarousel').addEventListener('touchstart', (e) => {
  touchStartX = e.touches[0].clientX;
  isDragging = true;
}, { passive: true });
document.getElementById('mobileCarousel').addEventListener('touchmove', (e) => {
  touchEndX = e.touches[0].clientX;
}, { passive: true });
document.getElementById('mobileCarousel').addEventListener('touchend', () => {
  isDragging = false;
  const diff = touchStartX - touchEndX;
  if (Math.abs(diff) > 50) {
    if (diff > 0) mobileMove(1);
    else mobileMove(-1);
  }
});
document.getElementById('mobileCarousel').addEventListener('mousedown', (e) => {
  startX = e.pageX;
  isDragging = true;
  mobileTrack.style.cursor = 'grabbing';
});
document.getElementById('mobileCarousel').addEventListener('mouseleave', () => {
  isDragging = false;
  mobileTrack.style.cursor = 'grab';
});
document.getElementById('mobileCarousel').addEventListener('mouseup', (e) => {
  isDragging = false;
  mobileTrack.style.cursor = 'grab';
  const diff = startX - e.pageX;
  if (Math.abs(diff) > 50) {
    if (diff > 0) mobileMove(1);
    else mobileMove(-1);
  }
});
document.getElementById('mobileCarousel').addEventListener('mousemove', (e) => {
  if (!isDragging) return;
  e.preventDefault();
  const walk = (e.pageX - startX) * 1.5;
  mobileTrack.style.transform = `translateX(calc(-${mobileCurrentSlide * 100}% - ${walk}px))`;
});

// Musk Button Ripple (removed with TRY MUSKU button - safe guard)
const muskBtnEl = document.getElementById('muskBtn');
if (muskBtnEl) {
  muskBtnEl.addEventListener('click', function (e) {
    const rect = this.getBoundingClientRect();
    const ripple = document.createElement('span');
    ripple.className = 'ripple';
    const size = Math.max(rect.width, rect.height);
    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = (e.clientX - rect.left - size / 2) + 'px';
    ripple.style.top = (e.clientY - rect.top - size / 2) + 'px';
    this.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600);
  });
}

// Header scroll
window.addEventListener('scroll', () => {
  const header = document.getElementById('header');
  if (window.scrollY > 50) header.classList.add('scrolled');
  else header.classList.remove('scrolled');
});

// Hamburger menu - right side, only open on tap
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('navLinks');
const navBackdrop = document.getElementById('navBackdrop');

function closeMenu() {
  hamburger.classList.remove('active');
  navLinks.classList.remove('active');
  if (navBackdrop) navBackdrop.classList.remove('active');
  // only clear overflow if modal is not open
  const modal = document.getElementById('imgModal');
  if (!modal || !modal.classList.contains('open')) document.body.style.overflow = '';
}
function openMenu() {
  hamburger.classList.add('active');
  navLinks.classList.add('active');
  if (navBackdrop) navBackdrop.classList.add('active');
  document.body.style.overflow = 'hidden';
}
// ensure closed on load (fix humesha on issue)
closeMenu();

hamburger.addEventListener('click', (e) => {
  e.stopPropagation();
  if (navLinks.classList.contains('active')) closeMenu();
  else openMenu();
});
if (navBackdrop) navBackdrop.addEventListener('click', closeMenu);
document.querySelectorAll('.nav-links a').forEach(link => {
  link.addEventListener('click', closeMenu);
});
// close on Escape
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && navLinks.classList.contains('active')) closeMenu();
});
// close if resized to desktop
window.addEventListener('resize', () => {
  if (window.innerWidth > 768) closeMenu();
});

// Scroll reveal
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => { if (entry.isIntersecting) entry.target.classList.add('active'); });
}, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

// Grass card - stable (no tilt), only pause autoplay on hover
const grassCard = document.querySelector('.grass-card');
if (grassCard) {
  grassCard.addEventListener('mouseenter', () => clearInterval(autoPlayInterval));
  grassCard.addEventListener('mouseleave', () => startAutoPlay());
}

// ===== BUG MODAL LOGIC =====
function sevClass(s) {
  if (s === 'critical') return 'sev-critical';
  if (s === 'major') return 'sev-major';
  if (s === 'fixed') return 'sev-fixed';
  return 'sev-minor';
}
function sevLabel(s) {
  if (s === 'critical') return 'Critical';
  if (s === 'major') return 'Major';
  if (s === 'fixed') return 'Fixed';
  return 'Minor';
}
function bugAccent(sev) {
  if (sev === 'critical') return '#ff003c';
  if (sev === 'major') return '#ff9800';
  if (sev === 'fixed') return '#7b2ff7';
  return '#00e676';
}
function renderBugList() {
  const list = document.getElementById('bugList');
  const badge = document.getElementById('bugCountBadge');
  const total = document.getElementById('bugTotalCount');
  if (!list) return;
  const count = muskuBugs.length;
  if (badge) badge.textContent = count;
  if (total) total.textContent = count === 0 ? 'No bugs' : count + (count === 1 ? ' bug' : ' bugs');
  if (count === 0) {
    list.innerHTML = '<div class="bug-empty"><i class="fas fa-check-circle" style="font-size:28px; color:#00e676; display:block; margin-bottom:10px;"></i> Koi bug nahi! Sab clean hai.</div>';
    return;
  }
  list.innerHTML = muskuBugs.map(b => {
    const accent = bugAccent(b.severity);
    return `<div class="bug-item" style="--bug-accent:${accent}; --bug-accent-bg:${accent}18; --bug-accent-border:${accent}30">
      <div class="bug-item-head">
        <span class="bug-item-id">${b.id}</span>
        <span class="bug-item-severity ${sevClass(b.severity)}">${sevLabel(b.severity)}</span>
      </div>
      <div class="bug-item-title">${b.title}</div>
      <div class="bug-item-desc">${b.desc}</div>
      <div class="bug-item-meta">
        <span><i class="fas fa-calendar-alt"></i> ${b.date}</span>
        <span><i class="fas fa-info-circle"></i> ${b.status}</span>
      </div>
    </div>`;
  }).join('');
}
function openBugModal() {
  renderBugList();
  const m = document.getElementById('bugModal');
  if (m) { m.classList.add('open'); document.body.style.overflow = 'hidden'; clearInterval(autoPlayInterval); }
}
function closeBugModal() {
  const m = document.getElementById('bugModal');
  if (m) m.classList.remove('open');
  const imgM = document.getElementById('imgModal');
  if (!navLinks || !navLinks.classList.contains('active')) {
    if (!imgM || !imgM.classList.contains('open')) document.body.style.overflow = '';
  }
  startAutoPlay();
}

function initBugModal() {
  renderBugList();
  const bugBtn = document.getElementById('muskuBugBtn');
  const bugModal = document.getElementById('bugModal');
  const bugBackdrop = document.getElementById('bugModalBackdrop');
  const bugClose = document.getElementById('bugModalClose');
  const bugOk = document.getElementById('bugModalOk');
  if (bugBtn && !bugBtn._bugBound) { bugBtn.addEventListener('click', openBugModal); bugBtn._bugBound = true; }
  if (bugBackdrop && !bugBackdrop._bugBound) { bugBackdrop.addEventListener('click', closeBugModal); bugBackdrop._bugBound = true; }
  if (bugClose && !bugClose._bugBound) { bugClose.addEventListener('click', closeBugModal); bugClose._bugBound = true; }
  if (bugOk && !bugOk._bugBound) { bugOk.addEventListener('click', closeBugModal); bugOk._bugBound = true; }
  if (bugModal && !bugModal._bugBound) { bugModal.addEventListener('click', (e) => { if (e.target.id === 'bugModal') closeBugModal(); }); bugModal._bugBound = true; }
}
document.addEventListener('DOMContentLoaded', initBugModal);
if (document.readyState !== 'loading') initBugModal();
else setTimeout(initBugModal, 0);
// Escape for bug modal (global)
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    const bm = document.getElementById('bugModal');
    if (bm && bm.classList.contains('open')) closeBugModal();
  }
});

// Modal events
document.getElementById('imgModalBackdrop').addEventListener('click', closeModal);
document.getElementById('imgModalClose').addEventListener('click', closeModal);
document.getElementById('imgModal').addEventListener('click', (e) => {
  if (e.target.id === 'imgModal') closeModal();
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    const m = document.getElementById('imgModal');
    if (m.classList.contains('open')) closeModal();
  }
});

// Initialize - instant fallback, then upgrade with real images (local only, no DB)
generateSlides();
startAutoPlay();
buildScreenshotData();
