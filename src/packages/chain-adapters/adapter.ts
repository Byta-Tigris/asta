import { ProtocolMethodNotSupported } from '@asta/errors';
import { ProtocolNode, ProtocolNodeResponse } from '@asta/packages/node/types';
import { SyntheticParameter } from '../manipulator/types';
import {
    CreateWalletArg,
    CreateWalletResponse,
    GetBalanceArg,
    GetBlockArg,
    GetBlockNumberArg,
    GetBlockNumberResponse,
    GetBlockResponse,
    GetTokenBalanceOfAccountArg,
    GetTokenBalanceOfAccountResponse,
    GetTransactionBySignatureArg,
    GetTransactionBySignatureResponse,
    GetTransactionsByAccountArg,
    GetTransactionsByAccountResponse,
    GetTransactionStatusArg,
    GetTransactionStatusResponse,
    SendRawTransactionArg,
    SendRawTransactionResponse,
    VerifySignatureArg,
    VerifySignatureResponse
} from './types';

export class ProtocolChainAdapter {
    private node?: ProtocolNode;

    constructor(node?: ProtocolNode) {
        this.node = node;
    }

    async getBlockNumber(
        arg: SyntheticParameter<GetBlockNumberArg>
    ): Promise<ProtocolNodeResponse<GetBlockNumberResponse>> {
        throw new ProtocolMethodNotSupported('getBlockNumber');
    }

    async getBlock(
        arg: SyntheticParameter<GetBlockArg>
    ): Promise<ProtocolNodeResponse<GetBlockResponse>> {
        throw new ProtocolMethodNotSupported('getBlock');
    }

    async getBalance(
        arg: SyntheticParameter<GetBalanceArg>
    ): Promise<ProtocolNodeResponse<GetBlockResponse>> {
        throw new ProtocolMethodNotSupported('getBalance');
    }

    async getTransactionBySignature(
        arg: SyntheticParameter<GetTransactionBySignatureArg>
    ): Promise<ProtocolNodeResponse<GetTransactionBySignatureResponse>> {
        throw new ProtocolMethodNotSupported('getTransactionBySignature');
    }

    async getTransactionStatus(
        arg: SyntheticParameter<GetTransactionStatusArg>
    ): Promise<ProtocolNodeResponse<GetTransactionStatusResponse>> {
        throw new ProtocolMethodNotSupported('getTransactionStatus');
    }

    async getTransactionsByAccount(
        arg: SyntheticParameter<GetTransactionsByAccountArg>
    ): Promise<ProtocolNodeResponse<GetTransactionsByAccountResponse>> {
        throw new ProtocolMethodNotSupported('getTransactionsByAccount');
    }

    async verifySignature(
        arg: SyntheticParameter<VerifySignatureArg>
    ): Promise<ProtocolNodeResponse<VerifySignatureResponse>> {
        throw new ProtocolMethodNotSupported('verifySignature');
    }

    async getTokenBalanceOfAccount(
        arg: SyntheticParameter<GetTokenBalanceOfAccountArg>
    ): Promise<ProtocolNodeResponse<GetTokenBalanceOfAccountResponse>> {
        throw new ProtocolMethodNotSupported('getTokenBalanceOfAccount');
    }

    async sendRawTransaction(
        arg: SyntheticParameter<SendRawTransactionArg>
    ): Promise<ProtocolNodeResponse<SendRawTransactionResponse>> {
        throw new ProtocolMethodNotSupported('sendRawTransaction');
    }

    async createWallet(
        arg: SyntheticParameter<CreateWalletArg>
    ): Promise<ProtocolNodeResponse<CreateWalletResponse>> {
        throw new ProtocolMethodNotSupported('createWallet');
    }
}
