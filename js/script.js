// DOM Elements
const videoUrlInput = document.getElementById('video-url');
const getThumbnailBtn = document.getElementById('get-thumbnail');
const thumbnailsContainer = document.querySelector('.thumbnails-container');
const loader = document.getElementById('loader');
const errorMessage = document.getElementById('error-message');
const results = document.getElementById('results');
const themeToggle = document.getElementById('theme-toggle');
const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.nav-links');
const accordionItems = document.querySelectorAll('.accordion-item');

// Configuration
const LOADING_DELAY = 18000; // 18 seconds loading delay
const DEFAULT_FILENAME = "RAO RAMZAN YT DOWNLOADER";

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Initialize theme based on saved preference
    initTheme();
    
    // Initialize animations
    animateOnScroll();
    
    // Initialize lazy loading
    lazyLoadImages();
    
    // Get thumbnail button
    if (getThumbnailBtn) {
        getThumbnailBtn.addEventListener('click', handleGetThumbnail);
    }
    
    // Enter key in input field
    if (videoUrlInput) {
        videoUrlInput.addEventListener('keyup', (e) => {
            if (e.key === 'Enter') {
                handleGetThumbnail();
            }
        });
    }
    
    // Example URL click handler
    const exampleLinks = document.querySelectorAll('.url-example');
    exampleLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            if (videoUrlInput) {
                videoUrlInput.value = link.dataset.url;
                handleGetThumbnail();
            }
        });
    });
    
    // Accordion functionality
    const accordionHeaders = document.querySelectorAll('.accordion-header');
    accordionHeaders.forEach(header => {
        header.addEventListener('click', () => {
            const accordionItem = header.parentElement;
            accordionItem.classList.toggle('active');
        });
    });
    
    // Theme toggle
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }
    
    // Mobile menu
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    
    if (hamburger && navLinks) {
        hamburger.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            hamburger.classList.toggle('active');
        });
    }
});

// Initialize theme based on saved preference
function initTheme() {
    const savedTheme = localStorage.getItem('dark-mode');
    if (savedTheme === 'true') {
        document.body.classList.add('dark-mode');
        updateThemeIcons(true);
    } else {
        updateThemeIcons(false);
    }
}

// Toggle theme function
function toggleTheme() {
    const isDarkMode = document.body.classList.toggle('dark-mode');
    localStorage.setItem('dark-mode', isDarkMode);
    updateThemeIcons(isDarkMode);
    
    // Show toast notification
    const message = isDarkMode ? 'Dark mode enabled' : 'Light mode enabled';
    showToast(message, 'info');
}

// Update theme icons visibility
function updateThemeIcons(isDarkMode) {
    const themeToggles = document.querySelectorAll('.theme-toggle');
    
    themeToggles.forEach(toggle => {
        const moonIcon = toggle.querySelector('.fa-moon');
        const sunIcon = toggle.querySelector('.fa-sun');
        
        if (isDarkMode) {
            moonIcon.style.display = 'none';
            sunIcon.style.display = 'inline-block';
        } else {
            moonIcon.style.display = 'inline-block';
            sunIcon.style.display = 'none';
        }
    });
}

// Initialize Loading Progress Bar
function initLoadingProgress() {
    const progressBar = document.getElementById('loading-progress');
    if (progressBar) {
        progressBar.value = 0;
    }
}

// Update Loading Progress
function updateLoadingProgress(percent) {
    const progressBar = document.getElementById('loading-progress');
    const progressText = document.getElementById('progress-text');
    
    if (progressBar) {
        progressBar.value = percent;
    }
    
    if (progressText) {
        progressText.textContent = `${Math.round(percent)}%`;
    }
}

// Add animation to elements when they come into view
function animateOnScroll() {
    const elements = document.querySelectorAll('.animate-on-scroll');
    const staggerContainers = document.querySelectorAll('.stagger-animation');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });
    
    elements.forEach(element => {
        observer.observe(element);
    });
    
    const staggerObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate');
                staggerObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });
    
    staggerContainers.forEach(container => {
        staggerObserver.observe(container);
    });
}

