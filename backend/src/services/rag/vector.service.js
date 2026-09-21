import VectorModel from "../../models/vector.model.js";

async function saveVectors(metadata) {
    try {
        const { source, category, chunks, embeddings } = metadata;

        console.log(`storing the ${source} file data`);

        const operations = chunks.map((chunk, index) => ({
            updateOne: {
                filter: { source, chunk },
                update: {
                    $set: {
                        category,
                        embedding: embeddings[index]
                    }
                },
                upsert: true
            }
        }));

        if (operations.length > 0) {
            await VectorModel.bulkWrite(operations);
        }
    
    } catch(error) {
        console.error("Failed to save the embeddings to the database : ", error.message);
        throw new Error("Failed to save vector embedding to database.");
    }
}

export default saveVectors;