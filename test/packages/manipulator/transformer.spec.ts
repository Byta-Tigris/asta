import {
    toArray,
    toObject,
    toValue
} from '@asta/packages/manipulator/transformer';
import { SingleSelectorOutputKeyName } from '@asta/packages/manipulator/types';

describe('Transformer testing', () => {
    const jsonObject: Record<string, unknown> = {
        firstName: 'Sonoo',
        lastName: 'Jaiswal',
        age: 27,
        address: {
            streetAddress: 'Plot-6, Mohan Nagar',
            city: 'Ghaziabad',
            state: 'UP',
            postalCode: '201007'
        },
        studies: {
            college: {
                department: {
                    name: 'Mechatronics',
                    year: 2022
                },
                student: {
                    name: 'Sonoo',
                    age: 29
                }
            }
        },
        [SingleSelectorOutputKeyName]: 'Agent'
    };

    it('toValue testing', () => {
        const fixture = [
            ['firstName', 'Sonoo'],
            ['karma', undefined],
            ['studies.student.name', undefined],
            [undefined, 'Agent'],
            ['address', jsonObject['address']]
        ];
        for (const fixtureData of fixture) {
            expect(toValue(fixtureData[0] as string)(jsonObject)).toStrictEqual(
                fixtureData[1]
            );
        }
    });

    it('toObject testing', () => {
        const fixture = [
            [
                {
                    age: 'age',
                    name: { firstName: 'firstName', lastName: 'lastName' }
                },
                {
                    age: 27,
                    name: { firstName: 'Sonoo', lastName: 'Jaiswal' }
                }
            ],
            [undefined, jsonObject]
        ];
        for (const fixtureData of fixture) {
            expect(
                toObject<typeof fixtureData[1]>(
                    fixtureData[0] as Record<
                        string,
                        string | Record<string, string>
                    >
                )(jsonObject as any)
            ).toStrictEqual(fixtureData[1]);
        }
    });

    it('toArray testing', () => {
        const fixture = [
            [
                ['firstName', 'age'],
                ['Sonoo', 27]
            ],
            [
                ['age', 'firstName', 'address'],
                [27, 'Sonoo', jsonObject['address']]
            ]
        ];

        for (const fixtureData of fixture) {
            const [input, expectedOutput] = fixtureData as [
                string[],
                unknown[]
            ];
            expect(toArray(input)(jsonObject)).toStrictEqual(expectedOutput);
        }
    });
});
