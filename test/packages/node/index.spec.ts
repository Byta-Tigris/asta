import { createRPCRequest } from '@asta/packages/node';
import { ProtocolNode } from '@asta/packages/node/types';
import ganache, { Server } from 'ganache';

describe('Testing createRPCRequest', () => {
    let server: Server<'ethereum'>;
    const PORT = 8545;
    const baseURL = `http://localhost:${PORT}`;
    beforeAll(async () => {
        server = ganache.server({ logging: { quiet: true } });
        await server.listen(PORT);
    });

    afterAll(async () => {
        await server.close();
    });

    it('test error with wrong method', async () => {
        const node: ProtocolNode = {
            baseUrl: baseURL
        };
        const res = await createRPCRequest(node, {
            id: 1,
            method: 'getName',
            params: []
        });
        expect(res.error).toBeDefined();
        expect(res.result).toBeUndefined();
    });
    it('test error with wrong not url', async () => {
        const node: ProtocolNode = {
            baseUrl: ''
        };
        const res = await createRPCRequest(node, {
            id: 1,
            method: 'getName',
            params: []
        });
        expect(res.error).toBeDefined();
        expect(res.result).toBeUndefined();
    });
    it('test pass with result', async () => {
        const res = await createRPCRequest(
            { baseUrl: baseURL },
            {
                id: 1,
                method: 'eth_blockNumber',
                params: []
            }
        );
        expect(res.error).toBeUndefined();
        expect(res.result).toBeDefined();
    });
});
