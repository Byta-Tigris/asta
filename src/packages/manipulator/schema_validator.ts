import { SchemaValidatorError } from '@asta/errors';
import Joi from 'joi';

export function validateSchema<
    R = unknown,
    S extends Joi.AnySchema = Joi.AnySchema
>(schema: S, data: R): R {
    const result = schema.validate(data);
    if (result.error) throw new SchemaValidatorError(result.error.message);
    return result.value;
}
