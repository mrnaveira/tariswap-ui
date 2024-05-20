//  Copyright 2022. The Tari Project
//
//  Redistribution and use in source and binary forms, with or without modification, are permitted provided that the
//  following conditions are met:
//
//  1. Redistributions of source code must retain the above copyright notice, this list of conditions and the following
//  disclaimer.
//
//  2. Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the
//  following disclaimer in the documentation and/or other materials provided with the distribution.
//
//  3. Neither the name of the copyright holder nor the names of its contributors may be used to endorse or promote
//  products derived from this software without specific prior written permission.
//
//  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES,
//  INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
//  DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
//  SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
//  SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY,
//  WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE
//  USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

import "./Home.css";
import {StyledPaper} from "../../components/StyledComponents";
import Grid from "@mui/material/Grid";
import SecondaryHeading from "../../components/SecondaryHeading";
import {FinalizeResult, FunctionDef, TemplateDef} from "@tariproject/wallet_jrpc_client";
import {useState, useEffect} from "react";
import SettingsForm, {Settings} from "./SettingsForm.tsx";
import {Error} from "@mui/icons-material";
import * as wallet from "../../wallet.ts";
import {Alert, Box, CircularProgress, Divider, IconButton, Stack, TextField, Typography} from "@mui/material";
import * as React from "react";
import Button from "@mui/material/Button";
import useSettings from "../../store/settings.ts";
import useTariProvider from "../../store/provider.ts";
import * as cbor from "../../cbor.ts";
import { SubmitTransactionRequest } from "@tariproject/tarijs";

