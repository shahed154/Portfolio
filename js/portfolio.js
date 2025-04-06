/**
 * Dynamic Portfolio Content Loader
 * This script loads project and code snippet data from JSON files and populates the DOM
 */

// Global store for loaded data
const portfolioData = {
    projects: null,
    codeSnippets: null
  };
  
  /**
   * Initialize portfolio content
   */
  document.addEventListener('DOMContentLoaded', async () => {
    try {
      // Load data
      await Promise.all([
        loadProjects(),
        loadCodeSnippets()
      ]);
      
      // Render content
      renderProjects();
      renderCodeSnippets();
      
      // Initialize interactions
      initializeDetailsToggle();
      initializeAnimations();
      hljs.highlightAll();
      
    } catch (error) {
      console.error('Failed to initialize portfolio:', error);
    }
  });
  
  /**
   * Load project data from JSON file
   */
  async function loadProjects() {
    try {
      const response = await fetch('data/projects.json');
      if (!response.ok) throw new Error('Failed to load projects data');
      portfolioData.projects = await response.json();
    } catch (error) {
      console.error('Error loading projects:', error);
      // Fallback content if loading fails
      document.querySelector('#projects .container').innerHTML = '<p class="error">Failed to load projects. Please refresh the page or try again later.</p>';
    }
  }
  
  /**
   * Load code snippet data from JSON file
   */
  async function loadCodeSnippets() {
    try {
      const response = await fetch('data/code-snippets.json');
      if (!response.ok) throw new Error('Failed to load code snippets data');
      portfolioData.codeSnippets = await response.json();
    } catch (error) {
      console.error('Error loading code snippets:', error);
      // Fallback content if loading fails
      document.querySelector('#code .container').innerHTML = '<p class="error">Failed to load code snippets. Please refresh the page or try again later.</p>';
    }
  }
  
  /**
   * Render projects to the DOM
   */
  function renderProjects() {
    if (!portfolioData.projects) return;
    
    // Game development projects
    renderProjectSection(
      portfolioData.projects.gameProjects, 
      '#projects .section-subtitle:first-of-type + .projects-grid'
    );
    
    // Web development projects
    renderProjectSection(
      portfolioData.projects.webProjects, 
      '#projects .section-subtitle:last-of-type + .projects-grid'
    );
  }
  
  /**
   * Render a section of projects
   * @param {Array} projects - Array of project objects
   * @param {string} selector - CSS selector for target container
   */
  function renderProjectSection(projects, selector) {
    const container = document.querySelector(selector);
    if (!container) return;
    
    // Clear existing content
    container.innerHTML = '';
    
    // Add project cards
    projects.forEach(project => {
      const projectCard = createProjectCard(project);
      container.appendChild(projectCard);
    });
  }
  
  /**
   * Create a project card element
   * @param {Object} project - Project data object
   * @return {HTMLElement} - The project card element
   */
  function createProjectCard(project) {
    const card = document.createElement('div');
    card.className = 'project-card animate';
    card.innerHTML = `
      <img src="${project.image}" alt="${project.title}" class="project-img">
      <div class="project-content">
        <h3 class="project-title">${project.title}</h3>
        <p class="project-description">${project.description}</p>
        
        <div class="project-tags">
          ${project.tags.map(tag => `<span class="project-tag">${tag}</span>`).join('')}
        </div>
        
        <div class="project-links">
          ${project.links.map(link => {
            return `<a href="${link.url}" ${link.url.startsWith('http') ? 'target="_blank"' : ''} class="project-${link.type}">${link.text}</a>`;
          }).join('')}
        </div>
        
        <details class="project-details" id="project-details-${project.id}">
          <summary>Project Details</summary>
          <div class="details-content">
            ${createProjectDetails(project)}
          </div>
        </details>
      </div>
    `;
    
    return card;
  }
  
  /**
   * Create project details HTML
   * @param {Object} project - Project data object
   * @return {string} - HTML for project details
   */
  function createProjectDetails(project) {
    if (!project.details) return '';
    
    let detailsHTML = '';
    
    // Overview
    if (project.details.overview) {
      detailsHTML += `
        <div class="game-feature">
          <div class="feature-title">Project Overview</div>
          <p>${project.details.overview}</p>
        </div>
      `;
    }
    
    // Features
    if (project.details.features && project.details.features.length) {
      detailsHTML += `
        <div class="game-feature">
          <div class="feature-title">Key Features</div>
          <ul>
            ${project.details.features.map(feature => `<li>${feature}</li>`).join('')}
          </ul>
        </div>
      `;
    }
    
    // How to play (for games)
    if (project.details.howToPlay && project.details.howToPlay.length) {
      detailsHTML += `
        <div class="game-feature">
          <div class="feature-title">How To Play</div>
          <ul>
            ${project.details.howToPlay.map(step => `<li>${step}</li>`).join('')}
          </ul>
        </div>
      `;
    }
    
    // Gallery
    if (project.details.gallery && project.details.gallery.length) {
      detailsHTML += `
        <div class="game-feature">
          <div class="feature-title">Media Gallery</div>
          <div class="game-demo-grid">
            ${project.details.gallery.map(item => `
              <div class="gallery-item">
                <img src="${item.image}" alt="${item.caption || ''}">
                ${item.caption ? `<div class="gallery-caption">${item.caption}</div>` : ''}
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }
    
    return detailsHTML;
  }
  
  /**
   * Render code snippets to the DOM
   */
  function renderCodeSnippets() {
    if (!portfolioData.codeSnippets) return;
    
    // Game development code snippets
    renderCodeSnippetSection(
      portfolioData.codeSnippets.gameSnippets, 
      '#code .section-subtitle:first-of-type'
    );
    
    // Web development code snippets
    renderCodeSnippetSection(
      portfolioData.codeSnippets.webSnippets, 
      '#code .section-subtitle:last-of-type'
    );
  }
  
  /**
   * Render a section of code snippets
   * @param {Array} snippets - Array of code snippet objects
   * @param {string} selector - CSS selector for target container
   */
  function renderCodeSnippetSection(snippets, selector) {
    const container = document.querySelector(selector);
    if (!container) return;
    
    // Clear any existing snippets
    while (container.nextElementSibling && container.nextElementSibling.tagName === 'DETAILS') {
      container.nextElementSibling.remove();
    }
    
    // Add code snippet details elements
    snippets.forEach(snippet => {
      const snippetElement = createCodeSnippet(snippet);
      container.insertAdjacentElement('afterend', snippetElement);
    });
  }
  
  /**
   * Create a code snippet details element
   * @param {Object} snippet - Code snippet data object
   * @return {HTMLElement} - The details element
   */
  function createCodeSnippet(snippet) {
    const details = document.createElement('details');
    details.id = `snippet-${snippet.id}`;
    
    details.innerHTML = `
      <summary>${snippet.title}</summary>
      <div class="details-content">
        <div class="code-description">
          ${snippet.description}
        </div>
        
        <div class="code-snippet">
          <pre><code class="language-${snippet.language}">${escapeHtml(snippet.code)}</code></pre>
        </div>
        
        ${snippet.externalLink ? `
          <div class="external-link">
            <a href="${snippet.externalLink.url}" target="_blank" class="external-code-link">
              <i class="${snippet.externalLink.icon}"></i> ${snippet.externalLink.text}
            </a>
          </div>
        ` : ''}
      </div>
    `;
    
    return details;
  }
  
  /**
   * Initialize details toggle functionality
   */
  function initializeDetailsToggle() {
    document.querySelectorAll('details').forEach(detail => {
      const content = detail.querySelector('.details-content');
      if (content) {
        detail.addEventListener('toggle', () => {
          if (detail.open) {
            content.style.maxHeight = content.scrollHeight + 'px';
            content.style.opacity = '1';
            
            // Scroll into view after opening
            setTimeout(() => {
              const headerHeight = document.querySelector('header').offsetHeight;
              const detailsTop = detail.getBoundingClientRect().top + window.pageYOffset - headerHeight - 20;
              window.scrollTo({
                top: detailsTop,
                behavior: 'smooth'
              });
            }, 100);
            
            // Re-highlight code when details is opened
            const codeBlocks = detail.querySelectorAll('pre code');
            if (codeBlocks.length > 0) {
              codeBlocks.forEach(block => {
                hljs.highlightElement(block);
              });
            }
          } else {
            content.style.maxHeight = '0';
            content.style.opacity = '0';
          }
        });
      }
    });
  }
  
  /**
   * Initialize animations
   */
  function initializeAnimations() {
    const observerOptions = {
      threshold: 0.25,
      rootMargin: '0px 0px -100px 0px'
    };
  
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.animation = 'fadeIn 0.8s ease-in-out forwards';
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);
  
    document.querySelectorAll('.animate').forEach(element => {
      observer.observe(element);
    });
  }
  
  /**
   * Utility function to escape HTML
   * @param {string} html - String that may contain HTML
   * @return {string} - Escaped HTML string
   */
  function escapeHtml(html) {
    const div = document.createElement('div');
    div.textContent = html;
    return div.innerHTML;
  }