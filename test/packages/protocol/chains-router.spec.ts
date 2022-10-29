import { EthereumProtocolChainAdapter } from '@asta/packages/chain-adapters/ethereum/ethereum.adapter';
import { ChainAdapterRouter } from '@asta/packages/protocol/chains-router';

describe('Testing ChainAdapterRouter', () => {
    let root: ChainAdapterRouter;
    beforeEach(() => {
        root = new ChainAdapterRouter(false, undefined, true);
    });
    it('adding single depth router', () => {
        const route = new ChainAdapterRouter(
            true,
            EthereumProtocolChainAdapter
        );
        root.addRoute('eip155', route);
        const routes = root.getRoutes();
        expect(routes['eip155']).toBeDefined();
        expect(routes['eip155']).toBeInstanceOf(ChainAdapterRouter);
        expect(routes['eip155'].isAdapterAvailable()).toEqual(true);
        expect(routes['eip155'].adapterClass).toEqual(
            EthereumProtocolChainAdapter
        );
    });
    it('adding multiple depth router', () => {
        class TestPolygonAdapter extends EthereumProtocolChainAdapter {}
        const route = new ChainAdapterRouter(true, TestPolygonAdapter);
        const eip155Route = new ChainAdapterRouter(
            false,
            EthereumProtocolChainAdapter
        );
        root.addRoute('eip155', eip155Route);
        root.addRoute('eip155:1', route);
        const routes = root.getRoutes();
        expect(routes['eip155']).toStrictEqual(eip155Route);
        const eip155Routes = routes['eip155'].getRoutes();
        expect(eip155Routes['1']).toStrictEqual(route);
    });
    it('getRouter must return undefined', () => {
        expect(root.getRouter('eip155')).toBeUndefined();
    });
    it('getRouter must return the parent router if unable to found none', () => {
        const _route = new ChainAdapterRouter(
            true,
            EthereumProtocolChainAdapter
        );
        class TestGoerliAdapter extends EthereumProtocolChainAdapter {}
        const polyRoute = new ChainAdapterRouter(false, TestGoerliAdapter);
        root.addRoute('eip155', _route);
        root.addRoute('eip155:4', polyRoute);
        expect(root.getRouter('eip155:4')).toStrictEqual(polyRoute);
        expect(root.getRouter('eip155:1')).toStrictEqual(_route);
        expect(root.getRouter('cosmos')).toBeUndefined();
    });
    it('getRouter must return undefined when parent does not support wildcard route', () => {
        const _route = new ChainAdapterRouter(
            false,
            EthereumProtocolChainAdapter
        );
        class TestGoerliAdapter extends EthereumProtocolChainAdapter {}
        const polyRoute = new ChainAdapterRouter(false, TestGoerliAdapter);
        root.addRoute('eip155', _route);
        root.addRoute('eip155:4', polyRoute);
        expect(root.getRouter('eip155:4')).toStrictEqual(polyRoute);
        expect(root.getRouter('eip155:1')).toBeUndefined();
    });
});
