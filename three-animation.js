


let heroScene, bgScene, camera;
let heroRenderer, bgRenderer;
let particles, stars;
let heroRafId = null;
let bgRafId = null;

let heroInitialized = false;
let bgInitialized = false;
let heroAnimationActive = false;

const particlesCount = 1000;
const starsCount = 1000;
const particlesGeometry = new THREE.BufferGeometry();
const starsGeometry = new THREE.BufferGeometry();

const positions = new Float32Array(particlesCount * 3);
const colors = new Float32Array(particlesCount * 3);
const starsPositions = new Float32Array(starsCount * 3);

const rotationSpeed = 0.001;
const defaultStarSpeed = 0.15;

let mouse = new THREE.Vector2(0, 0);
let targetRotation = new THREE.Vector2(0, 0);
let windowHalfX = window.innerWidth / 2;
let windowHalfY = window.innerHeight / 2;

// ============================================================
// MAIN
// ============================================================

function initAnimations() {
    initBackgroundStars();
    initHeroSphere();
    
    document.addEventListener('mousemove', onDocumentMouseMove);
}
// orignal idea was to make a way space/stars wraps around you depending on mouse movement but it just wasnt working and removed it.
//// followed this tutorial https://www.youtube.com/watch?v=k0npZq07afw 
function initBackgroundStars() {
    if (bgInitialized) return;
    
    bgScene = new THREE.Scene();
    
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000);
    camera.position.z = 1000;
    
    bgRenderer = new THREE.WebGLRenderer({ 
        alpha: true,
        antialias: true
    });
    bgRenderer.setSize(window.innerWidth, window.innerHeight);
    bgRenderer.setClearColor(0x000000, 0);
    
    document.body.insertBefore(bgRenderer.domElement, document.body.firstChild);
    bgRenderer.domElement.style.position = 'fixed';
    bgRenderer.domElement.style.top = '0';
    bgRenderer.domElement.style.left = '0';
    bgRenderer.domElement.style.width = '100%';
    bgRenderer.domElement.style.height = '100%';
    bgRenderer.domElement.style.zIndex = '-1';
    
    for (let i = 0; i < starsCount; i++) {
        const i3 = i * 3;
        
        const radius = 800 + Math.random() * 600;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        
        starsPositions[i3] = radius * Math.sin(phi) * Math.cos(theta);
        starsPositions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
        starsPositions[i3 + 2] = radius * Math.cos(phi);
    }
    
    starsGeometry.setAttribute('position', new THREE.BufferAttribute(starsPositions, 3));
    
    const starsMaterial = new THREE.PointsMaterial({
        size: 1.5,
        color: 0xffffff,
        transparent: true,
        opacity: 0.7,
        sizeAttenuation: true
    });
    
    stars = new THREE.Points(starsGeometry, starsMaterial);
    bgScene.add(stars);
    
    window.addEventListener('resize', onWindowResize);
    
    bgInitialized = true;
    
    animateBackground();
}
//// code taken and editted from 
/// https://www.youtube.com/watch?v=WNyDwW1KfF8
// https://www.youtube.com/watch?v=K3WCGUO1uu8

function initHeroSphere() {
    if (heroInitialized) return;
    
    const heroSection = document.getElementById('hero');
    if (!heroSection) {
        console.warn('Hero section not found. Hero animation will not be initialized.');
        return;
    }
    
    heroScene = new THREE.Scene();
    
    heroRenderer = new THREE.WebGLRenderer({ 
        alpha: true,
        antialias: true
    });
    heroRenderer.setSize(window.innerWidth, window.innerHeight);
    heroRenderer.setClearColor(0x000000, 0);
    
    heroSection.insertBefore(heroRenderer.domElement, heroSection.firstChild);
    heroRenderer.domElement.style.position = 'absolute';
    heroRenderer.domElement.style.top = '0';
    heroRenderer.domElement.style.left = '0';
    heroRenderer.domElement.style.width = '100%';
    heroRenderer.domElement.style.height = '100%';
    heroRenderer.domElement.style.zIndex = '0';
    
    for (let i = 0; i < particlesCount; i++) {
        const i3 = i * 3;
        
        const radius = 400 + Math.random() * 200;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        
        positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
        positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
        positions[i3 + 2] = radius * Math.cos(phi);
        
        colors[i3] = 0.2 + Math.random() * 0.3;
        colors[i3 + 1] = 0.5 + Math.random() * 0.2;
        colors[i3 + 2] = 0.8 + Math.random() * 0.3;
    }
    
    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    
    const particlesMaterial = new THREE.PointsMaterial({
        size: 3.0,
        vertexColors: true,
        transparent: true,
        opacity: 0.8,
        sizeAttenuation: true
    });
    
    particles = new THREE.Points(particlesGeometry, particlesMaterial);
    heroScene.add(particles);
    
    window.addEventListener('scroll', checkHeroVisibility);
    
    heroInitialized = true;
    
    checkHeroVisibility();
}

