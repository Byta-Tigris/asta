import {
    GetBlockArg,
    GetBlockNumberArg,
    GetBlockNumberResponse,
    GetBlockResponse
} from '../types';

export interface EthereumGetBlockNumberArg extends GetBlockNumberArg {}

export interface EthereumGetBlockNumberResponse
    extends GetBlockNumberResponse {}

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

export interface EthereumTransaction {
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
