import vectorModel from "../../models/vector.model.js";
import { generateEmbedding } from "./embedding.service.js";

function cosineSimilarity(vecA, vecB) {
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    for (let i = 0; i < vecA.length; i++) {
        dotProduct += vecA[i] * vecB[i];
        normA += vecA[i] * vecA[i];
        normB += vecB[i] * vecB[i];
    }
    if (normA === 0 || normB === 0) return 0;
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

export default async function retrieveContext(query, k = 5) {
    try {
        if (!query || query.trim().length === 0) return [];

        console.log(`Generating query embedding vector for query: "${query}"...`);
        const queryVector = await generateEmbedding(query);

        try {
            // Attempt MongoDB Atlas Vector Search
            const results = await vectorModel.aggregate([
                {
                    $vectorSearch: {
                        index: "vector_index",
                        path: "embedding",
                        queryVector: queryVector,
                        numCandidates: k * 10,
                        limit: k
                    }
                },
                {
                    $project: {
                        _id: 1,
                        source: 1,
                        category: 1,
                        chunk: 1,
                        score: { $meta: "vectorSearchScore" }
                    }
                }
            ]);

            if (results && results.length > 0) {
                return results;
            }
        } catch (atlasError) {
            console.warn("MongoDB Atlas $vectorSearch failed or not configured, using in-memory vector similarity fallback:", atlasError.message);
        }

        // Fallback: Perform local cosine similarity search over stored vectors
        const allVectors = await vectorModel.find({});
        if (!allVectors || allVectors.length === 0) {
            return [];
        }

        const scored = allVectors.map(doc => {
            const sim = cosineSimilarity(queryVector, doc.embedding);
            return {
                _id: doc._id,
                source: doc.source,
                category: doc.category,
                chunk: doc.chunk,
                score: sim
            };
        });

        scored.sort((a, b) => b.score - a.score);
        return scored.slice(0, k);

    } catch (error) {
        console.error("Vector retrieval failed:", error.message);
        return [];
    }
}
