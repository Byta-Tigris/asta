import { Selector } from '@asta/packages/manipulator/selector';
import {
    SelectorInputSpecType,
    SelectorOutputDataType
} from '@asta/packages/manipulator/types';

describe('Validator Selector tests', () => {
    const jsonObject = {
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
        }
    };
    it('findProperty must return when using direct and `.` addressing', () => {
        const fixtures = [
            ['firstName', 'Sonoo'],
            ['age', 27],
            ['state', 'UP'],
            ['studies.college.name', 'Mechatronics'],
            ['studies.college.age', 29],
            ['student.age', 29],
            ['agri', undefined],
            ['student.agri', undefined]
        ];
        for (const fixtureData of fixtures) {
            expect(
                Selector.findProperty(jsonObject, fixtureData[0] as string)
            ).toBe(fixtureData[1]);
        }
    });

    it('findPropertyUsingSelector must return object containing all the value', () => {
        const fixtures = [
            [
                ['firstName', 'age', 'state'],
                { firstName: 'Sonoo', age: 27, state: 'UP' }
            ],
            [
                { name: 'firstName', from: 'state', age: 'age' },
                { name: 'Sonoo', from: 'UP', age: 27 }
            ],
            [
                {
                    departmentName: 'studies.college.name',
                    studentData: 'student',
                    work: 'student.work'
                },
                {
                    departmentName: 'Mechatronics',
                    studentData: {
                        name: 'Sonoo',
                        age: 29
                    },
                    work: undefined
                }
            ]
        ];

        for (const fixtureData of fixtures) {
            const [selectorSpec, expectedOutput] = fixtureData as [
                SelectorInputSpecType,
                SelectorOutputDataType
            ];
            const output = Selector.findPropertyUsingSelector(
                jsonObject,
                selectorSpec
            );
            expect(output).toStrictEqual(expectedOutput);
        }
    });
});
