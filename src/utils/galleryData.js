import { supabase } from '../lib/supabaseClient';
import { uploadMedia } from './cloudinaryConfig';

// Helper to get public URL if needed, but we store full Cloudinary URL
// so we usually just use what's in the DB.

// --- ALBUMS ---

export const getAlbums = async () => {
    const { data, error } = await supabase
        .from('albums')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error("Error fetching albums:", error);
        return [];
    }

    // Map to match frontend expectations if necessary
    // Frontend expects: id, title, cover, count (string), stats object
    return (data || []).map(album => ({
        ...album,
        cover: album.cover_url || 'https://placehold.co/600x400/1e293b/475569?text=No+Cover',
        count: '0 Items', // We'll calculate this or add a view later if needed. For now simple.
        stats: { photos: 0, videos: 0 } // Todo: join count logic
    }));
};

export const addAlbum = async (albumData) => {
    // albumData: { title, date, count }
    const { data, error } = await supabase
        .from('albums')
        .insert([{
            title: albumData.title,
            description: '',
            cover_url: '',
            is_default: false
        }])
        .select()
        .single();

    if (error) throw error;
    return data;
};

export const updateAlbum = async (id, updates) => {
    const { error } = await supabase
        .from('albums')
        .update(updates)
        .eq('id', id);

    if (error) throw error;
};

export const deleteAlbum = async (id) => {
    const { error } = await supabase
        .from('albums')
        .delete()
        .eq('id', id);

    if (error) throw error;
};

// --- MEDIA ---

export const getAlbumMedia = async (albumId) => {
    const { data, error } = await supabase
        .from('photos')
        .select('*')
        .eq('album_id', albumId)
        .order('created_at', { ascending: false });

    if (error) {
        console.error("Error fetching media:", error);
        return [];
    }

    return (data || []).map(item => ({
        id: item.id,
        src: item.url,
        type: item.type,
        name: item.caption || `media-${item.id}`,
        created_at: item.created_at
    }));
};

export const addMediaToAlbum = async (albumId, fileOrObject) => {
    try {
        let url;
        let type;
        let name;

        // Upload to Cloudinary
        if (fileOrObject.src) {
            // Already a URL (rarely happens now unless testing)
            url = fileOrObject.src;
            type = fileOrObject.type;
            name = fileOrObject.name;
        } else {
            // It's a file
            const uploadData = await uploadMedia(fileOrObject.src ? fileOrObject.src : fileOrObject); // uploadMedia handles File object
            // Wait, Gallery.jsx passes object { src: ..., type: ..., name: ... } ?
            // Let's check AlbumView.jsx.
            // AlbumView Line 88: await addMediaToAlbum(id, { src: secureUrl, type, name: file.name })
            // So it passes an object with the ALREADY UPLOADED url.

            // Re-reading AlbumView logic:
            // It calls uploadImage(file) first, gets secureUrl, then calls addMediaToAlbum with {src: secureUrl...}

            // So here we just insert into Supabase.
            if (fileOrObject.src) {
                url = fileOrObject.src;
                type = fileOrObject.type;
                name = fileOrObject.name;
            }
        }

        const { data, error } = await supabase
            .from('photos')
            .insert([{
                album_id: albumId,
                url: url,
                type: type,
                caption: name
            }])
            .select()
            .single();

        if (error) throw error;

        // Update Album Cover if it's the first photo?
        // We can do that separately or let user set it. 
        // For now, let's keep it simple.

        return data;

    } catch (error) {
        console.error("Error adding media:", error);
        throw error;
    }
};

export const deleteMedia = async (mediaId, albumId) => {
    const { error } = await supabase
        .from('photos')
        .delete()
        .eq('id', mediaId);

    if (error) throw error;
};

export const setAlbumCover = async (albumId, coverUrl) => {
    const { error } = await supabase
        .from('albums')
        .update({ cover_url: coverUrl })
        .eq('id', albumId);

    if (error) throw error;
};

// Legacy stub
export const syncAllAlbumStats = async () => {
    // No-op for now, or could implement count logic
    return [];
};
