// Supabase Client Module
import { SUPABASE_CONFIG, validateConfig } from './supabase-config.js';

// Initialize Supabase client
let supabase = null;

/**
 * Initialize Supabase client
 * @returns {Object} Supabase client instance
 */
export async function initSupabase() {
    if (!validateConfig()) {
        throw new Error('Invalid Supabase configuration');
    }

    if (supabase) {
        return supabase;
    }

    // Dynamically import Supabase
    const { createClient } = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm');

    supabase = createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey, {
        auth: {
            autoRefreshToken: true,
            persistSession: true,
            detectSessionInUrl: true
        }
    });

    console.log('✅ Supabase client initialized');
    return supabase;
}

// ============================================
// Authentication Functions
// ============================================

/**
 * Sign in with Google OAuth
 */
export async function signInWithGoogle() {
    const client = await initSupabase();
    const { data, error } = await client.auth.signInWithOAuth({
        provider: 'google',
        options: {
            redirectTo: `${window.location.origin}/dashboard.html`
        }
    });

    if (error) throw error;
    return data;
}

/**
 * Get current user session
 */
export async function getCurrentUser() {
    const client = await initSupabase();
    const { data: { user }, error } = await client.auth.getUser();

    if (error) throw error;
    return user;
}

/**
 * Sign out current user
 */
export async function signOut() {
    const client = await initSupabase();
    const { error } = await client.auth.signOut();

    if (error) throw error;

    // Clear local storage
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_info');

    // Redirect to home
    window.location.href = '/';
}

/**
 * Listen to auth state changes
 */
export async function onAuthStateChange(callback) {
    const client = await initSupabase();
    return client.auth.onAuthStateChange(callback);
}

// ============================================
// Project CRUD Operations
// ============================================

/**
 * Create a new project
 */
export async function createProject(projectData) {
    const client = await initSupabase();
    const user = await getCurrentUser();

    if (!user) throw new Error('User not authenticated');

    const project = {
        ...SUPABASE_CONFIG.defaults,
        ...projectData,
        user_id: user.id,
        film_id: generateFilmId(projectData.project_name),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    };

    const { data, error } = await client
        .from('projects')
        .insert([project])
        .select()
        .single();

    if (error) throw error;
    return data;
}

/**
 * Get all projects for current user
 */
export async function getUserProjects(filters = {}) {
    const client = await initSupabase();
    const user = await getCurrentUser();

    if (!user) throw new Error('User not authenticated');

    let query = client
        .from('projects')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_deleted', false);

    // Apply filters
    if (filters.project_type) {
        query = query.eq('project_type', filters.project_type);
    }
    if (filters.status) {
        query = query.eq('status', filters.status);
    }
    if (filters.is_archived !== undefined) {
        query = query.eq('is_archived', filters.is_archived);
    }

    // Sort by updated_at descending by default
    query = query.order('updated_at', { ascending: false });

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
}

/**
 * Get a single project by ID
 */
export async function getProject(projectId) {
    const client = await initSupabase();

    const { data, error } = await client
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .single();

    if (error) throw error;
    return data;
}

/**
 * Update a project
 */
export async function updateProject(projectId, updates) {
    const client = await initSupabase();

    const { data, error } = await client
        .from('projects')
        .update({
            ...updates,
            updated_at: new Date().toISOString()
        })
        .eq('id', projectId)
        .select()
        .single();

    if (error) throw error;
    return data;
}

/**
 * Delete a project (soft delete)
 */
export async function deleteProject(projectId) {
    const client = await initSupabase();

    const { error } = await client
        .from('projects')
        .update({
            is_deleted: true,
            updated_at: new Date().toISOString()
        })
        .eq('id', projectId);

    if (error) throw error;
}

/**
 * Archive/Unarchive a project
 */
export async function archiveProject(projectId, isArchived = true) {
    const client = await initSupabase();

    const { data, error } = await client
        .from('projects')
        .update({
            is_archived: isArchived,
            updated_at: new Date().toISOString()
        })
        .eq('id', projectId)
        .select()
        .single();

    if (error) throw error;
    return data;
}

// ============================================
// Version Management
// ============================================

