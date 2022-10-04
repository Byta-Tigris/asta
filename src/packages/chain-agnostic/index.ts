import {
    FailedFormatDueToMissingArgument,
    InvalidChainAgnosticArgument,
    MissingChainAgnosticArgument
} from '@asta/errors';
import {
    ChainIdentifierSpecData,
    ChainAgnosticIdentifierSpecNames
} from './chain-specs';
import {
    AccountId,
    AccountIdParams,
    AssetId,
    AssetIdParams,
    AssetNameParams,
    AssetType,
    AssetTypeParams,
    ChainAgnosticData,
    ChainIdentifierSpec,
    ChainIdParams
} from './types';

type ChainAgnosticConstructorArgumentType =
    | string
    | ChainAgnosticData
    | string[];

export class ChainAgnostic {
    private readonly chainIdentifierSpecData = ChainIdentifierSpecData;

    public namespace: string;
    public reference: string;
    public chainId: ChainIdParams;
    public address?: string;
    public assetName?: AssetNameParams;
    public tokenId?: string;

    // Spec names that must be included in the error message with the property
    // for creating meaningful error message.
    private static parentSpecNamesToIncludeInError: string[] = [
        ChainAgnosticIdentifierSpecNames.AssetName
    ];

    private static specNamesNotSupportingWildCardPattern: string[] = [];

    private static colonDelim = ':';
    private static slashDelim = '/';

    constructor(data?: ChainAgnosticConstructorArgumentType) {
        if (data !== undefined) {
            if (typeof data === 'string') {
                data = ChainAgnostic.createFragments(data);
            } else if (typeof data === 'object' && !Array.isArray(data)) {
                data = this.destructObjectData(data);
            }

            if (Array.isArray(data)) {
                this.setupPropertiesFromArray(data);
            }
        }
    }

    /**
     * Destructs the object into string array with arguments at exact position and `undefined` upon empty value
     * @param data
     */
    destructObjectData(data: Partial<ChainAgnosticData>): string[] {
        if (data.tokenId) return this.destructAssetIdObject(data);
        if (data.address) return this.destructAccountIdData(data);
        if (data.chainId && (data.assetName || data.namespace))
            return this.destructAssetTypeData(data);
        if (data.chainId)
            return this.destructChainIdOrAssetNameData(data.chainId);
        return this.destructChainIdOrAssetNameData(data as ChainIdParams);
    }

    destructChainIdOrAssetNameData(
        data: string | ChainIdParams | AssetNameParams
    ): string[] {
        if (typeof data === 'string')
            return ChainAgnostic.createFragments(data);
        return [data.namespace, data.reference];
    }

    destructAccountIdData(data: Partial<AccountId & ChainIdParams>): string[] {
        let arr = [];
        if (data.chainId) {
            arr = arr.concat(this.destructChainIdOrAssetNameData(data.chainId));
        } else {
            arr = arr.concat([data.namespace, data.reference]);
        }
        arr.push(data.address);
        return arr;
    }

    destructAssetTypeData(data: Partial<AssetType & ChainIdParams>): string[] {
        let arr = [];
        if (data.chainId) {
            arr = arr.concat(this.destructChainIdOrAssetNameData(data.chainId));
        } else {
            arr = arr.concat([undefined, undefined]);
        }
        if (data.assetName) {
            arr = arr.concat(
                this.destructChainIdOrAssetNameData(data.assetName)
            );
        } else {
            arr = arr.concat([data.namespace, data.reference]);
        }
        return arr;
    }

    destructAssetIdObject(data: Partial<AssetId & ChainIdParams>): string[] {
        let arr = [];
        if (data.chainId !== undefined) {
            arr = arr.concat(this.destructChainIdOrAssetNameData(data.chainId));
        } else {
            // Undefined will cause the validator to throw Invalid Argument error
            arr = arr.concat([undefined, undefined]);
        }
        if (data.assetName !== undefined) {
            arr = arr.concat(
                this.destructChainIdOrAssetNameData(data.assetName)
            );
        } else if (data.namespace && data.reference) {
            arr = arr.concat([data.namespace, data.reference]);
        }
        arr.push(data.tokenId);

        return arr;
    }

    setupPropertiesFromArray(arr: string[]): void {
        const requirementMap = this.getSpecRequirementCountsMap();
        switch (arr.length) {
            case requirementMap[ChainAgnosticIdentifierSpecNames.AssetId]:
                this.setAssetId(arr);
                break;
            case requirementMap[ChainAgnosticIdentifierSpecNames.AssetType]:
                this.setAssetType(arr);
                break;
            case requirementMap[ChainAgnosticIdentifierSpecNames.AccountId]:
                this.setAccountId(arr);
                break;
            default:
                this.setChainId(arr);
        }
    }

