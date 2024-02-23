import { getRamdomWebCams } from '@/lib/webcams';
import { SearchWebCam } from '@/lib/component/SearchWebCam';
import { AutoProcessor, RawImage, AutoTokenizer , CLIPTextModelWithProjection,CLIPVisionModelWithProjection } from '@xenova/transformers';



const Home = async () => {
    const randomWebCamPhoto = await getRamdomWebCams();
    return (
        <div>
            <SearchWebCam randomWebCamPhoto={randomWebCamPhoto} />
        </div>
    );
};

export default Home;