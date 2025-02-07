import { TariProvider } from "@tari-project/tarijs";
import * as wallet from "./wallet.ts";
import * as cbor from "./cbor.ts";

export interface PoolProps {
    resourceA: string;
    resourceB: string;
    poolComponent: string;
}

export async function createPoolIndex(provider: TariProvider, pool_index_template: string, pool_template: string, market_fee: number) {
    const account = await provider.getAccount();
    const instructions = [
        {
            "CallFunction": {
                "template_address": pool_index_template,
                "function": "new",
                "args": [pool_template, market_fee]
            }
        }
    ];

    const required_substates = [
        {substate_id: account.address},
    ];

    const result = await wallet.submitAndWaitForTransaction(provider, account, instructions, required_substates);
    return result;
}

export async function createPool(provider: TariProvider, pool_index_component: string, tokenA: string, tokenB: string) {
    const account = await provider.getAccount();
    const instructions = [
        {
            "CallMethod": {
                "component_address": pool_index_component,
                "method": "create_pool",
                "args": [tokenA, tokenB]
            }
        }
    ];

    const required_substates = [
        {substate_id: account.address},
        {substate_id: pool_index_component},
    ];

    const result = await wallet.submitAndWaitForTransaction(provider, account, instructions, required_substates);

    return result;
}

export async function listPools(provider: TariProvider, pool_index_component: string): Promise<PoolProps[]> {
    const substate = await wallet.getSubstate(provider, pool_index_component);

    // extract the map of pools from the index substate
    const component_body = substate.value.Component.body.state.Map as {
      Text: string;
      Map: {
        Array: string[];
      }[][];
    }[][];
    const pools_field = component_body.find((field) => field[0].Text == "pools");
    if (!pools_field) {
        return [];
    }
    const pools_value = pools_field[1].Map;

    // extract the resource addresses and the pool component for each pool
    const pool_data = pools_value.map(value => {
        const resource_pair = value[0].Array;
        const resourceA = cbor.convertCborValue(resource_pair[0]);
        const resourceB = cbor.convertCborValue(resource_pair[1]);
        const poolComponent = cbor.convertCborValue(value[1]);
        return {resourceA, resourceB, poolComponent};
    });

    return pool_data
}

export async function getPoolLiquidityResource(provider: TariProvider, pool_component: string) {
    const substate = await wallet.getSubstate(provider, pool_component);

    // extract the map of pools from the index substate
    const component_body = substate.value.Component.body.state;
    const lpResource = cbor.getValueByPath(component_body, "$.lp_resource");

    return lpResource
}

export async function addLiquidity(
    provider: TariProvider,
    pool_component: string,
    tokenA: string,
    amountTokenA: number,
    tokenB: string,
    amountTokenB: number
) {
    const account = await provider.getAccount();
    const instructions = [
        {
            "CallMethod": {
                "component_address": account.address,
                "method": "withdraw",
                "args": [tokenA, amountTokenA.toString()]
            }
        },
        {
            "PutLastInstructionOutputOnWorkspace": {
                "key": [0]
            }
        },
        {
            "CallMethod": {
                "component_address": account.address,
                "method": "withdraw",
                "args": [tokenB, amountTokenB.toString()]
            }
        },
        {
            "PutLastInstructionOutputOnWorkspace": {
                "key": [1]
            }
        },
        {
            "CallMethod": {
                "component_address": pool_component,
                "method": "add_liquidity",
                "args": [
                    { "Workspace": [0] }, { "Workspace": [1] }]
            }
        },
        {
            "PutLastInstructionOutputOnWorkspace": {
                "key": [2]
            }
        },
        {
            "CallMethod": {
                "component_address": account.address,
                "method": "deposit",
                "args": [{ "Workspace": [2] }]
            }
        }
    ];

    const required_substates = [
        {substate_id: account.address},
        {substate_id: pool_component}
    ];

    const result = await wallet.submitAndWaitForTransaction(provider, account, instructions, required_substates);

    return result;
}

export async function removeLiquidity(provider: TariProvider, pool_component: string, lpToken: string, amountLpToken: number) {
    const account = await provider.getAccount();
    const instructions = [
        {
            "CallMethod": {
                "component_address": account.address,
                "method": "withdraw",
                "args": [lpToken, amountLpToken.toString()]
            }
        },
        {
            "PutLastInstructionOutputOnWorkspace": {
                "key": [108, 112, 95, 98, 117, 99, 107, 101, 116]
            }
        },
        {
            "CallMethod": {
                "component_address": pool_component,
                "method": "remove_liquidity",
                "args": [
                    { "Workspace": [108, 112, 95, 98, 117, 99, 107, 101, 116] }
                ]
            }
        },
        {
            "PutLastInstructionOutputOnWorkspace": {
                "key": [112, 111, 111, 108, 95, 98, 117, 99, 107, 101, 116, 115]
            }
        },
        {
            "CallMethod": {
                "component_address": account.address,
                "method": "deposit",
                "args": [{ "Workspace": [112, 111, 111, 108, 95, 98, 117, 99, 107, 101, 116, 115, 46, 48] }]
            }
        },
        {
            "CallMethod": {
                "component_address": account.address,
                "method": "deposit",
                "args": [{ "Workspace": [112, 111, 111, 108, 95, 98, 117, 99, 107, 101, 116, 115, 46, 49] }]
            }
        }
    ];
    const required_substates = [
        {substate_id: account.address},
        {substate_id: pool_component}
    ];

    const result = await wallet.submitAndWaitForTransaction(provider, account, instructions, required_substates);

    return result;
}

export async function swap(provider: TariProvider, pool_component: string, inputToken: string, amountInputToken: number, outputToken: string) {
    const account = await provider.getAccount();
    const instructions = [
        {
            "CallMethod": {
                "component_address": account.address,
                "method": "withdraw",
                "args": [inputToken, amountInputToken.toString()]
            }
        },
        {
            "PutLastInstructionOutputOnWorkspace": {
                "key": [0]
            }
        },
        {
            "CallMethod": {
                "component_address": pool_component,
                "method": "swap",
                "args": [
                    { "Workspace": [0] }, outputToken]
            }
        },
        {
            "PutLastInstructionOutputOnWorkspace": {
                "key": [1]
            }
        },
        {
            "CallMethod": {
                "component_address": account.address,
                "method": "deposit",
                "args": [{ "Workspace": [1] }]
            }
        }
    ];
    const required_substates = [
        {substate_id: account.address},
        {substate_id: pool_component}
    ];

    const result = await wallet.submitAndWaitForTransaction(provider, account, instructions, required_substates);

    return result;
}
