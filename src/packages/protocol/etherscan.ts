import { EtherscanUnsupportedChain } from '@asta/errors';
import { createAPIRequest } from '../node';
import { APIRequest, ProtocolNode, ProtocolNodeResponse } from '../node/types';
import { EthereumChains } from './chains-router';
import {
    EtherscanTransactionByAccount,
    EtherscanTransactionsByAccountRequest,
    EtherscanTransactionsByAccountResponse
} from './etherscan.types';

export class EtherscanAdapter {
    readonly apiKey: string;
    readonly endpoint: string;
    // Ascii code of 'etherscan' adds up to become 957
    private static errorCode = '000957';
    static endpointMap = {
        [EthereumChains.Mainnet]: 'https://api.etherscan.io/api',
        [EthereumChains.Goerli]: 'https://api-goerli.etherscan.io/api',
        [EthereumChains.Kovan]: 'https://api-kovan.etherscan.io/api',
        [EthereumChains.Rinkeby]: 'https://api-rinkeby.etherscan.io/api',
        [EthereumChains.Ropsten]: 'https://api-ropsten.etherscan.io/api'
    };

    constructor(chain: string, apiKey: string) {
        const endpoint = EtherscanAdapter.endpointMap[chain];
        if (endpoint === undefined) {
            throw new EtherscanUnsupportedChain(chain);
        }
        this.endpoint = endpoint;
        this.apiKey = apiKey;
    }

    async getTransactionsByAccount(
        query: EtherscanTransactionsByAccountRequest
    ): Promise<ProtocolNodeResponse<EtherscanTransactionByAccount[]>> {
        const node: ProtocolNode = {
            baseUrl: this.endpoint
        };
        query.apiKey = this.apiKey;
        const request: APIRequest = {
            params: {
                module: 'account',
                action: 'txlist',
                ...query
            }
        };
        const res =
            await createAPIRequest<EtherscanTransactionsByAccountResponse>(
                node,
                request
            );
        if (res.result && res.result.status === '0') {
            return {
                error: {
                    code: EtherscanAdapter.errorCode,
                    message: res.result.result as string
                }
            };
        }
        return {
            result: res.result?.result as EtherscanTransactionByAccount[],
            error: res.error
        };
    }
}