    private getSpecRequirementCountsMap(): Record<string, number> {
        return {
            [ChainAgnosticIdentifierSpecNames.ChainId]:
                ChainAgnostic.getChainIdentifierSpecRequiredArgumentCount(
                    this.chainIdentifierSpecData[
                        ChainAgnosticIdentifierSpecNames.ChainId
                    ]
                ),
            [ChainAgnosticIdentifierSpecNames.AccountId]:
                ChainAgnostic.getChainIdentifierSpecRequiredArgumentCount(
                    this.chainIdentifierSpecData[
                        ChainAgnosticIdentifierSpecNames.AccountId
                    ]
                ),
            [ChainAgnosticIdentifierSpecNames.AssetType]:
                ChainAgnostic.getChainIdentifierSpecRequiredArgumentCount(
                    this.chainIdentifierSpecData[
                        ChainAgnosticIdentifierSpecNames.AssetType
                    ]
                ),
            [ChainAgnosticIdentifierSpecNames.AssetId]:
                ChainAgnostic.getChainIdentifierSpecRequiredArgumentCount(
                    this.chainIdentifierSpecData[
                        ChainAgnosticIdentifierSpecNames.AssetId
                    ]
                )
        };
    }

    private _setChainIdProperties(arr: string[]): void {
        this.namespace = arr[0];
        this.reference = arr[1];
        this.chainId = { namespace: arr[0], reference: arr[1] };
    }

    setChainId(arr: string[]): void {
        this.isChainIdentifierSpecDataValid(
            arr,
            this.chainIdentifierSpecData[
                ChainAgnosticIdentifierSpecNames.ChainId
            ]
        );
        this._setChainIdProperties(arr);
    }

    private _setAccountIdProperties(arr: string[]): void {
        this._setChainIdProperties(arr.slice(0, 2));
        this.address = arr[2];
    }

    setAccountId(arr: string[]): void {
        this.isChainIdentifierSpecDataValid(
            arr,
            this.chainIdentifierSpecData[
                ChainAgnosticIdentifierSpecNames.AccountId
            ]
        );
        this._setAccountIdProperties(arr);
    }

    private _setAssetNameProperties(arr: string[]) {
        this.namespace = arr[0];
        this.reference = arr[1];
        this.assetName = {
            namespace: this.namespace,
            reference: this.reference
        };
    }

    private _setAssetTypeProperties(arr: string[]): void {
        this._setChainIdProperties(arr.slice(0, 2));
        this._setAssetNameProperties(arr.slice(2));
    }

    setAssetType(arr: string[]): void {
        this.isChainIdentifierSpecDataValid(
            arr,
            this.chainIdentifierSpecData[
                ChainAgnosticIdentifierSpecNames.AssetType
            ]
        );
        this._setAssetTypeProperties(arr);
    }

    private _setAssetIdProperties(arr: string[]): void {
        this._setAssetTypeProperties(arr.slice(0, 4));
        this.tokenId = arr[4];
    }

    setAssetId(arr: string[]): void {
        this.isChainIdentifierSpecDataValid(
            arr,
            this.chainIdentifierSpecData[
                ChainAgnosticIdentifierSpecNames.AssetId
            ]
        );
        this._setAssetIdProperties(arr);
    }

    static splitArrayStringByColon(strArray: string[]): string[] {
        return strArray.reduce(
            (previousValue: string[], currentValue: string) =>
                previousValue.concat(currentValue.split(this.colonDelim)),
            []
        );
    }

    static splitStringByBackSlash(str: string): string[] {
        return str.split(this.slashDelim);
    }

    static createFragments(str: string): string[] {
        return this.splitArrayStringByColon(this.splitStringByBackSlash(str));
    }

    static getChainIdentifierSpecRequiredArgumentCount(
        ident: ChainIdentifierSpec
    ): number {
        let count = 0;
        if (ident.parameters !== undefined && ident.parameters.values) {
            for (const value of Object.values(ident.parameters.values)) {
                if ((value as ChainIdentifierSpec).parameters) {
                    count +=
                        this.getChainIdentifierSpecRequiredArgumentCount(value);
                } else {
                    count += 1;
                }
            }
        }
        return count;
    }

