import {
    ArgumentManipulator,
    ArgumentSelector
} from '@asta/packages/manipulator';
import { validateSchema } from '@asta/packages/manipulator/schema_validator';
import { SelectorInputSpecType } from '@asta/packages/manipulator/types';
import Joi from 'joi';
import { EthereumTags } from './types';

const EthereumRPCRequestSchema = Joi.object({
    id: Joi.alternatives().try(Joi.number(), Joi.string()).required()
});

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
            address: Joi.string().required().min(5),
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
            token: Joi.string().required().min(5),
            address: Joi.string().required().min(5)
        });
        return validateSchema<T>(schema, data);
    }
}
