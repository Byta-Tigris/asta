import { ChainAdapterRouterError, ProtocolError } from '@asta/errors';
import { ProtocolChainAdapter } from '../chain-adapters/adapter';
import { ChainAgnostic } from '../chain-agnostic';

export enum EthereumChains {
    Mainnet = 'eip155:1',
    Goerli = 'eip155:5',
    Kovan = 'eip155:42',
    Ropsten = 'eip155:3',
    Rinkeby = 'eip155:4'
}

export class ChainAdapterRouter {
    private _routes: Record<string, ChainAdapterRouter>;
    public adapterClass?: typeof ProtocolChainAdapter;
    private _isSupportingWildcardChainId: boolean;
    private _isRootRouter: boolean;

    constructor(
        isSupportingWildcardChainId: boolean,
        adapterClass?: typeof ProtocolChainAdapter,
        isRootRouter = false
    ) {
        this._isRootRouter = isRootRouter;
        this._routes = {};
        this._isSupportingWildcardChainId = isSupportingWildcardChainId;
        this.adapterClass = adapterClass;
    }

    public get isRootRouter(): boolean {
        return this._isRootRouter;
    }

    public isAdapterAvailable(): boolean {
        return this.adapterClass !== undefined;
    }

    public hasDefaultAdapter(): boolean {
        return this._isSupportingWildcardChainId && this.isAdapterAvailable();
    }

    public addRoute(name: string | string[], router: ChainAdapterRouter): void {
        const chainFragments =
            typeof name === 'string'
                ? ChainAgnostic.createFragments(name)
                : name;
        if (chainFragments.length === 0) {
            throw new ChainAdapterRouterError('name cannot be an empty string');
        } else if (chainFragments.length === 1) {
            this._routes[chainFragments[0]] = router;
        } else {
            const _routeName = chainFragments[0];
            const route =
                this._routes[_routeName] ?? new ChainAdapterRouter(false);
            route.addRoute(chainFragments.slice(1), router);
            this._routes[_routeName] = route;
        }
    }

    public addRoutes(routes: Record<string, ChainAdapterRouter>): void {
        for (const [name, router] of Object.entries(routes)) {
            this.addRoute(name, router);
        }
    }

    public getRoutes(): Record<string, ChainAdapterRouter> {
        return this._routes;
    }

    public getRouter(name: string | string[]): ChainAdapterRouter | undefined {
        let chainFragments =
            typeof name === 'string'
                ? ChainAgnostic.createFragments(name)
                : name;
        const lastRouteName =
            chainFragments.length > 0
                ? chainFragments[chainFragments.length - 1]
                : undefined;
        let router: ChainAdapterRouter;
        while (chainFragments.length > 0) {
            const routes = router ? router.getRoutes() : this._routes;
            if (routes[chainFragments[0]]) {
                router = routes[chainFragments[0]];
            } else if (
                chainFragments[0] === lastRouteName &&
                router !== undefined &&
                !router.hasDefaultAdapter()
            ) {
                router = undefined;
            }
            chainFragments = chainFragments.slice(1);
        }
        return router;
    }

    public getAdapterClass(
        name: string | string[]
    ): typeof ProtocolChainAdapter | undefined {
        const router = this.getRouter(name);
        if (router === undefined) return undefined;
        return router.adapterClass;
    }
}
