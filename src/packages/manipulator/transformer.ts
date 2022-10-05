import {
    SelectorOutputDataType,
    SingleSelectorOutputKeyName,
    TransformerFunction
} from './types';

export function toValue<T = unknown>(
    keyName: string = SingleSelectorOutputKeyName
): TransformerFunction<T, T> {
    return function (data: SelectorOutputDataType<T>): T {
        if (data === undefined) return;
        if (typeof data === 'object') {
            return data[keyName] as T;
        }
    };
}

function createObjectFromAnotherObject<T = Record<string, unknown>>(
    source: Record<string, unknown>,
    spec: Record<string, string | Record<string, string>>
): T {
    const newObject = {};
    for (const [key, value] of Object.entries(spec)) {
        if (typeof value === 'string') {
            newObject[key] = source[value];
        } else if (typeof value === 'object') {
            newObject[key] = createObjectFromAnotherObject(source, value);
        }
    }
    return newObject as T;
}

export function toObject<T = Record<string, unknown>>(
    objectSpec?: Record<string, string | Record<string, string>>
): TransformerFunction<T> {
    return (data: SelectorOutputDataType): T => {
        if (objectSpec === undefined) return data as T;
        return createObjectFromAnotherObject<T>(data, objectSpec);
    };
}

export function toArray<T = unknown[]>(
    spec: string[]
): TransformerFunction<T, T> {
    return (data: SelectorOutputDataType<T>): T => {
        const newArray: unknown[] = [];
        for (const keyName of spec) {
            newArray.push(data[keyName]);
        }
        return newArray as T;
    };
}
