export interface LastFmSearch {
  'opensearch:Query': {
    '#text': string;
    role: string;
    searchTerms: string;
    startPage: string;
  };
  'opensearch:totalResults': string;
  'opensearch:startIndex': string;
  'opensearch:itemsPerPage': string;
  '@attr': {
    for: string;
  };
}

enum LastFmImageSize {
  SMALL = 'small',
  MEDIUM = 'medium',
  LARGE = 'large',
  EXTRALARGE = 'extralarge',
  MEGA = 'mega',
}

export interface LastFmImage {
  '#text': string;
  size: LastFmImageSize;
}
interface LastFmStats {
  listeners: string;
  playcount: string;
}

export interface BasicLastFmArtist {
  name: string;
  mbid: string;
  url: string;
  image?: LastFmImage[];
}
interface LastFmLinks {
  link: {
    '#text': string;
    rel: string;
    href: string;
  };
}
export interface LastFmArtists {
  artist: BasicLastFmArtist[];
}

interface LastFmBio {
  links: LastFmLinks;
  published: string;
  summary: string;
  content: string;
}
export interface LastFmArtist extends BasicLastFmArtist {
  streamable: string;
  ontour: string;
  stats: LastFmStats;
  similar: LastFmArtists;
  tags: LastFmTags;
  bio?: LastFmBio;
}
interface BasicLastFmTrack {
  name: string;
  url: string;
  artist: LastFmArtist;
}
interface LastFmTrack extends BasicLastFmTrack {
  duration: string;
  '@attr': {
    rank: string;
  };
  streamable: {
    '#text': string;
    fulltrack: string;
  };
}
export interface LastFmAlbum {
  name: string;
  artist: string;
  mbid: string;
  url?: string;
  listeners?: string;
  playcount?: string;
  image?: LastFmImage[];
  tracks?: LastFmTracks;
  wiki?: LastFmWiki;
}

interface LastFmTag {
  name: string;
  url: string;
  count?: number;
}

export interface LastFmAlbums {
  album: LastFmAlbum[];
}

export interface LastFmTracks {
  track: LastFmTrack[];
}
export interface LastFmTags {
  tag: LastFmTag[];
}
export interface LastFmWiki {
  published: string;
  summary: string;
  content: string;
}
export interface LastFmArtistCorrections {
  artist: BasicLastFmArtist;
  '@attr': {
    index: 0;
  };
}
