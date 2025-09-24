/**
 * Supabase Integration for Adamson Debate Society Website
 * Handles dynamic content loading and user interactions
 */

// Wait for DOM to load before initializing
document.addEventListener('DOMContentLoaded', function() {
    // Initialize Supabase integration after other scripts load
    setTimeout(initializeSupabase, 1000);
});

async function initializeSupabase() {
    try {
        // Check if Supabase client is available
        if (typeof debateDB === 'undefined') {
            console.warn('Supabase client not initialized. Please check your configuration.');
            return;
        }

        console.log('Initializing Supabase integration...');

        // Initialize based on current page
        const currentPage = getCurrentPage();

        switch (currentPage) {
            case 'index':
                await initializeHomePage();
                break;
            case 'news-events':
                await initializeNewsEventsPage();
                break;
            default:
                console.log('No specific initialization for this page');
        }

        await loadSystemSettings();

        console.log('Supabase integration initialized successfully');
    } catch (error) {
        console.error('Error initializing Supabase integration:', error);
    }
}

function getCurrentPage() {
    const path = window.location.pathname;
    const filename = path.split('/').pop().split('.')[0];
    return filename === '' ? 'index' : filename;
}

// Home page initialization
async function initializeHomePage() {
    try {
        // Load recent news for home page
        await loadRecentNews();
        // Load upcoming events
        await loadUpcomingEvents();
    } catch (error) {
        console.error('Error initializing home page:', error);
    }
}

// News & Events page initialization
async function initializeNewsEventsPage() {
    try {
        // Load featured article
        await loadFeaturedArticle();
        // Load all news posts with categories
        await loadCategorizedNews();
        // Load upcoming events timeline
        await loadEventsTimeline();
        // Initialize category filters
        await initializeCategoryFilters();
    } catch (error) {
        console.error('Error initializing news & events page:', error);
    }
}

// Load recent news for home page
async function loadRecentNews() {
    try {
        const news = await debateDB.getNews(3, true); // Get 3 most recent published news

        if (news.length === 0) {
            console.log('No news articles found');
            return;
        }

        // You can add a news section to your home page if needed
        console.log('Recent news loaded:', news);

    } catch (error) {
        console.error('Error loading recent news:', error);
    }
}

// Load upcoming events for home page
async function loadUpcomingEvents() {
    try {
        const events = await debateDB.getEvents(true, 3); // Get 3 upcoming events

        if (events.length === 0) {
            console.log('No upcoming events found');
            return;
        }

        console.log('Upcoming events loaded:', events);

    } catch (error) {
        console.error('Error loading upcoming events:', error);
    }
}


// Load featured article
async function loadFeaturedArticle() {
    try {
        const allNews = await debateDB.getAllNews(1, true);

        if (allNews.length === 0) {
            console.log('No featured article found');
            return;
        }

        const featuredArticle = allNews[0];
        updateFeaturedArticle(featuredArticle);

    } catch (error) {
        console.error('Error loading featured article:', error);
    }
}

// Load categorized news articles
async function loadCategorizedNews() {
    try {
        const allNews = await debateDB.getAllNews(10, true);

        if (allNews.length === 0) {
            console.log('No news articles found');
            return;
        }

        // Skip first article (used as featured)
        const newsToDisplay = allNews.slice(1);
        renderNewsGrid(newsToDisplay);

    } catch (error) {
        console.error('Error loading categorized news:', error);
    }
}

// Load events timeline
async function loadEventsTimeline() {
    try {
        const events = await debateDB.getEvents(true, 10);

        console.log('Events loaded:', events.length);
        renderEventsTimeline(events);

    } catch (error) {
        console.error('Error loading events timeline:', error);
        // Show empty state on error
        renderEventsTimeline([]);
    }
}

// Create news article element
function createNewsArticleElement(article, index) {
    const col = document.createElement('div');
    col.className = 'col-lg-6';
    col.setAttribute('data-aos', 'fade-up');
    col.setAttribute('data-aos-delay', (index + 3) * 100);

    const formattedDate = debateDB.formatDate(article.created_at);

    col.innerHTML = `
        <article>
            <div class="post-img">
                <img src="${article.featured_image_url || 'assets/img/blog/blog-placeholder.jpg'}" alt="${article.title}" class="img-fluid">
            </div>
            <h2 class="title">
                <a href="#" onclick="openNewsArticle('${article.id}')">${article.title}</a>
            </h2>
            <div class="meta-top">
                <ul>
                    <li class="d-flex align-items-center"><i class="bi bi-person"></i> <a href="#">${article.author_name}</a></li>
                    <li class="d-flex align-items-center"><i class="bi bi-clock"></i> <a href="#"><time datetime="${article.created_at}">${formattedDate}</time></a></li>
                </ul>
            </div>
            <div class="content">
                <p>${article.excerpt || article.content.substring(0, 150) + '...'}</p>
                <div class="read-more mt-auto align-self-end">
                    <a href="#" onclick="openNewsArticle('${article.id}')">Read More <i class="bi bi-arrow-right"></i></a>
                </div>
            </div>
        </article>
    `;

    return col;
}

