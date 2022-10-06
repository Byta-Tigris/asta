import { MissingSelectorSpec } from '@asta/errors';
import Joi from 'joi';
import { deferredSchemaValidator, validateSchema } from './schema_validator';
import { Selector } from './selector';
import { autoTransformer, toObject } from './transformer';
import {
    ArgumentManipulationData,
    IArgumentManipulator,
    MethodManipulationHolder,
    SchemaValidatorFunction,
    SelectionDataSource,
    SelectorInputSpecType,
    SelectorOutputDataType,
    SyntheticArgumentData,
    TransformerFunction
} from './types';

export const MANIPULATOR_PARAM_NAME = '__manipulators';

/**
 * ArgumentManipulator object contains function for selection, transform and schema validation.
 * Each of these function either returns a value or `null`.
 * In case `null` is returned, the manipulator class will be considered incapable of performing that function
 * and the manipulator will either depend on external function or raise Error.
 */
export class ArgumentManipulator implements IArgumentManipulator {
    /**
     * Selector spec is used to extract required data from the arguments object.W
     * @return selector spec
     */
    getSelectorSpec(): SelectorInputSpecType {
        throw new MissingSelectorSpec();
    }

    /**
     * Transformation is performed just after the selection of data and it's an optional step.
     * Function is required to perform direct transformation instead of returning {@link TransformerFunction}
     * @param data object after selection
     * @return transformed data
     */
    transform<T, R = unknown>(data: SelectorOutputDataType<R>): T {
        return autoTransformer<T>()(data);
    }

    /**
     * Unlike `SchemaValidatorFunction`, this has to perform validation itself.
     * The developer can choose to use `Joi` for schema validation or validate the data from scratch.
     * On successful validation it must return the same data otherwise throw {@link SchemaValidatorError}
     *
     * @param data transformed data on which validation will be performed
     * @return same data if validated
     *
     * @throws {@link SchemaValidatorError} when validation will fail.
     */
    validateSchema<T = unknown>(data: T): T {
        return data;
    }
}

export class ArgumentSelector extends ArgumentManipulator {
    getSelectorSpec(): SelectorInputSpecType {
        throw new Error('Method not implemented');
    }
}

export class ArgumentTransformer extends ArgumentManipulator {
    transform<T, R = unknown>(data: SelectorOutputDataType<R>): T {
        throw new Error('Method not implemented');
    }
}

export class ArgumentSchemaValidator extends ArgumentManipulator {
    validateSchema<T = unknown>(data: T): T {
        throw new Error('Method not implemented');
    }
}

interface CreateManipulationDecoratorOptions {
    source?: SelectionDataSource;
    transformer?:
        | TransformerFunction
        | ArgumentManipulator
        | ArgumentTransformer;
    schemaValidator?:
        | SchemaValidatorFunction
        | ArgumentManipulator
        | ArgumentSchemaValidator;
    manipulator?: ArgumentManipulator;
    schema?: Joi.AnySchema;
}

export function createManipulationDecorator(
    selector: SelectorInputSpecType | ArgumentManipulator | ArgumentSelector,
    options: CreateManipulationDecoratorOptions
): ParameterDecorator {
    return (target: any, propertyKey: string, propertyIndex: number) => {
        if (target[MANIPULATOR_PARAM_NAME] === undefined) {
            Object.defineProperty(target, MANIPULATOR_PARAM_NAME, {
                value: {},
                writable: true,
                configurable: true,
                enumerable: true
            });
        }
        const manipulatorDescriptor = Object.getOwnPropertyDescriptor(
            target,
            MANIPULATOR_PARAM_NAME
        );
        if (
            manipulatorDescriptor === undefined ||
            manipulatorDescriptor.value === undefined
        )
            return;
        const manipulators =
            manipulatorDescriptor.value as MethodManipulationHolder;
        const data: ArgumentManipulationData = {
            selectorSpec: getSelectorSpec(selector),
            source: options.source ?? SelectionDataSource.None,
            transformer: getTransformerFunction(
                options,
                selector instanceof ArgumentManipulator ? selector : undefined
            ),
            schemaValidator: getSchemaValidator(
                options,
                selector instanceof ArgumentManipulator ? selector : undefined
            )
        };
        if (manipulators[propertyKey] === undefined) {
            manipulators[propertyKey] = {};
        }
        manipulators[propertyKey][propertyIndex] = data;
        manipulatorDescriptor.value = manipulators;
        Object.defineProperty(
            target,
            MANIPULATOR_PARAM_NAME,
            manipulatorDescriptor
        );
    };
}

