/**
 * Space Animation System
 * Creates a particle sphere in the hero section and background stars throughout the site
 * - Particle sphere with pulsing effect and mouse-following rotation (hero section only)
 * - Simple downward-moving stars on all pages
 */

// ==============================================
// VARIABLE DECLARATIONS & CONFIGURATION
// ==============================================

// Scene-related variables
let heroScene, bgScene, camera;  // The two separate scenes + shared camera
let heroRenderer, bgRenderer;    // Renderers for each scene
let particles, stars;            // The particle objects
let heroRafId = null;            // Request animation frame ID for hero animation
let bgRafId = null;              // Request animation frame ID for background animation

// Initialization flags
let heroInitialized = false;     // Whether hero animation has been initialized
let bgInitialized = false;       // Whether background animation has been initialized
let heroAnimationActive = false; // Whether hero animation is currently running

// Particle system configuration
const particlesCount = 1000;     // Number of particles in the sphere
const starsCount = 1000;         // Number of background stars
const particlesGeometry = new THREE.BufferGeometry();  // Geometry for particle sphere
const starsGeometry = new THREE.BufferGeometry();      // Geometry for background stars

// Buffers for particle positions and colors
const positions = new Float32Array(particlesCount * 3);  // XYZ positions for particles
const colors = new Float32Array(particlesCount * 3);     // RGB colors for particles
const starsPositions = new Float32Array(starsCount * 3); // XYZ positions for stars

// Animation settings
const rotationSpeed = 0.001;    // Base rotation speed for particle sphere
const defaultStarSpeed = 0.15;   // Default downward speed for background stars

// Mouse interaction
let mouse = new THREE.Vector2(0, 0);          // Current mouse position (normalized)
let targetRotation = new THREE.Vector2(0, 0); // Target rotation based on mouse position
let windowHalfX = window.innerWidth / 2;      // Half window width for mouse calculations
let windowHalfY = window.innerHeight / 2;     // Half window height for mouse calculations

// ==============================================
// INITIALIZATION FUNCTIONS
// ==============================================

/**
 * Initialize both animations
 * Entry point for the animation system
 */
function initAnimations() {
    // Initialize both animations separately
    initBackgroundStars();
    initHeroSphere();
    
    // Add global mouse event listener
    document.addEventListener('mousemove', onDocumentMouseMove);
}

/**
 * Initialize the background stars that appear throughout the site
 * Creates a fixed background with small stars that move downward
 */
function initBackgroundStars() {
    // Only initialize once
    if (bgInitialized) return;
    
    // Create scene for background
    bgScene = new THREE.Scene();
    
    // Create camera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000);
    camera.position.z = 1000;
    
    // Create renderer for background
    bgRenderer = new THREE.WebGLRenderer({ 
        alpha: true,
        antialias: true
    });
    bgRenderer.setSize(window.innerWidth, window.innerHeight);
    bgRenderer.setClearColor(0x000000, 0);
    
    // Add renderer to DOM as fixed background
    document.body.insertBefore(bgRenderer.domElement, document.body.firstChild);
    bgRenderer.domElement.style.position = 'fixed';
    bgRenderer.domElement.style.top = '0';
    bgRenderer.domElement.style.left = '0';
    bgRenderer.domElement.style.width = '100%';
    bgRenderer.domElement.style.height = '100%';
    bgRenderer.domElement.style.zIndex = '-1'; // Behind all content
    
    // Create stars that will appear throughout the site
    for (let i = 0; i < starsCount; i++) {
        const i3 = i * 3;
        
        // Random positions in a larger sphere
        const radius = 800 + Math.random() * 600;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        
        starsPositions[i3] = radius * Math.sin(phi) * Math.cos(theta);
        starsPositions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
        starsPositions[i3 + 2] = radius * Math.cos(phi);
    }
    
    starsGeometry.setAttribute('position', new THREE.BufferAttribute(starsPositions, 3));
    
    // Create stars material
    const starsMaterial = new THREE.PointsMaterial({
        size: 1.5,
        color: 0xffffff,
        transparent: true,
        opacity: 0.7,
        sizeAttenuation: true
    });
    
    // Create stars object
    stars = new THREE.Points(starsGeometry, starsMaterial);
    bgScene.add(stars);
    
    // Add event listener for window resize
    window.addEventListener('resize', onWindowResize);
    
    // Mark as initialized
    bgInitialized = true;
    
    // Start background animation
    animateBackground();
}