// Update featured article
function updateFeaturedArticle(article) {
    const featuredArticle = document.querySelector('.featured-article');
    if (featuredArticle && article) {
        const titleElement = featuredArticle.querySelector('h2');
        const excerptElement = featuredArticle.querySelector('.featured-copy p');
        const tagElement = featuredArticle.querySelector('.news-tag');
        const imageElement = featuredArticle.querySelector('.featured-media img');
        const readMoreButton = featuredArticle.querySelector('.btn-cta.primary');

        if (titleElement) titleElement.textContent = article.title;
        if (excerptElement) excerptElement.textContent = article.excerpt || article.content?.substring(0, 200) + '...' || 'No description available';
        if (tagElement) {
            tagElement.innerHTML = `<i class="bi bi-${getCategoryIcon(article.type)}"></i> ${article.category}`;
        }
        if (imageElement && article.image_url) {
            imageElement.src = article.image_url;
            imageElement.alt = article.title;
        }

        // Update click handlers
        if (readMoreButton) {
            readMoreButton.onclick = (e) => {
                e.preventDefault();
                openNewsArticle(article.id, article.type);
            };
        }
    }
}

// Render news grid
function renderNewsGrid(newsArticles) {
    const newsGrid = document.querySelector('.news-grid');
    if (!newsGrid) return;

    // Clear existing articles
    newsGrid.innerHTML = '';

    newsArticles.forEach((article, index) => {
        const newsCard = createNewsCard(article, index);
        newsGrid.appendChild(newsCard);
    });
}

// Create news card element
function createNewsCard(article, index) {
    const card = document.createElement('article');
    card.className = 'news-card';
    card.setAttribute('data-aos', 'fade-up');
    card.setAttribute('data-aos-delay', (index + 1) * 50);
    card.setAttribute('data-category', article.type);

    const formattedDate = debateDB.formatDate(article.created_at);

    card.innerHTML = `
        <img src="${article.image_url || 'assets/img/blog/blog-placeholder.jpg'}" alt="${article.title}">
        <div class="news-card-body">
            <span class="news-tag">
                <i class="bi bi-${getCategoryIcon(article.type)}"></i> ${article.category}
            </span>
            <h3>${article.title}</h3>
            <p>${article.excerpt || article.content?.substring(0, 120) + '...' || 'No description available'}</p>
            <div class="news-meta">
                <span><i class="bi bi-calendar"></i> ${formattedDate}</span>
                ${article.author ? `<span><i class="bi bi-person"></i> ${article.author}</span>` : ''}
            </div>
        </div>
    `;

    // Add click handler to entire card
    card.style.cursor = 'pointer';
    card.onclick = () => openNewsArticle(article.id, article.type);

    return card;
}

// Render events timeline
function renderEventsTimeline(events) {
    const eventsTimeline = document.querySelector('.events-timeline');
    if (!eventsTimeline) return;

    // Clear existing events
    eventsTimeline.innerHTML = '';

    if (events.length === 0) {
        // Show empty state
        eventsTimeline.innerHTML = `
            <div class="timeline-entry" style="text-align: center; opacity: 0.7;">
                <span><i class="bi bi-calendar-x"></i> No Events Scheduled</span>
                <h3>No Upcoming Events</h3>
                <p>Check back soon for new events and announcements.</p>
            </div>
        `;
        return;
    }

    events.forEach((event, index) => {
        const eventEntry = createEventTimelineEntry(event, index);
        eventsTimeline.appendChild(eventEntry);
    });
}

