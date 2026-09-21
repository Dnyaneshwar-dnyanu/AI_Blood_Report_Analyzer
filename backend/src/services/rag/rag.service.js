import loadKnowledgeBase from "./document.service.js";
import chunkText from "./chunk.service.js";
import { generateBatchEmbedding } from "./embedding.service.js";
import saveVectors from "./vector.service.js";
import KnowledgeVector from "../../models/vector.model.js";

async function ingestKnowledgeBase(forceReindex = false) {
    try {
        const count = await KnowledgeVector.countDocuments();
        if (count > 0 && !forceReindex) {
            console.log(`Knowledge base already ingested (${count} chunks exist in DB). Skipping re-ingestion.`);
            return { success: true, totalChunksIndexed: count, skipped: true };
        }

        console.log("Loading Markdown Knowledge base files...");
        const files = loadKnowledgeBase();
        let totalChunksIndexed = 0;

        for (const file of files) {
            let chunks = chunkText(file.content, 400, 40);
            if (chunks.length === 0) continue;

            let embeddings = await generateBatchEmbedding(chunks);

            await saveVectors({
                source: file.source,
                category: file.category,
                chunks,
                embeddings
            });

            totalChunksIndexed += chunks.length;
            console.log(`Indexed: ${file.category}/${file.fileName} (${chunks.length} chunks)`);
        }

        return { success: true, totalFiles: files.length, totalChunksIndexed };
    } catch (error) {
        console.error("Knowledge Base Ingestion Error:", error.message);
        return { success: false, error: error.message };
    }
}

export default ingestKnowledgeBase;