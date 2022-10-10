import {
    IncompatibleEncoding,
    ProtocolDataDecodingError,
    ProtocolDataEncodingError
} from '@asta/errors';
import { ChainAgnostic } from '../chain-agnostic';
import { ChainIdentifierSpecData } from '../chain-agnostic/chain-specs';

export enum EncoderDecoderAlgorithms {
    Base64 = 'base64',
    Json = 'json'
}
export class ProtocolDataEncoderDecoder {
    private static algoDelimiter = '.';

    static decodeBase64(data: string): string {
        return Buffer.from(data, 'base64url').toString('binary');
    }

    static encodeBase64(data: string): string {
        return Buffer.from(data, 'binary').toString('base64url');
    }

    static decodeJSON<T>(data: string) {
        return JSON.parse(data) as T;
    }

    static encodeJSON(data: unknown): string {
        return JSON.stringify(data);
    }

    private static _encode(
        data: unknown,
        algoName: string,
        enc: (s: unknown) => string
    ): string {
        try {
            return algoName + this.algoDelimiter + enc(data);
        } catch (e) {
            throw new ProtocolDataEncodingError(data, e.message);
        }
    }

    private static _decode<T>(
        data: string,
        algoName: string,
        decoder: (data: string) => T
    ): T {
        if (!data.includes(algoName))
            throw new IncompatibleEncoding(algoName, data);
        try {
            data = data.replace(algoName + this.algoDelimiter, '');
            return decoder(data);
        } catch (e) {
            throw new ProtocolDataDecodingError(data, e.message);
        }
    }

    static encode(data: unknown, algoName: string): string {
        let encoder = this.encodeBase64;
        switch (algoName) {
            case EncoderDecoderAlgorithms.Base64:
                encoder = this.encodeBase64;
                break;
            case EncoderDecoderAlgorithms.Json:
                encoder = this.encodeJSON;
                break;
        }
        return this._encode(data, algoName, encoder);
    }

    static decode<T = string>(data: string): T {
        const chunkedData = data.split(this.algoDelimiter);
        let algoName;
        if (chunkedData.length < 2) {
            return data as T;
        } else {
            algoName = chunkedData[0];
        }
        let decoder = this.decodeBase64 as any;
        switch (algoName) {
            case EncoderDecoderAlgorithms.Base64:
                decoder = this.decodeBase64;
                break;
            case EncoderDecoderAlgorithms.Json:
                decoder = this.decodeJSON<T>;
                break;
        }
        return this._decode<T>(data, algoName, decoder);
    }
}

/**
 * Handles encoding-decoding of data, extraction of CAIP data from `params` or `body`.
 *
 * 1. Selecting all the CAIP properties from query params and body. In case of conflict between `params` and `body`,
 *    body will get the priority over params.
 * 2. Decoding of encoded data, decoding of data only works with the `params` in the url including the url part.
 */
export class ChainAgnosticDataDigester {
    private static encoderDecoder = ProtocolDataEncoderDecoder;
    static decodeData<T = string>(data: string): T {
        let decodedData = data;
        while (typeof decodedData === 'string' && decodedData.includes('.')) {
            decodedData = this.encoderDecoder.decode(decodedData);
        }
        return decodedData as T;
    }

    static encodeData(
        data: unknown,
        algoName: EncoderDecoderAlgorithms = EncoderDecoderAlgorithms.Base64
    ): string {
        return this.encoderDecoder.encode(data, algoName);
    }

    static decode(data: Record<string, unknown>): Record<string, unknown> {
        for (const [key, value] of Object.entries(data)) {
            if (typeof value === 'string') {
                data[key] = this.decodeData(value);
            }
        }
        return data;
    }

    private static getChainIdentifierSpecDataKeys(): string[] {
        return Object.keys(ChainIdentifierSpecData);
    }

    private static getCAIPAdditionalSelectableProps(): string[] {
        return ['address', 'tokenId'];
    }

    private static getCompleteCAIPProperties(): string[] {
        const specNames = this.getChainIdentifierSpecDataKeys();
        const additionalProperties = this.getCAIPAdditionalSelectableProps();
        return specNames.concat(additionalProperties);
    }

    /**
     * Decode all the data and then performs the selection of CAIP properties using
     * the properties names from `ChainIdentifierSpecData`.
     *
     * Selection also supports additional properties `address` and `tokenId` for AccountId and AssetId
     *
     * @param data - Plain params as object
     * @returns Tuple containing selected CAIP data and `data` object with formatted CAIP values
     */
    static selectCAIPData(
        data: Record<string, unknown>
    ): [Record<string, unknown>, Record<string, unknown>] {
        const decodedData = this.decode(data);
        const caipData: Record<string, unknown> = {};
        const completeCAIPProps = this.getCompleteCAIPProperties();
        const additionalCAIPProps = this.getCAIPAdditionalSelectableProps();
        for (const [key, value] of Object.entries(decodedData)) {
            if (completeCAIPProps.includes(key)) {
                if (additionalCAIPProps.includes(key)) {
                    caipData[key] = value;
                } else {
                    const chainAgnostic = new ChainAgnostic(value as string);
                    caipData[key] = chainAgnostic.toJSON();
                    decodedData[key] = chainAgnostic.toJSON();
                }
            }
        }
        return [caipData, decodedData];
    }
}
