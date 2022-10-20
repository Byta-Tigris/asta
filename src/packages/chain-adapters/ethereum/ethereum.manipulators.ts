import { ArgumentManipulator } from '@asta/packages/manipulator';
import { validateSchema } from '@asta/packages/manipulator/schema_validator';
import { SelectorInputSpecType } from '@asta/packages/manipulator/types';
import Joi from 'joi';
import { EthereumTags } from './types';

export const GetBlockNumberSchema = Joi.object({
    id: Joi.required()
});

export const GetBlockSchema = Joi.object({
    fullTransactionObjects: Joi.boolean().default(false),
    tag: Joi.string().allow(...Object.values(EthereumTags)),
    hash: Joi.string(),
    blockNumber: Joi.string(),
    id: Joi.required()
}).xor('tag', 'blockNumber', 'hash');

class _ethereumGetBlockManipulator extends ArgumentManipulator {
    getSelectorSpec(): SelectorInputSpecType {
        return ['id', 'tag', 'hash', 'blockNumber'];
    }
    validateSchema<T = unknown>(data: T): T {
        return validateSchema<T>(GetBlockSchema, data);
    }
}

export const EthereumGetBlockManipulator = new _ethereumGetBlockManipulator();
