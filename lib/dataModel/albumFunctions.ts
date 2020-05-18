import { LastFmAlbum, LastFmTags, LastFmAlbums, LastFmSearch } from './lastFMNatives';
import { LastFmRequest } from './sharedFunctions';
import { Search, SearchType } from './searchFunctions';

export type MBIDAlbum<R = {}> = Omit<AlbumRequest<R>, 'method' | 'artist' | 'album'> & { mbid: string };
export type NamedAlbum<R = {}> = Omit<AlbumRequest<R>, 'method'>;
type AlbumGet<R> = MBIDAlbum<R> | NamedAlbum<R>;

interface AlbumRequest<R> extends LastFmRequest<R> {
  artist: string;
  album: string;
  user?: string;
}

export type AlbumInfoRes = LastFmAlbum;
export interface AlbumTagsRes extends LastFmTags {
  '@attr': {
    artist: string;
    album: string;
  };
}
export interface AlbumSearchRes extends LastFmSearch {
  albummatches: LastFmAlbums;
}

export interface AlbumAddTags extends Omit<AlbumRequest<never>, 'method'> {
  tags: string;
}
export interface AlbumRemoveTag extends Omit<AlbumRequest<never>, 'method'> {
  tag: string;
}

export type AlbumGetTopTags = AlbumGet<AlbumTagsRes>;
export type AlbumGetTags = AlbumGet<AlbumTagsRes>;
export type AlbumGetInfo = AlbumGet<AlbumInfoRes>;
export type AlbumSearch = Search<AlbumSearchRes, { [SearchType.ALBUM]: string }>;
