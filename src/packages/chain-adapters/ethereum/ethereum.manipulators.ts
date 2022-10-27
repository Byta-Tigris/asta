import {
    ArgumentManipulator,
    ArgumentSelector
} from '@asta/packages/manipulator';
import { validateSchema } from '@asta/packages/manipulator/schema_validator';
import { SelectorInputSpecType } from '@asta/packages/manipulator/types';
import { EthereumChains } from '@asta/packages/protocol/chains';
import { ethers } from 'ethers';
import Joi from 'joi';
import {
    EthereumCreateWalletArg,
    EthereumGetTransactionsByAccountArg,
    EthereumTags
} from './types';

const EthereumRPCRequestSchema = Joi.object({
    id: Joi.alternatives().try(Joi.number(), Joi.string()).required()
});
const EthereumAddress = Joi.string().min(40);

export const GetBlockNumberSchema = EthereumRPCRequestSchema;

const TagSchema = Joi.string().allow(...Object.values(EthereumTags));

class EthereumBlockSelectors extends ArgumentSelector {
    getSelectorSpec(): SelectorInputSpecType {
        return ['id', 'tag', 'hash', 'blockNumber'];
    }
}

export class EthereumGetBlockManipulator extends EthereumBlockSelectors {
    validateSchema<T = unknown>(data: T): T {
        const GetBlockSchema = EthereumRPCRequestSchema.append({
            fullTransactionObjects: Joi.boolean().default(false),
            tag: TagSchema,
            hash: Joi.string(),
            blockNumber: Joi.string()
        }).xor('tag', 'blockNumber', 'hash');
        return validateSchema<T>(GetBlockSchema, data);
    }
}

export class EthereumGetBalanceManipulator extends EthereumBlockSelectors {
    validateSchema<T = unknown>(data: T): T {
        const GetBalanceSchema = EthereumRPCRequestSchema.append({
            address: Joi.string().required(),
            tag: TagSchema,
            blockNumber: Joi.string()
        }).xor('tag', 'blockNumber');
        return validateSchema<T>(GetBalanceSchema, data);
    }
}

export class EthereumGetTransactionBySignatureManipulator extends ArgumentManipulator {
    getSelectorSpec(): SelectorInputSpecType {
        return ['id', 'hash'];
    }
    validateSchema<T = unknown>(data: T): T {
        const schema = EthereumRPCRequestSchema.append({
            hash: Joi.string().required()
        });
        return validateSchema<T>(schema, data);
    }
}

export class EthereumSendRawTransactionManipulator extends ArgumentManipulator {
    getSelectorSpec(): SelectorInputSpecType {
        return ['id', 'signature'];
    }
    validateSchema<T = unknown>(data: T): T {
        const schema = EthereumRPCRequestSchema.append({
            signature: Joi.string().required()
        });
        return validateSchema<T>(schema, data);
    }
}

export class EthereumVerifySignatureManipulator extends ArgumentManipulator {
    getSelectorSpec(): SelectorInputSpecType {
        return ['id', 'address', 'signature', 'message'];
    }

    validateSchema<T = unknown>(data: T): T {
        const schema = EthereumRPCRequestSchema.append({
            address: EthereumAddress,
            signature: Joi.string().required().min(5),
            message: Joi.string().required()
        });
        return validateSchema<T>(schema, data);
    }
}

export class EthereumGetTokenBalanceOfAccountManipulator extends ArgumentManipulator {
    getSelectorSpec(): SelectorInputSpecType {
        return ['id', 'token', 'address'];
    }

    validateSchema<T = unknown>(data: T): T {
        const schema = EthereumRPCRequestSchema.append({
            token: EthereumAddress,
            address: EthereumAddress
        });
        return validateSchema<T>(schema, data);
    }
}

export class EthereumCreateWalletManipulator extends ArgumentManipulator {
    getSelectorSpec(): SelectorInputSpecType {
        return ['phrase', 'path'];
    }

    validateSchema<T = EthereumCreateWalletArg>(data: T): T {
        const schema = Joi.object({
            phrase: Joi.string(),
            path: Joi.string()
        });
        const validatedData = validateSchema<EthereumCreateWalletArg>(
            schema,
            data
        );
        const wallet = ethers.Wallet.createRandom({
            path: validatedData.path
        });
        validatedData.phrase = validatedData.phrase ?? wallet.mnemonic.phrase;
        validatedData.path = validatedData.path ?? wallet.mnemonic.path;
        return validatedData as T;
    }
}

export class EthereumGetTransactionsByAccountManipulator extends ArgumentManipulator {
    getSelectorSpec(): SelectorInputSpecType {
        return [
            'address',
            'apiKey',
            'chainId',
            'startblock',
            'endblock',
            'page',
            'offset',
            'sort'
        ];
    }

    validateSchema<T = EthereumGetTransactionsByAccountArg>(data: T): T {
        const schema = Joi.object({
            address: EthereumAddress,
            apiKey: Joi.string().required(),
            chain: Joi.string().default(EthereumChains.Mainnet),
            startblock: Joi.string(),
            endblock: Joi.string(),
            page: Joi.number(),
            offset: Joi.number(),
            sort: Joi.string().allow('asc', 'desc').default('asc')
        });

        return validateSchema<T>(schema, data);
    }
}
