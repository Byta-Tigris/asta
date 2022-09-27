import { ChainAgnostic } from "@asta/packages/chain-agnostic";


describe("Unit testing ChainAgnostic", () => {

    it("should split string with '/'", () => {
        const fixtures = [
            ['Testing programs/meta-corp:/arg', ['Testing programs','meta-corp:','arg']],
            ['Cruel/redemption\\harmony', ['Cruel', 'redemption\\harmony']],
            ['eip155:1/erc721:0xab16a96d359ec26a11e2c2b3d8f8b8942d5bfcdb', ['eip155:1','erc721:0xab16a96d359ec26a11e2c2b3d8f8b8942d5bfcdb']],
            ['', ['']]
        ]

        for(const data of fixtures){
            const [input, expectedOutput] = data;
            const output = ChainAgnostic.splitStringByBackSlash(input as string);
            expect(output.length).toEqual(expectedOutput.length)
            expect(output).toStrictEqual(expectedOutput)
        }
    });

    it("should split string array containing ':'", () => {

        const fixtures = [
            [['erc:20', '0x85544', 'tommy:fellow'], ['erc', '20', '0x85544', 'tommy', 'fellow']],
            [['your:majesty:argues;over'],['your','majesty', 'argues;over']],
            [['slumps:all/over'], ['slumps', 'all/over']]
        ];

        for(const data of fixtures){
            const [input, expectedOutput] = data;
            const output = ChainAgnostic.splitArrayStringByColon(input);
            expect(output.length).toEqual(expectedOutput.length);
            expect(output).toStrictEqual(expectedOutput)
        }
    })
    it("should split string with '/' and ':'", () => {
        const fixtures = [
            ['eip155:1', ['eip155', '1']],
            ['eip155:1:0xab16a96d359ec26a11e2c2b3d8f8b8942d5bfcdb', ['eip155','1','0xab16a96d359ec26a11e2c2b3d8f8b8942d5bfcdb']],
            ['eip155:1/erc721:0xab16a96d359ec26a11e2c2b3d8f8b8942d5bfcdb/1',['eip155','1','erc721','0xab16a96d359ec26a11e2c2b3d8f8b8942d5bfcdb','1']],
            ['eip155:1/erc721:0xab16a96d359ec26a11e2c2b3d8f8b8942d5bfcdb', ['eip155','1','erc721','0xab16a96d359ec26a11e2c2b3d8f8b8942d5bfcdb']]
        ]

        for(const data of fixtures){
            const [input, expectedOutput] = data;
            const output = ChainAgnostic.createFragments(input as string);
            expect(output.length).toEqual(expectedOutput.length);
            expect(output).toStrictEqual(expectedOutput)
        }
    })
})