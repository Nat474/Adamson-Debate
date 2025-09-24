// Admin Panel Configuration and Functionality
class AdminPanel {
    constructor() {
        this.supabase = null;
        this.currentTab = 'events';
        this.currentEditId = null;
        this.currentUser = null;
        this.resourceSources = [
            { key: 'template', label: 'Templates', table: 'resource_template' },
            { key: 'theory', label: 'Theory & Skills', table: 'resource_theory' },
            { key: 'analytics', label: 'Analytics & Data', table: 'resource_analytics' }
        ];
        this.currentResourceTable = null;
        this.currentResourceSource = null;
        this.init();
    }

    async init() {
        await this.initSupabase();
        this.bindEventHandlers();
        await this.checkAuthStatus();
    }

    async initSupabase() {
        try {
            // Use anon key for auth, service role for admin operations after login
            const SUPABASE_URL = window.ENV?.SUPABASE_URL || 'https://genkeeohrgnjliqhyuyh.supabase.co';
            const SUPABASE_ANON_KEY = window.ENV?.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdlbmtlZW9ocmduamxpcWh5dXloIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg2MzEwMTIsImV4cCI6MjA3NDIwNzAxMn0.nQvIM-pVz1tt45otWcO7dN--bcaRH_tJ7RCTBKU9d-o';
            const SUPABASE_SERVICE_KEY = window.ENV?.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdlbmtlZW9ocmduamxpcWh5dXloIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODYzMTAxMiwiZXhwIjoyMDc0MjA3MDEyfQ.6_84-KQC7we2eXwarLZiTWk6WMa9AHofMAaPgYYznYo';

            // Initialize with anon key for auth (single client to avoid warning)
            this.supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
                auth: {
                    storageKey: 'auds-admin-auth',
                    persistSession: true
                }
            });

            // Store service key for admin operations (we'll use this with the same client)
            this.serviceKey = SUPABASE_SERVICE_KEY;

