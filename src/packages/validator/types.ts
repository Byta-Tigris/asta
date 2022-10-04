export interface SyntheticArgumentData extends Record<string, unknown> {
    body?: Record<string, unknown>;
    params?: Record<string, unknown>;
    forSelection: boolean;
}

export type SyntheticParameter<T> = SyntheticArgumentData | T;

// Selector related types
export type SelectorInputDataType =
    | string
    | Array<string>
    | Record<string, string>;

export type SelectorOutputDataType<T = unknown> =
    | SelectorInputDataType
    | T
    | Array<T>;

export enum SelectionDataSource {
    Params = 'params',
    Body = 'body',
    None = 'none'
}
