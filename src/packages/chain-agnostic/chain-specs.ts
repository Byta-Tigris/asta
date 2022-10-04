import { ChainIdentifierSpec } from './types';

export enum ChainAgnosticIdentifierSpecNames {
    ChainId = 'chainId',
    AccountId = 'accountId',
    AssetName = 'assetName',
    AssetType = 'assetType',
    AssetId = 'assetId'
}

const CAIP2: ChainIdentifierSpec = {
    name: ChainAgnosticIdentifierSpecNames.ChainId,
    regex: '[-:a-zA-Z0-9]{5,41}',
    parameters: {
        delimiter: ':',
        values: {
            0: {
                name: 'namespace',
                regex: '[-a-z0-9]{3,8}'
            },
            1: {
                name: 'reference',
                regex: '[-a-zA-Z0-9]{1,32}'
            }
        }
    }
};

const CAIP10: ChainIdentifierSpec = {
    name: ChainAgnosticIdentifierSpecNames.AccountId,
    regex: '[-:a-zA-Z0-9]{7,106}',
    parameters: {
        delimiter: ':',
        values: {
            0: {
                name: 'namespace',
                regex: '[-a-z0-9]{3,8}'
            },
            1: {
                name: 'reference',
                regex: '[-a-zA-Z0-9]{1,32}'
            },
            2: {
                name: 'address',
                regex: '[a-zA-Z0-9]{1,64}'
            }
        }
    }
};

// represents namespace:reference in CAIP-19
const AssetName: ChainIdentifierSpec = {
    name: ChainAgnosticIdentifierSpecNames.AssetName,
    regex: '[-:a-zA-Z0-9]{5,73}',
    parameters: {
        delimiter: ':',
        values: {
            0: {
                name: 'namespace',
                regex: '[-a-z0-9]{3,8}'
            },
            1: {
                name: 'reference',
                regex: '[-a-zA-Z0-9]{1,64}'
            }
        }
    }
};

const CAIP19AssetType: ChainIdentifierSpec = {
    name: ChainAgnosticIdentifierSpecNames.AssetType,
    regex: '[-:a-zA-Z0-9]{11,115}',
    parameters: {
        delimiter: '/',
        values: {
            0: CAIP2,
            1: AssetName
        }
    }
};

const CAIP19AssetId: ChainIdentifierSpec = {
    name: ChainAgnosticIdentifierSpecNames.AssetId,
    regex: '[-:a-zA-Z0-9]{13,148}',
    parameters: {
        delimiter: '/',
        values: {
            0: CAIP2,
            1: AssetName,
            2: {
                name: 'tokenId',
                regex: '[-a-zA-Z0-9]{1,32}'
            }
        }
    }
};

export const ChainIdentifierSpecData: Record<string, ChainIdentifierSpec> = {
    [CAIP2.name]: CAIP2,
    [CAIP10.name]: CAIP10,
    [AssetName.name]: AssetName,
    [CAIP19AssetType.name]: CAIP19AssetType,
    [CAIP19AssetId.name]: CAIP19AssetId
};
