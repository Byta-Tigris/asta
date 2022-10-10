import {
    IncompatibleEncoding,
    ProtocolDataDecodingError,
    ProtocolDataEncodingError
} from '@asta/errors';

export enum EncoderDecoderAlgorithms {
    Base64 = 'base64',
    Json = 'json'
}
export class ProtocolDataEncoderDecoder {
    private static algoDelimiter = '.';

    static decodeBase64(data: string): string {
        return Buffer.from(data, 'base64').toString('binary');
    }

    static encodeBase64(data: string): string {
        return Buffer.from(data, 'binary').toString('base64');
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

export class ProtocolDataComponentManager {
    private static prefixName = 'caip';
    private static componentDelimiter = '__';

    static insertKeyValue(
        original: Record<string, unknown>,
        extracted: Record<string, unknown>
    ): Record<string, unknown> {
        return original;
    }

    static extractComponentData(
        keySplit: string[],
        value: unknown
    ): Record<string, unknown> {
        const propertyHierarchyNames = keySplit.slice(1).reverse();
        const extractedData: Record<string, unknown> = {};
        for (const index in propertyHierarchyNames) {
            if (index === 0) {
                extractedData[propertyHierarchyNames[index]] = value;
            }
        }
        return extractedData;
    }

    static execute(input: Record<string, unknown>): Record<string, unknown> {
        let dataObject = input;
        for (const [key, value] of Object.entries(input)) {
            const splittedKey = key.split(this.componentDelimiter);
            if (splittedKey.length > 1 && splittedKey[0] === this.prefixName) {
                const extractedComponentData = this.extractComponentData(
                    splittedKey,
                    value
                );
                dataObject = this.insertKeyValue(
                    dataObject,
                    extractedComponentData
                );
            }
        }
        return dataObject;
    }
}

export class ChainAgnosticDataDigester {
    private static encoderDecoder = ProtocolDataEncoderDecoder;
    static decode<T = string>(data: string): T {
        let decodedData = data;
        while (typeof decodedData === 'string' && decodedData.includes('.')) {
            decodedData = this.encoderDecoder.decode(decodedData);
        }
        return decodedData as T;
    }

    static encode(data: unknown, algoName: EncoderDecoderAlgorithms): string {
        return this.encoderDecoder.encode(data, algoName);
    }
}
