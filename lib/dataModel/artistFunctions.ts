import {
  LastFmAlbums,
  LastFmArtist,
  LastFmArtistCorrections,
  LastFmArtists,
  LastFmSearch,
  LastFmTags,
  LastFmTracks,
} from './lastFMNatives';
import { Search, SearchType } from './searchFunctions';
import { LastFmRequest } from './sharedFunctions';

interface ArtistRequest<R> extends LastFmRequest<R> {
  artist: string;
}

export type MBIDArtist<R = Record<string, unknown>> = Omit<ArtistRequest<R>, 'method' | 'artist'> & { mbid: string };
export type NamedArtist<R = Record<string, unknown>> = Omit<ArtistRequest<R>, 'method'>;
type ArtistGet<R> = MBIDArtist<R> | NamedArtist<R>;

export type ArtistGetInfoRes = LastFmArtist;
export type ArtistGetSimilarRes = LastFmArtists;
export interface ArtistGetCorrectionRes {
  correction: LastFmArtistCorrections;
}
export interface ArtistGetTagsRes extends LastFmTags {
  '@attr': {
    artist: string;
  };
}
export interface ArtistGetTopAlbumsRes extends LastFmAlbums {
  '@attr': {
    artist: string;
    page: string;
    perPage: string;
    totalPages: string;
    total: string;
  };
}
export interface ArtistGetTopTagsRes extends LastFmTags {
  '@attr': {
    artist: string;
  };
}
export interface ArtistGetTopTracksRes extends LastFmTracks {
  '@attr': {
    artist: string;
    page: string;
    perPage: string;
    totalPages: string;
    total: string;
  };
}
export interface ArtistSearchRes extends LastFmSearch {
  artistmatches: LastFmArtists;
}

export interface ArtistAddTags extends Omit<ArtistRequest<never>, 'method'> {
  tags: string;
}
export interface ArtistRemoveTag extends Omit<ArtistRequest<never>, 'method'> {
  tag: string;
}
export type ArtistGetCorrection = NamedArtist<ArtistGetCorrectionRes>;
export type ArtistGetInfo = ArtistGet<ArtistGetInfoRes>;
export type ArtistGetSimilar = ArtistGet<ArtistGetSimilarRes>;
export type ArtistGetTags = ArtistGet<ArtistGetTagsRes> & { user: string };
export type ArtistGetTopAlbums = ArtistGet<ArtistGetTopAlbumsRes>;
export type ArtistGetTopTags = ArtistGet<ArtistGetTopTagsRes>;
export type ArtistGetTopTracks = ArtistGet<ArtistGetTopTracksRes>;

export type ArtistSearch = Search<ArtistSearchRes, { [SearchType.ARTIST]: string }>;