    static flattenChainIdentifierSpec(
        spec: ChainIdentifierSpec
    ): ChainIdentifierSpec[] {
        if (spec.parameters === undefined) return [];

        let specs: ChainIdentifierSpec[] = [];
        for (const value of Object.values(spec.parameters.values)) {
            if (value.parameters) {
                specs = specs.concat(this.flattenChainIdentifierSpec(value));
            } else {
                const newSpec = value;
                if (this.parentSpecNamesToIncludeInError.includes(spec.name)) {
                    newSpec.parentName = spec.name;
                }

                specs.push(newSpec);
            }
        }
        return specs;
    }

    /**
     * String is validated against RegExp using the `match` method.
     * Validation will return false if match returns `null` or
     *  matched string length is not equal to the length of original string
     *
     * @param pattern - RegExp pattern string
     * @param data - string data that needs to be validated
     * @returns bool - validation of data against RegExp
     */
    static isValidRegex(pattern: string, data: string): boolean {
        const match = data.match(new RegExp(pattern));
        return (
            match !== null &&
            match.length > 0 &&
            match[0].length === data.length
        );
    }

    static isChainIdentifierSpecRegexValid(
        data: string | string[],
        spec: ChainIdentifierSpec,
        flattenSpecsArg?: ChainIdentifierSpec[]
    ): boolean {
        if (typeof data === 'string') {
            return this.isValidRegex(spec.regex, data);
        }
        const flattenSpecs =
            flattenSpecsArg ?? this.flattenChainIdentifierSpec(spec);
        return flattenSpecs
            .map((spec, index) => this.isValidRegex(spec.regex, data[index]))
            .every((el) => el);
    }

    static isChainIdentifierSpecDataValid(
        args: string[],
        spec: ChainIdentifierSpec
    ): boolean {
        const requiredArgumentsCount =
            this.getChainIdentifierSpecRequiredArgumentCount(spec);
        const flattenIdentifierSpec = this.flattenChainIdentifierSpec(spec);
        // If provided args array does not contains the required number of arguments then throw error
        if (args.length < requiredArgumentsCount) {
            throw new MissingChainAgnosticArgument(
                flattenIdentifierSpec[args.length].name
            );
        }
        // Iterate through each argument in the args array checking for the arguments regex validity
        // The arguments must be on the exact position of the targeted spec property
        // On undefined value {@link MissingChainAgnosticArgument} error will be thrown
        for (const index in args) {
            const parentNameOfSpec = flattenIdentifierSpec[index].parentName
                ? flattenIdentifierSpec[index].parentName + ' '
                : '';
            if (args[index] === undefined) {
                // If parentNameOfSpec has valid value (only in assetName) then the complete name shown
                // in the error will contain the parent name for creating meaningful errors
                const name =
                    parentNameOfSpec.length > 0
                        ? parentNameOfSpec +
                          ' ' +
                          flattenIdentifierSpec[index].name
                        : flattenIdentifierSpec[index].name;
                throw new MissingChainAgnosticArgument(name);
            }
            // When setting the arguments if any of the provided argument is wildcard `*`
            // and the Spec name is not present in the `specNamesNotSUpportingWildCardPattern` array
            // it will be marked as valid data without regex confirmation
            if (
                args[index] === '*' &&
                !ChainAgnostic.specNamesNotSupportingWildCardPattern.includes(
                    flattenIdentifierSpec[index].name
                )
            ) {
                return true;
            }
            if (
                !this.isChainIdentifierSpecRegexValid(
                    args[index],
                    flattenIdentifierSpec[index]
                )
            ) {
                throw new InvalidChainAgnosticArgument(
                    flattenIdentifierSpec[index].name,
                    args[index],
                    parentNameOfSpec
                );
            }
        }
        return true;
    }

    /**
     *
     * @param data - fragments of chain identifier data as array
     * @param spec - ChainIdentifierSpec data
     * @returns true if no error is thrown during the process
     *
     * @throws {@link MissingChainAgnosticArgument} if provided data has less than required arguments
     * @throws {@link InvalidChainAgnosticArgument} if any data argument fails the regex validation of chain identifier spec
     */
    isChainIdentifierSpecDataValid(
        data: string[],
        spec: ChainIdentifierSpec
    ): boolean {
        return ChainAgnostic.isChainIdentifierSpecDataValid(data, spec);
    }

