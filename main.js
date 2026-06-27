import './style.css';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

// Register ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);

// 1. Lenis Smooth Scroll Setup
const lenis = new Lenis({
  duration: 1.4,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  smoothWheel: true,
  touchMultiplier: 1.5,
  infinite: false
});

// Synchronize Lenis and ScrollTrigger
lenis.on('scroll', ScrollTrigger.update);

gsap.ticker.add((time) => {
  lenis.raf(time * 1000);
});
gsap.ticker.lagSmoothing(0);

// 2. Image Preloading & Canvas Sequence
const canvas = document.getElementById('hero-canvas');
const context = canvas.getContext('2d');

const totalFrames = 281;
const images = [];
const airpods = { frame: 0 };

// Construct padding for frames
function getFramePath(index) {
  const numStr = String(index).padStart(3, '0');
  return `all photos/ezgif-frame-${numStr}.jpg`;
}

// Preloader elements
const preloader = document.getElementById('preloader');
const percentSpan = document.querySelector('.loading-percentage');
const loadingLine = document.querySelector('.preloader-line');

let loadedCount = 0;

function preloadImages(callback) {
  for (let i = 1; i <= totalFrames; i++) {
    const img = new Image();
    img.src = getFramePath(i);
    img.onload = () => {
      loadedCount++;
      const progress = Math.round((loadedCount / totalFrames) * 100);
      percentSpan.textContent = `${progress}%`;
      loadingLine.style.width = `${progress}%`;
      
      if (loadedCount === totalFrames) {
        // Initialize the scroll experience first so the canvas draws the initial frame
        callback();
        gsap.to(preloader, {
          opacity: 0,
          duration: 1.2,
          ease: 'power2.out',
          onComplete: () => {
            preloader.style.display = 'none';
          }
        });
      }
    };
    img.onerror = () => {
      loadedCount++;
      if (loadedCount === totalFrames) {
        callback();
        gsap.to(preloader, {
          opacity: 0,
          duration: 1.2,
          ease: 'power2.out',
          onComplete: () => {
            preloader.style.display = 'none';
          }
        });
      }
    };
    images.push(img);
  }
}

// Aspect-ratio aware drawing (object-fit: cover for canvas)
function renderFrame(index) {
  const img = images[index];
  if (!img) return;
  
  const w = canvas.width;
  const h = canvas.height;
  const iw = img.width;
  const ih = img.height;
  
  const r = Math.max(w / iw, h / ih);
  const nw = iw * r;
  const nh = ih * r;
  
  const cx = (w - nw) * 0.5;
  const cy = (h - nh) * 0.5;
  
  context.clearRect(0, 0, w, h);
  context.drawImage(img, cx, cy, nw, nh);
}

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  renderFrame(Math.floor(airpods.frame));
}

