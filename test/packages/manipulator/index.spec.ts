import {
    Arg,
    ArgBody,
    MANIPULATOR_PARAM_NAME,
    Validate
} from '@asta/packages/manipulator';
import { ArgumentManipulationData } from '@asta/packages/manipulator/types';

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
        getNameAndAge(@Arg('name') name, @ArgBody('age') age?: number): string {
            if (age !== undefined) return `${name}__${age}`;
            return name;
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
    // Test combination with different selector, ArgumentManipulator, transformer and validators
});
