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
import CallTemplateForm from "../../components/CallTemplateForm.tsx";
import {Error} from "@mui/icons-material";
import * as wallet from "../../wallet.ts";
import {Alert, Box, CircularProgress, Divider, IconButton, Stack, TextField, Typography} from "@mui/material";
import * as React from "react";
import Button from "@mui/material/Button";
import useSettings from "../../store/settings.ts";
import useTariProvider from "../../store/provider.ts";

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
            is_mut: false,
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
            is_mut: false,
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
