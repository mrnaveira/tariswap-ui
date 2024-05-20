import { Account, SubmitTransactionRequest, SubstateRequirement, TariProvider } from "@tariproject/tarijs";
import * as wallet from "./wallet.ts";
import * as cbor from "./cbor.ts";
import { Settings } from "./store/settings.ts";
import { FunctionDef } from "@tariproject/typescript-bindings";

export async function createPoolIndex(provider: TariProvider, pool_template: string, market_fee: number) {
    const func: FunctionDef = {
        name: "new",
        arguments: [
            {
                name: "pool_template",
                arg_type: { Other: {name: "TemplateAddress"}},
            },
            {
                name: "market_fee",
                arg_type: "U16"
            }
        ],
        output: { Other: {name: "Component"}},
        is_mut: false,
    };

    const args = {
        pool_template: pool_template,
        market_fee,
    }

    const settings = {
        template: null
    };

    const result = await wallet.buildInstructionsAndSubmit(
        provider,
        settings,
        null,
        null,
        func,
        args,
    );
    
    return result;
}

export async function createPool(provider: TariProvider, pool_index_template: string, pool_index_component: string, tokenA: string, tokenB: string) {
    const settings: Settings = {
        template: pool_index_template
    };

    const func: FunctionDef = {
        name: "create_pool",
        arguments: [
            {
                name: "self",
                arg_type: { Other: {name: "&mut self"}},
            },
            {
                name: "a_addr",
                arg_type: { Other: {name: "ResourceAddress"}},
            },
            {
                name: "b_addr",
                arg_type: { Other: {name: "ResourceAddress"}},
            },
        ],
        output: { Other: {name: "Component"}},
        is_mut: true,
    };

    const args = {
        a_addr: tokenA,
        b_addr: tokenB,
    }

    const result = await wallet.buildInstructionsAndSubmit(
        provider,
        settings,
        null,
        pool_index_component,
        func,
        args,
    );
    
    return result;
}

export async function listPools(provider: TariProvider, pool_index_component: string) {
    const substate = await wallet.getSubstate(provider, pool_index_component);

    // extract the map of pools from the index substate
    const component_body = substate.value.substate.Component.body.state.Map;
    const pools_field = component_body.find((field) => field[0].Text == "pools")
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

    let result = await submitAndWaitForTransaction(provider, account, instructions, required_substates);

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

    let result = await submitAndWaitForTransaction(provider, account, instructions, required_substates);

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

    let result = await submitAndWaitForTransaction(provider, account, instructions, required_substates);

    return result;
}

// TODO: wrap into an utility function inside the "wallet.ts" file?
async function submitAndWaitForTransaction(provider: TariProvider, account: Account, instructions: object[], required_substates: SubstateRequirement[]) {
    const fee = 2000;
    const fee_instructions = [
        {
            CallMethod: {
                component_address: account.address,
                method: "pay_fee",
                args: [`Amount(${fee})`]
            }
        }
    ];
    const req: SubmitTransactionRequest = {
        account_id: account.account_id,
        fee_instructions,
        instructions: instructions as object[],
        inputs: [],
        input_refs: [],
        required_substates,
        is_dry_run: false,
        min_epoch: null,
        max_epoch: null
    };

    const resp = await provider.submitTransaction(req);

    let result = await wallet.waitForTransactionResult(provider, resp.transaction_id);

    return result;
}