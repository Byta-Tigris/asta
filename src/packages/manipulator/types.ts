export interface SyntheticArgumentData<T = any>
    extends Record<string, unknown> {
    body?: Record<string, unknown> | Partial<T>;
    params?: Record<string, unknown> | Partial<T>;
    forSelection: boolean;
}

export type SyntheticParameter<T> = SyntheticArgumentData<T> | T;

// Selector related types
export type Literal = string | number | boolean;
// Specification of selector direction data
export type SelectorInputSpecType =
    | string
    | Array<string>
    | Record<string, string>;

// Output of selection when single string is used as selector
export const SingleSelectorOutputKeyName = '__default__';
export interface SelectorOutputWithSingleSelectionType<T = unknown>
    extends Record<string, unknown> {
    [SingleSelectorOutputKeyName]: { value: T };
}
// Expected output from selector spec
export type SelectorOutputDataType<T = unknown> =
    | Record<string, unknown>
    | SelectorOutputWithSingleSelectionType<T>;

export enum SelectionDataSource {
    Params = 'params',
    Body = 'body',
    None = 'none'
}

export interface TransformerFunction<T = unknown, R = unknown> {
    (data: SelectorOutputDataType<R>): T;
}

export interface SchemaValidatorFunction<T = unknown> {
    (data: T): T;
}

export interface GetSelectorSpecFunction {
    (): SelectorInputSpecType;
}

export interface IArgumentTransformer {
    transform<T, R = unknown>(data: SelectorOutputDataType<R>): T;
}

export interface IArgumentSelector {
    getSelectorSpec(): SelectorInputSpecType;
}

export interface IArgumentSchemaValidator {
    validateSchema<T = unknown>(data: T): T;
}

export interface IArgumentManipulator
    extends IArgumentSelector,
        IArgumentTransformer,
        IArgumentSchemaValidator {}

export interface ArgumentManipulationData<T = unknown> {
    selectorSpec: SelectorInputSpecType;
    transformer?: TransformerFunction<T>;
    source: SelectionDataSource;
    schemaValidator?: SchemaValidatorFunction;
}

export interface MethodManipulationHolder {
    [k: string]: Record<number, ArgumentManipulationData>;
}
