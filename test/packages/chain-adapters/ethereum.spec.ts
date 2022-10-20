import { SchemaValidatorError } from '@asta/errors';
import { EthereumProtocolChainAdapter } from '@asta/packages/chain-adapters/ethereum/ethereum.adapter';
import { EthereumTags } from '@asta/packages/chain-adapters/ethereum/types';
import ganache, { Server } from 'ganache';

describe('Testing EthereumProtocolChainAdapter using ganache', () => {
    let server: Server;
    const PORT = 8545;
    const baseURL = `http://localhost:${PORT}`;
    let adapter: EthereumProtocolChainAdapter;
    beforeAll(async () => {
        server = ganache.server({ logging: { quiet: true } });
        await server.listen(PORT);
        adapter = new EthereumProtocolChainAdapter({ baseUrl: baseURL });
    });

    afterAll(async () => {
        await server.close();
    });

    it('getBlockNumber must throw error when id is not provided', async () => {
        try {
            await adapter.getBlockNumber({});
        } catch (e) {
            expect(e).toBeInstanceOf(SchemaValidatorError);
        }
    });
    it('getBlockNumber must return block number', async () => {
        const res = await adapter.getBlockNumber({
            forSelection: true,
            params: {
                id: 1
            }
        });
        expect(res.result).toBeDefined();
        // Fresh ganache server always returns '0x0' as current block
        expect(res.result).toEqual('0x0');
    });

    it('getBlock must throw validation error due to no required value is provided', async () => {
        try {
            await adapter.getBlock({
                params: {
                    id: 1
                },
                forSelection: true
            });
        } catch (e) {
            expect(e).toBeInstanceOf(SchemaValidatorError);
            expect(e.message).toEqual(
                '"value" must contain at least one of [tag, blockNumber, hash]'
            );
        }
    });
    it('getBlock must throw error when two alternate values provided together', async () => {
        try {
            await adapter.getBlock({
                params: {
                    id: 1,
                    tag: EthereumTags.Earliest,
                    blockNumber: '0x0'
                },
                forSelection: true
            });
        } catch (e) {
            expect(e).toBeInstanceOf(SchemaValidatorError);
            expect(e.message).toEqual(
                '"value" contains a conflict between exclusive peers [tag, blockNumber, hash]'
            );
        }
    });
    it('getBlock must return result using tag', async () => {
        const res = await adapter.getBlock({
            params: {
                id: 1,
                tag: EthereumTags.Latest,
                fullTransactionObjects: false
            },
            forSelection: true
        });
        expect(res.result).toBeDefined();
        expect(res.result.number).toEqual('0x0');
    });
    it('getBlock must return result using blockNumber', async () => {
        const latestBlockNumber = (await adapter.getBlockNumber({ id: 1 }))
            .result;
        const res = await adapter.getBlock({
            forSelection: true,
            body: {
                id: 2,
                blockNumber: latestBlockNumber,
                fullTransactionObjects: false
            }
        });
        expect(res.result).toBeDefined();
        expect(res.result.number).toEqual(latestBlockNumber);
    });
    it('getBlock must return result using hash', async () => {
        const block = (
            await adapter.getBlock({
                id: 1,
                tag: EthereumTags.Latest,
                fullTransactionObjects: false
            })
        ).result;
        const res = await adapter.getBlock({
            forSelection: true,
            params: {
                id: 2,
                hash: block.hash
            }
        });
        expect(res.result).toBeDefined();
        expect(res.result.number).toEqual(block.number);
    });
});
