
import { ExpectingTestToFail, InvalidChainAgnosticArgument, MissingChainAgnosticArgument } from "@asta/errors";
import {ChainAgnostic} from "@asta/packages/chain-agnostic"
import { ChainAgnosticIdentifierSpecNames, ChainIdentifierSpecData } from "@asta/packages/chain-agnostic/chain-specs";
import parsingFixtureJSON from "./parsing.fixture.json"


interface ParseFixture {
    in: string | string[];
    hasError: boolean;
    out?: object;
    errorMessage?: string;
}


describe("ChainAgnostic Parsing", () => {
    const fixture = parsingFixtureJSON as ParseFixture[];

    it("testing setChainId", () => {
        const fixture = [
            [[''], false, MissingChainAgnosticArgument],
            [['eip'], false, MissingChainAgnosticArgument],
            [['', '1'], false, InvalidChainAgnosticArgument],
            [['eip', '#'], false, InvalidChainAgnosticArgument],
            [['eip155', '1'], true]
        ];

        for(const fixtureData of fixture){

            try{
                const chainAgnostic = new ChainAgnostic();
                chainAgnostic.setChainId(fixtureData[0] as string[]);
                if(fixtureData[1] as  boolean){
                    const inputs = fixtureData[0] as string[]
                    expect(chainAgnostic.namespace).toEqual(inputs[0]);
                    expect(chainAgnostic.reference).toEqual(inputs[1]);
                    expect(chainAgnostic.chainId).toStrictEqual({namespace: inputs[0], reference: inputs[1]});
                }else{
                    throw new ExpectingTestToFail(`Must throw error ${(fixtureData[2] as any).name}`);
                }
            }catch(e){
                expect(e).toBeInstanceOf(fixtureData[2]);
            }
        }
        
    })

    it("testing setAccountId", () => {
        const fixture = [
            [[''], false, MissingChainAgnosticArgument],
            [['eip'], false, MissingChainAgnosticArgument],
            [['eip', '#'], false, MissingChainAgnosticArgument],
            [['eip155', '1'], false, MissingChainAgnosticArgument],
            [['eip155', '#', '0x958f2g'], false, InvalidChainAgnosticArgument],
            [['eip155', '1', '0x#jfkgjllfg'], false, InvalidChainAgnosticArgument],
            [['eip155', '1', '0xj95862'], true]
        ];

        for(const fixtureData of fixture){

            try{
                const chainAgnostic = new ChainAgnostic();
                chainAgnostic.setAccountId(fixtureData[0] as string[]);
                if(fixtureData[1] as  boolean){
                    const inputs = fixtureData[0] as string[]
                    expect(chainAgnostic.namespace).toEqual(inputs[0]);
                    expect(chainAgnostic.reference).toEqual(inputs[1]);
                    expect(chainAgnostic.chainId).toStrictEqual({namespace: inputs[0], reference: inputs[1]});
                    expect(chainAgnostic.address).toEqual(inputs[2]);
                }else{
                    throw new ExpectingTestToFail(`Must throw error ${(fixtureData[2] as any).name}`);
                }
            }catch(e){
 
                
                expect(e).toBeInstanceOf(fixtureData[2]);
            }
        }
    })


    it("testing setAssetType", () => {
        const fixture = [
            [[''], false, MissingChainAgnosticArgument],
            [['eip'], false, MissingChainAgnosticArgument],
            [['eip', '#'], false, MissingChainAgnosticArgument],
            [['eip155', '1'], false, MissingChainAgnosticArgument],
            [['eip155', '#', '0x958f2g'], false, MissingChainAgnosticArgument],
            [['eip155', '1', '0x#jfkgjllfg'], false, MissingChainAgnosticArgument],
            [['eip155', '1', '0xj95862'], false, MissingChainAgnosticArgument],
            [['eip155', '1', 'erc'], false, MissingChainAgnosticArgument],
            [['eip155', '1', 'erc,', '72'], false, InvalidChainAgnosticArgument],
            [['eip155', '1', 'erc', '72'], true]
        ];

        for(const fixtureData of fixture){

            try{
                const chainAgnostic = new ChainAgnostic();
                chainAgnostic.setAssetType(fixtureData[0] as string[]);
                if(fixtureData[1] as  boolean){
                    const inputs = fixtureData[0] as string[]
                    expect(chainAgnostic.namespace).toEqual(inputs[2]);
                    expect(chainAgnostic.reference).toEqual(inputs[3]);
                    expect(chainAgnostic.chainId).toStrictEqual({namespace: inputs[0], reference: inputs[1]});
                    expect(chainAgnostic.assetName).toStrictEqual({namespace: inputs[2], reference: inputs[3]});
                }else{
                    throw new ExpectingTestToFail(`Must throw error ${(fixtureData[2] as any).name}`);
                }
            }catch(e){
                
                expect(e).toBeInstanceOf(fixtureData[2]);
            }
        }
    })

    it("testing setAssetId", () => {
        const fixture = [
            [[''], false, MissingChainAgnosticArgument],
            [['eip'], false, MissingChainAgnosticArgument],
            [['eip', '#'], false, MissingChainAgnosticArgument],
            [['eip155', '1'], false, MissingChainAgnosticArgument],
            [['eip155', '#', '0x958f2g'], false, MissingChainAgnosticArgument],
            [['eip155', '1', '0x#jfkgjllfg'], false, MissingChainAgnosticArgument],
            [['eip155', '1', '0xj95862'], false, MissingChainAgnosticArgument],
            [['eip155', '1', 'erc'], false, MissingChainAgnosticArgument],
            [['eip155', '1', 'erc,', '72'], false, MissingChainAgnosticArgument],
            [['eip155', '1', 'erc', '72', '?'], false, InvalidChainAgnosticArgument],
            [['eip155', '1', 'erc', '72', '1'], true]
        ];

        for(const fixtureData of fixture){

            try{
                const chainAgnostic = new ChainAgnostic();
                chainAgnostic.setAssetId(fixtureData[0] as string[]);
                if(fixtureData[1] as  boolean){
                    const inputs = fixtureData[0] as string[]
                    expect(chainAgnostic.namespace).toEqual(inputs[2]);
                    expect(chainAgnostic.reference).toEqual(inputs[3]);
                    expect(chainAgnostic.chainId).toStrictEqual({namespace: inputs[0], reference: inputs[1]});
                    expect(chainAgnostic.assetName).toStrictEqual({namespace: inputs[2], reference: inputs[3]});
                    expect(chainAgnostic.tokenId).toEqual(inputs[4])
                }else{
                    throw new ExpectingTestToFail(`Must throw error ${(fixtureData[2] as any).name}`);
                }
            }catch(e){

                expect(e).toBeInstanceOf(fixtureData[2]);
            }
        }
    })


    
    it("should to throw error due to missing arguments", () => {        
        const missingArgumentsFixtures = fixture.filter((json) => json.hasError && json.errorMessage !== undefined && json.errorMessage.includes('Missing argument'));
        expect(missingArgumentsFixtures.length).toBeGreaterThan(0);

        for(const data of missingArgumentsFixtures){
           try{

                const caip = new ChainAgnostic(data.in);
                throw new ExpectingTestToFail(`Data: ${data.in}, was expected to throw ${data.errorMessage}`)
                
            }catch(e){
                if(e.message !== data.errorMessage){
                    console.log(data, e.message)
                }
                expect(e.message).toEqual(data.errorMessage);
            }
        }

       
    });

    it("should throw invalid argument error", () => {
        const invalidArgumentsFixtures = fixture.filter((json) => json.hasError && json.errorMessage !== undefined && json.errorMessage.includes('Invalid argument'));
        expect(invalidArgumentsFixtures.length).toBeGreaterThan(0);
        for(const data of invalidArgumentsFixtures){
            try{
 
                 const caip = new ChainAgnostic(data.in);
                 throw new ExpectingTestToFail(`${data.in} was expected to throw ${data.errorMessage}`)
                 
             }catch(e){
                 expect(e.message).toEqual(data.errorMessage);
             }
         }
    });

    it("must succeed", () => {
        const successfulFixtures = fixture.filter((json) => json.hasError === false);
        expect(successfulFixtures.length).toBeGreaterThan(0);
        for(const data of successfulFixtures){
            const caip = new ChainAgnostic(data.in);
            expect(caip.toJSON()).toStrictEqual(data.out);
            if(data.out["assetName"] !== undefined){
                expect(caip.namespace).toEqual(data.out["assetName"]["namespace"]);
                expect(caip.reference).toEqual(data.out["assetName"]["reference"]);
            }
        }
    })
    
});