    getCurrentIdentifierSpecName(): ChainAgnosticIdentifierSpecNames {
        if (this.tokenId) return ChainAgnosticIdentifierSpecNames.AssetId;
        if (this.assetName && this.chainId)
            return ChainAgnosticIdentifierSpecNames.AssetType;
        if (this.address) return ChainAgnosticIdentifierSpecNames.AccountId;
        return ChainAgnosticIdentifierSpecNames.ChainId;
    }

    toJSON():
        | ChainIdParams
        | AccountIdParams
        | AssetIdParams
        | AssetTypeParams {
        switch (this.getCurrentIdentifierSpecName()) {
            case ChainAgnosticIdentifierSpecNames.AssetId:
                return this.getAssetId();
            case ChainAgnosticIdentifierSpecNames.AssetType:
                return this.getAssetType();
            case ChainAgnosticIdentifierSpecNames.AccountId:
                return this.getAccountId();
            default:
                return this.getChainId();
        }
    }

    getChainId(): ChainIdParams {
        return Object.assign(this.chainId);
    }
    getChainIdString(): string {
        if (this.chainId === undefined)
            throw new FailedFormatDueToMissingArgument('chainId');
        if (this.chainId.namespace === undefined)
            throw new FailedFormatDueToMissingArgument('namespace');
        if (this.chainId.reference === undefined)
            throw new FailedFormatDueToMissingArgument('reference');

        return `${this.chainId.namespace}:${this.chainId.reference}`;
    }

    getAccountId(): AccountIdParams {
        return {
            chainId: this.chainId,
            address: this.address
        };
    }
    getAccountIdString(): string {
        if (this.address === undefined)
            throw new FailedFormatDueToMissingArgument('address');
        return `${this.getChainIdString()}:${this.address}`;
    }

    getAssetName(): AssetNameParams {
        return Object.assign(this.assetName);
    }
    getAssetNameString(): string {
        if (this.assetName === undefined)
            throw new FailedFormatDueToMissingArgument('assetName');
        if (this.assetName.namespace === undefined)
            throw new FailedFormatDueToMissingArgument('assetName namespace');
        if (this.assetName.reference === undefined)
            throw new FailedFormatDueToMissingArgument('assetName reference');
        return `${this.assetName.namespace}:${this.assetName.reference}`;
    }

    getAssetType(): AssetTypeParams {
        return {
            chainId: this.chainId,
            assetName: this.assetName
        };
    }

    getAssetTypeString(): string {
        return `${this.getChainIdString()}/${this.getAssetNameString()}`;
    }

    getAssetId(): AssetIdParams {
        return {
            chainId: this.chainId,
            assetName: this.assetName,
            tokenId: this.tokenId
        };
    }
    getAssetIdString(): string {
        if (this.tokenId === undefined)
            throw new FailedFormatDueToMissingArgument('tokenId');
        return `${this.getAssetTypeString()}/${this.tokenId}`;
    }

    format(): string {
        switch (this.getCurrentIdentifierSpecName()) {
            case ChainAgnosticIdentifierSpecNames.AssetId:
                return this.getAssetIdString();
            case ChainAgnosticIdentifierSpecNames.AssetType:
                return this.getAssetTypeString();
            case ChainAgnosticIdentifierSpecNames.AccountId:
                return this.getAccountIdString();
            default:
                return this.getChainIdString();
        }
    }
    toString(): string {
        return this.format();
    }

    private static matchProperty(
        comparator: string,
        target: string,
        spec: ChainIdentifierSpec,
        isWildCardAllowed = true
    ): boolean {
        if (comparator === undefined || target === undefined) return false;
        return (
            spec !== undefined &&
            spec.regex !== undefined &&
            this.isValidRegex(spec.regex, target) &&
            ((comparator === '*' && isWildCardAllowed) || comparator === target)
        );
    }

    match(matcherString: string): boolean {
        const currentFormattedCAIPString = this.format();
        const currentCAIPFragments = ChainAgnostic.createFragments(
            currentFormattedCAIPString
        );
        const matcherStringFragments =
            ChainAgnostic.createFragments(matcherString);
        if (currentCAIPFragments.length !== matcherStringFragments.length)
            return false;
        const currentSpecName = this.getCurrentIdentifierSpecName();
        const spec = this.chainIdentifierSpecData[currentSpecName];
        const flattenIdentifierSpec =
            ChainAgnostic.flattenChainIdentifierSpec(spec);
        return matcherStringFragments.every((value, index) =>
            ChainAgnostic.matchProperty(
                currentCAIPFragments[index],
                value,
                flattenIdentifierSpec[index],
                true
            )
        );
    }
}
