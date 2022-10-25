import { SchemaValidatorError } from '@asta/errors';
import { EthereumProtocolChainAdapter } from '@asta/packages/chain-adapters/ethereum/ethereum.adapter';
import {
    EthereumTags,
    EthereumTransaction
} from '@asta/packages/chain-adapters/ethereum/types';
import { ethers } from 'ethers';
import ganache, { Server } from 'ganache';

const createSampleTransaction = async (
    wallet: ethers.Wallet,
    eth: ethers.providers.Web3Provider,
    to: string,
    from: string
): Promise<string> => {
    const tx = {
        to: to,
        from: from,
        value: ethers.utils.parseEther('1'),
        nonce: await eth.getTransactionCount(from, 'latest'),
        gasLimit: ethers.utils.hexlify('0x100000'),
        gasPrice: await eth.getGasPrice()
    };
    return await wallet.signTransaction(tx);
};

describe('Testing EthereumProtocolChainAdapter using ganache', () => {
    let server: Server;
    const PORT = 8545;
    const baseURL = `http://localhost:${PORT}`;
    let adapter: EthereumProtocolChainAdapter;
    let accounts;
    let address;
    let wallet: ethers.Wallet;
    let initialAccountsMap: Record<
        string,
        { unlocked: boolean; secretKey: string; balance: bigint }
    >;
    let eth: ethers.providers.Web3Provider;
    beforeAll(async () => {
        server = ganache.server({ logging: { quiet: true } });
        await server.listen(PORT);
        accounts = await server.provider.request({
            method: 'eth_accounts',
            params: []
        });
        eth = new ethers.providers.Web3Provider(server.provider);
        address = accounts[3];
        initialAccountsMap = server.provider.getInitialAccounts();
        wallet = new ethers.Wallet(initialAccountsMap[address].secretKey);

        if ((await eth.getTransactionCount(address, 'latest')) === 0) {
            const signedTx = await createSampleTransaction(
                wallet,
                eth,
                accounts[2],
                address
            );
            const { hash } = await eth.sendTransaction(signedTx);
            await eth.waitForTransaction(hash);
        }
        adapter = new EthereumProtocolChainAdapter({ baseUrl: baseURL });
    });

    afterAll(async () => {
        await server.provider.initialize();
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
        expect(res.result).toEqual(
            ethers.BigNumber.from(await eth.getBlockNumber()).toHexString()
        );
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
        expect(ethers.BigNumber.from(res.result.number).toNumber()).toEqual(
            await eth.getBlockNumber()
        );
    });
    it('getBlock must return result using blockNumber', async () => {
        const latestBlockNumber = (await adapter.getBlockNumber({ id: 1 }))
            .result;
        const res = await adapter.getBlock({
            forSelection: true,
            body: {
                id: 2,
                blockNumber: latestBlockNumber as string,
                fullTransactionObjects: false
            }
        });
        expect(res.result).toBeDefined();
        expect(ethers.BigNumber.from(res.result.number).toNumber()).toEqual(
            await eth.getBlockNumber()
        );
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

    it('getBalance will throw error when tag and blockNumber are sent together', async () => {
        try {
            await adapter.getBalance({
                id: 1,
                tag: EthereumTags.Latest,
                blockNumber: '0x0',
                address: accounts[0]
            });
        } catch (e) {
            expect(e).toBeInstanceOf(SchemaValidatorError);
            expect(e.message).toEqual(
                '"value" contains a conflict between exclusive peers [tag, blockNumber]'
            );
        }
    });
    it('getBalance will throw error on missing address value', async () => {
        try {
            await adapter.getBalance({
                forSelection: true,
                params: {
                    id: 1,
                    blockNumber: '0x0'
                }
            });
        } catch (e) {
            expect(e).toBeInstanceOf(SchemaValidatorError);
            expect(e.message).toEqual('"address" is required');
        }
    });
    it('getBalance will return result', async () => {
        const res = await adapter.getBalance({
            id: 1,
            blockNumber: '0x0',
            address: accounts[0]
        });
        expect(res.result).toBeDefined();
        expect(res.result.value).toBeDefined();
        expect(res.result.value).toEqual('1000000000000000000000');
    });
    it('getTransactionBySignature must return transaction data', async () => {
        const block = (
            await adapter.getBlock({
                id: 1,
                tag: EthereumTags.Latest,
                fullTransactionObjects: true
            })
        ).result;
        expect(block.transactions.length).toBeGreaterThan(0);
        const res = await adapter.getTransactionBySignature({
            forSelection: true,
            params: {
                id: 2,
                hash: (block.transactions[0] as EthereumTransaction).hash
            }
        });
        expect(res.result).toBeDefined();
        expect(res.result).toStrictEqual(block.transactions[0]);
    });
});