// Lazy load images for better performance
function lazyLoadImages() {
    const lazyImages = document.querySelectorAll('img[data-src]');
    
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.add('loaded');
                    imageObserver.unobserve(img);
                }
            });
        });
        
        lazyImages.forEach(img => {
            imageObserver.observe(img);
        });
    } else {
        // Fallback for browsers that don't support IntersectionObserver
        lazyImages.forEach(img => {
            img.src = img.dataset.src;
            img.classList.add('loaded');
        });
    }
}

// Handle Get Thumbnail
function handleGetThumbnail() {
    const videoUrl = videoUrlInput.value.trim();
    
    if (!videoUrl) {
        showError('Please enter a YouTube video URL');
        return;
    }
    
    const videoId = extractVideoId(videoUrl);
    
    if (!videoId) {
        showError('Invalid YouTube URL. Please enter a valid YouTube video URL');
        return;
    }
    
    showLoader();
    hideError();
    
    // Clear previous results
    if (thumbnailsContainer) {
        thumbnailsContainer.innerHTML = '';
    }
    
    // Simulate loading with progress
    simulateLoading(videoId);
}

// Simulate loading with progress bar
function simulateLoading(videoId) {
    const loadingProgress = document.getElementById('loading-progress');
    const progressText = document.getElementById('progress-text');
    
    if (!loadingProgress || !progressText) {
        // Fallback if elements don't exist
        setTimeout(() => {
            hideLoader();
            getThumbnails(videoId);
        }, LOADING_DELAY);
        return;
    }
    
    let progress = 0;
    const interval = 100; // Update every 100ms
    const steps = LOADING_DELAY / interval;
    const increment = 100 / steps;
    
    const progressInterval = setInterval(() => {
        progress += increment;
        const roundedProgress = Math.min(Math.round(progress), 100);
        loadingProgress.value = roundedProgress;
        progressText.textContent = `${roundedProgress}%`;
        
        if (roundedProgress >= 100) {
            clearInterval(progressInterval);
            setTimeout(() => {
                hideLoader();
                getThumbnails(videoId);
            }, 500);
        }
    }, interval);
}

// Extract Video ID from URL
function extractVideoId(url) {
    // Regular expressions to match different YouTube URL formats
    const regexps = [
        /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([^&]+)/i,
        /(?:https?:\/\/)?(?:www\.)?youtube\.com\/embed\/([^?]+)/i,
        /(?:https?:\/\/)?(?:www\.)?youtube\.com\/v\/([^?]+)/i,
        /(?:https?:\/\/)?(?:www\.)?youtube\.com\/user\/[^\/]+\/?\?v=([^&]+)/i,
        /(?:https?:\/\/)?(?:www\.)?youtu\.be\/([^?]+)/i,
        /(?:https?:\/\/)?(?:www\.)?youtube\.com\/shorts\/([^?]+)/i
    ];
    
    for (const regexp of regexps) {
        const match = url.match(regexp);
        if (match && match[1]) {
            return match[1];
        }
    }
    
    return null;
}

