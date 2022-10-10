import {
    ChainAgnosticDataDigester,
    EncoderDecoderAlgorithms,
    ProtocolDataEncoderDecoder
} from '@asta/packages/protocol/digester';

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

interface CompleteDecodedRecordFixture {
    input: Record<string, unknown>;
    output: Record<string, unknown>;
}

describe('ChainAgnosticDataDigester testing', () => {
    it('test encodeData', () => {
        for (const data of fixtures.filter(
            (fixture) => !fixture.hasError && fixture.type === 'encode'
        )) {
            expect(
                ChainAgnosticDataDigester.encodeData(data.input, data.algoName)
            ).toEqual(data.output);
        }
    });
    it('test decodeData', () => {
        for (const data of fixtures.filter(
            (fixture) => !fixture.hasError && fixture.type === 'decode'
        )) {
            expect(
                ChainAgnosticDataDigester.decodeData(data.input as string)
            ).toStrictEqual(data.output);
        }
    });

    const completeDecodeFixtures: CompleteDecodedRecordFixture[] = [
        {
            input: {
                chainId: ProtocolDataEncoderDecoder.encode(
                    'eip155:1',
                    EncoderDecoderAlgorithms.Base64
                ),
                address: '0x9876'
            },
            output: {
                chainId: 'eip155:1',
                address: '0x9876'
            }
        },
        {
            input: {
                accountId: ProtocolDataEncoderDecoder.encode(
                    'eip155:1:0x987',
                    EncoderDecoderAlgorithms.Base64
                )
            },
            output: {
                accountId: 'eip155:1:0x987'
            }
        }
    ];
    it('testing decode', () => {
        for (const fixtureData of completeDecodeFixtures) {
            expect(
                ChainAgnosticDataDigester.decode(fixtureData.input)
            ).toStrictEqual(fixtureData.output);
        }
    });

    interface SelectCAIPDataFixture {
        input: Record<string, unknown>;
        output: Record<string, unknown>;
    }

    const selectCAIPFixtures: SelectCAIPDataFixture[] = [
        {
            input: {
                nodeId: '25648454',
                chainId: ChainAgnosticDataDigester.encodeData(
                    'eip155:1',
                    EncoderDecoderAlgorithms.Base64
                )
            },
            output: {
                chainId: {
                    namespace: 'eip155',
                    reference: '1'
                }
            }
        },
        {
            input: {
                charter: true,
                query: 28,
                accountId: ChainAgnosticDataDigester.encodeData(
                    'eip155:1:0x9876',
                    EncoderDecoderAlgorithms.Base64
                )
            },
            output: {
                accountId: {
                    chainId: {
                        namespace: 'eip155',
                        reference: '1'
                    },
                    address: '0x9876'
                }
            }
        },
        {
            input: {
                chainId: ChainAgnosticDataDigester.encodeData(
                    'eip155:1',
                    EncoderDecoderAlgorithms.Base64
                ),
                address: '0x9876'
            },
            output: {
                chainId: {
                    namespace: 'eip155',
                    reference: '1'
                },
                address: '0x9876'
            }
        }
    ];
    it('testing selectCAIPData', () => {
        for (const fixtureData of selectCAIPFixtures) {
            expect(
                ChainAgnosticDataDigester.selectCAIPData(fixtureData.input)[0]
            ).toStrictEqual(fixtureData.output);
        }
    });
});
