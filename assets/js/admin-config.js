// Admin Panel Configuration and Functionality
class AdminPanel {
    constructor() {
        this.supabase = null;
        this.supabaseAdmin = null;
        this.supabaseUrl = null;
        this.currentTab = 'blog';
        this.currentEditId = null;
        this.currentUser = null;
        this.profileModal = null;
        this.photoCropper = null;
        this.photoCropModal = null;
        this.croppedPhotoUrl = null;
        this.croppedPhotoBlob = null;
        this.blogs = [];
        this.partners = [];
        this.resourcesData = [];
        this.adminsList = [];
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

            // Store service key for admin operations
            this.serviceKey = SUPABASE_SERVICE_KEY;
            this.supabaseUrl = SUPABASE_URL;

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
        const blogForm = document.getElementById('blogForm');
        if (blogForm) {
            blogForm.addEventListener('submit', (e) => this.handleBlogSubmit(e));
        }

        const partnerForm = document.getElementById('partnerForm');
        if (partnerForm) {
            partnerForm.addEventListener('submit', (e) => this.handlePartnerSubmit(e));
        }

        const resourceForm = document.getElementById('resourceForm');
        if (resourceForm) {
            resourceForm.addEventListener('submit', (e) => this.handleResourceSubmit(e));
        }
        const resourceUploadBtn = document.getElementById('resourceUploadBtn');
        if (resourceUploadBtn) {
            resourceUploadBtn.addEventListener('click', () => this.openResourceUpload());
        }
        const partnerUploadBtn = document.getElementById('partnerUploadBtn');
        if (partnerUploadBtn) {
            partnerUploadBtn.addEventListener('click', () => this.openPartnerUpload());
        }
        const blogUploadBtn = document.getElementById('blogUploadBtn');
        if (blogUploadBtn) {
            blogUploadBtn.addEventListener('click', () => this.openBlogUpload());
        }

        const profileForm = document.getElementById('profileForm');
        if (profileForm) {
            profileForm.addEventListener('submit', (e) => this.handleProfileSubmit(e));
        }

        const profileSaveBtn = document.getElementById('profileSaveBtn');
        if (profileSaveBtn) {
            profileSaveBtn.addEventListener('click', () => this.handleProfileSubmit(new Event('submit')));
        }

        const profilePhotoFile = document.getElementById('profilePhotoFile');
        if (profilePhotoFile) {
            profilePhotoFile.addEventListener('change', (e) => this.handlePhotoFileChange(e));
        }

        const profileCropOpenBtn = document.getElementById('profileCropOpenBtn');
        if (profileCropOpenBtn) {
            profileCropOpenBtn.addEventListener('click', () => this.openCropperModal());
        }

        const profileCropResetBtn = document.getElementById('profileCropResetBtn');
        if (profileCropResetBtn) {
            profileCropResetBtn.addEventListener('click', () => this.resetPhotoCropper());
        }

        const cropperApplyBtn = document.getElementById('cropperApplyBtn');
        if (cropperApplyBtn) {
            cropperApplyBtn.addEventListener('click', () => this.applyCrop());
        }

        // Modal events
        const resettableModalIds = ['blogModal', 'partnerModal', 'resourceModal', 'profileModal'];
        resettableModalIds.forEach(id => {
            const modalEl = document.getElementById(id);
            if (modalEl) {
                modalEl.addEventListener('hidden.bs.modal', () => {
                    this.resetForm(modalEl);
                });
            }
        });

        const cropModalEl = document.getElementById('photoCropModal');
        if (cropModalEl) {
            cropModalEl.addEventListener('hidden.bs.modal', () => {
                this.destroyPhotoCropper();
            });
        }
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
                await this.ensureProfileComplete();
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
                await this.ensureProfileComplete();
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
        document.querySelector('.nav-link[data-bs-target="#blog"]').focus();
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
        await this.loadTabData('blog');
    }

    // Admin profile enforcement
    async ensureProfileComplete() {
        if (!this.currentUser) return;

        try {
            const { data: profile, error } = await this.supabase
                .from('admin_profiles')
                .select('*')
                .eq('user_id', this.currentUser.id)
                .maybeSingle();

            if (error) {
                throw error;
            }

            if (!profile || this.isProfileIncomplete(profile)) {
                this.prefillProfileForm(profile || {});
                this.getProfileModal().show();
            } else {
                this.prefillProfileForm(profile);
            }
        } catch (error) {
            console.error('Error checking admin profile:', error);
            this.prefillProfileForm();
            this.getProfileModal().show();
            this.showToast('Please complete your admin profile to continue', 'warning');
        }
    }