// Initialize Timeline and Bind Scroll
function initScrollExperience() {
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);
  renderFrame(0);
  
  // Base Timeline
  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: '.hero-scroll-section',
      start: 'top top',
      end: '+=550%', // duration of pinning
      scrub: true,
      pin: true,
      anticipatePin: 1
    }
  });
  
  // 1. Frame sequence scrubbing (0 to 12s duration in GSAP)
  tl.to(airpods, {
    frame: totalFrames - 1,
    snap: 'frame',
    ease: 'none',
    duration: 12,
    onUpdate: () => {
      renderFrame(Math.floor(airpods.frame));
    }
  }, 0);
  
  // 2. Scroll Indicator fade out
  tl.to('.scroll-indicator', {
    opacity: 0,
    y: 20,
    duration: 0.8
  }, 0.2);
  
  // 3. Step 1 (Exterior) fade out
  tl.to('.step-1', {
    opacity: 0,
    y: -80,
    duration: 1.5,
    ease: 'power2.inOut'
  }, 1.8);
  
  // 4. Step 2 (Doors open) fade in & out
  tl.fromTo('.step-2', 
    { opacity: 0, y: 50, scale: 0.95 },
    { opacity: 1, y: 0, scale: 1, duration: 1.5, ease: 'power2.out' },
    3.0
  );
  tl.to('.step-2', {
    opacity: 0,
    y: -80,
    duration: 1.5,
    ease: 'power2.inOut'
  }, 5.0);
  
  // 5. Step 3 (Dining Hall) fade in & out
  tl.fromTo('.step-3', 
    { opacity: 0, y: 50, scale: 0.95 },
    { opacity: 1, y: 0, scale: 1, duration: 1.5, ease: 'power2.out' },
    6.2
  );
  tl.to('.step-3', {
    opacity: 0,
    y: -80,
    duration: 1.5,
    ease: 'power2.inOut'
  }, 8.2);
  
  // 6. Step 4 (Food Focus) fade in & out
  tl.fromTo('.step-4', 
    { opacity: 0, y: 50, scale: 0.95 },
    { opacity: 1, y: 0, scale: 1, duration: 1.5, ease: 'power2.out' },
    9.5
  );
  tl.to('.step-4', {
    opacity: 0,
    y: -80,
    duration: 1.5,
    ease: 'power2.inOut'
  }, 11.2);

  // 7. Cinematic camera push-in and blur at the very end of the scroll sequence (keeping image visible)
  tl.to('#hero-canvas', {
    scale: 1.15,
    filter: 'blur(15px)',
    duration: 1.5,
    ease: 'power1.out'
  }, 10.5);
  
  tl.to('.hero-overlays', {
    opacity: 0.2,
    duration: 1.5
  }, 10.5);
  
  // Initialize standard scroll triggers for content sections
  initContentTriggers();
}

