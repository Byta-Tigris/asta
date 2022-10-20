export interface ChainRPCRequest {
    id?: string | number;
}

export interface GetBlockNumberArg extends ChainRPCRequest {}
export interface GetBlockNumberResponse {}

export interface GetBlockArg extends ChainRPCRequest {}
export interface GetBlockResponse {}

export interface GetBalanceArg extends ChainRPCRequest {}
export interface GetBalanceResponse {}

export interface GetTransactionBySignatureArg extends ChainRPCRequest {}
export interface GetTransactionBySignatureResponse {}

export interface GetTransactionStatusArg extends ChainRPCRequest {}
export interface GetTransactionStatusResponse {}

export interface GetTransactionsByAccountArg extends ChainRPCRequest {}
export interface GetTransactionsByAccountResponse {}

export interface VerifySignatureArg {
    address: string;
    signature: string;
    message: string;
}

export interface VerifySignatureResponse {
    address: string;
    signature: string;
    is_verified: boolean;
}

export interface GetTokenBalanceOfAccountArg extends ChainRPCRequest {}
export interface GetTokenBalanceOfAccountResponse {}

export interface SendRawTransactionArg extends ChainRPCRequest {}
export interface SendRawTransactionResponse {}

export interface CreateWalletArg {}
export interface CreateWalletResponse {}