    isProfileIncomplete(profile) {
        if (!profile) return true;
        const requiredFields = ['name', 'position', 'mobile_number', 'facebook_url', 'photo_url'];
        return requiredFields.some(field => !profile[field] || profile[field].toString().trim().length === 0);
    }

    prefillProfileForm(profile = {}) {
        const emailInput = document.getElementById('profileEmail');
        const nameInput = document.getElementById('profileName');
        const positionInput = document.getElementById('profilePosition');
        const mobileInput = document.getElementById('profileMobile');
        const facebookInput = document.getElementById('profileFacebook');
        const photoPreview = document.getElementById('profilePhotoPreview');
        const fileInput = document.getElementById('profilePhotoFile');

        if (emailInput && this.currentUser) emailInput.value = this.currentUser.email || '';
        if (nameInput) nameInput.value = profile.name || '';
        if (positionInput) positionInput.value = profile.position || '';
        if (mobileInput) mobileInput.value = profile.mobile_number || '';
        if (facebookInput) facebookInput.value = profile.facebook_url || '';
        if (photoPreview) photoPreview.src = profile.photo_url || '';
        this.croppedPhotoUrl = profile.photo_url || null;
        this.croppedPhotoBlob = null;
        if (fileInput) {
            if (profile.photo_url) {
                fileInput.removeAttribute('required');
            } else {
                fileInput.setAttribute('required', 'required');
            }
        }
    }

    getProfileModal() {
        if (!this.profileModal) {
            const modalEl = document.getElementById('profileModal');
            if (modalEl) {
                this.profileModal = new bootstrap.Modal(modalEl, {
                    backdrop: 'static',
                    keyboard: false
                });
            }
        }
        return this.profileModal;
    }

    setProfileSaving(loading) {
        const saveBtn = document.getElementById('profileSaveBtn');
        const spinner = document.getElementById('profileSaveSpinner');
        const text = document.getElementById('profileSaveText');
        if (!saveBtn || !spinner || !text) return;

        if (loading) {
            spinner.classList.remove('d-none');
            saveBtn.disabled = true;
            text.textContent = 'Saving...';
        } else {
            spinner.classList.add('d-none');
            saveBtn.disabled = false;
            text.textContent = 'Save Profile';
        }
    }

    async handleProfileSubmit(e) {
        if (e?.preventDefault) {
            e.preventDefault();
        }
        if (!this.currentUser) return;

        const form = document.getElementById('profileForm');
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }

        let photoUrl;
        try {
            photoUrl = await this.getPhotoUrlBeforeSave();
        } catch (err) {
            this.showToast(err.message || 'Please provide a profile photo', 'warning');
            return;
        }

        const payload = {
            user_id: this.currentUser.id,
            email: this.currentUser.email,
            name: document.getElementById('profileName').value.trim(),
            position: document.getElementById('profilePosition').value.trim(),
            mobile_number: document.getElementById('profileMobile').value.trim(),
            facebook_url: document.getElementById('profileFacebook').value.trim(),
            photo_url: photoUrl
        };

