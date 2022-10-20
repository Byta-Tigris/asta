import { AxiosRequestConfig } from 'axios';

export interface ProtocolNode {
    baseUrl: string;
    timeout?: number;
}

export enum RequestMethod {
    Post = 'Post',
    Get = 'Get'
}

export interface ResponseError {
    message: string;
    code: string;
}

export interface RPCRequest {
    jsonrpc?: string;
    id: number | string;
    method: string;
    params: Array<unknown> | Record<string, unknown>;
}

export type APIRequest<T = any> = AxiosRequestConfig<T>;

export interface ProtocolNodeResponse<
    T = any,
    E extends ResponseError = ResponseError
> {
    result?: T;
    error?: E;
}

export interface RPCResponse<T> extends ProtocolNodeResponse<T> {
    jsonrpc: string;
    id: number | string;
}
