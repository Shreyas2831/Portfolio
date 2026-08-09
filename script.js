/* ==========================================================================
   Shreyas Gonjari — Portfolio
   Interactions: nav, reveal-on-scroll, hero bubble name, project card
   open/close, skill tilt, credentials, experience progress, back-to-top
   ========================================================================== */

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* split hero name into per-letter hoverable spans (bubble effect), line by line */
const heroName = document.getElementById('heroName');
if(heroName){
  heroName.querySelectorAll('.line').forEach(lineEl=>{
    const text = lineEl.dataset.line;
    lineEl.textContent = '';
    [...text].forEach(ch=>{
      const span = document.createElement('span');
      span.className = 'bl';
      span.textContent = ch === ' ' ? '\u00A0' : ch;
      lineEl.appendChild(span);
    });
  });
}

const isCoarse = window.matchMedia('(pointer: coarse)').matches;

/* reveal on scroll */
const revealEls = document.querySelectorAll('.reveal');
if('IntersectionObserver' in window){
  const io = new IntersectionObserver((entries)=>{
    entries.forEach(e=>{ if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { threshold: 0, rootMargin: '0px 0px 200px 0px' });
  revealEls.forEach(el=>io.observe(el));
  // safety net: a fast flick-scroll can carry an element straight past the
  // observed band without ever registering as intersecting — never leave
  // anything permanently invisible.
  setTimeout(()=>{ revealEls.forEach(el=>el.classList.add('in')); io.disconnect(); }, 2500);
} else { revealEls.forEach(el=>el.classList.add('in')); }

/* about: fade lines to dark as they enter view */
const fadeLines = document.querySelectorAll('.fade-line');
if('IntersectionObserver' in window){
  const fio = new IntersectionObserver((entries)=>{
    entries.forEach(e=>{ if(e.isIntersecting){ e.target.classList.add('lit'); } });
  }, { threshold: 0.2, rootMargin: '0px 0px 100px 0px' });
  fadeLines.forEach(el=>fio.observe(el));
  setTimeout(()=>{ fadeLines.forEach(el=>el.classList.add('lit')); fio.disconnect(); }, 3000);
} else { fadeLines.forEach(el=>el.classList.add('lit')); }

if(!reduceMotion && !isCoarse){
  /* custom cursor */
  const dot = document.getElementById('curDot');
  const ring = document.getElementById('curRing');
  let mx=innerWidth/2,my=innerHeight/2, rx=mx, ry=my;
  window.addEventListener('mousemove', (e)=>{ mx=e.clientX; my=e.clientY; dot.style.transform=`translate(${mx}px,${my}px) translate(-50%,-50%)`; });
  function ringLoop(){ rx += (mx-rx)*0.18; ry += (my-ry)*0.18; ring.style.transform=`translate(${rx}px,${ry}px) translate(-50%,-50%)`; requestAnimationFrame(ringLoop); }
  ringLoop();
  document.querySelectorAll('a,.tilt,.other-card,.cred-flip,.pflip').forEach(el=>{
    el.addEventListener('mouseenter', ()=>ring.classList.add('big'));
    el.addEventListener('mouseleave', ()=>ring.classList.remove('big'));
  });

  /* hero cursor glow */
  const heroSection = document.getElementById('heroSection');
  const heroGlow = document.getElementById('heroGlow');
  heroSection.addEventListener('mousemove', (e)=>{
    const r = heroSection.getBoundingClientRect();
    heroGlow.style.setProperty('--gx', ((e.clientX-r.left)/r.width*100)+'%');
    heroGlow.style.setProperty('--gy', ((e.clientY-r.top)/r.height*100)+'%');
  });

  /* skill card 3D tilt */
  document.querySelectorAll('.skill-card.tilt').forEach(card=>{
    card.addEventListener('mousemove', (e)=>{
      const r = card.getBoundingClientRect();
      const px = (e.clientX-r.left)/r.width - 0.5;
      const py = (e.clientY-r.top)/r.height - 0.5;
      card.style.transform = `rotateY(${px*14}deg) rotateX(${-py*14}deg) translateY(-2px)`;
    });
    card.addEventListener('mouseleave', ()=>{ card.style.transform = 'rotateY(0) rotateX(0)'; });
  });

  /* project card spotlight (mouse-follow glow) */
  document.querySelectorAll('.pflip-inner').forEach(card=>{
    card.addEventListener('mousemove', (e)=>{
      const r = card.getBoundingClientRect();
      card.style.setProperty('--mx', ((e.clientX-r.left)/r.width*100)+'%');
      card.style.setProperty('--my', ((e.clientY-r.top)/r.height*100)+'%');
    });
  });

  /* project card open/close on real pointer devices: hover */
  document.querySelectorAll('.pflip').forEach(card=>{
    card.addEventListener('mouseenter', ()=>card.classList.add('is-open'));
    card.addEventListener('mouseleave', ()=>card.classList.remove('is-open'));
  });

  /* magnetic buttons */
  document.querySelectorAll('.magnet').forEach(wrap=>{
    const btn = wrap.querySelector('a');
    wrap.addEventListener('mousemove', (e)=>{
      const r = wrap.getBoundingClientRect();
      const mx = e.clientX - (r.left+r.width/2);
      const my = e.clientY - (r.top+r.height/2);
      btn.style.transform = `translate(${mx*0.25}px, ${my*0.3}px)`;
    });
    wrap.addEventListener('mouseleave', ()=>{ btn.style.transform=''; });
  });
}

/* project card open/close on touch devices: tap toggles it. This is a
   single JS-managed class (.is-open), not :hover — touchscreens don't
   have real hover, and relying on simulated/stuck :hover was the root
   cause of cards showing images or staying "open" incorrectly on mobile. */
if(isCoarse){
  document.querySelectorAll('.pflip').forEach(card=>{
    card.addEventListener('click', ()=>{
      const wasOpen = card.classList.contains('is-open');
      document.querySelectorAll('.pflip.is-open').forEach(c=>{ if(c!==card) c.classList.remove('is-open'); });
      card.classList.toggle('is-open', !wasOpen);
    });
  });
}

/* experience scroll progress line */
const expWrap = document.getElementById('expWrap');
const expFill = document.getElementById('expFill');
const expCards = document.querySelectorAll('.exp-card');
function updateExpProgress(){
  const r = expWrap.getBoundingClientRect();
  const vh = window.innerHeight;
  const total = r.height;
  const visible = Math.min(Math.max(vh*0.75 - r.top, 0), total);
  const pct = total>0 ? (visible/total*100) : 0;
  expFill.style.height = pct+'%';
  expCards.forEach(c=>{
    const cr = c.getBoundingClientRect();
    if(cr.top < vh*0.75){ c.classList.add('passed'); } else { c.classList.remove('passed'); }
  });
}

/* nav: collapse to hamburger on scroll */
const siteHeader = document.getElementById('siteHeader');
const navToggle = document.getElementById('navToggle');
const navDrop = document.getElementById('navDrop');
function closeNavDrop(){
  navDrop.classList.remove('open');
  navToggle.classList.remove('open');
  navToggle.setAttribute('aria-expanded','false');
}
function updateNavScroll(){
  const scrolled = window.scrollY > 80;
  siteHeader.classList.toggle('scrolled', scrolled);
  if(!scrolled) closeNavDrop();
}
if(navToggle && navDrop){
  navToggle.addEventListener('click', ()=>{
    const open = navDrop.classList.toggle('open');
    navToggle.classList.toggle('open', open);
    navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
  navDrop.querySelectorAll('a').forEach(a=>a.addEventListener('click', closeNavDrop));
}

/* back-to-top button */
const backToTop = document.getElementById('backToTop');
function updateBackToTop(){
  backToTop.classList.toggle('show', window.scrollY > window.innerHeight * 0.6);
}
if(backToTop){
  backToTop.addEventListener('click', ()=>{
    window.scrollTo({ top:0, behavior: reduceMotion ? 'auto' : 'smooth' });
  });
}

/* single rAF-throttled scroll handler drives all three, instead of three
   independent unthrottled listeners — much lighter on mobile scroll perf */
let scrollTicking = false;
function onScrollFrame(){
  updateExpProgress();
  if(siteHeader) updateNavScroll();
  if(backToTop) updateBackToTop();
  scrollTicking = false;
}
window.addEventListener('scroll', ()=>{
  if(!scrollTicking){
    requestAnimationFrame(onScrollFrame);
    scrollTicking = true;
  }
}, { passive:true });
window.addEventListener('resize', updateExpProgress);
onScrollFrame();