function Home() {
    const FAUCET_SUPPLY: number = 1_000_000;
    const faucet_template: string = import.meta.env.VITE_FAUCET_TEMPLATE;
    const pool_index_template: string = import.meta.env.VITE_POOL_INDEX_TEMPLATE;
    const pool_template: string = import.meta.env.VITE_POOL_TEMPLATE;
    const pool_index_component: string = import.meta.env.VITE_POOL_INDEX_COMPONENT;

    const {provider} = useTariProvider();

    const [newTokenName, setNewTokenName] = useState<string | null>(null);
    const [faucetComponent, setFaucetComponent] = useState<string | null>(null);

    const [tokenA, setTokenA] = useState<string | null>(null);
    const [tokenB, setTokenB] = useState<string | null>(null);


    const [addLiquidityComponent, setAddLiquidityComponent] = useState<string | null>(null);
    const [addLiquidityResourceA, setAddLiquidityResourceA] = useState<string | null>(null);
    const [addLiquidityResourceA_amount, setAddLiquidityResourceA_amount] = useState<number | null>(null);
    const [addLiquidityResourceB, setAddLiquidityResourceB] = useState<string | null>(null);
    const [addLiquidityResourceB_amount, setAddLiquidityResourceB_amount] = useState<number | null>(null);

    const [removeLiquidityComponent, setRemoveLiquidityComponent] = useState<string | null>(null);
    const [removeLiquidityResource, setRemoveLiquidityResource] = useState<string | null>(null);
    const [removeLiquidityAmount, setRemoveLiquidityAmount] = useState<number | null>(null);

    const [swapComponent, setSwapComponent] = useState<string | null>(null);
    const [swapResource, setSwapResource] = useState<string | null>(null);
    const [swapResource_amount, setSwapResource_amount] = useState<number | null>(null);
    const [swapOutputResource, setSwapOutputResource] = useState<string | null>(null);

    const {settings, setSettings} = useSettings();
    

    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [components, setComponents] = useState<string[]>([]);
    const [selectedComponent, setSelectedComponent] = useState<string | null>(
        null
    );
    const [
        templateDefinition,
        setTemplateDefinition
    ] = useState<TemplateDef | null>(null);
    const [badges, setBadges] = useState<string[]>([]);
    const [selectedBadge, setSelectedBadge] = useState<string | null>(null);
    const [lastResult, setLastResult] = useState<{
        index: number;
        result: FinalizeResult | null;
    } | null>(null);


    const onSaveSettings = (settings: Settings) => {
        localStorage.setItem("settings", JSON.stringify(settings));
        setSettings(settings);
    }

    const handleCreateIndexComponent = async () => {
        if (provider === null) {
            throw new Error('Provider is not initialized');
        }

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
            market_fee: 10,
        }

        const result = await wallet.buildInstructionsAndSubmit(
            provider,
            settings,
            null,
            null,
            func,
            args,
        );
        
        console.log({ result });
    }

    const handleCreateToken = async () => {
        if (provider === null) {
            throw new Error('Provider is not initialized');
        }

        const settings: Settings = {
            template: faucet_template
        };

        const func: FunctionDef = {
            name: "mint_with_symbol",
            arguments: [
                {
                    name: "initial_supply",
                    arg_type: { Other: {name: "Amount"}},
                },
                {
                    name: "symbol",
                    arg_type: "String",
                },
            ],
            output: { Other: {name: "Component"}},
            is_mut: false,
        };

        const args = {
            initial_supply: `Amount(${FAUCET_SUPPLY})`,
            symbol: newTokenName,
        }

        const result = await wallet.buildInstructionsAndSubmit(
            provider,
            settings,
            null,
            null,
            func,
            args,
        );
        
        console.log({ result });
    }

    const handleGetTokens = async () => {
        if (provider === null) {
            throw new Error('Provider is not initialized');
        }

        const settings: Settings = {
            template: faucetComponent
        };

        const func: FunctionDef = {
            name: "take_free_coins",
            arguments: [
                {
                    name: "self",
                    arg_type: { Other: {name: "&mut self"}},
                },
            ],
            output: { Other: {name: "Bucket"}},
            is_mut: true,
        };

        const args = {};

        const result = await wallet.buildInstructionsAndSubmit(
            provider,
            settings,
            null,
            faucetComponent,
            func,
            args,
        );
        
        console.log({ result });
    }

    const handleCreatePool = async () => {
        if (provider === null) {
            throw new Error('Provider is not initialized');
        }

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
        
        console.log({ result });
    }

    const handleListPools = async () => {
        if (provider === null) {
            throw new Error('Provider is not initialized');
        }

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
    
        console.log(pool_data);
    }

    const handleAddLiquidity = async () => {
        if (provider === null) {
            throw new Error('Provider is not initialized');
        }

        // TODO: wrap into an utility function inside the "wallet.ts" file
        const fee = 2000;
        const account = await provider.getAccount();
        const fee_instructions = [
            {
                CallMethod: {
                    component_address: account.address,
                    method: "pay_fee",
                    args: [`Amount(${fee})`]
                }
            }
        ];
        const instructions = [
            {
                "CallMethod": {
                    "component_address": account.address,
                    "method": "withdraw",
                    "args": [addLiquidityResourceA, addLiquidityResourceA_amount.toString()]
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
                    "args": [addLiquidityResourceB, addLiquidityResourceB_amount.toString()]
                }
            },
            {
                "PutLastInstructionOutputOnWorkspace": {
                    "key": [1]
                }
            },
            {
                "CallMethod": {
                    "component_address": addLiquidityComponent,
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
            {substate_id: addLiquidityComponent}
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

        console.log(result);
    }

    const handleRemoveLiquidity = async () => {
        if (provider === null) {
            throw new Error('Provider is not initialized');
        }

        // TODO: wrap into an utility function inside the "wallet.ts" file
        const fee = 2000;
        const account = await provider.getAccount();
        const fee_instructions = [
            {
                CallMethod: {
                    component_address: account.address,
                    method: "pay_fee",
                    args: [`Amount(${fee})`]
                }
            }
        ];
        const instructions = [
            {
                "CallMethod": {
                    "component_address": account.address,
                    "method": "withdraw",
                    "args": [removeLiquidityResource, removeLiquidityAmount.toString()]
                }
            },
            {
                "PutLastInstructionOutputOnWorkspace": {
                    "key": [108, 112, 95, 98, 117, 99, 107, 101, 116]
                }
            },
            {
                "CallMethod": {
                    "component_address": removeLiquidityComponent,
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
            {substate_id: removeLiquidityComponent}
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

        console.log(result);
    }

    const handleSwap = async () => {
        if (provider === null) {
            throw new Error('Provider is not initialized');
        }
    
        // TODO: wrap into an utility function inside the "wallet.ts" file
        const fee = 2000;
        const account = await provider.getAccount();
        const fee_instructions = [
            {
                CallMethod: {
                    component_address: account.address,
                    method: "pay_fee",
                    args: [`Amount(${fee})`]
                }
            }
        ];
        const instructions = [
            {
                "CallMethod": {
                    "component_address": account.address,
                    "method": "withdraw",
                    "args": [swapResource, swapResource_amount.toString()]
                }
            },
            {
                "PutLastInstructionOutputOnWorkspace": {
                    "key": [0]
                }
            },
            {
                "CallMethod": {
                    "component_address": swapComponent,
                    "method": "swap",
                    "args": [
                        { "Workspace": [0] }, swapOutputResource]
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
            {substate_id: swapComponent}
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

        console.log(result);
    }

    useEffect(() => {
        if (!provider) {
            return;
        }

        const getTemplateDef = ((settings.template)
                ? wallet.getTemplateDefinition(provider, settings.template)
                : Promise.resolve(null)
        )
            .then(setTemplateDefinition)
            .catch(e => {
                setError(e.message);
            });

        const getBadges = wallet.listSubstates(provider, null, "Resource")
            .then(substates => {
                setBadges(
                    // Best guess :/
                    substates
                        .filter(s => !!s.substate_id.NonFungible)
                        .map(s => s.substate_id.NonFungible.resource_address)
                );
            })
            .catch(e => {
                setError(e.message);
            });

        const getComponents = (settings.template
                ? wallet.listSubstates(provider, settings.template, "Component")
                : Promise.resolve(null)
        )
            .then(substates => {
                if (substates?.length) {
                    setComponents(
                        substates
                            .filter(s => !!s.substate_id.Component)
                            .map(s => s.substate_id.Component)
                    );
                } else {
                    setComponents([]);
                }
            })
            .catch(e => {
                setError(e.message);
            });

        Promise.allSettled([getBadges, getComponents, getTemplateDef]).then(
            () => {
                setIsLoading(false);
            }
        );
    }, [settings, provider]);

    useEffect(() => {
        if (!selectedComponent) {
            setSelectedComponent(components.length > 0 ? components[0] : null);
        }
    }, [components, selectedComponent]);

    if (!provider) {
        return <HomeLayout error={error} settings={settings} setSettings={onSaveSettings}>
            <pre>Please connect your wallet</pre>
        </HomeLayout>;
    }

    if (!settings || !settings.template) {
        return <HomeLayout error={error} settings={settings} setSettings={onSaveSettings}>
            <pre>Please add a template address to settings</pre>
        </HomeLayout>;
    }

    const handleNewTokenName = async (event) => {
        setNewTokenName(event.target.value);
    };
    
    const handleTokenA = async (event) => {
        setTokenA(event.target.value);
    };
    const handleTokenB = async (event) => {
        setTokenB(event.target.value);
    };

    const handleFaucetComponent = async (event) => {
        setFaucetComponent(event.target.value);
    };

    const handleAddLiquidityComponent = async (event) => {
        setAddLiquidityComponent(event.target.value);
    };

    const handleAddLiquidityResourceA = async (event) => {
        setAddLiquidityResourceA(event.target.value);
    };

    const handleAddLiquidityResourceA_amount = async (event) => {
        setAddLiquidityResourceA_amount(event.target.value);
    };

    const handleAddLiquidityResourceB = async (event) => {
        setAddLiquidityResourceB(event.target.value);
    };

    const handleAddLiquidityResourceB_amount = async (event) => {
        setAddLiquidityResourceB_amount(event.target.value);
    };

    const handleRemoveLiquidityComponent = async (event) => {
        setRemoveLiquidityComponent(event.target.value);
    };

    const handleRemoveLiquidityResource = async (event) => {
        setRemoveLiquidityResource(event.target.value);
    };

    const handleRemoveLiquidityAmount = async (event) => {
        setRemoveLiquidityAmount(event.target.value);
    };

    const handleSwapComponent = async (event) => {
        setSwapComponent(event.target.value);
    };

    const handleSwapResource = async (event) => {
        setSwapResource(event.target.value);
    };

    const handleSwapResource_amount = async (event) => {
        setSwapResource_amount(event.target.value);
    };

    const handleSwapOutputResource = async (event) => {
        setSwapOutputResource(event.target.value);
    };

    return <HomeLayout error={error} settings={settings} onCreateFreeTestCoins={async () => {
        await wallet.createFreeTestCoins(provider)
    }} setSettings={onSaveSettings}>
        {isLoading ? <CircularProgress/> : null}
        <Button onClick={async () => { await handleCreateIndexComponent(); }}>Create index component</Button>
        <Divider sx={{ mt: 3, mb: 3 }} variant="middle" />
        <Box sx={{ padding: 5, borderRadius: 4 }}>
            <Stack direction="column" justifyContent="space-between" spacing={2}>
                <TextField sx={{ mt: 1, width: '100%' }} id="newTokenName" placeholder="New token name"
                        onChange={handleNewTokenName}
                        InputProps={{
                            sx: { borderRadius: 2 },
                        }}>
                </TextField>
            </Stack>
            <Button onClick={async () => { await handleCreateToken(); }}>Create token</Button>
        </Box>
        <Divider sx={{ mt: 3, mb: 3 }} variant="middle" />
        <Box sx={{ padding: 5, borderRadius: 4 }}>
            <Stack direction="column" justifyContent="space-between" spacing={2}>
                <TextField sx={{ mt: 1, width: '100%' }} id="getTokens" placeholder="Faucet component address"
                        onChange={handleFaucetComponent}
                        InputProps={{
                            sx: { borderRadius: 2 },
                        }}>
                </TextField>
            </Stack>
            <Button onClick={async () => { await handleGetTokens(); }}>Get tokens</Button>
        </Box>
        <Divider sx={{ mt: 3, mb: 3 }} variant="middle" />
        <Box sx={{ padding: 5, borderRadius: 4 }}>
            <Stack direction="column" justifyContent="space-between" spacing={2}>
                <TextField sx={{ mt: 1, width: '100%' }} id="tokenA" placeholder="Token A resource address"
                        onChange={handleTokenA}
                        InputProps={{
                            sx: { borderRadius: 2 },
                        }}>
                </TextField>
                <TextField sx={{ mt: 1, width: '100%' }} id="tokenA" placeholder="Token B resource address"
                        onChange={handleTokenB}
                        InputProps={{
                            sx: { borderRadius: 2 },
                        }}>
                </TextField>
            </Stack>
            <Button onClick={async () => { await handleCreatePool(); }}>Create pool</Button>
        </Box>
        <Divider sx={{ mt: 3, mb: 3 }} variant="middle" />
        <Button onClick={async () => { await handleListPools(); }}>List pools</Button>
        <Divider sx={{ mt: 3, mb: 3 }} variant="middle" />
        <Box sx={{ padding: 5, borderRadius: 4 }}>
            <Stack direction="column" justifyContent="space-between" spacing={2}>
                <TextField sx={{ mt: 1, width: '100%' }} id="addLiquidityComponent" placeholder="Pool component address"
                        onChange={handleAddLiquidityComponent}
                        InputProps={{
                            sx: { borderRadius: 2 },
                        }}>
                </TextField>
                <Stack direction="row" justifyContent="space-between" spacing={2}>
                    <TextField sx={{ mt: 1, width: '70%' }} id="addLiquidityResourceA" placeholder="Resource address"
                        onChange={handleAddLiquidityResourceA}
                        InputProps={{
                            sx: { borderRadius: 2 },
                        }}>
                    </TextField>
                    <TextField sx={{ mt: 1, width: '30%' }} id="addLiquidityResourceA_amount" placeholder="0"
                        onChange={handleAddLiquidityResourceA_amount}
                        InputProps={{
                            sx: { borderRadius: 2 },
                        }}>
                    </TextField>
                </Stack>
                <Stack direction="row" justifyContent="space-between" spacing={2}>
                    <TextField sx={{ mt: 1, width: '70%' }} id="addLiquidityResourceB" placeholder="Resource address"
                        onChange={handleAddLiquidityResourceB}
                        InputProps={{
                            sx: { borderRadius: 2 },
                        }}>
                    </TextField>
                    <TextField sx={{ mt: 1, width: '30%' }} id="addLiquidityResourceB_amount" placeholder="0"
                        onChange={handleAddLiquidityResourceB_amount}
                        InputProps={{
                            sx: { borderRadius: 2 },
                        }}>
                    </TextField>
                </Stack>
            </Stack>
            <Button onClick={async () => { await handleAddLiquidity(); }}>Add liquidity</Button>
        </Box>
        <Box sx={{ padding: 5, borderRadius: 4 }}>
            <Stack direction="column" justifyContent="space-between" spacing={2}>
                <TextField sx={{ mt: 1, width: '100%' }} id="removeLiquidityComponent" placeholder="Pool component address"
                        onChange={handleRemoveLiquidityComponent}
                        InputProps={{
                            sx: { borderRadius: 2 },
                        }}>
                </TextField>
                <Stack direction="row" justifyContent="space-between" spacing={2}>
                    <TextField sx={{ mt: 1, width: '70%' }} id="removeLiquidityResource" placeholder="Resource address"
                        onChange={handleRemoveLiquidityResource}
                        InputProps={{
                            sx: { borderRadius: 2 },
                        }}>
                    </TextField>
                    <TextField sx={{ mt: 1, width: '30%' }} id="removeLiquidityAmount" placeholder="0"
                        onChange={handleRemoveLiquidityAmount}
                        InputProps={{
                            sx: { borderRadius: 2 },
                        }}>
                    </TextField>
                </Stack>
            </Stack>
            <Button onClick={async () => { await handleRemoveLiquidity(); }}>Remove liquidity</Button>
        </Box>
        <Box sx={{ padding: 5, borderRadius: 4 }}>
            <Stack direction="column" justifyContent="space-between" spacing={2}>
                <TextField sx={{ mt: 1, width: '100%' }} id="swapComponent" placeholder="Pool component address"
                        onChange={handleSwapComponent}
                        InputProps={{
                            sx: { borderRadius: 2 },
                        }}>
                </TextField>
                <Stack direction="row" justifyContent="space-between" spacing={2}>
                    <TextField sx={{ mt: 1, width: '70%' }} id="swapResource" placeholder="Input resource address"
                        onChange={handleSwapResource}
                        InputProps={{
                            sx: { borderRadius: 2 },
                        }}>
                    </TextField>
                    <TextField sx={{ mt: 1, width: '30%' }} id="swapResource_amount" placeholder="0"
                        onChange={handleSwapResource_amount}
                        InputProps={{
                            sx: { borderRadius: 2 },
                        }}>
                    </TextField>
                </Stack>
                <TextField sx={{ mt: 1, width: '100%' }} id="swapOutputResource" placeholder="Output resource address"
                        onChange={handleSwapOutputResource}
                        InputProps={{
                            sx: { borderRadius: 2 },
                        }}>
                </TextField>
            </Stack>
            <Button onClick={async () => { await handleSwap(); }}>Swap</Button>
        </Box>
    </HomeLayout>;
}


interface LayoutProps {
    error: string | null;
    settings: Settings | null;
    setSettings: (settings: Settings) => void;
    onCreateFreeTestCoins?: () => void;
    children: React.ReactNode;
}

function HomeLayout({error, settings, setSettings, onCreateFreeTestCoins, children}: LayoutProps) {
    return (
        <>
            <Grid item sm={12} md={12} xs={12}>
                <SecondaryHeading>Template</SecondaryHeading>
            </Grid>
            <Grid item xs={12} md={12} lg={12}>
                {error && (
                    <Alert icon={<Error/>} severity="error">
                        {error}
                    </Alert>
                )}
                <StyledPaper>
                    {<Button disabled={!onCreateFreeTestCoins} onClick={onCreateFreeTestCoins}>Create Free Test Coins</Button>}
                    {settings ? <SettingsForm settings={settings} onSave={setSettings}/> : <CircularProgress/>}
                </StyledPaper>
            </Grid>
            <Grid item xs={12} md={12} lg={12}>
                <StyledPaper>
                    {children}
                </StyledPaper>
            </Grid>
        </>
    )
}


export default Home;
