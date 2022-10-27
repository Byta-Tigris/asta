export interface EtherscanRequestQuery {
    apiKey: string;
}

export interface EtherscanResponse<T> {
    status: string;
    message: string;
    result: T;
}

export interface EtherscanRawTransactionsByAccountRequest {
    address: string;
    startblock?: string;
    endblock?: string;
    page?: number;
    offset?: number;
    sort?: 'asc' | 'desc';
}

export type EtherscanTransactionsByAccountRequest =
    EtherscanRawTransactionsByAccountRequest & Partial<EtherscanRequestQuery>;

export interface EtherscanTransactionByAccount {
    blockNumber: string;
    timeStamp: string;
    hash: string;
    nonce: string;
    blockHash: string;
    transactionIndex: string;
    from: string;
    to: string;
    value: string;
    gas: string;
    gasPrice: string;
    isError: string;
    txreceipt_status: string;
    input: string;
    contractAddress: string;
    cumulativeGasUsed: string;
    gasUsed: string;
    confirmations: string;
    methodId: string;
    functionName: string;
}

export type EtherscanTransactionsByAccountResponse = EtherscanResponse<
    EtherscanTransactionByAccount[] | string
>;
