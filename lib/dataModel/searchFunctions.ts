import { CallbackFunc } from './sharedFunctions';

export enum SearchType {
  ALBUM = 'album',
  ARTIST = 'artist',
}

export type Search<Response, T extends Partial<Record<SearchType, string>>> = T & {
  limit?: number;
  page?: number;
  callback?: CallbackFunc<Response>;
};
