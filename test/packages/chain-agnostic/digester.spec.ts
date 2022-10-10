import {
    ChainAgnosticDataDigester,
    EncoderDecoderAlgorithms,
    ProtocolDataComponentManager,
    ProtocolDataEncoderDecoder
} from '@asta/packages/chain-agnostic/digester';

interface EncodingDecodingFixture {
    input: string | Record<string, unknown>;
    output: string | Record<string, unknown>;
    algoName?: EncoderDecoderAlgorithms;
    hasError: boolean;
    type: 'encode' | 'decode';
}

const fixtures: EncodingDecodingFixture[] = [
    {
        type: 'encode',
        input: { name: 'Harrish' },
        hasError: false,
        algoName: EncoderDecoderAlgorithms.Json,
        output: `json.{"name":"Harrish"}`
    },
    {
        type: 'encode',
        hasError: false,
        input: 'Hello, World',
        algoName: EncoderDecoderAlgorithms.Base64,
        output:
            'base64.' + ProtocolDataEncoderDecoder.encodeBase64('Hello, World')
    },
    {
        type: 'decode',
        input:
            'base64.' + ProtocolDataEncoderDecoder.encodeBase64('Hello, World'),
        hasError: false,
        output: 'Hello, World'
    },
    {
        type: 'decode',
        input:
            'base64' +
            '.' +
            ProtocolDataEncoderDecoder.encodeBase64(
                'base64' +
                    '.' +
                    ProtocolDataEncoderDecoder.encodeBase64(
                        'json' +
                            '.' +
                            ProtocolDataEncoderDecoder.encodeJSON({
                                name: 'Harrish'
                            })
                    )
            ),
        hasError: false,
        output: { name: 'Harrish' }
    }
];

describe('ChainAgnosticDataDigester ProtocolDataEncoderDecoder testing', () => {
    it('test encode', () => {
        for (const data of fixtures.filter(
            (fixture) => !fixture.hasError && fixture.type === 'encode'
        )) {
            expect(
                ChainAgnosticDataDigester.encode(data.input, data.algoName)
            ).toEqual(data.output);
        }
    });
    it('test decode', () => {
        for (const data of fixtures.filter(
            (fixture) => !fixture.hasError && fixture.type === 'decode'
        )) {
            expect(
                ChainAgnosticDataDigester.decode(data.input as string)
            ).toStrictEqual(data.output);
        }
    });
});

interface ComponentFixture {
    input: Record<string, unknown>;
    output: Record<string, unknown>;
}

const componentFixures: ComponentFixture[] = [
    {
        input: {
            namespace: 'eip155',
            caip__chainId__namespace: 'eip155',
            caip__chainId__reference: '1'
        },
        output: {
            namespace: 'eip155',
            chainId: {
                namespace: 'eip155',
                reference: '1'
            }
        }
    },
    {
        input: {
            query: 23,
            caip__chainId: 'eip155:1',
            caip__address: '0x9865152'
        },
        output: {
            query: 23,
            chainId: 'eip155:1',
            address: '0x9865152'
        }
    },
    {
        input: {
            chainId: {
                namespace: 'cosmos'
            },
            caip__chainId__namespace: 'eip155'
        },
        output: {
            chainId: {
                namespace: 'eip155'
            }
        }
    },
    {
        input: {
            user__data__name: 'stringer',
            chainId: {
                namespace: 'cosmos'
            },
            caip__chainId__reference: '23'
        },
        output: {
            user__data__name: 'stringer',
            chainId: {
                namespace: 'cosmos',
                reference: '23'
            }
        }
    },
    {
        input: {
            caip__user__id: '23'
        },
        output: {
            caip__user__id: '23'
        }
    }
];
describe('ChainAgnosticDataDigester ProtocolDataComponentManager testing', () => {
    it('testing execution of component extraction and combination', () => {
        for (const fixtureData of componentFixures) {
            expect(
                ProtocolDataComponentManager.execute(fixtureData.input)
            ).toStrictEqual(fixtureData.output);
        }
    });
});