// 3. Standard Scroll Animations for Other Sections
function initContentTriggers() {
  // Navbar Scrolled Glass effect
  window.addEventListener('scroll', () => {
    const header = document.querySelector('.navbar-header');
    if (window.scrollY > 60) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });

  // Pinned Signature Dishes Showcase
  const slides = gsap.utils.toArray('.showcase-slide');
  if (slides.length > 0) {
    const showcaseTL = ScrollTrigger.create({
      trigger: '.section-signature-showcase',
      start: 'top top',
      end: '+=320%', // slightly longer for smoother transition pacing
      pin: true,
      scrub: true,
      onUpdate: (self) => {
        const progress = self.progress;
        let activeIndex = 0;
        if (progress >= 0.33 && progress < 0.66) {
          activeIndex = 1;
        } else if (progress >= 0.66) {
          activeIndex = 2;
        }

        slides.forEach((slide, index) => {
          const img = slide.querySelector('.showcase-img');
          const wrapper = slide.querySelector('.showcase-image-wrapper');
          const content = slide.querySelectorAll('.showcase-badge, .showcase-tag, .showcase-description, .showcase-action');
          const titleEl = slide.querySelector('.showcase-title');
          
          if (index === activeIndex) {
            if (!slide.classList.contains('active')) {
              slide.classList.add('active');
              
              // Word-by-word reveal on title
              if (titleEl && !titleEl.dataset.splitDone) {
                const text = titleEl.textContent;
                titleEl.innerHTML = text.split(' ').map(word => 
                  `<span style="display:inline-block; overflow:hidden; vertical-align:bottom;">
                    <span class="showcase-word" style="display:inline-block; transform:translateY(100%);">${word}&nbsp;</span>
                  </span>`
                ).join('');
                titleEl.dataset.splitDone = 'true';
              }
              
              // Clip-path circle wipe reveal
              if (wrapper) {
                gsap.fromTo(wrapper,
                  { clipPath: 'circle(0% at 50% 50%)' },
                  { clipPath: 'circle(100% at 50% 50%)', duration: 1.4, ease: 'power3.inOut' }
                );
              }
              
              // Perspective morph and blur transition
              gsap.fromTo(img, 
                { scale: 1.35, rotation: -8, filter: 'blur(20px)' },
                { scale: 1.15, rotation: 2, filter: 'blur(0px)', duration: 1.6, ease: 'power2.out', overwrite: 'auto' }
              );
              
              // Reveal title words
              const innerWords = slide.querySelectorAll('.showcase-word');
              if (innerWords.length > 0) {
                gsap.fromTo(innerWords,
                  { translateY: '100%' },
                  { translateY: '0%', stagger: 0.06, duration: 0.85, ease: 'power3.out', overwrite: 'auto' }
                );
              }
              
              // Slide up description details
              gsap.fromTo(content,
                { opacity: 0, y: 25 },
                { opacity: 1, y: 0, stagger: 0.08, duration: 0.9, ease: 'power2.out', overwrite: 'auto' }
              );

              // Shift radial background spotlight
              const spotlight = slide.querySelector('.showcase-bg-spotlight');
              if (spotlight) {
                gsap.fromTo(spotlight,
                  { opacity: 0, scale: 0.75 },
                  { opacity: 1, scale: 1.25, duration: 1.8, ease: 'power2.out' }
                );
              }
            } else {
              // Smooth camera push-in zoom on scrub
              const segmentProgress = (progress - (index * 0.33)) / 0.33;
              gsap.set(img, {
                scale: 1.15 + Math.min(Math.max(segmentProgress * 0.12, 0), 0.12),
                rotation: 2 + (segmentProgress * 3.0)
              });
            }
          } else {
            if (slide.classList.contains('active')) {
              slide.classList.remove('active');
              
              if (wrapper) {
                gsap.to(wrapper, {
                  clipPath: 'circle(0% at 50% 50%)',
                  duration: 1.0,
                  ease: 'power3.inOut'
                });
              }
              gsap.to(img, {
                scale: 1.35,
                rotation: 8,
                filter: 'blur(20px)',
                duration: 1.0,
                ease: 'power3.inOut'
              });
              gsap.to(content, {
                opacity: 0,
                y: -15,
                duration: 0.8,
                overwrite: 'auto'
              });
            }
          }
        });
      }
    });
  }

  // Parallax on Signature showcase columns (Background & Foreground depth layers)
  gsap.to('.showcase-content-col', {
    yPercent: -12,
    ease: 'none',
    scrollTrigger: {
      trigger: '.section-signature-showcase',
      start: 'top bottom',
      end: 'bottom top',
      scrub: true
    }
  });
  gsap.to('.showcase-image-col', {
    yPercent: 8,
    ease: 'none',
    scrollTrigger: {
      trigger: '.section-signature-showcase',
      start: 'top bottom',
      end: 'bottom top',
      scrub: true
    }
  });

  // Dining Experience Line-by-line word reveal
  const expTitle = document.querySelector('.section-experience .section-title');
  if (expTitle) {
    const text = expTitle.textContent;
    expTitle.innerHTML = text.split(' ').map(word => 
      `<span style="display:inline-block; overflow:hidden; vertical-align:bottom;">
        <span class="word-reveal-span" style="display:inline-block; transform:translateY(100%);">${word}&nbsp;</span>
      </span>`
    ).join('');
    
    gsap.to('.word-reveal-span', {
      scrollTrigger: {
        trigger: '.section-experience',
        start: 'top 80%',
        toggleActions: 'play none none none'
      },
      y: '0%',
      duration: 0.85,
      stagger: 0.08,
      ease: 'power3.out'
    });
  }

  // Dining Experience Timeline Reveal
  gsap.from('.timeline-step', {
    scrollTrigger: {
      trigger: '.experience-timeline',
      start: 'top 85%'
    },
    opacity: 0,
    x: -25,
    stagger: 0.2,
    duration: 0.8,
    ease: 'power2.out'
  });
  
  // Dining Experience Split Parallax Images with clip-path mask wipes
  gsap.fromTo('.exp-photo', 
    { clipPath: 'inset(100% 0 0 0)', filter: 'blur(20px)', opacity: 0 },
    {
      scrollTrigger: {
        trigger: '.section-experience',
        start: 'top 80%',
        toggleActions: 'play none none none'
      },
      clipPath: 'inset(0% 0 0 0)',
      filter: 'blur(0px)',
      opacity: 1,
      duration: 1.5,
      stagger: 0.25,
      ease: 'power3.out'
    }
  );

  gsap.to('.exp-photo-1', {
    yPercent: -15,
    ease: 'none',
    scrollTrigger: {
      trigger: '.section-experience',
      start: 'top bottom',
      end: 'bottom top',
      scrub: true
    }
  });
  gsap.to('.exp-photo-2', {
    yPercent: 15,
    ease: 'none',
    scrollTrigger: {
      trigger: '.section-experience',
      start: 'top bottom',
      end: 'bottom top',
      scrub: true
    }
  });

  // Background light beams and orbs parallax (Visual Depth Layer)
  gsap.to('.ambient-glow-orb', {
    yPercent: -35,
    ease: 'none',
    scrollTrigger: {
      trigger: '.main-content',
      start: 'top bottom',
      end: 'bottom top',
      scrub: true
    }
  });
  gsap.to('.light-beam', {
    yPercent: -50,
    ease: 'none',
    scrollTrigger: {
      trigger: '.section-experience',
      start: 'top bottom',
      end: 'bottom top',
      scrub: true
    }
  });

  // Chef's Specials Horizontal Scroll Pinned Animation
  const track = document.querySelector('.specials-track');
  if (track) {
    const trackAnim = gsap.to(track, {
      scrollTrigger: {
        trigger: '.section-specials',
        start: 'top top',
        end: () => `+=${track.scrollWidth - window.innerWidth + 500}`,
        scrub: true,
        pin: true,
        anticipatePin: 1,
        invalidateOnRefresh: true
      },
      x: () => -(track.scrollWidth - window.innerWidth + 100),
      ease: 'none'
    });

    // Image zoom & absolute number parallax inside specials cards
    const specialCards = gsap.utils.toArray('.special-card');
    specialCards.forEach(card => {
      const img = card.querySelector('img');
      const num = card.querySelector('.special-number');
      const details = card.querySelectorAll('.special-details h3, .special-details p, .special-price');
      
      // Zoom card image on viewport horizontal crawl
      if (img) {
        gsap.fromTo(img, 
          { scale: 1.0 },
          {
            scale: 1.15,
            ease: 'none',
            scrollTrigger: {
              trigger: card,
              containerAnimation: trackAnim,
              start: 'left right',
              end: 'right left',
              scrub: true
            }
          }
        );
      }

      // Parallax drift on the background numbers
      if (num) {
        gsap.fromTo(num,
          { xPercent: 18 },
          {
            xPercent: -22,
            ease: 'none',
            scrollTrigger: {
              trigger: card,
              containerAnimation: trackAnim,
              start: 'left right',
              end: 'right left',
              scrub: true
            }
          }
        );
      }

      // Slide in card details on track enter
      if (details.length > 0) {
        gsap.fromTo(details,
          { opacity: 0.7, x: 20 },
          {
            opacity: 1,
            x: 0,
            stagger: 0.05,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: card,
              containerAnimation: trackAnim,
              start: 'left 85%',
              end: 'left 25%',
              scrub: true
            }
          }
        );
      }
    });
  }

  // Gallery Staggered Overlap Reveal using clip-path masks & blur transition
  gsap.fromTo('.gallery-item', 
    { clipPath: 'inset(100% 0 0 0)', filter: 'blur(20px)', y: 60 },
    {
      scrollTrigger: {
        trigger: '.gallery-stagger-layout',
        start: 'top 80%',
        toggleActions: 'play none none none'
      },
      clipPath: 'inset(0% 0 0 0)',
      filter: 'blur(0px)',
      y: 0,
      duration: 1.4,
      stagger: 0.18,
      ease: 'power3.out'
    }
  );

  // Gallery Column vertical offsets (Parallax Depth Layer)
  gsap.to('.item-left', {
    yPercent: -12,
    ease: 'none',
    scrollTrigger: {
      trigger: '.gallery-stagger-layout',
      start: 'top bottom',
      end: 'bottom top',
      scrub: true
    }
  });
  gsap.to('.item-right', {
    yPercent: 12,
    ease: 'none',
    scrollTrigger: {
      trigger: '.gallery-stagger-layout',
      start: 'top bottom',
      end: 'bottom top',
      scrub: true
    }
  });

  // Header and Reservation Box reveals
  const fadeUps = document.querySelectorAll('.section-header, .reservation-box');
  fadeUps.forEach(el => {
    gsap.from(el, {
      y: 40,
      opacity: 0,
      duration: 1.0,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: el,
        start: 'top 85%',
        toggleActions: 'play none none none'
      }
    });
  });

  // Active Navbar link highlight on scroll (ScrollSpy)
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('section[id], section-signature-showcase');
  
  window.addEventListener('scroll', () => {
    let current = 'home';
    const scrollPosition = window.scrollY + 160;
    
    if (window.scrollY > window.innerHeight) {
      // Check menu showcase
      const menuSec = document.getElementById('menu');
      if (menuSec) {
        const top = menuSec.getBoundingClientRect().top + window.scrollY;
        const height = menuSec.offsetHeight * 2.5; // accounts for pinned scroll height
        if (scrollPosition >= top && scrollPosition < top + height) {
          current = 'menu';
        }
      }
      
      const otherSections = document.querySelectorAll('section[id]:not(#menu)');
      otherSections.forEach(section => {
        const sectionTop = section.getBoundingClientRect().top + window.scrollY;
        const sectionHeight = section.offsetHeight;
        if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
          current = section.getAttribute('id');
        }
      });
    }
    
    navLinks.forEach(link => {
      link.classList.remove('active');
      const href = link.getAttribute('href');
      if (href === '#' && current === 'home') {
        link.classList.add('active');
      } else if (href === `#${current}`) {
        link.classList.add('active');
      }
    });
  });
}

