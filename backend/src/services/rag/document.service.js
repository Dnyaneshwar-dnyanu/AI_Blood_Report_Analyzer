import fs from 'fs';
import path from 'path';

function loadKnowledgeBase(baseDir = 'knowledge_base') {
    const documents = [];

    function walkdir(currentPath) {
        const entries = fs.readdirSync(currentPath, {withFileTypes: true});
        
        for(const entry of entries) {
            const fullPath = path.join(currentPath, entry.name);

            if(entry.isDirectory()) {
                walkdir(fullPath);
            
            } else if(entry.isFile() && path.extname(entry.name) === '.md') {
                const content = fs.readFileSync(fullPath, 'utf-8');
                documents.push({
                    source: fullPath,
                    fileName: entry.name,
                    category: path.basename(path.dirname(fullPath)),
                    content: content
                });
            }
        }

    }
    walkdir(baseDir);
    return documents;
}

export default loadKnowledgeBase;