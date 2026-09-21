function chunkText(text, chunkSize = 500, chunkOverlap = 50) {
    if (!text || typeof text !== 'string') return [];

    const words = text.trim().split(/\s+/);
    if (words.length === 0 || words[0] === '') return [];

    const chunks = [];
    const step = Math.max(1, chunkSize - chunkOverlap);

    for (let i = 0; i < words.length; i += step) {
        const chunk = words.slice(i, i + chunkSize).join(" ");
        if (chunk.trim()) {
            chunks.push(chunk);
        }
        if (i + chunkSize >= words.length) break;
    }

    return chunks;
}

export default chunkText;