'use client';

import { Photo, PhotoSearchResponse } from '@/lib/type';
import {
    FunctionComponent,
    useState,
    useTransition
} from 'react';
import { VscSearch } from 'react-icons/vsc';
import { Loading } from './Loading';
import { PhotoList } from './PhotoList';
import { FetchResponse, RecordMetadata } from '@pinecone-database/pinecone';

const PhotoListWrapper: FunctionComponent<{
    loading: boolean;
    searchedPhotos: Photo[] | null;
    randomPhotos: Photo[];
}> = ({ loading, searchedPhotos, randomPhotos }) => {
    if (loading) {
        return <Loading />;
    }
    if (searchedPhotos) {
        console.log("searchedPhotos !!!",searchedPhotos);
        return <PhotoList photos={searchedPhotos} />;
    }
    return <PhotoList photos={randomPhotos} />;
};

export const SearchWebCam: FunctionComponent<{
    randomWebCamPhoto: Photo[];
}> = ({ randomWebCamPhoto }) => {
    const [query, setQuery] = useState<string | null>(null);
    const [searching, setSearching] = useState(false);
    const [searchedPhotos, setSearchedPhotos] = useState<Photo[] | null>(null);
    
    const [loading, startTransition] = useTransition();
    return (
        <div>
            <div className="my-8 flex justify-center">
                <input
                    className="w-96 mr-4 p-2 bg-gray-700"
                    value={query ?? ''}
                    onChange={(e) => {
                        setQuery(e.target.value);
                    }}
                />
                <button
                    className="bg-gray-700 py-2 px-4"
                    onClick={async () => {
                        try {
                            setSearching(true);
                            const response = await fetch(`/api/webcamsearch`,
                                {
                                    method: 'POST',
                                    body: JSON.stringify({
                                        query
                                    }),
                                    headers: {
                                        'Content-Type':'application/json'
                                    }
                                }
                            );
                            if (!response.ok) {
                                throw response;
                            }
                            const jsonResponse = await response.json();
                            startTransition(() => {
                                setSearchedPhotos(jsonResponse);
                            });
                        } catch (error) {
                            alert(
                                '検索中にエラーが発生しました'
                            );
                            setSearchedPhotos([]);
                        } finally {
                            setSearching(false);
                        }
                    }}
                >
                    <VscSearch />
                </button>
            </div>
            <PhotoListWrapper
                loading={searching || loading}
                searchedPhotos = {searchedPhotos}
                randomPhotos = {randomWebCamPhoto}
            />
        </div>
    );
};