/**
 * Create a new version of a project
 */
export async function createProjectVersion(projectId, versionData) {
    const client = await initSupabase();
    const user = await getCurrentUser();

    const version = {
        project_id: projectId,
        version_number: versionData.version_number || generateVersionNumber(),
        version_name: versionData.version_name,
        version_type: versionData.version_type || 'draft',
        storyboard_data: versionData.storyboard_data,
        concept_art_data: versionData.concept_art_data,
        metadata: versionData.metadata || {},
        created_by: user.id,
        created_at: new Date().toISOString()
    };

    const { data, error } = await client
        .from('project_versions')
        .insert([version])
        .select()
        .single();

    if (error) throw error;
    return data;
}

/**
 * Get all versions of a project
 */
export async function getProjectVersions(projectId) {
    const client = await initSupabase();

    const { data, error } = await client
        .from('project_versions')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
}

// ============================================
// Storage Operations
// ============================================

/**
 * Upload a file to storage
 */
export async function uploadFile(file, projectId, folder = 'media') {
    const client = await initSupabase();
    const user = await getCurrentUser();

    const fileName = `${user.id}/${projectId}/${folder}/${Date.now()}_${file.name}`;

    const { data, error } = await client.storage
        .from(SUPABASE_CONFIG.storage.projectFiles)
        .upload(fileName, file, {
            cacheControl: '3600',
            upsert: false
        });

    if (error) throw error;

    // Get public URL
    const { data: { publicUrl } } = client.storage
        .from(SUPABASE_CONFIG.storage.projectFiles)
        .getPublicUrl(fileName);

    return publicUrl;
}

/**
 * Delete a file from storage
 */
export async function deleteFile(filePath) {
    const client = await initSupabase();

    const { error } = await client.storage
        .from(SUPABASE_CONFIG.storage.projectFiles)
        .remove([filePath]);

    if (error) throw error;
}

// ============================================
// Auto-save Management
// ============================================

let autoSaveTimer = null;

/**
 * Enable auto-save for a project
 */
export function enableAutoSave(projectId, saveFunction) {
    // Clear existing timer
    if (autoSaveTimer) {
        clearInterval(autoSaveTimer);
    }

    // Set up new auto-save timer
    autoSaveTimer = setInterval(async () => {
        try {
            await saveFunction(projectId);
            console.log('✅ Auto-save completed');
        } catch (error) {
            console.error('❌ Auto-save failed:', error);
        }
    }, SUPABASE_CONFIG.app.autoSaveInterval);

    console.log('🔄 Auto-save enabled');
}

/**
 * Disable auto-save
 */
export function disableAutoSave() {
    if (autoSaveTimer) {
        clearInterval(autoSaveTimer);
        autoSaveTimer = null;
        console.log('⏹ Auto-save disabled');
    }
}

// ============================================
// Utility Functions
// ============================================

/**
 * Generate a unique film ID
 */
function generateFilmId(projectName) {
    const prefix = projectName
        .split(' ')
        .map(word => word[0])
        .join('')
        .toUpperCase()
        .slice(0, 3);

    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');

    return `${prefix}${year}${random}`;
}

/**
 * Generate version number
 */
function generateVersionNumber() {
    const now = new Date();
    return `v${now.getFullYear()}.${(now.getMonth() + 1).toString().padStart(2, '0')}.${now.getDate().toString().padStart(2, '0')}.${now.getHours().toString().padStart(2, '0')}${now.getMinutes().toString().padStart(2, '0')}`;
}

/**
 * Check if user is authenticated
 */
export async function requireAuth() {
    const user = await getCurrentUser();

    if (!user) {
        // Redirect to login
        window.location.href = '/';
        return false;
    }

    return true;
}

// Export all functions
export default {
    initSupabase,
    signInWithGoogle,
    getCurrentUser,
    signOut,
    onAuthStateChange,
    createProject,
    getUserProjects,
    getProject,
    updateProject,
    deleteProject,
    archiveProject,
    createProjectVersion,
    getProjectVersions,
    uploadFile,
    deleteFile,
    enableAutoSave,
    disableAutoSave,
    requireAuth
};