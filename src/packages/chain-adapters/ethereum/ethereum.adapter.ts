import { ProtocolChainAdapter } from '../adapter';
import { Arg, Validate } from '@asta/packages/manipulator';
import {
    EthereumBlock,
    EthereumGetBalanceArg,
    EthereumGetBlockArg,
    EthereumGetBlockNumberArg,
    EthereumGetBlockNumberResponse
} from './types';
import {
    EthereumGetBalanceManipulator,
    EthereumGetBlockManipulator,
    GetBlockNumberSchema
} from './ethereum.manipulators';
import { ProtocolNodeResponse, ResponseError } from '@asta/packages/node/types';
import { SyntheticParameter } from '@asta/packages/manipulator/types';
import { createRPCRequest } from '@asta/packages/node';
import { GetBalanceResponse } from '../types';

export class EthereumProtocolChainAdapter extends ProtocolChainAdapter {
    @Validate
    async getBlockNumber(
        @Arg(['id'], { schema: GetBlockNumberSchema })
        arg: SyntheticParameter<EthereumGetBlockNumberArg>
    ): Promise<
        ProtocolNodeResponse<EthereumGetBlockNumberResponse, ResponseError>
    > {
        this.assertNodeExistence(this.node);
        const method = 'eth_blockNumber';
        return await createRPCRequest<EthereumGetBlockNumberResponse>(
            this.node,
            {
                id: arg.id as string,
                method: method,
                params: []
            }
        );
    }

    @Validate
    async getBlock(
        @Arg(new EthereumGetBlockManipulator())
        arg: SyntheticParameter<EthereumGetBlockArg>
    ): Promise<ProtocolNodeResponse<EthereumBlock, ResponseError>> {
        this.assertNodeExistence(this.node);
        const method =
            arg.tag === undefined && arg.blockNumber === undefined
                ? 'eth_getBlockByHash'
                : 'eth_getBlockByNumber';
        let params = [];
        if (method === 'eth_getBlockByNumber') {
            params = [arg.blockNumber ?? arg.tag];
        } else {
            params = [arg.hash];
        }
        params.push(arg.fullTransactionObjects);
        return await createRPCRequest<EthereumBlock>(this.node, {
            id: arg.id as string,
            method: method,
            params: params
        });
    }

    @Validate
    async getBalance(
        @Arg(new EthereumGetBalanceManipulator())
        arg: SyntheticParameter<EthereumGetBalanceArg>
    ): Promise<ProtocolNodeResponse<GetBalanceResponse, ResponseError>> {
        this.assertNodeExistence(this.node);
        const method = 'eth_getBalance';
        const params = [arg.address];
        if (arg.blockNumber !== undefined) {
            params.push(arg.blockNumber);
        } else if (arg.tag !== undefined) {
            params.push(arg.tag);
        }

        const res = await createRPCRequest<string>(this.node, {
            id: arg.id as string,
            method: method,
            params: params
        });
        if (res.result) {
            return {
                result: {
                    value: res.result,
                    symbol: 'wei'
                }
            };
        }
        return {
            error: res.error
        };
    }
}