// Get Thumbnails
function getThumbnails(videoId) {
    const thumbnailQualities = [
        { name: 'Standard Quality (450p)', url: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`, size: '450p' },
        { name: 'HD Quality (760p)', url: `https://img.youtube.com/vi/${videoId}/sddefault.jpg`, size: '760p' },
        { name: 'Full HD (1080p)', url: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`, size: '1080p' },
        { name: '2K Quality', url: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`, size: '2K' },
        { name: '4K Quality', url: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`, size: '4K' }
    ];
    
    // Fetch video title using oEmbed API
    fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch video title');
            }
            return response.json();
        })
        .then(data => {
            const videoTitle = data.title;
            
            // Create main preview section first
            if (thumbnailsContainer) {
                // Clear previous results
                thumbnailsContainer.innerHTML = '';
                
                // Create main preview section
                const previewSection = createMainPreviewSection(thumbnailQualities[2], videoTitle);
                thumbnailsContainer.appendChild(previewSection);
                
                // Create format options section
                const formatOptionsSection = createFormatOptionsSection(thumbnailQualities, videoTitle);
                thumbnailsContainer.appendChild(formatOptionsSection);
            }
            
            // Show results section
            const resultsSection = document.getElementById('results');
            if (resultsSection) {
                resultsSection.style.display = 'block';
            }
            
            // Initialize lazy loading for the new images
            lazyLoadImages();
            
            // Re-initialize animations for the new elements
            animateOnScroll();
            
            // Show success message
            showToast('Thumbnails loaded successfully!', 'success');
        })
        .catch(error => {
            console.error('Error fetching video title:', error);
            
            // Create main preview section first with default title
            if (thumbnailsContainer) {
                // Clear previous results
                thumbnailsContainer.innerHTML = '';
                
                // Create main preview section
                const previewSection = createMainPreviewSection(thumbnailQualities[2], 'YouTube Video');
                thumbnailsContainer.appendChild(previewSection);
                
                // Create format options section
                const formatOptionsSection = createFormatOptionsSection(thumbnailQualities, 'YouTube Video');
                thumbnailsContainer.appendChild(formatOptionsSection);
            }
            
            // Show results section
            const resultsSection = document.getElementById('results');
            if (resultsSection) {
                resultsSection.style.display = 'block';
            }
            
            // Initialize lazy loading for the new images
            lazyLoadImages();
            
            // Re-initialize animations for the new elements
            animateOnScroll();
            
            // Show warning message
            showToast('Thumbnails loaded, but video title could not be fetched.', 'info');
        });
}

// Create main preview section with large thumbnail
function createMainPreviewSection(thumbnail, videoTitle) {
    const section = document.createElement('div');
    section.className = 'main-preview-section';
    
    const heading = document.createElement('h2');
    heading.className = 'section-heading';
    heading.textContent = 'Thumbnail Preview';
    
    const imageContainer = document.createElement('div');
    imageContainer.className = 'main-thumbnail-container';
    
    const img = document.createElement('img');
    img.className = 'main-thumbnail-img lazy-load';
    img.dataset.src = thumbnail.url;
    img.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1 1"%3E%3C/svg%3E';
    img.alt = `${videoTitle} - ${thumbnail.name}`;
    
    const titleDisplay = document.createElement('div');
    titleDisplay.className = 'video-title-display';
    titleDisplay.textContent = videoTitle;
    
    imageContainer.appendChild(img);
    
    section.appendChild(heading);
    section.appendChild(imageContainer);
    section.appendChild(titleDisplay);
    
    return section;
}

// Create format options section with all qualities and formats
function createFormatOptionsSection(thumbnailQualities, videoTitle) {
    const section = document.createElement('div');
    section.className = 'format-options-section';
    
    const heading = document.createElement('h2');
    heading.className = 'section-heading';
    heading.textContent = 'Download Options';
    
    const optionsContainer = document.createElement('div');
    optionsContainer.className = 'format-options-container';
    
    // Create a tab for each quality
    const tabsContainer = document.createElement('div');
    tabsContainer.className = 'quality-tabs';
    
    const contentContainer = document.createElement('div');
    contentContainer.className = 'quality-content-container';
    
    thumbnailQualities.forEach((thumbnail, index) => {
        // Create tab
        const tab = document.createElement('button');
        tab.className = 'quality-tab';
        tab.textContent = thumbnail.size;
        if (index === 0) tab.classList.add('active');
        
        tab.addEventListener('click', () => {
            // Remove active class from all tabs
            document.querySelectorAll('.quality-tab').forEach(t => t.classList.remove('active'));
            // Add active class to current tab
            tab.classList.add('active');
            
            // Hide all content
            document.querySelectorAll('.quality-content').forEach(c => c.style.display = 'none');
            // Show current content
            document.getElementById(`quality-content-${thumbnail.size}`).style.display = 'block';
        });
        
        tabsContainer.appendChild(tab);
        
        // Create content for this quality
        const content = document.createElement('div');
        content.className = 'quality-content';
        content.id = `quality-content-${thumbnail.size}`;
        content.style.display = index === 0 ? 'block' : 'none';
        
        // Get file sizes for different formats
        const jpgSize = getEstimatedFileSize(thumbnail.size, 'jpg');
        const pngSize = getEstimatedFileSize(thumbnail.size, 'png');
        const webpSize = getEstimatedFileSize(thumbnail.size, 'webp');
        
        // Create format cards
        const formatCards = document.createElement('div');
        formatCards.className = 'format-cards';
        
        // JPG Format
        const jpgCard = createFormatCard(thumbnail, videoTitle, 'jpg', jpgSize);
        formatCards.appendChild(jpgCard);
        
        // PNG Format
        const pngCard = createFormatCard(thumbnail, videoTitle, 'png', pngSize);
        formatCards.appendChild(pngCard);
        
        // WEBP Format
        const webpCard = createFormatCard(thumbnail, videoTitle, 'webp', webpSize);
        formatCards.appendChild(webpCard);
        
        content.appendChild(formatCards);
        contentContainer.appendChild(content);
    });
    
    optionsContainer.appendChild(tabsContainer);
    optionsContainer.appendChild(contentContainer);
    
    section.appendChild(heading);
    section.appendChild(optionsContainer);
    
    return section;
}

// Create a card for each format option
function createFormatCard(thumbnail, videoTitle, format, fileSize) {
    const card = document.createElement('div');
    card.className = 'format-card';
    
    const formatIcon = document.createElement('div');
    formatIcon.className = 'format-icon';
    
    const iconImg = document.createElement('img');
    iconImg.src = `./images/${format}-icon.svg`;
    iconImg.alt = `${format.toUpperCase()} format`;
    iconImg.onerror = function() {
        // Fallback if image doesn't exist
        this.onerror = null;
        this.src = '';
        this.style.display = 'none';
        formatIcon.innerHTML = `<span class="format-text">${format.toUpperCase()}</span>`;
    };
    
    formatIcon.appendChild(iconImg);
    
    const formatInfo = document.createElement('div');
    formatInfo.className = 'format-info';
    
    const formatName = document.createElement('h3');
    formatName.textContent = format.toUpperCase();
    
    const formatSize = document.createElement('span');
    formatSize.className = 'format-size';
    formatSize.textContent = fileSize;
    
    const downloadBtn = document.createElement('button');
    downloadBtn.className = `btn-download btn-${format}`;
    downloadBtn.innerHTML = `<i class="fas fa-download"></i> Download ${format.toUpperCase()}`;
    downloadBtn.addEventListener('click', () => {
        downloadThumbnailWithFormat(thumbnail.url, `RAO RAMZAN YT DOWNLOADER - ${thumbnail.size}.${format}`, format);
    });
    
    formatInfo.appendChild(formatName);
    formatInfo.appendChild(formatSize);
    
    card.appendChild(formatIcon);
    card.appendChild(formatInfo);
    card.appendChild(downloadBtn);
    
    return card;
}

// Get estimated file size based on resolution and format
function getEstimatedFileSize(resolution, format) {
    let baseSize = 0;
    
    // Estimate base size in KB based on resolution
    switch(resolution) {
        case '450p':
            baseSize = 45;
            break;
        case '760p':
            baseSize = 100;
            break;
        case '1080p':
            baseSize = 200;
            break;
        case '2K':
            baseSize = 400;
            break;
        case '4K':
            baseSize = 800;
            break;
        default:
            baseSize = 100;
    }
    
    // Adjust based on format
    switch(format) {
        case 'jpg':
            // JPG is the reference format
            break;
        case 'png':
            // PNG is typically 2-3x larger than JPG
            baseSize = baseSize * 2.5;
            break;
        case 'webp':
            // WebP is typically 25-35% smaller than JPG
            baseSize = baseSize * 0.7;
            break;
    }
    
    // Format the size
    if (baseSize >= 1000) {
        return `${(baseSize / 1000).toFixed(1)} MB`;
    } else {
        return `${Math.round(baseSize)} KB`;
    }
}

// Download thumbnail with specific format
function downloadThumbnailWithFormat(url, filename, format) {
    // Show loading indicator
    const loadingToast = showToast(`Preparing ${format.toUpperCase()} download...`, 'info');
    
    // For JPG, we can download directly
    if (format === 'jpg') {
        downloadDirectly(url, filename, loadingToast);
        return;
    }
    
    // For other formats, we need to convert
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = function() {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        
        let mimeType;
        switch(format) {
            case 'png':
                mimeType = 'image/png';
                break;
            case 'webp':
                mimeType = 'image/webp';
                break;
            default:
                mimeType = 'image/jpeg';
        }
        
        // Get data URL with the desired format
        const dataUrl = canvas.toDataURL(mimeType, 1.0);
        
        // Create a temporary link and trigger download
        const a = document.createElement('a');
        a.href = dataUrl;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        
        // Clean up
        setTimeout(() => {
            document.body.removeChild(a);
            hideToast(loadingToast);
            showToast(`${format.toUpperCase()} download complete!`, 'success');
        }, 1000);
    };
    
    img.onerror = function() {
        hideToast(loadingToast);
        showToast(`Failed to convert to ${format.toUpperCase()}. Downloading as JPG instead.`, 'error');
        downloadDirectly(url, filename.replace(`.${format}`, '.jpg'), null);
    };
    
    img.src = url;
}

// Download directly without conversion
function downloadDirectly(url, filename, loadingToast) {
    // Create a temporary anchor element
    const tempLink = document.createElement('a');
    tempLink.href = url;
    tempLink.setAttribute('download', filename);
    tempLink.setAttribute('target', '_blank');
    tempLink.style.display = 'none';
    document.body.appendChild(tempLink);
    
    // Click the link to trigger download
    tempLink.click();
    
    // Clean up
    setTimeout(() => {
        document.body.removeChild(tempLink);
        if (loadingToast) {
            hideToast(loadingToast);
        }
        showToast('Download complete!', 'success');
    }, 1000);
}

// Toast notification system for better UX
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
        <div class="toast-icon">
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
        </div>
        <div class="toast-message">${message}</div>
    `;
    
    // Add to DOM
    if (!document.querySelector('.toast-container')) {
        const container = document.createElement('div');
        container.className = 'toast-container';
        document.body.appendChild(container);
    }
    
    document.querySelector('.toast-container').appendChild(toast);
    
    // Animate in
    setTimeout(() => {
        toast.classList.add('show');
    }, 10);
    
    // Auto remove after 3 seconds for success/info messages
    if (type !== 'error') {
        setTimeout(() => {
            hideToast(toast);
        }, 3000);
    } else {
        // Add close button for error messages
        const closeBtn = document.createElement('button');
        closeBtn.className = 'toast-close';
        closeBtn.innerHTML = '&times;';
        closeBtn.addEventListener('click', () => hideToast(toast));
        toast.appendChild(closeBtn);
    }
    
    return toast;
}

function hideToast(toast) {
    toast.classList.remove('show');
    setTimeout(() => {
        if (toast.parentNode) {
            toast.parentNode.removeChild(toast);
        }
        
        // Remove container if empty
        const container = document.querySelector('.toast-container');
        if (container && container.children.length === 0) {
            container.parentNode.removeChild(container);
        }
    }, 300);
}

// Show Loader
function showLoader() {
    if (loader) {
        loader.style.display = 'flex';
    }
}

// Hide Loader
function hideLoader() {
    if (loader) {
        loader.style.display = 'none';
    }
}

// Show Error
function showError(message) {
    if (errorMessage) {
        errorMessage.textContent = message;
        errorMessage.style.display = 'block';
    }
}

// Hide Error
function hideError() {
    if (errorMessage) {
        errorMessage.style.display = 'none';
    }
}