function getSelectorSpec(
    selector: SelectorInputSpecType | ArgumentManipulator | ArgumentSelector
): SelectorInputSpecType {
    if (selector instanceof ArgumentManipulator) {
        return selector.getSelectorSpec();
    }
    return selector;
}

function getTransformerFunction(
    options: CreateManipulationDecoratorOptions,
    selector?: ArgumentManipulator
): TransformerFunction {
    if (options.transformer !== undefined) {
        if (options.transformer instanceof ArgumentManipulator) {
            return options.transformer.transform;
        }
        return options.transformer as TransformerFunction;
    }
    if (options.manipulator !== undefined) {
        return options.manipulator.transform;
    }
    if (selector !== undefined) return selector.transform;
    return autoTransformer();
}

function getSchemaValidator(
    options: CreateManipulationDecoratorOptions,
    selector?: ArgumentManipulator
): SchemaValidatorFunction {
    if (options.schemaValidator !== undefined) {
        if (options.schemaValidator instanceof ArgumentManipulator)
            return options.schemaValidator.validateSchema;
        return options.schemaValidator as SchemaValidatorFunction;
    }
    if (options.schema !== undefined)
        return deferredSchemaValidator(options.schema);
    if (options.manipulator !== undefined)
        return options.manipulator.validateSchema;
    if (selector !== undefined) return selector.validateSchema;
}

function getManipulatorHolderForMethod(
    target: object,
    methodName: string
): Record<number, ArgumentManipulationData> | undefined {
    const manipulatorDescriptor = Object.getOwnPropertyDescriptor(
        target,
        MANIPULATOR_PARAM_NAME
    );
    if (manipulatorDescriptor.value === undefined) return undefined;
    return (manipulatorDescriptor.value as MethodManipulationHolder)[
        methodName
    ];
}

export function Validate(
    target: any,
    memberName: string,
    propertyDescriptor: PropertyDescriptor
) {
    const originalMethod = propertyDescriptor.value;
    propertyDescriptor.value = function (...args: unknown[]) {
        const methodManipulators = getManipulatorHolderForMethod(
            target,
            memberName
        );
        if (methodManipulators !== undefined && args.length > 0) {
            let lastSyntheticArgument: SyntheticArgumentData;
            for (const index of Object.keys(methodManipulators)) {
                const arg = args[index] ?? lastSyntheticArgument;
                if (
                    arg === undefined ||
                    typeof arg !== 'object' ||
                    arg['forSelection'] !== true ||
                    methodManipulators[index] === undefined
                ) {
                    continue;
                }
                const parameterManipulator = methodManipulators[index];
                const syntheticArgumentData = arg as SyntheticArgumentData;
                if (
                    syntheticArgumentData !== undefined &&
                    typeof syntheticArgumentData === 'object' &&
                    syntheticArgumentData['forSelection'] === true
                ) {
                    lastSyntheticArgument = syntheticArgumentData;
                }
                const selectedData = Selector.findPropertyUsingSelector(
                    syntheticArgumentData,
                    parameterManipulator.selectorSpec,
                    parameterManipulator.source
                );
                let transformedData: unknown = selectedData;
                if (parameterManipulator.transformer !== undefined) {
                    transformedData =
                        parameterManipulator.transformer(selectedData);
                }
                let validatedData: unknown = transformedData;
                if (parameterManipulator.schemaValidator !== undefined) {
                    validatedData =
                        parameterManipulator.schemaValidator(transformedData);
                }
                args[index] = validatedData;
            }
        }
        const result = originalMethod.apply(this, args);
        return result;
    };
}

export function Arg(
    selector: SelectorInputSpecType | ArgumentManipulator | ArgumentSelector,
    options?: CreateManipulationDecoratorOptions
) {
    options = options ?? {};
    return createManipulationDecorator(selector, options);
}

export function ArgParams(
    selector: SelectorInputSpecType | ArgumentManipulator | ArgumentSelector,
    options?: CreateManipulationDecoratorOptions
) {
    options = options ?? {};
    options.source = SelectionDataSource.Params;
    return createManipulationDecorator(selector, options);
}

export function ArgBody(
    selector: SelectorInputSpecType | ArgumentManipulator | ArgumentSelector,
    options?: CreateManipulationDecoratorOptions
) {
    options = options ?? {};
    options.source = SelectionDataSource.Body;
    return createManipulationDecorator(selector, options);
}
