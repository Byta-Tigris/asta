import { EtherscanUnsupportedChain } from '@asta/errors';
import { EthereumChains } from '@asta/packages/protocol/chains-router';
import { EtherscanAdapter } from '@asta/packages/protocol/etherscan';

describe('Testing Etherscan', () => {
    const apiKey = process.env.ETHERSCAN_API_KEY;
    const testAddress = process.env.ETHERSCAN_TEST_ADDRESS;

    it('testing chain allocation error', () => {
        try {
            new EtherscanAdapter('polygon', apiKey);
        } catch (e) {
            expect(e).toBeInstanceOf(EtherscanUnsupportedChain);
        }
    });
    it('testing getTransactionsByAccount', async () => {
        const etherscan = new EtherscanAdapter(EthereumChains.Mainnet, apiKey);
        const res = await etherscan.getTransactionsByAccount({
            address: testAddress
        });
        expect(res.error).toBeUndefined();
        expect(res.result).toBeDefined();
        expect(res.result.length).toBeGreaterThan(0);
        expect(res.result[0].to).toEqual(testAddress.toLowerCase());
    }, 30000);
});
