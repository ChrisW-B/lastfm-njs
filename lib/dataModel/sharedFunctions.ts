export interface ErrorMessage {
  error: number;
  message: string;
  success: false;
}

export interface LastFmConstructor {
  debug?: boolean;
  apiKey?: string;
  apiSecret?: string;
  username?: string;
  password?: string;
  sessionKey?: string;
}

export type ResponseData<R = {}> = R & {
  success: true;
};

export type CallbackFunc<R = {}> = (result: ErrorMessage | ResponseData<R>) => void;

export interface LastFmRequest<R> {
  method: string;
  autocorrect?: number;
  username?: string;
  callback?: (result: ErrorMessage | ResponseData<R>) => void;
}

export interface PostRequest<R> extends LastFmRequest<R> {
  api_key: string;
  format: string;
  sk: string;
  api_sig: string;
}