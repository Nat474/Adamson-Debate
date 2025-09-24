/**
 * Supabase Configuration and Client Setup
 * Adamson Debate Society Website Integration
 */

// Load environment variables (for local development)
// In production, these should be set as environment variables
const SUPABASE_CONFIG = {
    url: 'https://genkeeohrgnjliqhyuyh.supabase.co',
    key: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdlbmtlZW9ocmduamxpcWh5dXloIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg2MzEwMTIsImV4cCI6MjA3NDIwNzAxMn0.nQvIM-pVz1tt45otWcO7dN--bcaRH_tJ7RCTBKU9d-o'
};

// Initialize Supabase client
const { createClient } = supabase;
const supabaseClient = createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.key);

// Database helper functions
class DebateSocietyDB {
    constructor() {
        this.client = supabaseClient;
    }


    // News and Posts management
    async getNews(limit = 10) {
        try {
            const { data, error } = await this.client
                .from('news_posts')
                .select('*')
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

    // News category management
    async getCommunityNews(limit = 10) {
        try {
            const { data, error } = await this.client
                .from('news_community')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(limit);

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error fetching community news:', error);
            return [];
        }
    }

    async getTrainingNews(limit = 10) {
        try {
            const { data, error } = await this.client
                .from('news_training')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(limit);

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error fetching training news:', error);
            return [];
        }
    }

    async getTournamentNews(limit = 10) {
        try {
            const { data, error } = await this.client
                .from('news_tournaments')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(limit);

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error fetching tournament news:', error);
            return [];
        }
    }

    async getAllNews(limit = 20) {
        try {
            // Fetch from all news tables and combine
            const [communityNews, trainingNews, tournamentNews] = await Promise.all([
                this.getCommunityNews(limit),
                this.getTrainingNews(limit),
                this.getTournamentNews(limit)
            ]);

            // Add type field to distinguish news categories
            const combinedNews = [
                ...communityNews.map(news => ({ ...news, type: 'community', category: 'Community' })),
                ...trainingNews.map(news => ({ ...news, type: 'training', category: 'Training' })),
                ...tournamentNews.map(news => ({ ...news, type: 'tournaments', category: 'Tournaments' }))
            ];

            // Sort by date and limit
            return combinedNews
                .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
                .slice(0, limit);

        } catch (error) {
            console.error('Error fetching all news:', error);
            return [];
        }
    }

    async getNewsById(id, table = null) {
        try {
            if (table) {
                // Search in specific table
                const { data, error } = await this.client
                    .from(table)
                    .select('*')
                    .eq('id', id)
                    .single();

                if (error) throw error;
                return { ...data, type: table.replace('news_', ''), category: this.getCategoryDisplayName(table) };
            } else {
                // Search in all news tables
                const tables = ['news_community', 'news_training', 'news_tournaments'];

                for (const tableName of tables) {
                    try {
                        const { data, error } = await this.client
                            .from(tableName)
                            .select('*')
                            .eq('id', id)
                            .single();

                        if (!error && data) {
                            return { ...data, type: tableName.replace('news_', ''), category: this.getCategoryDisplayName(tableName) };
                        }
                    } catch (tableError) {
                        // Continue to next table if not found
                        continue;
                    }
                }
            }

            return null;
        } catch (error) {
            console.error('Error fetching news by ID:', error);
            return null;
        }
    }

    getCategoryDisplayName(tableName) {
        const displayNames = {
            'news_community': 'Community',
            'news_training': 'Training',
            'news_tournaments': 'Tournaments'
        };
        return displayNames[tableName] || 'News';
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