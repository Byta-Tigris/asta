import {
    APIRequest,
    ProtocolNode,
    RPCRequest,
    ProtocolNodeResponse,
    RPCResponse
} from './types';
import axios, { AxiosError } from 'axios';

function handleResponseError(e: AxiosError): ProtocolNodeResponse {
    return {
        error: {
            code: e.code,
            message: e.message
        }
    };
}

export async function createRPCRequest<T>(
    node: ProtocolNode,
    request: RPCRequest
): Promise<ProtocolNodeResponse<T>> {
    try {
        request.jsonrpc = '2.0';
        const res = await axios.post<RPCResponse<T>>(node.baseUrl, request, {
            timeout: node.timeout
        });
        if (res.status === 200 && res.data.id === request.id) {
            return {
                result: res.data.result,
                error: res.data.error
            };
        }
    } catch (e) {
        return handleResponseError(e);
    }
}

export async function createAPIRequest<T>(
    node: ProtocolNode,
    request: APIRequest
): Promise<ProtocolNodeResponse<T>> {
    try {
        request.baseURL = node.baseUrl;
        if (node.timeout) {
            request.timeout = node.timeout;
        }
        const res = await axios.request<T>(request);
        return {
            result: res.data
        };
    } catch (e) {
        return handleResponseError(e);
    }
}
