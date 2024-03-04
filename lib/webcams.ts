import 'server-only';
//import { AutoProcessor, RawImage, AutoTokenizer , CLIPTextModelWithProjection,CLIPVisionModelWithProjection } from '@xenova/transformers';
import { Pinecone , QueryResponse, FetchResponse ,RecordMetadata } from '@pinecone-database/pinecone';
import { Photo ,webCamObj,webCamMetadata } from './type';
import { textEmbedding } from './embedding';

const pinecone = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY ??  '',
});
const index = pinecone.index(process.env.PINECONE_INDEX_NAME ?? '');
const model_id = process.env.MODEL_ID;

const image_server = process.env.WINDY_IMAGE_SERVER ?? '';

export const getRamdomWebCams = async (): Promise<Photo[]> => {

    const idArray = ["1697814124","1613061608","1521891840"];
    /* query to pinecone */
    const response = await index.namespace('webcamInfo').fetch(idArray);
    const {records} = response;
    const keys = Object.keys(records);

    return keys.map(key => {
        const metadata  = records[key].metadata as webCamMetadata;
        const photo : Photo = {
            id: records[key].id,
            created_at: "",
            width: 200,
            height: 112,
            color: "",
            description: metadata.title,
            urls: {
                raw: "",
                full: "",
                regular: "",
                small: image_server + records[key].id + ".jpg",
                thumb: ""
            },
            links: {
                self: "",
                html: metadata.day,
                download: ""
            }
        }

        return photo;
    })

};


export const searchWebcams = async (
    query: string
):  Promise<Photo[]> => {

    const y = await textEmbedding(query);
    /* query to pinecone */
    const response = await index.namespace('webcamInfo').query({
        topK: 5,
        vector: y,
        includeValues: false,
        includeMetadata: true
    });
    
    const {matches} = response;

    return matches.map(match => {
        const metadata = match.metadata as webCamMetadata;
        const photo : Photo = {
            id: match.id,
            score: match.score,
            created_at: "",
            width: 200,
            height: 112,
            color: "",
            description: metadata.title,
            urls: {
                raw: "",
                full: "",
                regular: "",
                small: image_server + match.id + ".jpg",
                thumb: ""
            },
            links: {
                self: "",
                html: metadata.day,
                download: ""
            }
        }

        return photo;
    })

}

// コンポーネントファイル

/*
async function textEmbedding(text: string): Promise<number[]> {

    const textInputs = tokenizer(text, { padding: true, truncation: true });

    const { text_embeds } = await textModel(textInputs) ;
    return Array.from(text_embeds.data);
}    
*/