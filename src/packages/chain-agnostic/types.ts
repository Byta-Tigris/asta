
export interface ChainIdParams {
    namespace: string;
    reference: string;
}


export interface AccountIdParams {
    chainId: ChainIdParams,
    address: string;
}

export interface AccountId{
    chainId: ChainIdParams | string;
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

export interface AssetType {
    chainId: ChainIdParams| string;
    assetName: AssetNameParams | string;
}

export interface AssetIdParams {
    chainId: ChainIdParams,
    assetName: AssetNameParams,
    tokenId: string;
}

export interface AssetId {
    chainId: ChainIdParams | string;
    assetName: AssetNameParams | string;
    tokenId: string;
}


export interface ChainIdentifierSpec {
    name: string
    regex: string
    parentName?: string
    parameters?: {
        delimiter: string;
        values: Record<number, ChainIdentifierSpec>
    }
}



export type ChainAgnosticData = AssetId & AccountId & ChainIdParams;
