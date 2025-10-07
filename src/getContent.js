export const getContent = content => {
    if (!content) return [];
    if (typeof content === 'string') {
        try {
            const parsed = JSON.parse(content);
            return Array.isArray(parsed) ? parsed : (parsed !== null && typeof parsed === 'object' ? [parsed] : []);
        } catch (error) {
            console.warn('getContent: Could not parse content string as JSON.', content);
            return [];
        }
    }
    if (Array.isArray(content)) {
        return content;
    }
    if (content !== null && typeof content === 'object') {
        return [content];
    }
    return [];
};