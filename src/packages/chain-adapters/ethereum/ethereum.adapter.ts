import { ProtocolChainAdapter } from '../adapter';
import { Arg, Validate } from '@asta/packages/manipulator';
import {
    EthereumBlock,
    EthereumGetBlockArg,
    EthereumGetBlockNumberArg,
    EthereumGetBlockNumberResponse
} from './types';
import {
    EthereumGetBlockManipulator,
    GetBlockNumberSchema
} from './ethereum.manipulators';
import { ProtocolNodeResponse, ResponseError } from '@asta/packages/node/types';
import { SyntheticParameter } from '@asta/packages/manipulator/types';
import { createRPCRequest } from '@asta/packages/node';

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
        @Arg(EthereumGetBlockManipulator)
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
        return await createRPCRequest(this.node, {
            id: arg.id as string,
            method: method,
            params: params
        });
    }
}
