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

        // Initialize common features
        await initializeContactForm();
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
        // Load recent achievements
        await loadRecentAchievements();
    } catch (error) {
        console.error('Error initializing home page:', error);
    }
}

// News & Events page initialization
async function initializeNewsEventsPage() {
    try {
        // Load all news posts
        await loadNewsArticles();
        // Load upcoming events sidebar
        await loadUpcomingEventsSidebar();
        // Load recent posts widget
        await loadRecentPostsWidget();
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

// Load recent achievements
async function loadRecentAchievements() {
    try {
        // This would require adding a method to the database class
        console.log('Loading recent achievements...');
    } catch (error) {
        console.error('Error loading recent achievements:', error);
    }
}

// Load news articles for news & events page
async function loadNewsArticles() {
    try {
        const news = await debateDB.getNews(10, true); // Get 10 most recent published news

        if (news.length === 0) {
            console.log('No news articles found');
            return;
        }

        // Update the news section with dynamic content
        const newsContainer = document.querySelector('.col-lg-8 .row.gy-4');
        if (newsContainer) {
            // Clear existing static content except featured post
            const articles = newsContainer.querySelectorAll('.col-lg-6');
            articles.forEach(article => article.remove());

            // Add dynamic news articles
            news.slice(1).forEach((article, index) => {
                const articleElement = createNewsArticleElement(article, index);
                newsContainer.appendChild(articleElement);
            });

            // Update featured post if there's a featured article
            const featuredArticle = news.find(article => article.featured) || news[0];
            updateFeaturedPost(featuredArticle);
        }

    } catch (error) {
        console.error('Error loading news articles:', error);
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

// Update featured post
function updateFeaturedPost(article) {
    const featuredPost = document.querySelector('.featured-post');
    if (featuredPost && article) {
        const titleElement = featuredPost.querySelector('.title a');
        const excerptElement = featuredPost.querySelector('.content p');
        const authorElement = featuredPost.querySelector('.meta-top .bi-person').parentElement.querySelector('a');
        const dateElement = featuredPost.querySelector('.meta-top time');
        const imageElement = featuredPost.querySelector('.post-img img');

        if (titleElement) titleElement.textContent = article.title;
        if (excerptElement) excerptElement.textContent = article.excerpt || article.content.substring(0, 200) + '...';
        if (authorElement) authorElement.textContent = article.author_name;
        if (dateElement) {
            dateElement.textContent = debateDB.formatDate(article.created_at);
            dateElement.setAttribute('datetime', article.created_at);
        }
        if (imageElement && article.featured_image_url) {
            imageElement.src = article.featured_image_url;
        }

        // Update click handler
        titleElement.onclick = () => openNewsArticle(article.id);
        featuredPost.querySelector('.read-more a').onclick = () => openNewsArticle(article.id);
    }
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

// Initialize contact form
async function initializeContactForm() {
    try {
        // Look for contact forms on the page
        const contactForms = document.querySelectorAll('form[class*="contact"], form[class*="php-email-form"]');

        contactForms.forEach(form => {
            form.addEventListener('submit', handleContactFormSubmission);
        });

        // If no existing form, create a simple contact form
        if (contactForms.length === 0) {
            createContactForm();
        }

    } catch (error) {
        console.error('Error initializing contact form:', error);
    }
}

// Handle contact form submission
async function handleContactFormSubmission(event) {
    event.preventDefault();

    const form = event.target;
    const formData = new FormData(form);

    // Show loading state
    const submitButton = form.querySelector('button[type="submit"], input[type="submit"]');
    const originalText = submitButton.textContent;
    submitButton.textContent = 'Sending...';
    submitButton.disabled = true;

    try {
        const contactData = {
            name: formData.get('name'),
            email: formData.get('email'),
            phone: formData.get('phone') || null,
            subject: formData.get('subject'),
            message: formData.get('message'),
            inquiry_type: formData.get('inquiry_type') || 'general'
        };

        const result = await debateDB.submitContact(contactData);

        if (result.success) {
            showMessage('Thank you! Your message has been sent successfully.', 'success');
            form.reset();
        } else {
            showMessage('Sorry, there was an error sending your message. Please try again.', 'error');
        }
    } catch (error) {
        console.error('Error submitting contact form:', error);
        showMessage('Sorry, there was an error sending your message. Please try again.', 'error');
    } finally {
        // Restore button state
        submitButton.textContent = originalText;
        submitButton.disabled = false;
    }
}

// Create a simple contact form if none exists
function createContactForm() {
    // This would be implemented if you want to add a contact form to pages that don't have one
    console.log('No contact form found on this page');
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

// Utility functions
function openNewsArticle(articleId) {
    // Create a modal or navigate to a detailed view
    console.log('Opening news article:', articleId);

    // For now, just show an alert - you can implement a modal or separate page
    alert('News article details would open here. Article ID: ' + articleId);
}

function openEvent(eventId) {
    // Create a modal or navigate to event details
    console.log('Opening event:', eventId);

    // For now, just show an alert - you can implement a modal or separate page
    alert('Event details would open here. Event ID: ' + eventId);
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

// Membership application functions
async function submitMembershipApplication(membershipType) {
    // This would open a modal or form for membership application
    console.log('Membership application for:', membershipType);

    // For now, redirect to email
    window.location.href = 'mailto:auds@adamson.edu.ph?subject=Membership Application - ' +
                          (membershipType === 'varsity' ? 'Varsity Member' : 'Resident Member');
}

// Export functions for global access
window.DebateSocietyApp = {
    openNewsArticle,
    openEvent,
    submitMembershipApplication,
    showMessage
};