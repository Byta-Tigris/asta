import {
    ExpectingTestToFail,
    InvalidChainAgnosticArgument,
    MissingChainAgnosticArgument
} from '@asta/errors';
import { ChainAgnostic } from '@asta/packages/chain-agnostic';
import { ChainIdentifierSpecData } from '@asta/packages/chain-agnostic/chain-specs';
import {
    ChainAgnosticData,
    ChainIdentifierSpec
} from '@asta/packages/chain-agnostic/types';
import objectDataFixtureJSON from './object-data.fixture.json';
import formatDataFixtureJSON from './format.fixture.json';

describe('Unit testing ChainAgnostic', () => {
    interface Fixture {
        in: object;
        hasError: boolean;
        error?: string;
        out?: object | string;
    }

    const objectFixture = objectDataFixtureJSON as Fixture[];
    const formatFixture = formatDataFixtureJSON as Fixture[];

    it("should split string with '/'", () => {
        const fixtures = [
            [
                'Testing programs/meta-corp:/arg',
                ['Testing programs', 'meta-corp:', 'arg']
            ],
            ['Cruel/redemption\\harmony', ['Cruel', 'redemption\\harmony']],
            [
                'eip155:1/erc721:0xab16a96d359ec26a11e2c2b3d8f8b8942d5bfcdb',
                [
                    'eip155:1',
                    'erc721:0xab16a96d359ec26a11e2c2b3d8f8b8942d5bfcdb'
                ]
            ],
            ['', ['']]
        ];

        for (const data of fixtures) {
            const [input, expectedOutput] = data;
            const output = ChainAgnostic.splitStringByBackSlash(
                input as string
            );
            expect(output.length).toEqual(expectedOutput.length);
            expect(output).toStrictEqual(expectedOutput);
        }
    });

    it("should split string array containing ':'", () => {
        const fixtures = [
            [
                ['erc:20', '0x85544', 'tommy:fellow'],
                ['erc', '20', '0x85544', 'tommy', 'fellow']
            ],
            [['your:majesty:argues;over'], ['your', 'majesty', 'argues;over']],
            [['slumps:all/over'], ['slumps', 'all/over']]
        ];

        for (const data of fixtures) {
            const [input, expectedOutput] = data;
            const output = ChainAgnostic.splitArrayStringByColon(input);
            expect(output.length).toEqual(expectedOutput.length);
            expect(output).toStrictEqual(expectedOutput);
        }
    });
    it("should split string with '/' and ':'", () => {
        const fixtures = [
            ['eip155:1', ['eip155', '1']],
            [
                'eip155:1:0xab16a96d359ec26a11e2c2b3d8f8b8942d5bfcdb',
                ['eip155', '1', '0xab16a96d359ec26a11e2c2b3d8f8b8942d5bfcdb']
            ],
            [
                'eip155:1/erc721:0xab16a96d359ec26a11e2c2b3d8f8b8942d5bfcdb/1',
                [
                    'eip155',
                    '1',
                    'erc721',
                    '0xab16a96d359ec26a11e2c2b3d8f8b8942d5bfcdb',
                    '1'
                ]
            ],
            [
                'eip155:1/erc721:0xab16a96d359ec26a11e2c2b3d8f8b8942d5bfcdb',
                [
                    'eip155',
                    '1',
                    'erc721',
                    '0xab16a96d359ec26a11e2c2b3d8f8b8942d5bfcdb'
                ]
            ]
        ];

        for (const data of fixtures) {
            const [input, expectedOutput] = data;
            const output = ChainAgnostic.createFragments(input as string);
            expect(output.length).toEqual(expectedOutput.length);
            expect(output).toStrictEqual(expectedOutput);
        }
    });

    it('should return the exact required arguments for identifier spec', () => {
        const fixture = [
            [ChainIdentifierSpecData['chainId'], 2],
            [ChainIdentifierSpecData['accountId'], 3],
            [ChainIdentifierSpecData['assetName'], 2],
            [ChainIdentifierSpecData['assetType'], 4],
            [ChainIdentifierSpecData['assetId'], 5]
        ];

        for (const fixtureData of fixture) {
            const [identifierSpec, expectedOutput] = fixtureData;
            const count =
                ChainAgnostic.getChainIdentifierSpecRequiredArgumentCount(
                    identifierSpec as ChainIdentifierSpec
                );
            expect(count).toEqual(expectedOutput);
        }
    });

    it('should be able to test regex for identifier spec', () => {
        interface RegexFixtureData {
            input: string | string[];
            spec: ChainIdentifierSpec;
            willPass: boolean;
        }
        const fixture: RegexFixtureData[] = [
            {
                input: 'eip155:1',
                spec: ChainIdentifierSpecData['chainId'],
                willPass: true
            },
            {
                input: 'eip155:#',
                spec: ChainIdentifierSpecData['chainId'],
                willPass: false
            },
            {
                input: ['eip155', '1'],
                spec: ChainIdentifierSpecData['chainId'],
                willPass: true
            },
            {
                input: [
                    'eip155',
                    '1',
                    'erc721',
                    '0xab16a96d359ec26a11e2c2b3d8f8b8942d5bfcdb',
                    '1'
                ],
                spec: ChainIdentifierSpecData['assetId'],
                willPass: true
            },
            {
                input: [
                    'eip155',
                    '1',
                    'erc721',
                    '0xab16a96d359ec26a11e2c2b3d8f8b8942d5bfcdb#',
                    '1'
                ],
                spec: ChainIdentifierSpecData['assetId'],
                willPass: false
            }
        ];

        for (const fixtureData of fixture) {
            expect(
                ChainAgnostic.isChainIdentifierSpecRegexValid(
                    fixtureData.input,
                    fixtureData.spec
                )
            ).toEqual(fixtureData.willPass);
        }
    });

    it('should throw MissingChainAgnosticArgument for identifier data', () => {
        const fixtures = [
            [['eip155'], ChainIdentifierSpecData['chainId']],
            [['eip155', '#'], ChainIdentifierSpecData['accountId']],
            [['eip155', '1', '0x5424'], ChainIdentifierSpecData['assetId']]
        ];

        for (const fixtureData of fixtures) {
            const [input, spec] = fixtureData;
            try {
                ChainAgnostic.isChainIdentifierSpecDataValid(
                    input as string[],
                    spec as ChainIdentifierSpec
                );
                throw new ExpectingTestToFail(
                    'Must throw MissingChainAgnosticArgument error'
                );
            } catch (e) {
                expect(e).toBeInstanceOf(MissingChainAgnosticArgument);
            }
        }
    });

    it('should throw InvalidChainAgnosticArgument for identifier data', () => {
        const fixtures = [
            [['ei', '1'], ChainIdentifierSpecData['chainId']],
            [['eip155', '#'], ChainIdentifierSpecData['chainId']],
            [['eip155', '#', '0x9475h'], ChainIdentifierSpecData['accountId']]
        ];

        for (const fixtureData of fixtures) {
            const [input, spec] = fixtureData as [
                string[],
                ChainIdentifierSpec
            ];
            try {
                ChainAgnostic.isChainIdentifierSpecDataValid(input, spec);
                throw new ExpectingTestToFail(
                    'Must throw InvalidChainAgnosticArgument error'
                );
            } catch (e) {
                expect(e).toBeInstanceOf(InvalidChainAgnosticArgument);
            }
        }
    });

    it('should not throw any error for identifier spec data validation', () => {
        const fixture = [
            [['eip155', '1'], ChainIdentifierSpecData['chainId']],
            [
                [
                    'eip155',
                    '1',
                    'erc721',
                    '0xab16a96d359ec26a11e2c2b3d8f8b8942d5bfcdb',
                    '1'
                ],
                ChainIdentifierSpecData['assetId']
            ],
            [
                ['eip155', '1', '0xab16a96d359ec26a11e2c2b3d8f8b8942d5bfcdb'],
                ChainIdentifierSpecData['accountId']
            ]
        ];

        for (const fixtureData of fixture) {
            expect(
                ChainAgnostic.isChainIdentifierSpecDataValid(
                    fixtureData[0] as string[],
                    fixtureData[1] as ChainIdentifierSpec
                )
            ).toBe(true);
        }
    });

    it('object as constructor data must throw error', () => {
        const fixtures = objectFixture.filter((fix) => fix.hasError);
        for (const fixtureData of fixtures) {
            try {
                new ChainAgnostic(fixtureData.in as ChainAgnosticData);
                throw new ExpectingTestToFail(
                    `Expected to throw: ${fixtureData.error}`
                );
            } catch (e) {
                expect(e.message).toEqual(fixtureData.error);
            }
        }
    });

    it('object as constructor data must pass', () => {
        const fixtures = objectFixture.filter((fix) => !fix.hasError);
        for (const fixtureData of fixtures) {
            const caip = new ChainAgnostic(fixtureData.in as ChainAgnosticData);
            const jsonData = caip.toJSON();
            expect(jsonData).toBeDefined();
            expect(jsonData).toStrictEqual(fixtureData.out);
        }
    });

    it('must format the properties to string according to the format', () => {
        for (const fixtureData of formatFixture) {
            const caip = new ChainAgnostic(fixtureData.in as ChainAgnosticData);
            expect(caip.format()).toEqual(fixtureData.out);
        }
    });
});