// 4. Gallery Lightbox Logic
const galleryItems = document.querySelectorAll('.gallery-item');
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightbox-img');
const lightboxClose = document.querySelector('.lightbox-close');
const lightboxPrev = document.querySelector('.lightbox-prev');
const lightboxNext = document.querySelector('.lightbox-next');
const lightboxCaption = document.getElementById('lightbox-caption');

let currentGalleryIndex = 0;

function openLightbox(index) {
  currentGalleryIndex = index;
  const item = galleryItems[index];
  const img = item.querySelector('img');
  lightboxImg.src = img.src;
  
  const captionEl = item.querySelector('.gallery-caption');
  lightboxCaption.textContent = captionEl ? captionEl.textContent : (img.alt || 'Gallery View');
  
  lightbox.classList.add('active');
  lenis.stop(); // Disable scrolling when lightbox is active
}

function closeLightbox() {
  lightbox.classList.remove('active');
  lenis.start(); // Enable scrolling
}

galleryItems.forEach((item, index) => {
  item.addEventListener('click', () => openLightbox(index));
});

lightboxClose.addEventListener('click', closeLightbox);
lightbox.addEventListener('click', (e) => {
  if (e.target === lightbox) closeLightbox();
});

lightboxPrev.addEventListener('click', (e) => {
  e.stopPropagation();
  let prev = currentGalleryIndex - 1;
  if (prev < 0) prev = galleryItems.length - 1;
  openLightbox(prev);
});