        this.setProfileSaving(true);
        try {
            const { error } = await this.supabase
                .from('admin_profiles')
                .upsert(payload, { onConflict: 'user_id' });

            if (error) throw error;

            this.showToast('Profile saved', 'success');
            const modal = this.getProfileModal();
            if (modal) {
                modal.hide();
            }
        } catch (error) {
            console.error('Error saving profile:', error);
            this.showToast('Failed to save profile', 'error');
        } finally {
            this.setProfileSaving(false);
        }
    }

    async handlePhotoFileChange(event) {
        const file = event.target.files?.[0];
        if (!file) return;

        this.resetPhotoCropper(false);
        await this.openCropperModal(file);
    }

    async openCropperModal(file) {
        const modal = this.getPhotoCropModal();
        if (!modal) return;

        const imageEl = document.getElementById('cropperImage');

        if (!imageEl) return;

        // If file provided, load it; otherwise try existing preview src
        if (file) {
            imageEl.src = URL.createObjectURL(file);
        } else if (this.croppedPhotoUrl) {
            imageEl.src = this.croppedPhotoUrl;
        } else {
            return;
        }

        if (this.photoCropper) {
            this.photoCropper.destroy();
        }

        // Wait for image to load before initializing cropper
        await new Promise(resolve => {
            if (imageEl.complete && imageEl.naturalWidth > 0) return resolve();
            imageEl.onload = () => resolve();
        });

        this.photoCropper = new Cropper(imageEl, {
            aspectRatio: 1,
            viewMode: 2, // keep image inside container
            autoCropArea: 1,
            responsive: true,
            background: false,
            zoomable: false,
            zoomOnWheel: false,
            zoomOnTouch: false,
            zoomOnDblclick: false,
            scalable: false,
            movable: true,
            dragMode: 'move',
            ready: () => this.fitImageToContainer(),
            zoom: (event) => {
                if (event?.detail?.originalEvent) {
                    event.preventDefault();
                }
            }
        });

        modal.show();
    }

    getPhotoCropModal() {
        if (!this.photoCropModal) {
            const el = document.getElementById('photoCropModal');
            if (el) {
                this.photoCropModal = new bootstrap.Modal(el, {
                    backdrop: 'static',
                    keyboard: false
                });
            }
        }
        return this.photoCropModal;
    }

    applyCrop() {
        if (!this.photoCropper) return;

        const canvas = this.photoCropper.getCroppedCanvas({ width: 600, height: 600 });
        if (!canvas) return;

        canvas.toBlob((blob) => {
            if (!blob) return;
            this.croppedPhotoBlob = blob;
            const previewEl = document.getElementById('profilePhotoPreview');
            if (previewEl) {
                previewEl.src = canvas.toDataURL('image/jpeg', 0.9);
            }
            const fileInput = document.getElementById('profilePhotoFile');
            if (fileInput) {
                fileInput.removeAttribute('required');
            }
            const modal = this.getPhotoCropModal();
            if (modal) {
                modal.hide();
            }
        }, 'image/jpeg', 0.9);
    }

    initCropper() {
        return;
    }

    destroyPhotoCropper() {
        if (this.photoCropper) {
            this.photoCropper.destroy();
            this.photoCropper = null;
        }
    }

    resetPhotoCropper(clearPreview = true) {
        this.destroyPhotoCropper();
        this.croppedPhotoUrl = null;
        this.croppedPhotoBlob = null;
        const previewEl = document.getElementById('profilePhotoPreview');
        if (clearPreview && previewEl) {
            previewEl.src = '';
        }
        const fileInput = document.getElementById('profilePhotoFile');
        if (fileInput) {
            fileInput.value = '';
            fileInput.setAttribute('required', 'required');
        }
        const cropperPreview = document.getElementById('cropperPreview');
        if (cropperPreview) {
            cropperPreview.innerHTML = '';
        }
    }

    async getPhotoUrlBeforeSave() {
        if (this.croppedPhotoUrl && !this.croppedPhotoBlob) {
            return this.croppedPhotoUrl;
        }

        if (!this.croppedPhotoBlob) {
            throw new Error('Please upload and crop a profile photo.');
        }

        const uploadedUrl = await this.uploadToCloudinary(this.croppedPhotoBlob);
        this.croppedPhotoUrl = uploadedUrl;
        this.croppedPhotoBlob = null;
        const fileInput = document.getElementById('profilePhotoFile');
        if (fileInput) {
            fileInput.removeAttribute('required');
        }
        return uploadedUrl;
    }

    fitImageToContainer() {
        if (!this.photoCropper) return;

        const container = this.photoCropper.getContainerData();
        const image = this.photoCropper.getImageData();
        if (!container || !image || !image.naturalWidth || !image.naturalHeight) return;

        // Scale image so it fully covers the square crop area without overlap
        const scale = Math.max(
            container.width / image.naturalWidth,
            container.height / image.naturalHeight
        );
        this.photoCropper.zoomTo(scale);

        // Center the canvas
        const canvas = this.photoCropper.getCanvasData();
        this.photoCropper.setCanvasData({
            ...canvas,
            left: (container.width - canvas.width) / 2,
            top: (container.height - canvas.height) / 2
        });

        // Center a square crop box that fits the visible canvas
        const cropSize = Math.min(canvas.width, canvas.height);
        this.photoCropper.setCropBoxData({
            width: cropSize,
            height: cropSize,
            left: (container.width - cropSize) / 2,
            top: (container.height - cropSize) / 2
        });
    }

    async uploadToCloudinary(blob) {
        const cloudName = window.ENV?.CLOUDINARY_CLOUD_NAME || this.parseCloudinaryUrl()?.cloudName || 'dtkvdi8ha';
        const uploadPreset = window.ENV?.CLOUDINARY_UPLOAD_PRESET || '';
        const apiKey = window.ENV?.CLOUDINARY_API_KEY || this.parseCloudinaryUrl()?.apiKey || '888347376741749';
        const apiSecret = window.ENV?.CLOUDINARY_API_SECRET || window.ENV?.CLOUDINARY_SECRET || this.parseCloudinaryUrl()?.apiSecret || 'aQcehXJGNhTCGTt_ZE3s_fiHzNA';

        if (!cloudName || !apiKey || !apiSecret) {
            throw new Error('Cloudinary configuration missing. Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET.');
        }

        const timestamp = Math.floor(Date.now() / 1000);
        const paramsToSign = {
            timestamp
        };
        if (uploadPreset) {
            paramsToSign.upload_preset = uploadPreset;
        }

        const signature = await this.generateCloudinarySignature(paramsToSign, apiSecret);

        const formData = new FormData();
        formData.append('file', blob);
        formData.append('api_key', apiKey);
        formData.append('timestamp', timestamp.toString());
        formData.append('signature', signature);
        if (uploadPreset) {
            formData.append('upload_preset', uploadPreset);
        }

        // Use "auto" resource type so non-images (e.g., pdf) are accepted
        const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`, {
            method: 'POST',
            body: formData
        });

        let data;
        try {
            data = await response.json();
        } catch (err) {
            // keep data undefined
        }

        if (!response.ok) {
            const msg = data?.error?.message || 'Cloudinary upload failed. Check your upload preset or signature.';
            throw new Error(msg);
        }

        if (!data?.secure_url) {
            throw new Error('Upload succeeded but no URL returned.');
        }

        const previewEl = document.getElementById('profilePhotoPreview');
        if (previewEl) {
            previewEl.src = data.secure_url;
        }
        return data.secure_url;
    }

    parseCloudinaryUrl() {
        const url = window.ENV?.CLOUDINARY_URL;
        if (!url) return null;
        try {
            // Use a plain string-based regex to avoid escaping issues in literals
            const re = new RegExp('^cloudinary://([^:]+):([^@]+)@([^/]+)$');
            const match = url.match(re);
            if (!match) return null;
            const [, apiKey, apiSecret, cloudName] = match;
            if (!apiKey || !apiSecret || !cloudName) return null;
            return { apiKey, apiSecret, cloudName };
        } catch (err) {
            return null;
        }
    }

    async generateCloudinarySignature(params, apiSecret) {
        const sortedKeys = Object.keys(params).sort();
        const paramString = sortedKeys.map(key => `${key}=${params[key]}`).join('&');
        const toSign = `${paramString}${apiSecret}`;

        const encoder = new TextEncoder();
        const data = encoder.encode(toSign);
        const hashBuffer = await crypto.subtle.digest('SHA-1', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        return hashHex;
    }

    async loadTabData(tabName) {
        switch(tabName) {
            case 'blog':
                await this.loadBlogs();
                break;
            case 'partners':
                await this.loadPartners();
                break;
            case 'resources':
                await this.loadResources();
                break;
            case 'admins':
                await this.loadAdmins();
                break;
        }
    }

    // Blog Management (in-memory placeholder)
    getServiceClient() {
        if (!this.supabaseUrl || !this.serviceKey) return this.supabase;
        if (!this.supabaseAdmin) {
            this.supabaseAdmin = supabase.createClient(this.supabaseUrl, this.serviceKey);
        }
        return this.supabaseAdmin;
    }

    // Blog Management
    async loadBlogs() {
        try {
            const { data, error } = await this.getServiceClient()
                .from('blogs')
                .select('*')
                .order('published_at', { ascending: false });

            if (error) throw error;
            this.blogs = data || [];
            this.renderBlogTable(this.blogs);
        } catch (error) {
            console.error('Error loading publications:', error);
            this.showToast('Failed to load publications', 'error');
            this.renderBlogTable([]);
        }
    }

    showBlogForm(id = null) {
        this.currentEditId = id;
        const form = document.getElementById('blogForm');
        if (form) form.reset();

        const modalEl = document.getElementById('blogModal');
        if (!modalEl) return;
        const modal = new bootstrap.Modal(modalEl);

        const title = document.getElementById('blogModalTitle');
        if (title) {
            title.textContent = id ? 'Edit Blog Post' : 'Add Blog Post';
        }

        if (id) {
            const blog = this.blogs.find(b => b.id === id);
            if (blog) {
                document.getElementById('blogTitle').value = blog.title || '';
                const categoryEl = document.getElementById('blogCategory');
                if (categoryEl) {
                    const { category } = blog;
                    if (category && !Array.from(categoryEl.options).some(opt => opt.value === category)) {
                        const opt = document.createElement('option');
                        opt.value = category;
                        opt.textContent = category;
                        categoryEl.appendChild(opt);
                    }
                    categoryEl.value = category || '';
                }
                document.getElementById('blogAuthor').value = blog.author || '';
                document.getElementById('blogDate').value = blog.published_at ? blog.published_at.split('T')[0] : '';
                document.getElementById('blogMinutesToRead').value = blog.minutes_to_read || '';
                const ratingEl = document.getElementById('blogRating');
                if (ratingEl) ratingEl.value = blog.rating || '';
                const commentsEl = document.getElementById('blogComments');
                if (commentsEl) commentsEl.value = blog.comments_count || '';
                document.getElementById('blogDescription').value = blog.description || '';
                document.getElementById('blogBody').value = blog.body || '';
                document.getElementById('blogPhoto').value = blog.photo || '';
                document.getElementById('blogShare').value = blog.share_link || '';
            }
        }

        modal.show();
    }

    async handleBlogSubmit(e) {
        if (e?.preventDefault) e.preventDefault();
        const titleEl = document.getElementById('blogTitle');
        const categoryEl = document.getElementById('blogCategory');
        const authorEl = document.getElementById('blogAuthor');
        const dateEl = document.getElementById('blogDate');
        const minutesEl = document.getElementById('blogMinutesToRead');
        const ratingEl = document.getElementById('blogRating');
        const commentsEl = document.getElementById('blogComments');
        const descEl = document.getElementById('blogDescription');
        const bodyEl = document.getElementById('blogBody');
        const photoEl = document.getElementById('blogPhoto');
        const shareEl = document.getElementById('blogShare');

        // Guard against missing form (e.g., if tab not mounted)
        if (!titleEl || !categoryEl || !authorEl || !dateEl || !minutesEl || !descEl || !bodyEl) {
            this.showToast('Blog form is not available on this view', 'error');
            return;
        }

        const payload = {
            title: titleEl.value.trim(),
            category: categoryEl.value.trim(),
            author: authorEl.value.trim(),
            published_at: dateEl.value,
            minutes_to_read: parseInt(minutesEl.value, 10) || null,
            rating: ratingEl ? parseFloat(ratingEl.value) || null : null,
            comments_count: commentsEl ? parseInt(commentsEl.value, 10) || 0 : 0,
            description: descEl.value.trim(),
            body: bodyEl.value.trim(),
            photo: photoEl ? photoEl.value.trim() : '',
            share_link: shareEl ? shareEl.value.trim() : ''
        };

        const client = this.getServiceClient();
        try {
            if (this.currentEditId) {
                const { error } = await client.from('blogs').update(payload).eq('id', this.currentEditId);
                if (error) throw error;
                this.showToast('Blog updated', 'success');
            } else {
                const { error } = await client.from('blogs').insert(payload);
                if (error) throw error;
                this.showToast('Blog created', 'success');
            }
            await this.loadBlogs();
        } catch (error) {
            console.error('Error saving publication:', error);
            this.showToast('Failed to save publication', 'error');
        } finally {
            this.currentEditId = null;
            bootstrap.Modal.getInstance(document.getElementById('blogModal'))?.hide();
        }
    }

    editBlog(id) {
        const blog = this.blogs.find(b => b.id === id);
        if (!blog) return;
        this.showBlogForm(id);
        document.getElementById('blogTitle').value = blog.title || '';
        const categoryEl = document.getElementById('blogCategory');
        if (categoryEl) {
            const { category } = blog;
            if (category && !Array.from(categoryEl.options).some(opt => opt.value === category)) {
                const opt = document.createElement('option');
                opt.value = category;
                opt.textContent = category;
                categoryEl.appendChild(opt);
            }
            categoryEl.value = category || '';
        }
        document.getElementById('blogAuthor').value = blog.author || '';
        document.getElementById('blogDate').value = blog.published_at ? blog.published_at.split('T')[0] : '';
        document.getElementById('blogMinutesToRead').value = blog.minutes_to_read || '';
        const ratingEl = document.getElementById('blogRating');
        if (ratingEl) ratingEl.value = blog.rating || '';
        const commentsEl = document.getElementById('blogComments');
        if (commentsEl) commentsEl.value = blog.comments_count || '';
        document.getElementById('blogDescription').value = blog.description || '';
        document.getElementById('blogBody').value = blog.body || '';
        document.getElementById('blogPhoto').value = blog.photo || '';
        document.getElementById('blogShare').value = blog.share_link || '';
    }

    async deleteBlog(id) {
        if (!confirm('Delete this publication?')) return;
        try {
            const { error } = await this.getServiceClient().from('blogs').delete().eq('id', id);
            if (error) throw error;
            await this.loadBlogs();
            this.showToast('Blog deleted', 'success');
        } catch (error) {
            console.error('Error deleting publication:', error);
            this.showToast('Failed to delete publication', 'error');
        }
    }

    renderBlogTable(items = []) {
        const tbody = document.getElementById('blogTable');
        if (!tbody) return;
        if (!items.length) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="5" class="text-center text-muted py-4">
                        <i class="bi bi-journal-text"></i> No publications yet
                    </td>
                </tr>
            `;
            return;
        }
        tbody.innerHTML = '';
        items.forEach(item => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${item.title || ''}</td>
                <td>${item.category || '-'}</td>
                <td>${item.author || '-'}</td>
                <td>${item.published_at ? new Date(item.published_at).toLocaleDateString() : '-'}</td>
                <td>
                    <button class="btn btn-sm btn-outline-primary me-1" onclick="window.adminPanel.editBlog('${item.id}')"><i class="bi bi-pencil"></i></button>
                    <button class="btn btn-sm btn-outline-danger" onclick="window.adminPanel.deleteBlog('${item.id}')"><i class="bi bi-trash"></i></button>
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    // Partners Management
    async loadPartners() {
        try {
            const { data, error } = await this.getServiceClient()
                .from('partnerships')
                .select('*')
                .order('created_at', { ascending: false });
            if (error) throw error;
            this.partners = data || [];
            this.renderPartnersTable(this.partners);
        } catch (error) {
            console.error('Error loading partners:', error);
            this.renderPartnersTable([]);
            this.showToast('Failed to load partners', 'error');
        }
    }

    showPartnerForm(id = null) {
        this.currentEditId = id;
        const form = document.getElementById('partnerForm');
        if (form) form.reset();

        const modalEl = document.getElementById('partnerModal');
        if (!modalEl) return;
        const modal = new bootstrap.Modal(modalEl);
        const title = document.getElementById('partnerModalTitle');
        if (title) title.textContent = id ? 'Edit Partner' : 'Add Partner';

        if (id) {
            const partner = this.partners.find(p => p.id === id);
            if (partner) {
                document.getElementById('partnerName').value = partner.name || '';
                document.getElementById('partnerLink').value = partner.link || '';
                document.getElementById('partnerLogo').value = partner.logo || '';
                document.getElementById('partnerDescription').value = partner.description || '';
            }
        }

        modal.show();
    }

    async handlePartnerSubmit(e) {
        if (e?.preventDefault) e.preventDefault();
        const payload = {
            name: document.getElementById('partnerName').value.trim(),
            link: document.getElementById('partnerLink').value.trim(),
            logo: document.getElementById('partnerLogo').value.trim(),
            description: document.getElementById('partnerDescription').value.trim()
        };

        const client = this.getServiceClient();
        try {
            if (this.currentEditId) {
                const { error } = await client.from('partnerships').update(payload).eq('id', this.currentEditId);
                if (error) throw error;
                this.showToast('Partner updated', 'success');
            } else {
                const { error } = await client.from('partnerships').insert(payload);
                if (error) throw error;
                this.showToast('Partner created', 'success');
            }
            await this.loadPartners();
        } catch (error) {
            console.error('Error saving partner:', error);
            this.showToast('Failed to save partner', 'error');
        } finally {
            this.currentEditId = null;
            bootstrap.Modal.getInstance(document.getElementById('partnerModal'))?.hide();
        }
    }

    editPartner(id) {
        const partner = this.partners.find(p => p.id === id);
        if (!partner) return;
        this.showPartnerForm(id);
        document.getElementById('partnerName').value = partner.name || '';
        document.getElementById('partnerLink').value = partner.link || '';
        document.getElementById('partnerLogo').value = partner.logo || '';
        document.getElementById('partnerDescription').value = partner.description || '';
    }

    async deletePartner(id) {
        if (!confirm('Delete this partner?')) return;
        try {
            const { error } = await this.getServiceClient().from('partnerships').delete().eq('id', id);
            if (error) throw error;
            await this.loadPartners();
            this.showToast('Partner deleted', 'success');
        } catch (error) {
            console.error('Error deleting partner:', error);
            this.showToast('Failed to delete partner', 'error');
        }
    }

    renderPartnersTable(items = []) {
        const tbody = document.getElementById('partnersTable');
        if (!tbody) return;
        if (!items.length) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="3" class="text-center text-muted py-4">
                        <i class="bi bi-people"></i> No partners yet
                    </td>
                </tr>
            `;
            return;
        }
        tbody.innerHTML = '';
        items.forEach(item => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td class="d-flex align-items-center gap-2">
                    ${item.logo ? `<img src="${item.logo}" alt="" style="width:36px;height:36px;object-fit:contain;border-radius:6px;">` : ''}
                    <div>
                        <div class="fw-semibold">${item.name || ''}</div>
                        <div class="text-muted small">${item.description || ''}</div>
                    </div>
                </td>
                <td><a href="${item.link || '—'}" target="_blank">${item.link || '—'}</a></td>
                <td>
                    <button class="btn btn-sm btn-outline-primary me-1" onclick="window.adminPanel.editPartner('${item.id}')"><i class="bi bi-pencil"></i></button>
                    <button class="btn btn-sm btn-outline-danger" onclick="window.adminPanel.deletePartner('${item.id}')"><i class="bi bi-trash"></i></button>
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    

    // Resources Management (simple)
    async loadResources() {
        try {
            const { data, error } = await this.getServiceClient()
                .from('resources')
                .select('*')
                .order('created_at', { ascending: false });
            if (error) throw error;
            this.resourcesData = data || [];
            this.renderResourcesTableSimple(this.resourcesData);
        } catch (error) {
            console.error('Error loading resources:', error);
            this.resourcesData = [];
            this.renderResourcesTableSimple([]);
            this.showToast('Failed to load resources', 'error');
        }
    }

    showResourceForm(id = null) {
        this.currentEditId = id;
        const form = document.getElementById('resourceForm');
        if (form) form.reset();
        const modalEl = document.getElementById('resourceModal');
        if (!modalEl) return;
        const modal = new bootstrap.Modal(modalEl);
        const title = document.getElementById('resourceModalTitle');
        if (title) title.textContent = id ? 'Edit Resource' : 'Add Resource';

        if (id) {
            const resource = this.resourcesData.find(r => r.id === id);
            if (resource) {
                document.getElementById('resourceTitle').value = resource.title || '';
                const categoryEl = document.getElementById('resourceCategory');
                if (categoryEl) {
                    const { category } = resource;
                    if (category && !Array.from(categoryEl.options).some(opt => opt.value === category)) {
                        const opt = document.createElement('option');
                        opt.value = category;
                        opt.textContent = category;
                        categoryEl.appendChild(opt);
                    }
                    categoryEl.value = category || '';
                }
                document.getElementById('resourceFileUrl').value = resource.document_url || resource.fileUrl || '';
                document.getElementById('resourceDescription').value = resource.description || '';
            }
        }
        modal.show();
    }

    async handleResourceSubmit(e) {
        if (e?.preventDefault) e.preventDefault();
        const categoryEl = document.getElementById('resourceCategory');
        if (!categoryEl) {
            this.showToast('Resource form is missing the category field', 'error');
            return;
        }
        const payload = {
            title: document.getElementById('resourceTitle').value.trim(),
            category: categoryEl.value.trim(),
            document_url: document.getElementById('resourceFileUrl').value.trim(),
            description: document.getElementById('resourceDescription').value.trim()
        };

        const client = this.getServiceClient();
        try {
            if (this.currentEditId) {
                const { error } = await client.from('resources').update(payload).eq('id', this.currentEditId);
                if (error) throw error;
                this.showToast('Resource updated', 'success');
            } else {
                const { error } = await client.from('resources').insert(payload);
                if (error) throw error;
                this.showToast('Resource created', 'success');
            }
            await this.loadResources();
        } catch (error) {
            console.error('Error saving resource:', error);
            this.showToast('Failed to save resource', 'error');
        } finally {
            this.currentEditId = null;
            bootstrap.Modal.getInstance(document.getElementById('resourceModal'))?.hide();
        }
    }

    async openResourceUpload() {
        await this.uploadAndFill('resourceFileUrl', 'File uploaded to Cloudinary');
    }

    async openPartnerUpload() {
        await this.uploadAndFill('partnerLogo', 'Logo uploaded to Cloudinary');
    }

    async openBlogUpload() {
        await this.uploadAndFill('blogPhoto', 'Image uploaded to Cloudinary');
    }

    async pickFile() {
        return new Promise((resolve) => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = '*/*';
            input.onchange = (e) => {
                const file = e.target.files?.[0];
                resolve(file || null);
            };
            input.click();
        });
    }

    async uploadAndFill(inputId, successMessage = 'File uploaded') {
        const file = await this.pickFile();
        if (!file) return;
        try {
            const url = await this.uploadToCloudinary(file);
            const input = document.getElementById(inputId);
            if (input) {
                input.value = url;
            }
            this.showToast(successMessage, 'success');
        } catch (error) {
            console.error('Upload error:', error);
            this.showToast(error.message || 'Failed to upload file', 'error');
        }
    }

    editResource(id) {
        this.showResourceForm(id);
    }

    async deleteResource(id) {
        if (!confirm('Delete this resource?')) return;
        try {
            const { error } = await this.getServiceClient().from('resources').delete().eq('id', id);
            if (error) throw error;
            await this.loadResources();
            this.showToast('Resource deleted', 'success');
        } catch (error) {
            console.error('Error deleting resource:', error);
            this.showToast('Failed to delete resource', 'error');
        }
    }

    renderResourcesTableSimple(items = []) {
        const tbody = document.getElementById('resourcesTable');
        if (!tbody) return;
        if (!items.length) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="4" class="text-center text-muted py-4">
                        <i class="bi bi-folder"></i> No resources yet
                    </td>
                </tr>
            `;
            return;
        }
        tbody.innerHTML = '';
        items.forEach(item => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${item.title || ''}</td>
                <td>${item.category || '-'}</td>
                <td><a href="${item.document_url || item.fileUrl || '#'}" target="_blank">${item.document_url || item.fileUrl || '-'}</a></td>
                <td>
                    <button class="btn btn-sm btn-outline-primary me-1" onclick="window.adminPanel.editResource('${item.id}')"><i class="bi bi-pencil"></i></button>
                    <button class="btn btn-sm btn-outline-danger" onclick="window.adminPanel.deleteResource('${item.id}')"><i class="bi bi-trash"></i></button>
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    // Admins Management (read-only from Supabase admin_profiles)
    async loadAdmins() {
        try {
            const { data, error } = await this.supabase
                .from('admin_profiles')
                .select('id, name, email, position, mobile_number, facebook_url, photo_url')
                .order('created_at', { ascending: false });

            if (error) throw error;
            this.adminsList = data || [];
            this.renderAdminsTable(this.adminsList);
        } catch (error) {
            console.error('Error loading admins:', error);
            this.adminsList = [];
            this.renderAdminsTable([]);
            this.showToast('Failed to load admin profiles', 'error');
        }
    }

    renderAdminsTable(items = []) {
        const tbody = document.getElementById('adminsTable');
        if (!tbody) return;
        if (!items.length) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="4" class="text-center text-muted py-4">
                        <i class="bi bi-person-badge"></i> No admins yet
                    </td>
                </tr>
            `;
            return;
        }
        tbody.innerHTML = '';
        items.forEach(item => {
            const row = document.createElement('tr');
            const nameContent = `
                ${item.photo_url ? `<img src="${item.photo_url}" alt="" style="width:36px;height:36px;object-fit:cover;border-radius:50%;">` : ''}
                <span>${item.name || ''}</span>
            `;
            const nameCell = item.facebook_url
                ? `<a href="${item.facebook_url}" target="_blank" rel="noopener noreferrer" class="d-flex align-items-center gap-2 text-decoration-none">${nameContent}</a>`
                : `<div class="d-flex align-items-center gap-2">${nameContent}</div>`;
            row.innerHTML = `
                <td>${nameCell}</td>
                <td>${item.email || ''}</td>
                <td>${item.position || ''}</td>
                <td>${item.mobile_number || ''}</td>
            `;
            tbody.appendChild(row);
        });
    }

    resetForm(modalEl = null) {
        this.currentEditId = null;

        if (modalEl?.id === 'profileModal') {
            this.resetPhotoCropper();
        }

        const forms = modalEl ? modalEl.querySelectorAll('form') : document.querySelectorAll('.modal form');
        forms.forEach(form => form.reset());
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
    // Expose instance globally for inline handlers
    window.adminPanel = adminPanel;
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
    if (!passwordInput || !passwordIcon) return;

    const show = passwordInput.type === 'password';
    passwordInput.type = show ? 'text' : 'password';

    passwordIcon.classList.toggle('bi-eye', !show);
    passwordIcon.classList.toggle('bi-eye-slash', show);
}

// Modal show functions
function showBlogForm() {
    adminPanel?.showBlogForm();
}

function showPartnerForm() {
    adminPanel?.showPartnerForm();
}

function showResourceForm() {
    adminPanel?.showResourceForm();
}











