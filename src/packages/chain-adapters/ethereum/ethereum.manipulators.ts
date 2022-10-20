import { ArgumentSelector } from '@asta/packages/manipulator';
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
        })
            .xor('tag', 'blockNumber')
            .without('id', 'hash');
        return validateSchema<T>(GetBalanceSchema, data);
    }
}