/**
 * Initialize the particle sphere that only appears in the hero section
 * Creates an interactive particle sphere with mouse-following rotation
 */
function initHeroSphere() {
    // Only initialize once
    if (heroInitialized) return;
    
    // Check if hero section exists
    const heroSection = document.getElementById('hero');
    if (!heroSection) {
        console.warn('Hero section not found. Hero animation will not be initialized.');
        return;
    }
    
    // Create scene for hero
    heroScene = new THREE.Scene();
    
    // Create renderer for hero
    heroRenderer = new THREE.WebGLRenderer({ 
        alpha: true,
        antialias: true
    });
    heroRenderer.setSize(window.innerWidth, window.innerHeight);
    heroRenderer.setClearColor(0x000000, 0);
    
    // Add renderer to hero section
    heroSection.insertBefore(heroRenderer.domElement, heroSection.firstChild);
    heroRenderer.domElement.style.position = 'absolute';
    heroRenderer.domElement.style.top = '0';
    heroRenderer.domElement.style.left = '0';
    heroRenderer.domElement.style.width = '100%';
    heroRenderer.domElement.style.height = '100%';
    heroRenderer.domElement.style.zIndex = '0';
    
    // Create particle sphere
    for (let i = 0; i < particlesCount; i++) {
        const i3 = i * 3;
        
        // Positions - create a sphere distribution
        const radius = 400 + Math.random() * 200;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        
        positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
        positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
        positions[i3 + 2] = radius * Math.cos(phi);
        
        // Colors - blue to cyan gradient
        colors[i3] = 0.2 + Math.random() * 0.3;     // R - low red component
        colors[i3 + 1] = 0.5 + Math.random() * 0.2; // G - medium green component
        colors[i3 + 2] = 0.8 + Math.random() * 0.3; // B - high blue component
    }
    
    // Set position and color attributes
    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    
    // Create particle material
    const particlesMaterial = new THREE.PointsMaterial({
        size: 3.0,
        vertexColors: true,
        transparent: true,
        opacity: 0.8,
        sizeAttenuation: true
    });
    
    // Create particles object
    particles = new THREE.Points(particlesGeometry, particlesMaterial);
    heroScene.add(particles);
    
    // Add event listener for scroll to check visibility
    window.addEventListener('scroll', checkHeroVisibility);
    
    // Mark as initialized
    heroInitialized = true;
    
    // Check visibility and start animation if in view
    checkHeroVisibility();
}

// ==============================================
// EVENT HANDLERS
// ==============================================

/**
 * Handle mouse movement
 * Updates mouse position for particle sphere rotation
 */
function onDocumentMouseMove(event) {
    // Update mouse position (normalized for rotation calculation)
    mouse.x = (event.clientX - windowHalfX) / 100;
    mouse.y = (event.clientY - windowHalfY) / 100;
}

/**
 * Handle window resize
 * Updates camera and renderers when window size changes
 */
function onWindowResize() {
    // Update window dimensions
    windowHalfX = window.innerWidth / 2;
    windowHalfY = window.innerHeight / 2;
    
    // Update camera
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    
    // Update both renderers if they exist
    if (bgRenderer) {
        bgRenderer.setSize(window.innerWidth, window.innerHeight);
    }
    
    if (heroRenderer) {
        heroRenderer.setSize(window.innerWidth, window.innerHeight);
    }
}

/**
 * Check if the hero section is visible
 * Starts/stops the hero animation based on visibility
 */
function checkHeroVisibility() {
    if (!heroInitialized) return;
    
    const heroSection = document.getElementById('hero');
    if (!heroSection) return;
    
    // Get hero section position relative to viewport
    const rect = heroSection.getBoundingClientRect();
    
    // Check if hero is at least partially visible
    // (considers element visible even when partially offscreen)
    const isVisible = (
        rect.top >= -rect.height && 
        rect.bottom <= window.innerHeight + rect.height
    );
    
    // Start/stop animation based on visibility
    if (isVisible && !heroAnimationActive) {
        startHeroAnimation();
    } 
    else if (!isVisible && heroAnimationActive) {
        stopHeroAnimation();
    }
}

