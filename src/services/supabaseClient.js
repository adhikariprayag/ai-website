import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const isValidUrl = (url) => {
    try {
        return url && (url.startsWith('http://') || url.startsWith('https://'));
    } catch {
        return false;
    }
};

if (!isValidUrl(supabaseUrl) || !supabaseAnonKey) {
    console.warn("Supabase credentials missing or invalid. Global comments will not persist. Check your Vercel Environment Variables.");
}

export const supabase = (isValidUrl(supabaseUrl) && supabaseAnonKey)
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;

/**
 * Fetch all comments from the database
 * @returns {Promise<Array>} List of comments
 */
export const fetchComments = async () => {
    if (!supabase) return [];

    const { data, error } = await supabase
        .from('comments')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching comments:', error);
        throw error;
    }
    return data;
};

/**
 * Post a new comment to the database
 * @param {Object} comment - { name, content }
 * @returns {Promise<Object>} The created comment
 */
export const postComment = async (comment) => {
    if (!supabase) {
        throw new Error("Supabase is not configured. Local comments are not supported.");
    }

    const { data, error } = await supabase
        .from('comments')
        .insert([comment])
        .select();

    if (error) {
        console.error('Error posting comment:', error);
        throw error;
    }
    return data[0];
};
