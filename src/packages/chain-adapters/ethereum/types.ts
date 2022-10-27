import {
    EtherscanRawTransactionsByAccountRequest,
    EtherscanTransactionsByAccountResponse
} from '@asta/packages/protocol/etherscan.types';
import {
    GetBalanceArg,
    GetBlockArg,
    GetBlockNumberArg,
    GetBlockNumberResponse,
    GetBlockResponse,
    GetTransactionBySignatureArg,
    GetTransactionBySignatureResponse,
    SendRawTransactionArg,
    GetTransactionStatusArg,
    GetTransactionStatusResponse,
    VerifySignatureArg,
    VerifySignatureResponse,
    GetTokenBalanceOfAccountArg,
    GetTokenBalanceOfAccountResponse,
    CreateWalletArg,
    CreateWalletResponse,
    GetTransactionsByAccountArg,
    GetTransactionsByAccountResponse
} from '../types';

export interface EthereumGetBlockNumberArg extends GetBlockNumberArg {}

export interface EthereumGetBlockNumberResponse
    extends GetBlockNumberResponse {}

export enum EthereumTags {
    Earliest = 'earliest',
    Latest = 'latest',
    Pending = 'pending'
}

export interface EthereumGetBlockArg extends GetBlockArg {
    fullTransactionObjects: boolean;
    tag?: EthereumTags;
    hash?: string;
    blockNumber?: string;
}

export interface EthereumBlock extends GetBlockResponse {
    number: string;
    hash: string;
    parentHash: string;
    nonce: string;
    sha3Uncles: string;
    logsBloom: string;
    transactionsRoot: string;
    stateRoot: string;
    receiptsRoot: string;
    miner: string;
    difficulty: string;
    size: string;
    gasLimit: string;
    gasUsed: string;
    timestamp: string;
    transactions: string[] | EthereumTransaction[];
    uncles: string[];
}

export interface EthereumGetBalanceArg extends GetBalanceArg {
    address: string;
    tag?: EthereumTags;
    blockNumber?: string;
}

export interface EthereumGetTransactionBySignatureArg
    extends GetTransactionBySignatureArg {
    hash: string;
}
export interface EthereumTransaction extends GetTransactionBySignatureResponse {
    blockHash: string | null;
    blockNumber: string | null;
    from: string;
    gas: string;
    gasPrice: string;
    hash: string;
    input: string;
    nonce: string;
    to: string | null;
    transactionIndex: string | null;
    value: string;
    v: string;
    s: string;
}

export interface EthereumGetTransactionStatusArg
    extends GetTransactionStatusArg {
    hash: string;
}

export interface EthereumTransactionReceipt
    extends GetTransactionStatusResponse {
    transactionHash: string;
    transactionIndex: string;
    blockHash: string;
    blockNumber: string;
    from: string;
    to: string | null;
    cumulativeGasUser: string;
    gasUsed: string;
    contractAddress: string | null;
    logs: Array<unknown>;
    logBloom: string;
    root: string;
    status: string;
}

export type EthereumGetTransactionStatusResponse =
    | EthereumTransactionReceipt
    | Pick<EthereumTransactionReceipt, 'transactionHash' | 'status'>;

export interface EthereumSendRawTransactionArg extends SendRawTransactionArg {
    signature: string;
}

export interface EthereumVerifySignatureArg extends VerifySignatureArg {
    address: string;
    signature: string;
    message: string;
}

export interface EthereumVerifySignatureResponse
    extends VerifySignatureResponse {}

export interface EthereumGetTokenBalanceOfAccountArg
    extends GetTokenBalanceOfAccountArg {
    token: string;
    address: string;
}

export interface EthereumGetTokenBalanceOfAccountResponse
    extends GetTokenBalanceOfAccountResponse {
    balance: string;
}

export interface EthereumCreateWalletArg extends CreateWalletArg {
    phrase?: string;
    path?: string;
}

export interface EthereumCreateWalletResponse extends CreateWalletResponse {
    phrase: string;
    path: string;
    privateKey: string;
    publicKey: string;
}

export type EthereumGetTransactionsByAccountArg =
    EtherscanRawTransactionsByAccountRequest &
        GetTransactionsByAccountArg & {
            apiKey: string;
            chain: string;
        };

// export type EthereumGetTransactionsByAccountResponse =
//     EtherscanTransactionsByAccountResponse & GetTransactionsByAccountResponse;
