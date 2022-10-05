export interface SyntheticArgumentData extends Record<string, unknown> {
    body?: Record<string, unknown>;
    params?: Record<string, unknown>;
    forSelection: boolean;
}

export type SyntheticParameter<T> = SyntheticArgumentData | T;

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
    [SingleSelectorOutputKeyName]: T;
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

export interface TransformerFunction<T, R = unknown> {
    (data: SelectorOutputDataType<R>): T;
}

export interface SchemaValidatorFunction<S = object, T = unknown> {
    (schema: S, data: T): T;
}

export interface GetSelectorSpecFunction {
    (): SelectorInputSpecType;
}

export interface ArgumentTransform {
    transform<T, R = unknown>(data: SelectorOutputDataType<R>): T;
}

export interface ArgumentSelector {
    getSelectorSpec(): SelectorInputSpecType;
}

export interface ArgumentSchemaValidator {
    validateSchema<S = object, T = unknown>(schema: S, data: T): T;
}

export interface ArgumentManipulator
    extends ArgumentSelector,
        ArgumentTransform,
        ArgumentSchemaValidator {}