            console.log('Supabase client initialized');
        } catch (error) {
            console.error('Error initializing Supabase:', error);
            this.showToast('Failed to connect to database', 'error');
        }
    }

    bindEventHandlers() {
        // Login form
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }

        // Tab switching
        document.querySelectorAll('.nav-link').forEach(tab => {
            tab.addEventListener('click', (e) => {
                e.preventDefault();
                this.switchTab(tab.dataset.bsTarget.replace('#', ''));
            });
        });

        // Form submissions - only bind if elements exist
        const eventForm = document.getElementById('eventForm');
        if (eventForm) {
            eventForm.addEventListener('submit', (e) => this.handleEventSubmit(e));
        }

        const newsForm = document.getElementById('newsForm');
        if (newsForm) {
            newsForm.addEventListener('submit', (e) => this.handleNewsSubmit(e));
        }

        const trainingForm = document.getElementById('trainingForm');
        if (trainingForm) {
            trainingForm.addEventListener('submit', (e) => this.handleTrainingSubmit(e));
        }

        const resourceForm = document.getElementById('resourceForm');
        if (resourceForm) {
            resourceForm.addEventListener('submit', (e) => this.handleResourceSubmit(e));
        }

        // Modal events
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('hidden.bs.modal', () => {
                this.resetForm();
            });
        });
    }

    switchTab(tabName) {
        this.currentTab = tabName;

        // Update active tab
        document.querySelectorAll('.nav-link').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

        // Update active content
        document.querySelectorAll('.tab-pane').forEach(pane => {
            pane.classList.remove('show', 'active');
        });
        document.getElementById(tabName).classList.add('show', 'active');

        // Load data for the active tab
        this.loadTabData(tabName);
    }

    // Authentication Methods
    async checkAuthStatus() {
        try {
            const { data: { user } } = await this.supabase.auth.getUser();

            if (user && this.isAdminUser(user)) {
                this.currentUser = user;
                this.showAdminInterface();
                await this.loadInitialData();
                this.showToast('Admin panel loaded successfully', 'success');
            } else {
                this.showLoginScreen();
            }
        } catch (error) {
            console.error('Error checking auth status:', error);
            this.showLoginScreen();
        }
    }

    isAdminUser(user) {
        // Check if user has admin role or is from allowed domain
        const adminEmails = [
            'admin@adamson.edu',
            'admin@adudebate.org',
            'auds@adamson.edu.ph'
        ];
        const allowedDomains = [
            'adamson.edu',
            'adamson.edu.ph',
            'adudebate.org'
        ];

        if (adminEmails.includes(user.email)) {
            return true;
        }

        const emailDomain = user.email.split('@')[1];
        return allowedDomains.includes(emailDomain);
    }

    async handleLogin(e) {
        e.preventDefault();

        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;

        this.setLoginLoading(true);
        this.hideLoginError();

        try {
            const { data, error } = await this.supabase.auth.signInWithPassword({
                email: email,
                password: password
            });

            if (error) throw error;

            if (data.user && this.isAdminUser(data.user)) {
                this.currentUser = data.user;
                this.showAdminInterface();
                await this.loadInitialData();
                this.showToast('Login successful', 'success');
            } else {
                throw new Error('Access denied. Admin privileges required.');
            }
        } catch (error) {
            console.error('Login error:', error);
            this.showLoginError(error.message || 'Login failed. Please check your credentials.');
        } finally {
            this.setLoginLoading(false);
        }
    }

    async logout() {
        try {
            await this.supabase.auth.signOut();
            this.currentUser = null;
            this.showLoginScreen();
            this.showToast('Logged out successfully', 'info');
        } catch (error) {
            console.error('Logout error:', error);
            this.showToast('Error logging out', 'error');
        }
    }

    showLoginScreen() {
        document.getElementById('loginScreen').classList.remove('d-none');
        document.getElementById('adminInterface').classList.add('d-none');
        document.getElementById('loginEmail').focus();
    }

    showAdminInterface() {
        document.getElementById('loginScreen').classList.add('d-none');
        document.getElementById('adminInterface').classList.remove('d-none');

        // Update user email in header
        const userEmailSpan = document.getElementById('userEmail');
        if (userEmailSpan && this.currentUser) {
            userEmailSpan.textContent = this.currentUser.email;
        }

        // Set focus to first tab
        document.querySelector('.nav-link[data-bs-target="#events"]').focus();
    }

    setLoginLoading(loading) {
        const spinner = document.getElementById('loginSpinner');
        const text = document.getElementById('loginText');
        const btn = document.getElementById('loginBtn');

        if (loading) {
            spinner.classList.remove('d-none');
            text.textContent = 'Signing In...';
            btn.disabled = true;
        } else {
            spinner.classList.add('d-none');
            text.textContent = 'Sign In';
            btn.disabled = false;
        }
    }

    showLoginError(message) {
        const errorDiv = document.getElementById('loginError');
        const errorText = document.getElementById('loginErrorText');

        errorText.textContent = message;
        errorDiv.classList.remove('d-none');
    }

    hideLoginError() {
        document.getElementById('loginError').classList.add('d-none');
    }

    async loadInitialData() {
        await this.loadTabData('events');
    }

    async loadTabData(tabName) {
        switch(tabName) {
            case 'events':
                await this.loadEvents();
                break;
            case 'news':
                await this.loadNews();
                break;
            case 'training':
                await this.loadTrainingSessions();
                break;
            case 'resources':
                await this.loadResources();
                break;
        }
    }

    // Events Management
    async loadEvents() {
        try {
            // Use service key for admin operations
            const { data, error } = await this.supabase
                .from('events')
                .select('*')
                .order('event_date', { ascending: false });

            if (error) throw error;
            this.renderEventsTable(data || []);
        } catch (error) {
            console.error('Error loading events:', error);
            this.showToast('Failed to load events', 'error');
            // Show empty state on error
            this.renderEventsTable([]);
        }
    }

    renderEventsTable(events) {
        const tbody = document.getElementById('eventsTable');
        if (!tbody) {
            console.error('Events table not found');
            return;
        }

        tbody.innerHTML = '';

        if (events.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="4" class="text-center text-muted py-4">
                        <i class="bi bi-calendar-x"></i> No events found
                    </td>
                </tr>
            `;
            return;
        }

        events.forEach(event => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${event.title}</td>
                <td>${event.location || 'N/A'}</td>
                <td>${event.event_date ? new Date(event.event_date).toLocaleDateString() : 'N/A'}</td>
                <td>
                    <button class="btn btn-sm btn-outline-primary me-1" onclick="adminPanel.editEvent('${event.id}')">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger" onclick="adminPanel.deleteEvent('${event.id}')">
                        <i class="bi bi-trash"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    async handleEventSubmit(e) {
        e.preventDefault();

        const eventData = {
            title: document.getElementById('eventTitle').value,
            slug: this.generateSlug(document.getElementById('eventTitle').value),
            description: document.getElementById('eventDescription').value,
            short_description: document.getElementById('eventShortDescription').value,
            location: document.getElementById('eventLocation').value,
            event_date: document.getElementById('eventDate').value ? new Date(document.getElementById('eventDate').value).toISOString() : null,
            organizer_name: document.getElementById('eventOrganizer').value,
            link: document.getElementById('eventLink').value
        };

        try {
            let result;
            if (this.currentEditId) {
                result = await this.supabase
                    .from('events')
                    .update(eventData)
                    .eq('id', this.currentEditId);
            } else {
                result = await this.supabase
                    .from('events')
                    .insert([eventData]);
            }

            if (result.error) throw result.error;

            this.showToast(`Event ${this.currentEditId ? 'updated' : 'created'} successfully`, 'success');
            bootstrap.Modal.getInstance(document.getElementById('eventModal')).hide();
            await this.loadEvents();
        } catch (error) {
            console.error('Error saving event:', error);
            this.showToast('Failed to save event', 'error');
        }
    }

    async editEvent(id) {
        try {
            const { data, error } = await this.supabase
                .from('events')
                .select('*')
                .eq('id', id)
                .single();

            if (error) throw error;

            this.currentEditId = id;
            this.populateEventForm(data);
            new bootstrap.Modal(document.getElementById('eventModal')).show();
        } catch (error) {
            console.error('Error loading event for edit:', error);
            this.showToast('Failed to load event data', 'error');
        }
    }

    populateEventForm(event) {
        document.getElementById('eventTitle').value = event.title || '';
        document.getElementById('eventDescription').value = event.description || '';
        document.getElementById('eventShortDescription').value = event.short_description || '';
        document.getElementById('eventLocation').value = event.location || '';
        document.getElementById('eventOrganizer').value = event.organizer_name || '';
        document.getElementById('eventLink').value = event.link || '';

        if (event.event_date) {
            document.getElementById('eventDate').value = this.formatDateForInput(event.event_date);
        }

        document.getElementById('eventModalTitle').textContent = 'Edit Event';
    }

    async deleteEvent(id) {
        if (!confirm('Are you sure you want to delete this event?')) return;

        try {
            const { error } = await this.supabase
                .from('events')
                .delete()
                .eq('id', id);

            if (error) throw error;

            this.showToast('Event deleted successfully', 'success');
            await this.loadEvents();
        } catch (error) {
            console.error('Error deleting event:', error);
            this.showToast('Failed to delete event', 'error');
        }
    }

    // News Management
    async loadNews() {
        try {
            const [community, training, tournaments] = await Promise.all([
                this.supabase.from('news_community').select('*').order('created_at', { ascending: false }),
                this.supabase.from('news_training').select('*').order('created_at', { ascending: false }),
                this.supabase.from('news_tournaments').select('*').order('created_at', { ascending: false })
            ]);

            const allNews = [
                ...community.data.map(item => ({...item, category: 'community'})),
                ...training.data.map(item => ({...item, category: 'training'})),
                ...tournaments.data.map(item => ({...item, category: 'tournaments'}))
            ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

            this.renderNewsTable(allNews);
        } catch (error) {
            console.error('Error loading news:', error);
            this.showToast('Failed to load news', 'error');
            // Show empty state on error
            this.renderNewsTable([]);
        }
    }

    renderNewsTable(news) {
        const tbody = document.getElementById('newsTable');
        if (!tbody) {
            console.error('News table not found');
            return;
        }

        tbody.innerHTML = '';

        if (news.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="4" class="text-center text-muted py-4">
                        <i class="bi bi-newspaper"></i> No news articles found
                    </td>
                </tr>
            `;
            return;
        }

        news.forEach(item => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${item.title}</td>
                <td><span class="badge bg-secondary">${item.category}</span></td>
                <td>${new Date(item.created_at).toLocaleDateString()}</td>
                <td>
                    <button class="btn btn-sm btn-outline-primary me-1" onclick="adminPanel.editNews('${item.id}', '${item.category}')">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger" onclick="adminPanel.deleteNews('${item.id}', '${item.category}')">
                        <i class="bi bi-trash"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    async handleNewsSubmit(e) {
        e.preventDefault();

        const newsData = {
            title: document.getElementById('newsTitle').value,
            slug: this.generateSlug(document.getElementById('newsTitle').value),
            content: document.getElementById('newsContent').value,
            excerpt: document.getElementById('newsExcerpt').value,
            image_url: document.getElementById('newsImageUrl').value,
            link: document.getElementById('newsLink').value
        };

        const category = document.getElementById('newsCategorySelect').value;
        const tableName = `news_${category}`;

        try {
            let result;
            if (this.currentEditId) {
                result = await this.supabase
                    .from(tableName)
                    .update(newsData)
                    .eq('id', this.currentEditId);
            } else {
                result = await this.supabase
                    .from(tableName)
                    .insert([newsData]);
            }

            if (result.error) throw result.error;

            this.showToast(`News ${this.currentEditId ? 'updated' : 'created'} successfully`, 'success');
            bootstrap.Modal.getInstance(document.getElementById('newsModal')).hide();
            await this.loadNews();
        } catch (error) {
            console.error('Error saving news:', error);
            this.showToast('Failed to save news', 'error');
        }
    }

    async editNews(id, category) {
        try {
            const { data, error } = await this.supabase
                .from(`news_${category}`)
                .select('*')
                .eq('id', id)
                .single();

            if (error) throw error;

            this.currentEditId = id;
            this.currentEditCategory = category;
            this.populateNewsForm(data, category);
            new bootstrap.Modal(document.getElementById('newsModal')).show();
        } catch (error) {
            console.error('Error loading news for edit:', error);
            this.showToast('Failed to load news data', 'error');
        }
    }

    populateNewsForm(news, category) {
        document.getElementById('newsTitle').value = news.title || '';
        document.getElementById('newsContent').value = news.content || '';
        document.getElementById('newsExcerpt').value = news.excerpt || '';
        document.getElementById('newsImageUrl').value = news.image_url || '';
        document.getElementById('newsLink').value = news.link || '';
        document.getElementById('newsCategorySelect').value = category;

        document.getElementById('newsModalTitle').textContent = 'Edit News';
    }

    async deleteNews(id, category) {
        if (!confirm('Are you sure you want to delete this news item?')) return;

        try {
            const { error } = await this.supabase
                .from(`news_${category}`)
                .delete()
                .eq('id', id);

            if (error) throw error;

            this.showToast('News deleted successfully', 'success');
            await this.loadNews();
        } catch (error) {
            console.error('Error deleting news:', error);
            this.showToast('Failed to delete news', 'error');
        }
    }

    // Training Sessions Management
    async loadTrainingSessions() {
        try {
            const { data, error } = await this.supabase
                .from('training_sessions')
                .select('*')
                .order('session_date', { ascending: false });

            if (error) throw error;
            this.renderTrainingTable(data || []);
        } catch (error) {
            console.error('Error loading training sessions:', error);
            this.showToast('Failed to load training sessions', 'error');
            // Show empty state on error
            this.renderTrainingTable([]);
        }
    }

    renderTrainingTable(sessions) {
        const tbody = document.getElementById('trainingTable');
        if (!tbody) {
            console.error('Training table not found');
            return;
        }

        tbody.innerHTML = '';

        if (sessions.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="4" class="text-center text-muted py-4">
                        <i class="bi bi-mortarboard"></i> No training sessions found
                    </td>
                </tr>
            `;
            return;
        }

        sessions.forEach(session => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${session.title}</td>
                <td>${session.location || 'N/A'}</td>
                <td>${session.session_date ? new Date(session.session_date).toLocaleDateString() : 'N/A'}</td>
                <td>
                    <button class="btn btn-sm btn-outline-primary me-1" onclick="adminPanel.editTraining('${session.id}')">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger" onclick="adminPanel.deleteTraining('${session.id}')">
                        <i class="bi bi-trash"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    async handleTrainingSubmit(e) {
        e.preventDefault();

        const materialsInput = document.getElementById('trainingMaterials').value || '';
        const parsedMaterials = materialsInput
            .split(',')
            .map(item => item.trim())
            .filter(item => item.length > 0);

        const durationValue = parseInt(document.getElementById('trainingDuration').value, 10);
        const maxParticipantsValue = parseInt(document.getElementById('trainingMaxParticipants').value, 10);

        const trainingData = {
            title: document.getElementById('trainingTitle').value,
            description: document.getElementById('trainingDescription').value,
            location: document.getElementById('trainingLocation').value,
            session_date: document.getElementById('trainingDate').value ? new Date(document.getElementById('trainingDate').value).toISOString() : null,
            trainer: document.getElementById('trainingTrainer').value,
            duration_minutes: Number.isNaN(durationValue) ? null : durationValue,
            skill_level: document.getElementById('trainingLevel').value,
            max_participants: Number.isNaN(maxParticipantsValue) ? null : maxParticipantsValue,
            materials: parsedMaterials,
            updated_by: this.currentUser?.id || null
        };

        if (!parsedMaterials.length) {
            trainingData.materials = [];
        }

        if (!this.currentEditId && this.currentUser?.id) {
            trainingData.created_by = this.currentUser.id;
        }

        if (!trainingData.updated_by) {
            delete trainingData.updated_by;
        }

        try {
            let result;
            if (this.currentEditId) {
                result = await this.supabase
                    .from('training_sessions')
                    .update(trainingData)
                    .eq('id', this.currentEditId);
            } else {
                result = await this.supabase
                    .from('training_sessions')
                    .insert([trainingData]);
            }

            if (result.error) throw result.error;

            this.showToast(`Training session ${this.currentEditId ? 'updated' : 'created'} successfully`, 'success');
            bootstrap.Modal.getInstance(document.getElementById('trainingModal')).hide();
            await this.loadTrainingSessions();
        } catch (error) {
            console.error('Error saving training session:', error);
            this.showToast('Failed to save training session', 'error');
        }
    }

    async editTraining(id) {
        try {
            const { data, error } = await this.supabase
                .from('training_sessions')
                .select('*')
                .eq('id', id)
                .single();

            if (error) throw error;

            this.currentEditId = id;
            this.populateTrainingForm(data);
            document.getElementById('trainingModalTitle').textContent = 'Edit Training Session';
            new bootstrap.Modal(document.getElementById('trainingModal')).show();
        } catch (error) {
            console.error('Error loading training session for edit:', error);
            this.showToast('Failed to load training session', 'error');
        }
    }

    populateTrainingForm(session) {
        document.getElementById('trainingTitle').value = session.title || '';
        document.getElementById('trainingDescription').value = session.description || '';
        document.getElementById('trainingLocation').value = session.location || '';
        document.getElementById('trainingTrainer').value = session.trainer || '';
        document.getElementById('trainingDuration').value = session.duration_minutes ?? '';
        document.getElementById('trainingLevel').value = session.skill_level || 'beginner';
        document.getElementById('trainingMaxParticipants').value = session.max_participants ?? '';

        const materialsValue = Array.isArray(session.materials)
            ? session.materials.join(', ')
            : (session.materials || '');
        document.getElementById('trainingMaterials').value = materialsValue;

        if (session.session_date) {
            document.getElementById('trainingDate').value = this.formatDateForInput(session.session_date);
        }

        document.getElementById('trainingModalTitle').textContent = 'Edit Training Session';
    }

    async deleteTraining(id) {
        if (!confirm('Are you sure you want to delete this training session?')) return;

        try {
            const { error } = await this.supabase
                .from('training_sessions')
                .delete()
                .eq('id', id);

            if (error) throw error;

            this.showToast('Training session deleted successfully', 'success');
            await this.loadTrainingSessions();
        } catch (error) {
            console.error('Error deleting training session:', error);
            this.showToast('Failed to delete training session', 'error');
        }
    }

    // Resources Management
    async loadResources() {
        try {
            const { data, error } = await this.supabase
                .from('resources')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) {
                if (this.isMissingTableError(error)) {
                    await this.loadLegacyResources();
                    return;
                }
                throw error;
            }

            const normalized = (data || []).map(item =>
                this.normalizeResourceRecord(item, {
                    table: 'resources',
                    key: item.resource_type || item.category || 'general'
                })
            );

            this.renderResourcesTable(normalized);
        } catch (error) {
            console.error('Error loading resources:', error);
            this.showToast('Failed to load resources', 'error');
            this.renderResourcesTable([]);
        }
    }

    async loadLegacyResources() {
        const aggregated = [];

        for (const source of this.resourceSources) {
            try {
                const { data, error } = await this.supabase
                    .from(source.table)
                    .select('*')
                    .order('created_at', { ascending: false });

                if (error) throw error;

                (data || []).forEach(item => {
                    aggregated.push(this.normalizeResourceRecord(item, source));
                });
            } catch (error) {
                console.warn(`Error loading resources from ${source.table}:`, error);
            }
        }

        if (aggregated.length === 0) {
            this.renderResourcesTable([]);
            return;
        }

        aggregated.sort((a, b) => {
            const aTime = a.created_at ? new Date(a.created_at).getTime() : 0;
            const bTime = b.created_at ? new Date(b.created_at).getTime() : 0;
            return bTime - aTime;
        });

        this.renderResourcesTable(aggregated);
    }

    normalizeResourceRecord(resource, source) {
        const sourceKey = source?.key || resource?.resource_type || resource?.category || 'general';

        let normalizedTags = [];
        if (Array.isArray(resource.tags)) {
            normalizedTags = resource.tags;
        } else if (typeof resource.tags === 'string' && resource.tags.trim().length > 0) {
            const cleaned = resource.tags.replace(/[{}]/g, '');
            normalizedTags = cleaned.split(',').map(tag => tag.trim()).filter(Boolean);
        }

        return {
            ...resource,
            category: resource.category || sourceKey,
            file_type: resource.file_type || resource.type || null,
            tags: normalizedTags,
            difficulty_level: resource.difficulty_level || 'beginner',
            estimated_time: resource.estimated_time ?? null,
            is_active: typeof resource.is_active === 'boolean' ? resource.is_active : true,
            _table: source?.table || 'resources',
            _source: sourceKey
        };
    }

    renderResourcesTable(resources) {
        const tbody = document.getElementById('resourcesTable');
        if (!tbody) {
            console.error('Resources table not found');
            return;
        }

        tbody.innerHTML = '';

        if (resources.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="4" class="text-center text-muted py-4">
                        <i class="bi bi-folder"></i> No resources found
                    </td>
                </tr>
            `;
            return;
        }

        resources.forEach(resource => {
            const collectionBadge = this.formatResourceSource(resource._source || resource.resource_type || resource.category);
            const fileTypeBadge = this.formatFileType(resource.file_type);
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${resource.title}</td>
                <td>
                    <span class="badge bg-info">${collectionBadge}</span>
                    ${fileTypeBadge ? `<span class="badge bg-secondary ms-1">${fileTypeBadge}</span>` : ''}
                </td>
                <td>${resource.created_at ? new Date(resource.created_at).toLocaleDateString() : 'N/A'}</td>
                <td>
                    <button class="btn btn-sm btn-outline-primary me-1" onclick="adminPanel.editResource('${resource._table}', '${resource.id}')">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger" onclick="adminPanel.deleteResource('${resource._table}', '${resource.id}')">
                        <i class="bi bi-trash"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    async handleResourceSubmit(e) {
        e.preventDefault();

        const sourceValue = document.getElementById('resourceSource').value;
        const source = this.getResourceSourceByKey(sourceValue);
        const tagsInput = document.getElementById('resourceTags').value || '';
        const parsedTags = tagsInput
            .split(',')
            .map(tag => tag.trim())
            .filter(tag => tag.length > 0);
        const estimatedTimeValue = parseInt(document.getElementById('resourceEstimatedTime').value, 10);

        const activeSourceKey = source ? source.key : (this.currentResourceSource || sourceValue || 'general');
        let tableName;

        if (this.currentEditId) {
            tableName = this.currentResourceTable || (source ? source.table : 'resources');
        } else {
            if (!source) {
                this.showToast('Please choose a valid collection for the resource', 'error');
                return;
            }
            tableName = source.table;
        }

        const resourceData = {
            title: document.getElementById('resourceTitle').value,
            description: document.getElementById('resourceDescription').value,
            category: activeSourceKey,
            file_type: document.getElementById('resourceFileType').value || null,
            file_url: document.getElementById('resourceUrl').value,
            download_url: document.getElementById('resourceDownloadUrl').value || null,
            file_size: document.getElementById('resourceFileSize').value || null,
            tags: parsedTags,
            difficulty_level: document.getElementById('resourceDifficulty').value,
            estimated_time: Number.isNaN(estimatedTimeValue) ? null : estimatedTimeValue,
            created_by: document.getElementById('resourceCreatedBy').value || null,
            is_active: document.getElementById('resourceActive').value === 'true'
        };

        if (tableName === 'resources') {
            resourceData.resource_type = activeSourceKey;
        }

        try {
            let result;
            if (this.currentEditId) {
                result = await this.supabase
                    .from(tableName)
                    .update(resourceData)
                    .eq('id', this.currentEditId);
            } else {
                result = await this.supabase
                    .from(tableName)
                    .insert([resourceData]);
            }

            if (result.error) throw result.error;

            this.showToast(`Resource ${this.currentEditId ? 'updated' : 'created'} successfully`, 'success');
            bootstrap.Modal.getInstance(document.getElementById('resourceModal')).hide();
            await this.loadResources();
        } catch (error) {
            console.error('Error saving resource:', error);
            this.showToast('Failed to save resource', 'error');
        }
    }

    async editResource(tableName, id) {
        try {
            const { data, error } = await this.supabase
                .from(tableName)
                .select('*')
                .eq('id', id)
                .single();

            if (error) throw error;

            this.currentEditId = id;
            this.currentResourceTable = tableName;
            this.currentResourceSource = this.getResourceSourceByTable(tableName)?.key || data.resource_type || data.category || 'general';
            this.populateResourceForm(data, tableName);
            document.getElementById('resourceModalTitle').textContent = 'Edit Resource';
            new bootstrap.Modal(document.getElementById('resourceModal')).show();
        } catch (error) {
            console.error('Error loading resource for edit:', error);
            this.showToast('Failed to load resource', 'error');
        }
    }

    populateResourceForm(resource, tableName) {
        const source = this.getResourceSourceByTable(tableName);
        const sourceKey = source?.key || resource.resource_type || resource.category || 'template';

        this.currentResourceSource = sourceKey;
        document.getElementById('resourceTitle').value = resource.title || '';
        document.getElementById('resourceDescription').value = resource.description || '';
        document.getElementById('resourceSource').value = sourceKey;
        document.getElementById('resourceSource').disabled = true;
        document.getElementById('resourceFileType').value = resource.file_type || 'pdf';
        document.getElementById('resourceUrl').value = resource.file_url || '';
        document.getElementById('resourceDownloadUrl').value = resource.download_url || '';
        document.getElementById('resourceFileSize').value = resource.file_size || '';
        document.getElementById('resourceDifficulty').value = resource.difficulty_level || 'beginner';
        document.getElementById('resourceEstimatedTime').value = resource.estimated_time ?? '';
        document.getElementById('resourceTags').value = Array.isArray(resource.tags) ? resource.tags.join(', ') : (resource.tags || '');
        document.getElementById('resourceCreatedBy').value = resource.created_by || '';
        document.getElementById('resourceActive').value = resource.is_active === false ? 'false' : 'true';
    }

    async deleteResource(tableName, id) {
        if (!confirm('Are you sure you want to delete this resource?')) return;

        try {
            const { error } = await this.supabase
                .from(tableName)
                .delete()
                .eq('id', id);

            if (error) throw error;

            this.showToast('Resource deleted successfully', 'success');
            await this.loadResources();
        } catch (error) {
            console.error('Error deleting resource:', error);
            this.showToast('Failed to delete resource', 'error');
        }
    }

    isMissingTableError(error) {
        if (!error) return false;
        const message = `${error.message || ''} ${error.details || ''}`.toLowerCase();
        return (
            error.code === 'PGRST116' ||
            error.code === 'PGRST205' ||
            error.code === '42P01' ||
            error.status === 404 ||
            message.includes('does not exist') ||
            message.includes('not found')
        );
    }

    getResourceSourceByKey(key) {
        if (!key) return null;
        return this.resourceSources.find(source => source.key === key) || null;
    }

    getResourceSourceByTable(tableName) {
        if (!tableName) return null;
        return this.resourceSources.find(source => source.table === tableName) || null;
    }


    // Utility Functions
    formatDateForInput(dateString) {
        if (!dateString) return '';
        const date = new Date(dateString);
        if (Number.isNaN(date.getTime())) {
            return '';
        }
        return date.toISOString().slice(0, 16);
    }

    formatResourceSource(key) {
        if (!key) {
            return 'General';
        }
        const source = this.getResourceSourceByKey(key);
        if (source) {
            return source.label;
        }
        const normalized = key.toString().trim();
        if (!normalized) {
            return 'General';
        }
        return normalized.charAt(0).toUpperCase() + normalized.slice(1);
    }

    formatFileType(fileType) {
        if (!fileType) {
            return '';
        }
        const normalized = fileType.toString().trim();
        if (!normalized) {
            return '';
        }
        return normalized.toUpperCase();
    }

    generateSlug(text) {
        return text.toLowerCase()
            .replace(/[^\w ]+/g, '')
            .replace(/ +/g, '-');
    }

    resetForm() {
        this.currentEditId = null;
        this.currentEditCategory = null;
        this.currentResourceTable = null;
        this.currentResourceSource = null;
        document.querySelectorAll('.modal form').forEach(form => form.reset());

        const defaultSource = this.resourceSources?.[0]?.key || 'template';
        const resourceSource = document.getElementById('resourceSource');
        if (resourceSource) {
            resourceSource.disabled = false;
            resourceSource.value = defaultSource;
        }
        const resourceDifficulty = document.getElementById('resourceDifficulty');
        if (resourceDifficulty) {
            resourceDifficulty.value = 'beginner';
        }
        const resourceActive = document.getElementById('resourceActive');
        if (resourceActive) {
            resourceActive.value = 'true';
        }
        const resourceFileType = document.getElementById('resourceFileType');
        if (resourceFileType) {
            resourceFileType.value = 'pdf';
        }
    }

    showToast(message, type = 'info') {
        // Create toast container if it doesn't exist
        let toastContainer = document.getElementById('toastContainer');
        if (!toastContainer) {
            toastContainer = document.createElement('div');
            toastContainer.id = 'toastContainer';
            toastContainer.className = 'toast-container position-fixed top-0 end-0 p-3';
            toastContainer.style.zIndex = '1080';
            document.body.appendChild(toastContainer);
        }

        const toastId = 'toast-' + Date.now();
        const bgColor = {
            success: 'bg-success',
            error: 'bg-danger',
            warning: 'bg-warning',
            info: 'bg-info'
        }[type] || 'bg-info';

        const toastHTML = `
            <div id="${toastId}" class="toast ${bgColor} text-white" role="alert">
                <div class="toast-header ${bgColor} text-white border-0">
                    <strong class="me-auto">Admin Panel</strong>
                    <button type="button" class="btn-close btn-close-white" data-bs-dismiss="toast"></button>
                </div>
                <div class="toast-body">
                    ${message}
                </div>
            </div>
        `;

        toastContainer.insertAdjacentHTML('beforeend', toastHTML);

        const toastElement = document.getElementById(toastId);
        const toast = new bootstrap.Toast(toastElement, { delay: 5000 });
        toast.show();

        // Clean up after toast is hidden
        toastElement.addEventListener('hidden.bs.toast', () => {
            toastElement.remove();
        });
    }
}

// Initialize admin panel when page loads
let adminPanel;
document.addEventListener('DOMContentLoaded', () => {
    adminPanel = new AdminPanel();
});

// Global functions for onclick handlers
function logout() {
    if (adminPanel) {
        adminPanel.logout();
    }
}

// Password visibility toggle
function togglePasswordVisibility() {
    const passwordInput = document.getElementById('loginPassword');
    const passwordIcon = document.getElementById('passwordIcon');

    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        passwordIcon.classList.remove('bi-eye');
        passwordIcon.classList.add('bi-eye-slash');
    } else {
        passwordInput.type = 'password';
        passwordIcon.classList.remove('bi-eye-slash');
        passwordIcon.classList.add('bi-eye');
    }
}

// Modal show functions
function showEventForm() {
    adminPanel.currentEditId = null;
    document.getElementById('eventModalTitle').textContent = 'Add Event';
    new bootstrap.Modal(document.getElementById('eventModal')).show();
}

function showNewsForm() {
    adminPanel.currentEditId = null;
    document.getElementById('newsModalTitle').textContent = 'Add News';
    new bootstrap.Modal(document.getElementById('newsModal')).show();
}

function showTrainingForm() {
    adminPanel.currentEditId = null;
    document.getElementById('trainingModalTitle').textContent = 'Add Training Session';
    new bootstrap.Modal(document.getElementById('trainingModal')).show();
}

function showResourceForm() {
    adminPanel.currentEditId = null;
    adminPanel.currentResourceTable = null;
    adminPanel.currentResourceSource = null;
    document.getElementById('resourceModalTitle').textContent = 'Add Resource';
    const defaultSource = adminPanel?.resourceSources?.[0]?.key || 'template';
    const sourceSelect = document.getElementById('resourceSource');
    if (sourceSelect) {
        sourceSelect.disabled = false;
        sourceSelect.value = defaultSource;
    }
    const difficultySelect = document.getElementById('resourceDifficulty');
    if (difficultySelect) {
        difficultySelect.value = 'beginner';
    }
    const fileTypeSelect = document.getElementById('resourceFileType');
    if (fileTypeSelect) {
        fileTypeSelect.value = 'pdf';
    }
    const statusSelect = document.getElementById('resourceActive');
    if (statusSelect) {
        statusSelect.value = 'true';
    }
    new bootstrap.Modal(document.getElementById('resourceModal')).show();
}

// Save functions
function saveEvent() {
    const form = document.getElementById('eventForm');
    const formData = new FormData();

    formData.append('title', document.getElementById('eventTitle').value);
    formData.append('event_date', document.getElementById('eventDate').value);
    formData.append('location', document.getElementById('eventLocation').value);
    formData.append('organizer_name', document.getElementById('eventOrganizer').value);
    formData.append('short_description', document.getElementById('eventShortDescription').value);
    formData.append('description', document.getElementById('eventDescription').value);
    formData.append('link', document.getElementById('eventLink').value);

    const event = { preventDefault: () => {}, target: { elements: form.elements } };
    adminPanel.handleEventSubmit({ preventDefault: () => {}, target: form });
}

function saveNews() {
    const form = document.getElementById('newsForm');
    adminPanel.handleNewsSubmit({ preventDefault: () => {}, target: form });
}

function saveTraining() {
    const form = document.getElementById('trainingForm');
    adminPanel.handleTrainingSubmit({ preventDefault: () => {}, target: form });
}

function saveResource() {
    const form = document.getElementById('resourceForm');
    adminPanel.handleResourceSubmit({ preventDefault: () => {}, target: form });
}

window.adminPanel = {
    editEvent: (id) => adminPanel.editEvent(id),
    deleteEvent: (id) => adminPanel.deleteEvent(id),
    editNews: (id, category) => adminPanel.editNews(id, category),
    deleteNews: (id, category) => adminPanel.deleteNews(id, category),
    editTraining: (id) => adminPanel.editTraining(id),
    deleteTraining: (id) => adminPanel.deleteTraining(id),
    editResource: (table, id) => adminPanel.editResource(table, id),
    deleteResource: (table, id) => adminPanel.deleteResource(table, id)
};