// Create event timeline entry
function createEventTimelineEntry(event, index) {
    const entry = document.createElement('article');
    entry.className = 'timeline-entry';
    entry.setAttribute('data-aos', 'fade-up');
    entry.setAttribute('data-aos-delay', (index + 1) * 100);

    // Format date properly - handle both date and datetime
    let formattedDate;
    try {
        const eventDate = new Date(event.event_date);
        formattedDate = eventDate.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    } catch (error) {
        formattedDate = event.event_date || 'Date TBA';
    }

    entry.innerHTML = `
        <span><i class="bi bi-calendar-event"></i> ${formattedDate}</span>
        <h3>${event.title}</h3>
        <p><i class="bi bi-geo-alt"></i> ${event.location || 'Location TBA'}</p>
        <p>${event.short_description || event.description?.substring(0, 150) + '...' || 'Event details coming soon'}</p>
    `;

    // Add click handler - always make clickable
    entry.onclick = () => {
        if (event.link) {
            // Open external link in new tab
            window.open(event.link, '_blank');
        } else {
            // Show event details in modal or alert
            showEventDetails(event);
        }
    };

    return entry;
}

// Show event details function
function showEventDetails(event) {
    const eventDate = new Date(event.event_date);
    const formattedDate = eventDate.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    const formattedTime = eventDate.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
    });

    const modalContent = `
📅 ${event.title}

📍 ${event.location || 'Location TBA'}
🕐 ${formattedDate} at ${formattedTime}

${event.description || 'Event details coming soon.'}

${event.organizer_name ? `👥 Organized by: ${event.organizer_name}` : ''}
${event.registration_required ? '📝 Registration required' : ''}
    `;

    // For now use alert - you can implement a proper modal later
    alert(modalContent);
}

// Get category icon based on type
function getCategoryIcon(type) {
    const icons = {
        'community': 'people',
        'training': 'lightning-charge',
        'tournaments': 'trophy'
    };
    return icons[type] || 'newspaper';
}

// Load upcoming events for sidebar
async function loadUpcomingEventsSidebar() {
    try {
        const events = await debateDB.getEvents(true, 3); // Get 3 upcoming events

        const eventsWidget = document.querySelector('.events-widget');
        if (eventsWidget && events.length > 0) {
            // Clear existing events
            const existingEvents = eventsWidget.querySelectorAll('.event-item');
            existingEvents.forEach(event => event.remove());

            // Add dynamic events
            events.forEach(event => {
                const eventElement = createEventElement(event);
                eventsWidget.appendChild(eventElement);
            });
        }

    } catch (error) {
        console.error('Error loading upcoming events sidebar:', error);
    }
}

// Create event element for sidebar
function createEventElement(event) {
    const eventDate = new Date(event.event_date);
    const day = eventDate.getDate().toString().padStart(2, '0');
    const month = eventDate.toLocaleString('en-US', { month: 'short' }).toUpperCase();

    const eventDiv = document.createElement('div');
    eventDiv.className = 'event-item d-flex';

    eventDiv.innerHTML = `
        <div class="event-date">
            <div class="day">${day}</div>
            <div class="month">${month}</div>
        </div>
        <div class="event-content">
            <h4><a href="#" onclick="openEvent('${event.id}')">${event.title}</a></h4>
            <p>${event.short_description || event.description.substring(0, 100) + '...'}</p>
        </div>
    `;

    return eventDiv;
}

// Load recent posts widget
async function loadRecentPostsWidget() {
    try {
        const recentPosts = await debateDB.getNews(3, true); // Get 3 most recent posts

        const recentPostsWidget = document.querySelector('.recent-posts-widget');
        if (recentPostsWidget && recentPosts.length > 0) {
            // Clear existing posts
            const existingPosts = recentPostsWidget.querySelectorAll('.post-item');
            existingPosts.forEach(post => post.remove());

            // Add dynamic posts
            recentPosts.forEach(post => {
                const postElement = createRecentPostElement(post);
                recentPostsWidget.appendChild(postElement);
            });
        }

    } catch (error) {
        console.error('Error loading recent posts widget:', error);
    }
}

// Create recent post element
function createRecentPostElement(post) {
    const postDiv = document.createElement('div');
    postDiv.className = 'post-item';

    const formattedDate = debateDB.formatDate(post.created_at);

    postDiv.innerHTML = `
        <img src="${post.featured_image_url || 'assets/img/blog/blog-placeholder.jpg'}" alt="${post.title}" class="flex-shrink-0">
        <div>
            <h4><a href="#" onclick="openNewsArticle('${post.id}')">${post.title}</a></h4>
            <time datetime="${post.created_at}">${formattedDate}</time>
        </div>
    `;

    return postDiv;
}


// Load system settings
async function loadSystemSettings() {
    try {
        // Update contact information and social links from database
        // This would require implementing a getSettings method in the database class
        console.log('Loading system settings...');

    } catch (error) {
        console.error('Error loading system settings:', error);
    }
}

