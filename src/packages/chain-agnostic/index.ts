import { InvalidChainAgnosticArgument, MissingChainAgnosticArgument } from "@asta/errors";
import { ChainIdentifierSpecData, ChainAgnosticIdentifierSpecNames } from "./chain-specs";
import { ChainAgnosticData, ChainIdentifierSpec } from "./types";




type ChainAgnosticConstructorArgumentType = string | ChainAgnosticData | string[];

export class ChainAgnostic {

    private readonly chainIdentifierSpecData = ChainIdentifierSpecData

    public namespace: string;
    public reference: string;
    public chainId: ChainAgnosticData["chainId"];
    public address?: ChainAgnosticData["address"];
    public assetName?: ChainAgnosticData["assetName"];
    public tokenId?: ChainAgnosticData["tokenId"];

    private static colonDelim = ':';
    private static slashDelim = '/';


    constructor(data?: ChainAgnosticConstructorArgumentType){
        if (data !== undefined){
            if(typeof data === 'string'){
                data = ChainAgnostic.createFragments(data);
            }
    
            if(Array.isArray(data)){
                this.setupPropertiesFromArray(data);
            }
        }
        
    }


    setupPropertiesFromArray(arr: string[]): void {
        const requirementMap = this.getSpecRequirementCountsMap()
        switch(arr.length){
            case requirementMap[ChainAgnosticIdentifierSpecNames.AssetId]:
                this.setAssetId(arr)
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
            [ChainAgnosticIdentifierSpecNames.ChainId]: ChainAgnostic.getChainIdentifierSpecRequiredArgumentCount(this.chainIdentifierSpecData[ChainAgnosticIdentifierSpecNames.ChainId]),
            [ChainAgnosticIdentifierSpecNames.AccountId]: ChainAgnostic.getChainIdentifierSpecRequiredArgumentCount(this.chainIdentifierSpecData[ChainAgnosticIdentifierSpecNames.AccountId]),
            [ChainAgnosticIdentifierSpecNames.AssetType]: ChainAgnostic.getChainIdentifierSpecRequiredArgumentCount(this.chainIdentifierSpecData[ChainAgnosticIdentifierSpecNames.AssetType]),
            [ChainAgnosticIdentifierSpecNames.AssetId]: ChainAgnostic.getChainIdentifierSpecRequiredArgumentCount(this.chainIdentifierSpecData[ChainAgnosticIdentifierSpecNames.AssetId]) 
        }
    }


    private _setChainIdProperties(arr: string[]): void {
        this.namespace = arr[0];
        this.reference = arr[1];
        this.chainId = {namespace: arr[0], reference: arr[1]};

    }

    setChainId(arr: string[]): void {
        this.isChainIdentifierSpecDataValid(arr, this.chainIdentifierSpecData[ChainAgnosticIdentifierSpecNames.ChainId]);
        this._setChainIdProperties(arr);
    }

    private _setAccountIdProperties(arr: string[]): void {
        this._setChainIdProperties(arr.slice(0,2));
        this.address = arr[2];

    }

    setAccountId(arr: string[]): void {
        this.isChainIdentifierSpecDataValid(arr, this.chainIdentifierSpecData[ChainAgnosticIdentifierSpecNames.AccountId]);
        this._setAccountIdProperties(arr)
    }

    private _setAssetNameProperties(arr: string[]) {
        this.namespace = arr[0]
        this.reference = arr[1]
        this.assetName = {namespace: this.namespace, reference: this.reference};
    }

    private _setAssetTypeProperties(arr: string[]): void {
        this._setChainIdProperties(arr.slice(0,2));
        this._setAssetNameProperties(arr.slice(2));
    }

    setAssetType(arr: string[]): void {
        this.isChainIdentifierSpecDataValid(arr, this.chainIdentifierSpecData[ChainAgnosticIdentifierSpecNames.AssetType]);
        this._setAssetTypeProperties(arr);
    }

    private _setAssetIdProperties(arr: string[]): void {
        this._setAssetTypeProperties(arr.slice(0,4));
        this.tokenId = arr[4];
    }

    setAssetId(arr: string[]): void {
        this.isChainIdentifierSpecDataValid(arr, this.chainIdentifierSpecData[ChainAgnosticIdentifierSpecNames.AssetId]);
        this._setAssetIdProperties(arr);
    }







    static splitArrayStringByColon(strArray: string[]): string[]{

        return strArray.reduce(
            (previousValue: string[], currentValue: string) => previousValue.concat(currentValue.split(this.colonDelim)),
            []
        );
    }

    static splitStringByBackSlash(str: string): string[] {
        return str.split(this.slashDelim);
    }

    static createFragments(str: string): string[] {
        return this.splitArrayStringByColon(this.splitStringByBackSlash(str));
    }

    static getChainIdentifierSpecRequiredArgumentCount(ident: ChainIdentifierSpec): number {
        let count = 0
        if(ident.parameters !== undefined && ident.parameters.values){
            for(const value of Object.values(ident.parameters.values)){
                if((value as ChainIdentifierSpec).parameters){
                    count += this.getChainIdentifierSpecRequiredArgumentCount(value)
                }else{
                    count += 1
                }
            }
        }
        return count;
    }


    static flattenChainIdentifierSpec(spec: ChainIdentifierSpec): ChainIdentifierSpec[] {
        if(spec.parameters === undefined) return [];

        let specs: ChainIdentifierSpec[] = [];
        for(const value of Object.values(spec.parameters.values)){
            if(value.parameters){
                specs = specs.concat(this.flattenChainIdentifierSpec(value))
            }else {
                specs.push(value);
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
       return match !== null && match.length > 0 && match[0].length === data.length;
    }

    static isChainIdentifierSpecRegexValid(data: string | string[], spec: ChainIdentifierSpec, flattenSpecsArg?: ChainIdentifierSpec[]): boolean {
        if (typeof data === 'string'){
            return this.isValidRegex(spec.regex, data)
        }
        const flattenSpecs = flattenSpecsArg ?? this.flattenChainIdentifierSpec(spec);
        return flattenSpecs.map((spec, index) => this.isValidRegex(spec.regex, data[index])).every((el) => el)

    }

    static isChainIdentifierSpecDataValid(data: string[], spec: ChainIdentifierSpec): boolean {
        const requiredArgumentsCount = this.getChainIdentifierSpecRequiredArgumentCount(spec);
        const flattenIdentifierSpec = this.flattenChainIdentifierSpec(spec)
        if(data.length < requiredArgumentsCount) {
            throw new MissingChainAgnosticArgument(flattenIdentifierSpec[data.length].name);
        }
        for(const index in data){
            if(!this.isChainIdentifierSpecRegexValid(data[index], flattenIdentifierSpec[index])){
                throw new InvalidChainAgnosticArgument(flattenIdentifierSpec[index].name, data[index]);
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
    isChainIdentifierSpecDataValid(data: string [], spec: ChainIdentifierSpec): boolean {
        return ChainAgnostic.isChainIdentifierSpecDataValid(data, spec);
    }




    // getChainId(): ChainIdParams {}
    // getChainIdString(): string {}

    // getAccountId(): AccountIdParams {}
    // getAccountIdString(): string {}

    // getAssetName(): ChainAgnosticData["assetName"] {}
    // getAssetNameString(): string {}

    // getAssetId(): AssetIdParams {}
    // getAssetIdString(): string {}

    // toJSON(): ChainAgnosticData {}
    // toString(): string {}


}