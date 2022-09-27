
import {ChainAgnostic} from "@asta/packages/chain-agnostic"
import parsingFixtureJSON from "./parsing.fixture.json"


interface ParseFixture {
    in: string | string[];
    hasError: boolean;
    out?: object;
    errorMessage?: string;
}


describe("ChainAgnostic Parsing", () => {
    const fixture = parsingFixtureJSON as ParseFixture[];

    
    it("should to throw error due to missing arguments", () => {        
        const missingArgumentsFixtures = fixture.filter((json) => json.hasError && json.errorMessage !== undefined && json.errorMessage.includes('Missing argument'));
        expect(missingArgumentsFixtures.length).toBeGreaterThan(0);

        for(const data of missingArgumentsFixtures){
           try{

                const caip = new ChainAgnostic(data.in);
                fail(`${data.in} was expected to throw ${data.errorMessage}`)
                
            }catch(e){
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
                 fail(`${data.in} was expected to throw ${data.errorMessage}`)
                 
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
        }
    })
    
});