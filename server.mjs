
import {createServer} from 'http';
import { parse } from 'url';
import next from 'next';
import { AutoProcessor, AutoTokenizer , CLIPTextModelWithProjection,CLIPVisionModelWithProjection } from '@xenova/transformers';
import { Pinecone  } from '@pinecone-database/pinecone';

const dev = process.env.NODE_ENV !== 'production'
const hostname = 'localhost'
const port = 3000
// when using middleware `hostname` and `port` must be provided below
const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()

const model_id = 'Xenova/clip-vit-base-patch32';
const model = await CLIPVisionModelWithProjection.from_pretrained(model_id);
const tokenizer = await  AutoTokenizer.from_pretrained(model_id);
const textModel =  await CLIPTextModelWithProjection.from_pretrained(model_id);
const imageProcessor = await AutoProcessor.from_pretrained(model_id);

const image_server = 'https://xxxxxx.s3.ap-northeast-1.amazonaws.com/';

const pinecone = new Pinecone({
    apiKey: 'xxxxxxx-5fd6-4d8a-ba7e-f7187ae79846',
});
const index = pinecone.index('imageindex');

const textEmbedding = async function (text) {

    const textInputs = tokenizer(text, { padding: true, truncation: true });

    const { text_embeds } = await textModel(textInputs) ;
    return Array.from(text_embeds.data);
}    


const searchWebcams = async (query) =>{

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
        const { metadata} = match;
        return {
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
    })

}

app.prepare().then(() => {
    createServer(async (req, res) => {
        try {
            // Be sure to pass `true` as the second argument to `url.parse`.
            // This tells it to parse the query portion of the URL.
            const parsedUrl = parse(req.url, true)
            const { pathname, query } = parsedUrl
            if (pathname === '/webcamsearch') {
                if (!query || typeof query !== 'object' || !query.query) {
                    console.error('no query')
                    res.statusCode = 400
                    res.end('no query')

                    return;    
                }

                const searchPhotosResponse = await searchWebcams(query.query);
                res.writeHead(200, {'Content-Type': 'application/json'});
                res.write(JSON.stringify(searchPhotosResponse));
                res.end(); 

                return;

            } else {
                await handle(req, res, parsedUrl)
            }
        } catch (err) {
            console.error('Error occurred handling', req.url, err)
            res.statusCode = 500
            res.end('internal server error')
        }
    })
    .once('error', (err) => {
        console.error(err)
        process.exit(1)
    })
    .listen(port, () => {
        console.log(`> Ready on http://${hostname}:${port}`)
    })
})