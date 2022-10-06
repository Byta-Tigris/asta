import { ExpectingTestToFail, SchemaValidatorError } from '@asta/errors';
import { validateSchema } from '@asta/packages/manipulator/schema_validator';
import Joi from 'joi';

describe('Schema Validator testing', () => {
    interface Fixture {
        schema: Joi.AnySchema;
        hasError: boolean;
        input: unknown;
    }

    const fixtures: Fixture[] = [
        {
            schema: Joi.string(),
            hasError: true,
            input: 23
        },
        {
            schema: Joi.string(),
            hasError: false,
            input: 'hello'
        },
        {
            schema: Joi.object({
                username: Joi.string(),
                password: Joi.string(),
                age: Joi.number().less(26)
            }),
            hasError: false,
            input: {
                username: '2365',
                password: 'random123',
                age: 25
            }
        },
        {
            schema: Joi.array().max(2),
            hasError: false,
            input: ['hello', 'world']
        }
    ];

    it('schema validation must throw error', () => {
        const fixturesWithError = fixtures.filter(
            (fixture) => fixture.hasError
        );
        for (const fixtureData of fixturesWithError) {
            try {
                validateSchema(fixtureData.schema, fixtureData.input);
                throw new ExpectingTestToFail(
                    `must throw SchemaValidationError with schema: ${fixtureData.schema} and data: ${fixtureData.input}`
                );
            } catch (e) {
                expect(e).toBeInstanceOf(SchemaValidatorError);
            }
        }
    });

    it('schema validation must pass', () => {
        const fixtureWithoutError = fixtures.filter(
            (fixture) => !fixture.hasError
        );
        for (const fixtureData of fixtureWithoutError) {
            expect(
                validateSchema(fixtureData.schema, fixtureData.input)
            ).toStrictEqual(fixtureData.input);
        }
    });
});
