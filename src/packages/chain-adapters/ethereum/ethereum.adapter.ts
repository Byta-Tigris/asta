import { ProtocolChainAdapter } from '../adapter';
import { Arg, Validate } from '@asta/packages/manipulator';
import {
    EthereumBlock,
    EthereumCreateWalletArg,
    EthereumCreateWalletResponse,
    EthereumGetBalanceArg,
    EthereumGetBlockArg,
    EthereumGetBlockNumberArg,
    EthereumGetTokenBalanceOfAccountArg,
    EthereumGetTokenBalanceOfAccountResponse,
    EthereumGetTransactionBySignatureArg,
    EthereumGetTransactionsByAccountArg,
    EthereumGetTransactionStatusArg,
    EthereumGetTransactionStatusResponse,
    EthereumSendRawTransactionArg,
    EthereumTransaction,
    EthereumVerifySignatureArg,
    EthereumVerifySignatureResponse
} from './types';
import {
    EthereumCreateWalletManipulator,
    EthereumGetBalanceManipulator,
    EthereumGetBlockManipulator,
    EthereumGetTokenBalanceOfAccountManipulator,
    EthereumGetTransactionBySignatureManipulator,
    EthereumSendRawTransactionManipulator,
    EthereumVerifySignatureManipulator,
    GetBlockNumberSchema
} from './ethereum.manipulators';
import { ProtocolNodeResponse, ResponseError } from '@asta/packages/node/types';
import { SyntheticParameter } from '@asta/packages/manipulator/types';
import { createRPCRequest } from '@asta/packages/node';
import {
    GetBalanceResponse,
    GetTransactionsByAccountArg,
    GetTransactionsByAccountResponse
} from '../types';
import { ethers } from 'ethers';
import { EtherscanAdapter } from '@asta/packages/protocol/etherscan';
import {
    EtherscanRawTransactionsByAccountRequest,
    EtherscanTransactionByAccount,
    EtherscanTransactionsByAccountRequest
} from '@asta/packages/protocol/etherscan.types';

export class EthereumProtocolChainAdapter extends ProtocolChainAdapter {
    @Validate
    async getBlockNumber(
        @Arg(['id'], { schema: GetBlockNumberSchema })
        arg: SyntheticParameter<EthereumGetBlockNumberArg>
    ): Promise<ProtocolNodeResponse<string, ResponseError>> {
        this.assertNodeExistence(this.node);
        const method = 'eth_blockNumber';
        const res = await createRPCRequest<string>(this.node, {
            id: arg.id as string,
            method: method,
            params: []
        });
        if (res.error) return res;
        return {
            error: res.error,
            result: ethers.BigNumber.from(res.result).toHexString()
        };
    }

    @Validate
    async getBlock(
        @Arg(new EthereumGetBlockManipulator())
        arg: SyntheticParameter<EthereumGetBlockArg>
    ): Promise<ProtocolNodeResponse<EthereumBlock | null, ResponseError>> {
        this.assertNodeExistence(this.node);
        const method =
            arg.tag === undefined && arg.blockNumber === undefined
                ? 'eth_getBlockByHash'
                : 'eth_getBlockByNumber';
        let params = [];
        if (method === 'eth_getBlockByNumber') {
            params = [arg.blockNumber ?? arg.tag];
        } else {
            params = [arg.hash];
        }
        params.push(arg.fullTransactionObjects);
        return await createRPCRequest<EthereumBlock | null>(this.node, {
            id: arg.id as string,
            method: method,
            params: params
        });
    }

    @Validate
    async getBalance(
        @Arg(new EthereumGetBalanceManipulator())
        arg: SyntheticParameter<EthereumGetBalanceArg>
    ): Promise<ProtocolNodeResponse<GetBalanceResponse, ResponseError>> {
        this.assertNodeExistence(this.node);
        const method = 'eth_getBalance';
        const params = [arg.address];
        if (arg.blockNumber !== undefined) {
            params.push(arg.blockNumber);
        } else if (arg.tag !== undefined) {
            params.push(arg.tag);
        }

        const res = await createRPCRequest<string>(this.node, {
            id: arg.id as string,
            method: method,
            params: params
        });
        if (res.result) {
            return {
                result: {
                    value: ethers.BigNumber.from(res.result).toString(),
                    symbol: 'wei'
                }
            };
        }
        return {
            error: res.error
        };
    }

    @Validate
    async getTransactionBySignature(
        @Arg(new EthereumGetTransactionBySignatureManipulator())
        arg: SyntheticParameter<EthereumGetTransactionBySignatureArg>
    ): Promise<
        ProtocolNodeResponse<EthereumTransaction | null, ResponseError>
    > {
        this.assertNodeExistence(this.node);
        const method = 'eth_getTransactionByHash';
        const params = [arg.hash];
        return await createRPCRequest<EthereumTransaction | null>(this.node, {
            id: arg.id as string,
            method: method,
            params: params
        });
    }

