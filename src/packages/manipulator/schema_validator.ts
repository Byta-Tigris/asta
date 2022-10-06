import { SchemaValidatorError } from '@asta/errors';
import Joi from 'joi';
import { SchemaValidatorFunction } from './types';

export function validateSchema<
    R = unknown,
    S extends Joi.AnySchema = Joi.AnySchema
>(schema: S, data: R): R {
    const result = schema.validate(data);
    if (result.error) throw new SchemaValidatorError(result.error.message);
    return result.value;
}

export function deferredSchemaValidator<
    R = unknown,
    S extends Joi.AnySchema = Joi.AnySchema
>(schema: S): SchemaValidatorFunction<R> {
    return (data: R): R => {
        return validateSchema<R, S>(schema, data);
    };
}
