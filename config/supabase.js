/**
 * Supabase Configuration and Client Setup
 * Adamson Debate Society Website Integration
 */

// Load environment variables (for local development)
// In production, these should be set as environment variables
const SUPABASE_CONFIG = {
    url: 'https://qwtvqkwhkncskjpygunz.supabase.co',
    key: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF3dHZxa3doa25jc2tqcHlndW56Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg1MTg5NjIsImV4cCI6MjA3NDA5NDk2Mn0.AOLF08s8ahdvgd5lBq2pUBsaiWfynvS3U9RiHOKyiQI'
};

// Initialize Supabase client
const { createClient } = supabase;
const supabaseClient = createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.key);

// Database helper functions
class DebateSocietyDB {
    constructor() {
        this.client = supabaseClient;
    }

    // Members management
    async getMembers(filters = {}) {
        try {
            let query = this.client.from('members').select('*');

            if (filters.status) {
                query = query.eq('status', filters.status);
            }
            if (filters.membership_type) {
                query = query.eq('membership_type', filters.membership_type);
            }

            const { data, error } = await query.order('created_at', { ascending: false });

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error fetching members:', error);
            return [];
        }
    }

    async addMember(memberData) {
        try {
            const { data, error } = await this.client
                .from('members')
                .insert([memberData])
                .select();

            if (error) throw error;
            return { success: true, data: data[0] };
        } catch (error) {
            console.error('Error adding member:', error);
            return { success: false, error: error.message };
        }
    }

    // News and Posts management
    async getNews(limit = 10, published = true) {
        try {
            let query = this.client
                .from('news_posts')
                .select('*');

            if (published) {
                query = query.eq('published', true);
            }

            const { data, error } = await query
                .order('created_at', { ascending: false })
                .limit(limit);

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error fetching news:', error);
            return [];
        }
    }

    async getNewsById(id) {
        try {
            const { data, error } = await this.client
                .from('news_posts')
                .select('*')
                .eq('id', id)
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error fetching news by ID:', error);
            return null;
        }
    }

    async addNews(newsData) {
        try {
            const { data, error } = await this.client
                .from('news_posts')
                .insert([newsData])
                .select();

            if (error) throw error;
            return { success: true, data: data[0] };
        } catch (error) {
            console.error('Error adding news:', error);
            return { success: false, error: error.message };
        }
    }

    // Events management
    async getEvents(upcoming = true, limit = 10) {
        try {
            let query = this.client
                .from('events')
                .select('*');

            if (upcoming) {
                const now = new Date().toISOString();
                query = query.gte('event_date', now);
            }

            const { data, error } = await query
                .order('event_date', { ascending: true })
                .limit(limit);

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error fetching events:', error);
            return [];
        }
    }

    async getEventById(id) {
        try {
            const { data, error } = await this.client
                .from('events')
                .select('*')
                .eq('id', id)
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error fetching event by ID:', error);
            return null;
        }
    }

    async addEvent(eventData) {
        try {
            const { data, error } = await this.client
                .from('events')
                .insert([eventData])
                .select();

            if (error) throw error;
            return { success: true, data: data[0] };
        } catch (error) {
            console.error('Error adding event:', error);
            return { success: false, error: error.message };
        }
    }

    // Contact form submissions
    async submitContact(contactData) {
        try {
            const { data, error } = await this.client
                .from('contact_submissions')
                .insert([{
                    ...contactData,
                    submitted_at: new Date().toISOString()
                }])
                .select();

            if (error) throw error;
            return { success: true, data: data[0] };
        } catch (error) {
            console.error('Error submitting contact form:', error);
            return { success: false, error: error.message };
        }
    }

    // Authentication helpers
    async signUp(email, password, userData = {}) {
        try {
            const { data, error } = await this.client.auth.signUp({
                email,
                password,
                options: {
                    data: userData
                }
            });

            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            console.error('Error signing up:', error);
            return { success: false, error: error.message };
        }
    }

    async signIn(email, password) {
        try {
            const { data, error } = await this.client.auth.signInWithPassword({
                email,
                password
            });

            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            console.error('Error signing in:', error);
            return { success: false, error: error.message };
        }
    }

    async signOut() {
        try {
            const { error } = await this.client.auth.signOut();
            if (error) throw error;
            return { success: true };
        } catch (error) {
            console.error('Error signing out:', error);
            return { success: false, error: error.message };
        }
    }

    async getCurrentUser() {
        try {
            const { data: { user } } = await this.client.auth.getUser();
            return user;
        } catch (error) {
            console.error('Error getting current user:', error);
            return null;
        }
    }

    // Utility functions
    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    formatTime(dateString) {
        const date = new Date(dateString);
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    slugify(text) {
        return text
            .toString()
            .toLowerCase()
            .replace(/\s+/g, '-')
            .replace(/[^\w\-]+/g, '')
            .replace(/\-\-+/g, '-')
            .replace(/^-+/, '')
            .replace(/-+$/, '');
    }
}

// Initialize database instance
const debateDB = new DebateSocietyDB();

// Export for use in other files
window.debateDB = debateDB;
window.supabaseClient = supabaseClient;