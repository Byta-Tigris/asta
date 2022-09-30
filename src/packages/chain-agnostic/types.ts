
export interface ChainIdParams {
    namespace: string;
    reference: string;
}

export interface AccountIdParams {
    
}
export interface AssetIdParams {
    chainId: ChainIdParams,
    address: string;
}

export interface AssetNameParams {
    namespace: string;
    reference: string;
}

export interface AssetTypeParams {
    chainId: ChainIdParams;
    assetName: AssetNameParams;
}

export interface AssetIdParams {
    chainId: ChainIdParams,
    assetName: AssetNameParams,
    tokenId: string;
}


export interface ChainIdentifierSpec {
    name: string
    regex: string
    parameters?: {
        delimiter: string;
        values: Record<number, ChainIdentifierSpec>
    }
}



export type ChainAgnosticData = AssetIdParams & AccountIdParams & ChainIdParams;