lightboxNext.addEventListener('click', (e) => {
  e.stopPropagation();
  let next = currentGalleryIndex + 1;
  if (next >= galleryItems.length) next = 0;
  openLightbox(next);
});

window.addEventListener('keydown', (e) => {
  if (!lightbox.classList.contains('active')) return;
  if (e.key === 'Escape') closeLightbox();
  if (e.key === 'ArrowLeft') lightboxPrev.click();
  if (e.key === 'ArrowRight') lightboxNext.click();
});

// 5. Testimonial Carousel Auto-slide & Dot Selection
const slidesList = document.querySelectorAll('.testimonial-slide');
const dots = document.querySelectorAll('.dot');
let currentSlide = 0;
let slideInterval;

function showSlide(index) {
  slidesList.forEach(slide => slide.classList.remove('active'));
  dots.forEach(dot => dot.classList.remove('active'));
  
  slidesList[index].classList.add('active');
  dots[index].classList.add('active');
  currentSlide = index;
}

function nextSlide() {
  let next = currentSlide + 1;
  if (next >= slidesList.length) next = 0;
  showSlide(next);
}

function startSlideShow() {
  slideInterval = setInterval(nextSlide, 6000);
}

function stopSlideShow() {
  clearInterval(slideInterval);
}

dots.forEach(dot => {
  dot.addEventListener('click', () => {
    stopSlideShow();
    showSlide(parseInt(dot.dataset.slide));
    startSlideShow();
  });
});