// Initialize category filters
async function initializeCategoryFilters() {
    try {
        const tabPills = document.querySelectorAll('.tab-pill');

        tabPills.forEach(pill => {
            pill.addEventListener('click', () => {
                // Remove active class from all pills
                tabPills.forEach(p => p.classList.remove('active'));
                // Add active class to clicked pill
                pill.classList.add('active');

                // Filter news based on category
                const category = pill.textContent.toLowerCase();
                filterNewsByCategory(category);
            });
        });

    } catch (error) {
        console.error('Error initializing category filters:', error);
    }
}

// Filter news by category
async function filterNewsByCategory(category) {
    try {
        let filteredNews;

        if (category === 'all') {
            filteredNews = await debateDB.getAllNews(10, true);
        } else if (category === 'community') {
            filteredNews = await debateDB.getCommunityNews(10, true);
            filteredNews = filteredNews.map(news => ({ ...news, type: 'community', category: 'Community' }));
        } else if (category === 'training') {
            filteredNews = await debateDB.getTrainingNews(10, true);
            filteredNews = filteredNews.map(news => ({ ...news, type: 'training', category: 'Training' }));
        } else if (category === 'tournaments') {
            filteredNews = await debateDB.getTournamentNews(10, true);
            filteredNews = filteredNews.map(news => ({ ...news, type: 'tournaments', category: 'Tournaments' }));
        } else {
            filteredNews = await debateDB.getAllNews(10, true);
        }

        // Skip first article (featured) and render the rest
        const newsToDisplay = category === 'all' ? filteredNews.slice(1) : filteredNews;
        renderNewsGrid(newsToDisplay);

    } catch (error) {
        console.error('Error filtering news by category:', error);
    }
}

// Utility functions
function openNewsArticle(articleId, type = null) {
    console.log('Opening news article:', articleId, 'Type:', type);

    // Try to get the article details from database
    debateDB.getNewsById(articleId, type ? `news_${type}` : null)
        .then(article => {
            if (article && article.link) {
                // Open external link if available
                window.open(article.link, '_blank');
            } else {
                // Show article details in modal or alert
                showArticleModal(article);
            }
        })
        .catch(error => {
            console.error('Error opening article:', error);
            alert('Unable to load article details.');
        });
}

function openEvent(eventId) {
    console.log('Opening event:', eventId);

    debateDB.getEventById(eventId)
        .then(event => {
            if (event && event.link) {
                // Open external link if available
                window.open(event.link, '_blank');
            } else {
                // Show event details in modal or alert
                showEventModal(event);
            }
        })
        .catch(error => {
            console.error('Error opening event:', error);
            alert('Unable to load event details.');
        });
}

function openEventLink(link) {
    if (link) {
        window.open(link, '_blank');
    }
}

// Show article in modal (basic implementation)
function showArticleModal(article) {
    if (!article) {
        alert('Article not found.');
        return;
    }

    const modalContent = `
        <h3>${article.title}</h3>
        <p><strong>Category:</strong> ${article.category || 'News'}</p>
        <p><strong>Date:</strong> ${debateDB.formatDate(article.created_at)}</p>
        <p>${article.content || article.excerpt || 'Full content will be available soon.'}</p>
    `;

    // For now, use alert - you can implement a proper modal
    alert(modalContent);
}

// Show event in modal (basic implementation)
function showEventModal(event) {
    if (!event) {
        alert('Event not found.');
        return;
    }

    const modalContent = `
        <h3>${event.title}</h3>
        <p><strong>Date:</strong> ${debateDB.formatDate(event.event_date)}</p>
        <p><strong>Location:</strong> ${event.location || 'Location TBA'}</p>
        <p>${event.description || 'Event details coming soon.'}</p>
    `;

    // For now, use alert - you can implement a proper modal
    alert(modalContent);
}

function showMessage(message, type = 'info') {
    // Create a toast notification or alert
    const alertClass = type === 'success' ? 'alert-success' :
                     type === 'error' ? 'alert-danger' : 'alert-info';

    const alertDiv = document.createElement('div');
    alertDiv.className = `alert ${alertClass} alert-dismissible fade show position-fixed`;
    alertDiv.style.cssText = 'top: 20px; right: 20px; z-index: 9999; max-width: 350px;';
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;

    document.body.appendChild(alertDiv);

    // Auto remove after 5 seconds
    setTimeout(() => {
        if (alertDiv.parentNode) {
            alertDiv.parentNode.removeChild(alertDiv);
        }
    }, 5000);
}


// Export functions for global access
window.DebateSocietyApp = {
    openNewsArticle,
    openEvent,
    showMessage
};