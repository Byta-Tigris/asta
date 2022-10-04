import patternFixtureJSON from './pattern.fixture.json';
import { ChainAgnostic } from '@asta/packages/chain-agnostic';

interface PatternFixture {
  in: string;
  matches: Array<[string, boolean]>;
}

describe('ChainAgnostic pattern handler testing', () => {
  const patternFixture = patternFixtureJSON as PatternFixture[];

  it('Testing patterns', () => {
    for (const fixtureData of patternFixture) {
      const caip = new ChainAgnostic(fixtureData.in);
      for (const [matchString, willPass] of fixtureData.matches) {
        expect(caip.match(matchString)).toBe(willPass);
      }
    }
  });
});