startSlideShow();

// 6. Smooth Scroll Anchor Links using Lenis
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const targetId = this.getAttribute('href');
    if (targetId === '#') return;
    const targetEl = document.querySelector(targetId);
    if (targetEl) {
      let scrollOffset = -80;
      if (targetId === '#menu') {
        scrollOffset = 0; // pin alignment
      }
      lenis.scrollTo(targetEl, { offset: scrollOffset });
    }
  });
});

// 7. Mobile Menu Interaction
const menuToggle = document.querySelector('.menu-toggle');
const navMenu = document.querySelector('.nav-menu');

menuToggle.addEventListener('click', () => {
  menuToggle.classList.toggle('active');
  navMenu.classList.toggle('active');
});

document.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', () => {
    menuToggle.classList.remove('active');
    navMenu.classList.remove('active');
  });
});

// 8. Start Preloading
preloadImages(initScrollExperience);

// 9. Initialize Luxury Visual Effects
function initLuxuryEffects() {
  // 1. Custom Cursor trailing physics
  const cursorDot = document.querySelector('.custom-cursor-dot');
  const cursorGlow = document.querySelector('.custom-cursor-glow');
  
  if (cursorDot && cursorGlow) {
    let mouseX = 0, mouseY = 0;
    let dotX = 0, dotY = 0;
    let glowX = 0, glowY = 0;
    
    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    });
    
    gsap.ticker.add(() => {
      dotX += (mouseX - dotX) * 0.3;
      dotY += (mouseY - dotY) * 0.3;
      glowX += (mouseX - glowX) * 0.15;
      glowY += (mouseY - glowY) * 0.15;
      
      gsap.set(cursorDot, { x: dotX, y: dotY });
      gsap.set(cursorGlow, { x: glowX, y: glowY });
    });
    
    const refreshCursorHovers = () => {
      const hoverElements = document.querySelectorAll('a, button, .special-card, .gallery-item, .social-icon, select, input, textarea, .showcase-image-wrapper');
      hoverElements.forEach(el => {
        el.addEventListener('mouseenter', () => {
          cursorGlow.classList.add('hovered');
        });
        el.addEventListener('mouseleave', () => {
          cursorGlow.classList.remove('hovered');
        });
      });
    };
    refreshCursorHovers();
  }

  // 2. Scroll Progress Indicator
  const header = document.querySelector('.navbar-header');
  if (header) {
    const progBar = document.createElement('div');
    progBar.className = 'scroll-progress-bar';
    header.appendChild(progBar);
    
    window.addEventListener('scroll', () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = (scrollTop / docHeight) * 100;
      progBar.style.width = `${scrollPercent}%`;
    }, { passive: true });
  }

  // 3. 3D Tilt on Cards (Showcase Image Wrapper and Specials)
  const tiltCards = document.querySelectorAll('.showcase-image-wrapper, .special-card');
  tiltCards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      const rotateX = ((centerY - y) / centerY) * 8;
      const rotateY = ((x - centerX) / centerX) * 8;
      
      gsap.to(card, {
        rotateX: rotateX,
        rotateY: rotateY,
        transformPerspective: 800,
        duration: 0.3,
        ease: 'power2.out'
      });
    });
    
    card.addEventListener('mouseleave', () => {
      gsap.to(card, {
        rotateX: 0,
        rotateY: 0,
        duration: 0.6,
        ease: 'power2.out'
      });
    });
  });

  // 4. Magnetic Buttons
  const magneticButtons = document.querySelectorAll('.btn, .btn-reserve');
  magneticButtons.forEach(btn => {
    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      
      gsap.to(btn, {
        x: x * 0.3,
        y: y * 0.3,
        duration: 0.3,
        ease: 'power2.out'
      });
    });
    
    btn.addEventListener('mouseleave', () => {
      gsap.to(btn, {
        x: 0,
        y: 0,
        duration: 0.5,
        ease: 'elastic.out(1, 0.3)'
      });
    });
  });

  // 5. Canvas Steam Animation Overlay for Active Showcases
  initSteamCanvas();

  // 6. Reservation form Submission success modal
  const bookingForm = document.getElementById('booking-form');
  const successModal = document.getElementById('success-modal');
  const modalCloseBtn = document.querySelector('.modal-close');
  
  if (bookingForm && successModal) {
    bookingForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const nameVal = document.getElementById('name').value || 'Guest';
      const modalNameText = successModal.querySelector('.modal-name-text');
      if (modalNameText) {
        modalNameText.textContent = `Honored ${nameVal}`;
      }
      
      successModal.classList.add('active');
      lenis.stop(); // Disable scrolling
    });
    
    const closeModal = () => {
      successModal.classList.remove('active');
      bookingForm.reset();
      lenis.start(); // Enable scrolling
    };
    
    if (modalCloseBtn) {
      modalCloseBtn.addEventListener('click', closeModal);
    }
    successModal.addEventListener('click', (e) => {
      if (e.target === successModal) closeModal();
    });
  }
}

