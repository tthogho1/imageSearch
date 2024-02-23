import 'server-only';
import { AutoProcessor, RawImage, AutoTokenizer , CLIPTextModelWithProjection,CLIPVisionModelWithProjection } from '@xenova/transformers';

const model_id = process.env.MODEL_ID;

const model = await CLIPVisionModelWithProjection.from_pretrained(model_id as string);
const tokenizer = await  AutoTokenizer.from_pretrained(model_id as string);
const textModel =  await CLIPTextModelWithProjection.from_pretrained(model_id as string);
const imageProcessor = await AutoProcessor.from_pretrained(model_id as string);

const textEmbedding = async function (text: string): Promise<number[]> {

    const textInputs = tokenizer(text, { padding: true, truncation: true });

    const { text_embeds } = await textModel(textInputs) ;
    return Array.from(text_embeds.data);
}    

export { textEmbedding };