import { UnsupportedSelectorSpecError } from '@asta/errors';
import {
    SelectionDataSource,
    SelectorInputSpecType,
    SelectorOutputDataType,
    SingleSelectorOutputKeyName
} from './types';

class Queue<T> {
    private array: T[];

    constructor() {
        this.array = [];
    }

    enqueue(val: T): void {
        this.array.push(val);
    }

    dequeue(): T {
        return this.array.splice(0, 1)[0];
    }

    length(): number {
        return this.array.length;
    }

    clear(): void {
        this.array = [];
    }

    top(): T {
        return this.array[0];
    }
}

export class Selector {
    private static ignoreKeyNames = ['forSelection'];
    /**
     * @param data - source data from which the algorithm will find the value
     * @param name - Name of target key
     * @returns value | undefined
     */
    static findProperty<T = unknown>(
        data: Record<string, unknown>,
        name: string,
        source: string = SelectionDataSource.None
    ): T {
        const queue = new Queue<
            unknown | unknown[] | Record<string, unknown>
        >();
        let nameFragments = name.split('.');
        const foundValues = [];
        if (source !== SelectionDataSource.None) {
            nameFragments = [source].concat(nameFragments);
        }
        queue.enqueue(data);
        while (queue.length() > 0 && nameFragments.length > 0) {
            const chunk = queue.dequeue();
            if (typeof chunk === 'object') {
                for (const [key, value] of Object.entries(chunk)) {
                    if (nameFragments[0] === key) {
                        nameFragments.splice(0, 1);
                        if (nameFragments.length === 0) {
                            foundValues.push(value);
                        }
                    }
                    if (
                        typeof value === 'object' &&
                        !this.ignoreKeyNames.includes(key)
                    ) {
                        queue.enqueue(value);
                    }
                }
            }
        }

        return foundValues[0] as T;
    }
    /**
     * Search for the properties in the argument object using the selector spec and source using BFS.
     * source is used to specifically target nested object in the argument avoiding all other values.
     *
     * @param arg The data argument (an Object) from which required property will be selected
     * @param selectorSpec Selector spec for selection
     * @param source property name of the targeted data source
     * @returns Selected values as object
     *
     * @throws {@link UnsupportedSelectorSpecError} when selectorSpec is not supported.
     * any value other than `string`, `Array<string>` or Object will trigger the error
     */
    static findPropertyUsingSelector<T = unknown>(
        arg: Record<string, unknown>,
        selectorSpec: SelectorInputSpecType,
        source: SelectionDataSource = SelectionDataSource.None
    ): SelectorOutputDataType<T> {
        if (typeof selectorSpec === 'string') {
            return {
                [SingleSelectorOutputKeyName]: this.findProperty(
                    arg,
                    selectorSpec,
                    source
                )
            };
        }
        if (Array.isArray(selectorSpec)) {
            const selectedData = {};
            for (const selector of selectorSpec) {
                selectedData[selector] = this.findProperty(
                    arg,
                    selector,
                    source
                );
            }
            return selectedData;
        }
        if (typeof selectorSpec === 'object') {
            const selectedData = {};
            for (const [selectorName, selector] of Object.entries(
                selectorSpec
            )) {
                selectedData[selectorName] = this.findProperty(
                    arg,
                    selector,
                    source
                );
            }
            return selectedData;
        }
        throw new UnsupportedSelectorSpecError(selectorSpec);
    }
}