// 10. Canvas Steam Particle Rendering Function
function initSteamCanvas() {
  const canvases = document.querySelectorAll('.steam-canvas');
  canvases.forEach(canvas => {
    const ctx = canvas.getContext('2d');
    let particles = [];
    const maxParticles = 25;

    const resizeSteamCanvas = () => {
      canvas.width = canvas.parentElement.clientWidth;
      canvas.height = canvas.parentElement.clientHeight;
    };
    resizeSteamCanvas();
    window.addEventListener('resize', resizeSteamCanvas);

    class SteamParticle {
      constructor() {
        this.reset();
        this.y = Math.random() * canvas.height;
      }
      reset() {
        // Spawn steam from center table coordinates
        this.x = canvas.width / 2 + (Math.random() - 0.5) * 60;
        this.y = canvas.height * 0.75 + Math.random() * 20;
        this.size = Math.random() * 10 + 10;
        this.vx = (Math.random() - 0.5) * 0.8;
        this.vy = -(Math.random() * 0.8 + 0.6);
        this.alpha = 0.01;
        this.growth = Math.random() * 0.2 + 0.15;
        this.maxAlpha = Math.random() * 0.15 + 0.05;
        this.life = 0;
        this.maxLife = Math.random() * 100 + 80;
      }
      update() {
        this.x += this.vx;
        this.y += this.vy;
        this.size += this.growth;
        this.life++;

        // Fade in initially, then fade out near end of life
        if (this.life < 20) {
          this.alpha = (this.life / 20) * this.maxAlpha;
        } else {
          this.alpha = (1 - (this.life / this.maxLife)) * this.maxAlpha;
        }

        if (this.life >= this.maxLife || this.y < 50 || this.alpha <= 0) {
          this.reset();
        }
      }
      draw() {
        ctx.beginPath();
        // Steam gradient for soft realism
        const grad = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.size);
        grad.addColorStop(0, `rgba(248, 246, 242, ${this.alpha})`);
        grad.addColorStop(1, 'rgba(248, 246, 242, 0)');
        ctx.fillStyle = grad;
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Populate steam particles
    for (let i = 0; i < maxParticles; i++) {
      particles.push(new SteamParticle());
    }

    const renderSteam = () => {
      // Clear canvas with transparent color
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Only render if parent showcase slide is active
      const parentSlide = canvas.closest('.showcase-slide');
      if (parentSlide && parentSlide.classList.contains('active')) {
        particles.forEach(p => {
          p.update();
          p.draw();
        });
      }
      requestAnimationFrame(renderSteam);
    };
    renderSteam();
  });
}

initLuxuryEffects();