// ============================================================
// EVENT HANDLES
// ============================================================

function onDocumentMouseMove(event) {
    mouse.x = (event.clientX - windowHalfX) / 100;
    mouse.y = (event.clientY - windowHalfY) / 100;
}

function onWindowResize() {
    windowHalfX = window.innerWidth / 2;
    windowHalfY = window.innerHeight / 2;
    
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    
    if (bgRenderer) {
        bgRenderer.setSize(window.innerWidth, window.innerHeight);
    }
    
    if (heroRenderer) {
        heroRenderer.setSize(window.innerWidth, window.innerHeight);
    }
}

function checkHeroVisibility() {
    if (!heroInitialized) return;
    
    const heroSection = document.getElementById('hero');
    if (!heroSection) return;
    
    const rect = heroSection.getBoundingClientRect();
    
    const isVisible = (
        rect.top >= -rect.height && 
        rect.bottom <= window.innerHeight + rect.height
    );
    
    if (isVisible && !heroAnimationActive) {
        startHeroAnimation();
    } 
    else if (!isVisible && heroAnimationActive) {
        stopHeroAnimation();
    }
}

// ============================================================
// ANIM CONTROL
// ============================================================

function startHeroAnimation() {
    if (heroAnimationActive) return;
    heroAnimationActive = true;
    animateHero();
}

function stopHeroAnimation() {
    if (!heroAnimationActive) return;
    heroAnimationActive = false;
    if (heroRafId) {
        cancelAnimationFrame(heroRafId);
        heroRafId = null;
    }
}

// ============================================================
// ANIMATIONLOOPS 
// ============================================================

function animateHero() {
    if (!heroAnimationActive) return;
    heroRafId = requestAnimationFrame(animateHero);
    
    targetRotation.x = mouse.y * 0.3;
    targetRotation.y = mouse.x * 0.3;
    
    particles.rotation.x += (targetRotation.x - particles.rotation.x) * 0.01;
    particles.rotation.y += (targetRotation.y - particles.rotation.y) * 0.01;
    
    particles.rotation.x += rotationSpeed;
    particles.rotation.y += rotationSpeed * 0.5;
    
    const time = Date.now() * 0.001;
    const particlePositions = particlesGeometry.attributes.position.array;
    
    for (let i = 0; i < particlesCount; i++) {
        const i3 = i * 3;
        const x = particlePositions[i3];
        const y = particlePositions[i3 + 1];
        const z = particlePositions[i3 + 2];
        
        const distance = Math.sqrt(x * x + y * y + z * z);
        
        const pulseFactor = Math.sin(distance * 0.01 + time) * 4;
        
        const normX = x / distance;
        const normY = y / distance;
        const normZ = z / distance;
        
        particlePositions[i3] = x + normX * pulseFactor;
        particlePositions[i3 + 1] = y + normY * pulseFactor;
        particlePositions[i3 + 2] = z + normZ * pulseFactor;
    }
    
    particlesGeometry.attributes.position.needsUpdate = true;
    
    heroRenderer.render(heroScene, camera);
}

function animateBackground() {
    bgRafId = requestAnimationFrame(animateBackground);
    
    const starPositions = starsGeometry.attributes.position.array;
    
    for (let i = 0; i < starsCount; i++) {
        const i3 = i * 3;
        
        starPositions[i3 + 1] -= defaultStarSpeed + Math.random() * 0.1;
        
        if (starPositions[i3 + 1] < -1000) {
            const radius = 800 + Math.random() * 600;
            const theta = Math.random() * Math.PI * 2;
            
            starPositions[i3] = radius * Math.sin(theta);
            starPositions[i3 + 1] = 1000 + Math.random() * 500;
            starPositions[i3 + 2] = radius * Math.cos(theta);
        }
    }
    
    starsGeometry.attributes.position.needsUpdate = true;
    
    bgRenderer.render(bgScene, camera);
}

// ============================================================
// STARTUP
// ============================================================

window.addEventListener('load', function() {
    if (typeof THREE !== 'undefined') {
        initAnimations();
    } else {
        console.warn('Three.js library not loaded. Please make sure it is included in your HTML.');
    }
});