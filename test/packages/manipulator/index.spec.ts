import { SchemaValidatorError } from '@asta/errors';
import {
    Arg,
    ArgBody,
    ArgumentManipulator,
    ArgumentTransformer,
    MANIPULATOR_PARAM_NAME,
    Validate
} from '@asta/packages/manipulator';
import {
    autoTransformer,
    toObject
} from '@asta/packages/manipulator/transformer';
import {
    ArgumentManipulationData,
    SelectorInputSpecType,
    SelectorOutputDataType,
    SingleSelectorOutputKeyName,
    SyntheticArgumentData,
    SyntheticParameter
} from '@asta/packages/manipulator/types';
import Joi, { object } from 'joi';

describe('Complete Manipulator testing', () => {
    // Test Method parameter is binding data
    it('method parameter is binding the data', () => {
        class MethodBindingTestClass {
            getName(@Arg('name') name): string {
                return name;
            }
        }
        expect(
            Object.getOwnPropertyDescriptor(
                MethodBindingTestClass.prototype,
                MANIPULATOR_PARAM_NAME
            ).value
        ).toBeDefined();
        const manipulators = Object.getOwnPropertyDescriptor(
            MethodBindingTestClass.prototype,
            MANIPULATOR_PARAM_NAME
        ).value;
        expect(manipulators['getName']).toBeDefined();
        const getNameManipulatorData = manipulators[
            'getName'
        ][0] as ArgumentManipulationData;
        expect(getNameManipulatorData.selectorSpec).toEqual('name');
    });
    // Test ParameterDecorator is working
    class ManipulatorTestClass {
        @Validate
        getName(@Arg('name') name): string {
            return name;
        }

        @Validate
        getNameAndAge(
            @Arg('name') name: SyntheticParameter<string>,
            @ArgBody('age') age?: SyntheticParameter<number>
        ): string {
            if (age !== undefined) return `${name}__${age}`;
            return name as string;
        }
    }
    it('testing working of parameter decorator with single argument and single data', () => {
        const obj = new ManipulatorTestClass();
        expect(obj.getName('Test')).toEqual('Test');
        expect(
            obj.getName({ data: { name: 'Logger' }, forSelection: true })
        ).toEqual('Logger');
    });
    it('testing working of manipulator with multiple argument and single data', () => {
        const obj = new ManipulatorTestClass();
        expect(
            obj.getNameAndAge({
                body: {
                    name: 'Arnold',
                    age: 25
                },
                forSelection: true
            })
        ).toEqual('Arnold__25');
    });
    it('testing working of manipulator with multiple argument and multiple data as synthetic argument', () => {
        const obj = new ManipulatorTestClass();
        expect(
            obj.getNameAndAge(
                { body: { name: 'Krish' }, forSelection: true },
                { body: { age: 27 }, forSelection: true }
            )
        ).toEqual('Krish__27');
    });
    it('testing working of manipulator with multiple argument and multiple data one as plain data', () => {
        const obj = new ManipulatorTestClass();
        expect(
            obj.getNameAndAge(
                { body: { name: 'Krish' }, forSelection: true },
                27
            )
        ).toEqual('Krish__27');
        expect(
            obj.getNameAndAge('Aster', {
                body: { age: 27 },
                forSelection: true
            })
        ).toEqual('Aster__27');
    });
    it('testing working of manipulator with multiple argument and all plain data', () => {
        const obj = new ManipulatorTestClass();
        expect(obj.getNameAndAge('Arshi', 98)).toEqual('Arshi__98');
    });
    // Test combination with different selector, ArgumentManipulator, transformer and validators
    const data = {
        body: {
            age: 98
        },
        forSelection: true
    };
    it('using transformer', () => {
        class UsingTransformerTestClass {
            @Validate
            getData(
                @Arg(['age'], { transformer: toObject({ value: 'age' }) })
                ageData: SyntheticParameter<{ value: number }>
            ) {
                return ageData.value;
            }
        }

        const obj = new UsingTransformerTestClass();
        expect(obj.getData(data)).toEqual(data.body.age);
    });
    it('using ArgumentTransformer', () => {
        const greaterThanAgeKeyName = 'isGreaterThanAge';
        const thresholdAge = 88;
        class IsGreaterThanAge extends ArgumentTransformer {
            private readonly thresholdAge: number;
            constructor(thresholdAge: number) {
                super();
                this.thresholdAge = thresholdAge;
            }
            transform<T = { [greaterThanAgeKeyName]: boolean }, R = unknown>(
                data: SelectorOutputDataType<R>
            ): T {
                const value = autoTransformer<{ age: number }>()(data);
                if (typeof value === 'object') {
                    return {
                        [greaterThanAgeKeyName]:
                            value.age !== undefined &&
                            value.age > this.thresholdAge
                    } as T;
                }
                return {
                    [greaterThanAgeKeyName]: false
                } as T;
            }
        }
        const ageTransformer = new IsGreaterThanAge(thresholdAge);
        class UsingTransformerTestClass {
            @Validate
            getData(
                @Arg(['age'], {
                    transformer: ageTransformer
                })
                ageData: SyntheticParameter<{
                    [greaterThanAgeKeyName]: boolean;
                }>
            ) {
                return ageData;
            }
        }
        const obj = new UsingTransformerTestClass();
        const result = obj.getData(data);
        expect(result[greaterThanAgeKeyName]).toEqual(
            data.body.age > thresholdAge
        );
    });
    const schema = Joi.object({
        age: Joi.number().max(60).min(21),
        name: Joi.string().required().max(8)
    });

    class SchemaValidatorTestClass {
        @Validate
        getAge(
            @Arg('age', { schema: Joi.number().max(60).min(21) })
            age: SyntheticParameter<number>
        ): number {
            return age as number;
        }

        @Validate
        getAgeAndName(
            @Arg(['age', 'name'], { schema: schema })
            ageAndName: SyntheticParameter<{ age: number; name: string }>
        ): { age: number; name: string } {
            return ageAndName as { age: number; name: string };
        }
    }

    const fixtures: {
        arg: SyntheticArgumentData;
        hasError: boolean;
        hasErrorComplex: boolean;
    }[] = [
        {
            arg: { body: { age: 18 }, forSelection: true },
            hasError: true,
            hasErrorComplex: true
        },
        {
            arg: { body: { age: 67, name: 'Arnold' }, forSelection: true },
            hasError: true,
            hasErrorComplex: true
        },
        {
            arg: {
                body: { age: 28, name: 'Arnold Raja Ram' },
                forSelection: true
            },
            hasError: false,
            hasErrorComplex: true
        },
        {
            arg: { body: { age: 28, name: 'Arnold' }, forSelection: true },
            hasError: false,
            hasErrorComplex: false
        }
    ];
    it('schema validator will throw error with single value addressing', () => {
        const obj = new SchemaValidatorTestClass();
        for (const fixtureData of fixtures.filter(
            (fixture) => fixture.hasError
        )) {
            try {
                obj.getAge(fixtureData.arg);
            } catch (e) {
                expect(e).toBeInstanceOf(SchemaValidatorError);
            }
        }
    });

    it('schema validator will throw error with multiple value addressing', () => {
        const obj = new SchemaValidatorTestClass();
        const fixes = fixtures.filter((fixture) => fixture.hasErrorComplex);
        for (const fixtureData of fixes) {
            try {
                obj.getAgeAndName(fixtureData.arg);
            } catch (e) {
                expect(e).toBeInstanceOf(SchemaValidatorError);
            }
        }
    });
    it('schema validator will pass', () => {
        const obj = new SchemaValidatorTestClass();
        const fixes = fixtures.filter(
            (fixture) => !fixture.hasError && !fixture.hasErrorComplex
        );
        for (const fixtureData of fixes) {
            expect(obj.getAgeAndName(fixtureData.arg)).toStrictEqual(
                fixtureData.arg.body
            );
        }
    });
    it('schema validator will fail schema validation when providing non-synthetic data', () => {
        try {
            const obj = new SchemaValidatorTestClass();
            obj.getAgeAndName({ age: 98, name: 'Arnold' });
        } catch (e) {
            expect(e).toBeInstanceOf(SchemaValidatorError);
        }
    });
    it('schema validator will pass when sending non-synthetic data', () => {
        const obj = new SchemaValidatorTestClass();
        const data = { age: 24, name: 'Arnold' };
        expect(obj.getAgeAndName(data)).toStrictEqual(data);
    });
});