// ==============================================
// ANIMATION CONTROL
// ==============================================

/**
 * Start the hero animation
 * Begins the particle sphere animation loop
 */
function startHeroAnimation() {
    if (heroAnimationActive) return;
    heroAnimationActive = true;
    animateHero();
}

/**
 * Stop the hero animation
 * Stops the particle sphere animation when not visible
 */
function stopHeroAnimation() {
    if (!heroAnimationActive) return;
    heroAnimationActive = false;
    if (heroRafId) {
        cancelAnimationFrame(heroRafId);
        heroRafId = null;
    }
}

// ==============================================
// ANIMATION LOOPS
// ==============================================

/**
 * Animation loop for hero particle sphere
 * Handles rotation, pulsing effect and rendering
 */
function animateHero() {
    if (!heroAnimationActive) return;
    heroRafId = requestAnimationFrame(animateHero);
    
    // Smooth rotation following mouse position
    targetRotation.x = mouse.y * 0.3;
    targetRotation.y = mouse.x * 0.3;
    
    // Gradually move toward target rotation
    particles.rotation.x += (targetRotation.x - particles.rotation.x) * 0.01;
    particles.rotation.y += (targetRotation.y - particles.rotation.y) * 0.01;
    
    // Continuous rotation
    particles.rotation.x += rotationSpeed;
    particles.rotation.y += rotationSpeed * 0.5;
    
    // Pulsate particles
    const time = Date.now() * 0.001; // Current time in seconds
    const particlePositions = particlesGeometry.attributes.position.array;
    
    for (let i = 0; i < particlesCount; i++) {
        const i3 = i * 3;
        const x = particlePositions[i3];
        const y = particlePositions[i3 + 1];
        const z = particlePositions[i3 + 2];
        
        // Distance from center
        const distance = Math.sqrt(x * x + y * y + z * z);
        
        // Pulse based on distance and time
        const pulseFactor = Math.sin(distance * 0.01 + time) * 4;
        
        // Apply pulse to particle position
        const normX = x / distance;
        const normY = y / distance;
        const normZ = z / distance;
        
        particlePositions[i3] = x + normX * pulseFactor;
        particlePositions[i3 + 1] = y + normY * pulseFactor;
        particlePositions[i3 + 2] = z + normZ * pulseFactor;
    }
    
    // Mark geometry for update
    particlesGeometry.attributes.position.needsUpdate = true;
    
    // Render hero scene
    heroRenderer.render(heroScene, camera);
}

/**
 * Animation loop for background stars
 * Moves stars downward and resets them when offscreen
 */
function animateBackground() {
    bgRafId = requestAnimationFrame(animateBackground);
    
    // Update star positions to move downward
    const starPositions = starsGeometry.attributes.position.array;
    
    for (let i = 0; i < starsCount; i++) {
        const i3 = i * 3;
        
        // Move star downward with slight speed variation for natural effect
        starPositions[i3 + 1] -= defaultStarSpeed + Math.random() * 0.1;
        
        // Reset star position when it goes off screen
        if (starPositions[i3 + 1] < -1000) {
            // Reset to top with random x and z positions
            const radius = 800 + Math.random() * 600;
            const theta = Math.random() * Math.PI * 2;
            
            starPositions[i3] = radius * Math.sin(theta);     // X position
            starPositions[i3 + 1] = 1000 + Math.random() * 500; // Y position (above the screen)
            starPositions[i3 + 2] = radius * Math.cos(theta); // Z position
        }
    }
    
    // Mark geometry for update
    starsGeometry.attributes.position.needsUpdate = true;
    
    // Render background scene
    bgRenderer.render(bgScene, camera);
}

// ==============================================
// INITIALIZATION
// ==============================================

// Initialize on page load
window.addEventListener('load', function() {
    if (typeof THREE !== 'undefined') {
        initAnimations();
    } else {
        console.warn('Three.js library not loaded. Please make sure it is included in your HTML.');
    }
});