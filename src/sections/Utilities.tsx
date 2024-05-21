//  Copyright 2024. The Tari Project
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

import "./Utilities.css";
import {FinalizeResult, TemplateDef} from "@tariproject/wallet_jrpc_client";
import {useState, useEffect} from "react";
import {Alert, Box, CircularProgress, Divider, IconButton, Stack, TextField, Typography} from "@mui/material";
import * as React from "react";
import Button from "@mui/material/Button";
import useSettings from "../store/settings.ts";
import useTariProvider from "../store/provider.ts";
import * as wallet from "../wallet.ts";
import * as tariswap from "../tariswap.ts";
import * as faucet from "../faucet.ts";

function Utilities() {
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

    const handleCreateToken = async () => {
        const result = await faucet.createFaucet(provider, faucet_template, FAUCET_SUPPLY, newTokenName);
        console.log({ result });
    }

    const handleGetTokens = async () => {
        const result = await faucet.takeFreeCoins(provider, faucetComponent);
        console.log({ result });
    }

    const handleCreateIndexComponent = async () => {
        //TODO: constant?
        const market_fee = 10;
        const result = await tariswap.createPoolIndex(provider, pool_index_template, pool_template, market_fee);
        console.log({ result });
    }

    const handleCreatePool = async () => {
        const result = await tariswap.createPool(provider, pool_index_component, tokenA, tokenB);
        console.log({ result });
    }

    const handleListPools = async () => {
        const pools = await tariswap.listPools(provider, pool_index_component);
        console.log(pools);
    }

    const handleAddLiquidity = async () => {
        const result = await tariswap.addLiquidity(
            provider,
            addLiquidityComponent,
            addLiquidityResourceA,
            addLiquidityResourceA_amount,
            addLiquidityResourceB, 
            addLiquidityResourceB_amount
        );
        console.log(result);
    }

    const handleRemoveLiquidity = async () => {
        const result = await tariswap.removeLiquidity(
            provider,
            removeLiquidityComponent,
            removeLiquidityResource,
            removeLiquidityAmount,
        );
        console.log(result);
    }

    const handleSwap = async () => {
        const result = await tariswap.swap(
            provider,
            swapComponent,
            swapResource,
            swapResource_amount,
            swapOutputResource
        );
        console.log(result);
    }

    const handleNewTokenName = async (event: any) => {
        setNewTokenName(event.target.value);
    };
    
    const handleTokenA = async (event: any) => {
        setTokenA(event.target.value);
    };
    const handleTokenB = async (event: any) => {
        setTokenB(event.target.value);
    };

    const handleFaucetComponent = async (event: any) => {
        setFaucetComponent(event.target.value);
    };

    const handleAddLiquidityComponent = async (event: any) => {
        setAddLiquidityComponent(event.target.value);
    };

    const handleAddLiquidityResourceA = async (event: any) => {
        setAddLiquidityResourceA(event.target.value);
    };

    const handleAddLiquidityResourceA_amount = async (event: any) => {
        setAddLiquidityResourceA_amount(event.target.value);
    };

    const handleAddLiquidityResourceB = async (event: any) => {
        setAddLiquidityResourceB(event.target.value);
    };

    const handleAddLiquidityResourceB_amount = async (event: any) => {
        setAddLiquidityResourceB_amount(event.target.value);
    };

    const handleRemoveLiquidityComponent = async (event: any) => {
        setRemoveLiquidityComponent(event.target.value);
    };

    const handleRemoveLiquidityResource = async (event: any) => {
        setRemoveLiquidityResource(event.target.value);
    };

    const handleRemoveLiquidityAmount = async (event: any) => {
        setRemoveLiquidityAmount(event.target.value);
    };

    const handleSwapComponent = async (event: any) => {
        setSwapComponent(event.target.value);
    };

    const handleSwapResource = async (event: any) => {
        setSwapResource(event.target.value);
    };

    const handleSwapResource_amount = async (event: any) => {
        setSwapResource_amount(event.target.value);
    };

    const handleSwapOutputResource = async (event: any) => {
        setSwapOutputResource(event.target.value);
    };

    return <Box>
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
    </Box>;
}


export default Utilities;
