import { LastFmRankedArtist, LastFmRankedTag, LastFmRankedTrack } from './lastFMNatives';
import { LastFmRequest } from './sharedFunctions';

export interface ChartRequest extends LastFmRequest {
  page?: number;
  limit?: number;
}

export interface ChartTopTracksRes {
  tracks: LastFmRankedTrack[];
  '@attr': {
    page: string;
    perPage: string;
    totalPages: string;
    total: string;
  };
}
export interface ChartTopTagsRes {
  tags: LastFmRankedTag[];
  '@attr': {
    page: string;
    perPage: string;
    totalPages: string;
    total: string;
  };
}
export interface ChartTopArtistsRes {
  artists: LastFmRankedArtist[];
  '@attr': {
    page: string;
    perPage: string;
    totalPages: string;
    total: string;
  };
}
export type ChartGetTopArtists = Omit<ChartRequest, 'method'>;
export type ChartGetTopTracks = Omit<ChartRequest, 'method'>;
export type ChartGetTopTags = Omit<ChartRequest, 'method'>;
