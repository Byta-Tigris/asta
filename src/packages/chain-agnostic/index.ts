import { ChainAgnosticData } from "src/types";
import {ChainIdParams, AccountIdParams, AssetIdParams} from "caip";

type ChainAgnosticConstructorArgumentType = string | ChainAgnosticData | string[];

export class ChainAgnostic {


    private namespace: string;
    private reference: string;
    private chainId: ChainAgnosticData["chainId"];
    private address?: ChainAgnosticData["address"];
    private assetName?: ChainAgnosticData["assetName"];
    private tokenId?: ChainAgnosticData["tokenId"];

    private static colonDelim = ':';
    private static slashDelim = '/';

    private _chainAgnosticData?: ChainAgnosticData;

    constructor(data: ChainAgnosticConstructorArgumentType){}



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