    @Validate
    async getTransactionStatus(
        @Arg(new EthereumGetTransactionBySignatureManipulator())
        arg: SyntheticParameter<EthereumGetTransactionStatusArg>
    ): Promise<
        ProtocolNodeResponse<
            EthereumGetTransactionStatusResponse | null,
            ResponseError
        >
    > {
        this.assertNodeExistence(this.node);
        const method = 'eth_getTransactionReceipt';
        const params = [arg.hash];
        const res =
            await createRPCRequest<EthereumGetTransactionStatusResponse | null>(
                this.node,
                {
                    id: arg.id as string,
                    method: method,
                    params: params
                }
            );
        if (res.result === null) {
            return {
                result: {
                    transactionHash: arg.hash as string,
                    status: 'pending'
                }
            };
        }
        return res;
    }

    @Validate
    async sendRawTransaction(
        @Arg(new EthereumSendRawTransactionManipulator())
        arg: SyntheticParameter<EthereumSendRawTransactionArg>
    ): Promise<ProtocolNodeResponse<string, ResponseError>> {
        this.assertNodeExistence(this.node);
        const method = 'eth_sendRawTransaction';
        return await createRPCRequest(this.node, {
            id: arg.id as string,
            method: method,
            params: [arg.signature]
        });
    }

    @Validate
    async verifySignature(
        @Arg(new EthereumVerifySignatureManipulator())
        arg: SyntheticParameter<EthereumVerifySignatureArg>
    ): Promise<
        ProtocolNodeResponse<EthereumVerifySignatureResponse, ResponseError>
    > {
        const messageDigest = ethers.utils.arrayify(
            ethers.utils.toUtf8Bytes(arg.message as string)
        );
        const recoveryAddress = ethers.utils.verifyMessage(
            messageDigest,
            arg.signature as string
        );
        return {
            result: {
                is_verified: recoveryAddress === arg.address,
                address: arg.address as string
            }
        };
    }

    @Validate
    async getTokenBalanceOfAccount(
        @Arg(new EthereumGetTokenBalanceOfAccountManipulator())
        arg: SyntheticParameter<EthereumGetTokenBalanceOfAccountArg>
    ): Promise<
        ProtocolNodeResponse<
            EthereumGetTokenBalanceOfAccountResponse,
            ResponseError
        >
    > {
        this.assertNodeExistence(this.node);
        const functionSignature = 'balanceOf(address)';
        const paddingLength = 64;
        const method = 'eth_call';
        const methodId = ethers.utils
            .keccak256(ethers.utils.toUtf8Bytes(functionSignature))
            .slice(0, 10);
        let inputData = arg.address as string;
        if (inputData.includes('0x')) {
            // remove "0x" from the address
            inputData = inputData.slice(2);
        }
        // pad the data with '0' until the length is equal to paddingLength
        inputData = inputData.padStart(paddingLength, '0x');
        const payload = methodId + inputData;
        const params = [
            {
                from: null,
                to: arg.token,
                data: payload
            }
        ];
        const res = await createRPCRequest<string>(this.node, {
            id: arg.id as string,
            method: method,
            params: params
        });
        if (res.result) {
            const balance = ethers.BigNumber.from(res.result).toHexString();
            return {
                result: {
                    balance: balance
                }
            };
        }
        return {
            error: res.error
        };
    }

    @Validate
    async createWallet(
        @Arg(new EthereumCreateWalletManipulator())
        arg: SyntheticParameter<EthereumCreateWalletArg>
    ): Promise<
        ProtocolNodeResponse<EthereumCreateWalletResponse, ResponseError>
    > {
        try {
            const wallet = ethers.Wallet.fromMnemonic(
                arg.phrase as string,
                arg.path as string
            );
            const res: EthereumCreateWalletResponse = {
                phrase: wallet.mnemonic.phrase,
                path: wallet.mnemonic.path,
                privateKey: wallet.privateKey,
                publicKey: wallet.address
            };
            return {
                result: res
            };
        } catch (e) {
            return {
                error: {
                    code: '-100',
                    message:
                        'Unable create wallet due to wrong "phrase" or "path"'
                }
            };
        }
    }

    @Validate
    async getTransactionsByAccount(
        @Arg(new EthereumGetTokenBalanceOfAccountManipulator())
        arg: SyntheticParameter<EthereumGetTransactionsByAccountArg>
    ): Promise<
        ProtocolNodeResponse<EtherscanTransactionByAccount[], ResponseError>
    > {
        const etherscan = new EtherscanAdapter(
            arg.chain as string,
            arg.apiKey as string
        );
        arg.chain = undefined;
        const query = arg as EtherscanTransactionsByAccountRequest;
        return await etherscan.getTransactionsByAccount(query);
    }
}
