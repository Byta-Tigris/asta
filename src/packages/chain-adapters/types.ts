export interface GetBlockNumberArg {}
export interface GetBlockNumberResponse {}

export interface GetBlockArg {}
export interface GetBlockResponse {}

export interface GetBalanceArg {}
export interface GetBalanceResponse {}

export interface GetTransactionBySignatureArg {}
export interface GetTransactionBySignatureResponse {}

export interface GetTransactionStatusArg {}
export interface GetTransactionStatusResponse {}

export interface GetTransactionsByAccountArg {}
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

export interface GetTokenBalanceOfAccountArg {}
export interface GetTokenBalanceOfAccountResponse {}

export interface SendRawTransactionArg {}
export interface SendRawTransactionResponse {}

export interface CreateWalletArg {}
export interface CreateWalletResponse {}
