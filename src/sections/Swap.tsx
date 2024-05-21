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

import { useEffect, useState } from "react";
import { Box, IconButton, Paper, Stack, TextField } from "@mui/material";
import Button from "@mui/material/Button";
import useTariProvider from "../store/provider.ts";
import * as tariswap from "../tariswap.ts";
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { TokenSelectDialog } from "../components/TokenSelectDialog.tsx";
import { truncateResource } from "../utils/text.ts";

function Swap() {
    const pool_index_component: string = import.meta.env.VITE_POOL_INDEX_COMPONENT;

    const { provider } = useTariProvider();

    const [pools, setPools] = useState<object[]>([]);

    const [selectedInputToken, setSelectedInputToken] = useState<string | null>(null);
    const [selectedOutputToken, setSelectedOutputToken] = useState<string | null>(null);

    const [tokens, setTokens] = useState<string[]>([]);
    const [inputTokens, setInputTokens] = useState<string[]>([]);
    const [outputTokens, setOutputTokens] = useState<string[]>([]);

    const [inputTokenDialogOpen, setInputTokenDialogOpen] = useState(false);
    const [outputTokenDialogOpen, setOutputTokenDialogOpen] = useState(false);

    const [inputAmount, setInputAmount] = useState<string | null>(null);

    useEffect(() => {
        if (!provider) {
            return;
        }

        tariswap.listPools(provider, pool_index_component)
            .then(pools => {
                setPools(pools);
                console.log(pools);

                let tokens: string[] = [];
                pools.forEach((pool: object) => {
                    tokens.push(pool.resourceA);
                    tokens.push(pool.resourceB);
                });
                // remove duplicates
                tokens = [...new Set(tokens)];
                setTokens(tokens);
                setInputTokens(tokens);
                setOutputTokens(tokens)
            })
            .catch(e => {
                console.error(e);
            });
    }, []);

    const getCorrespondingPoolTokens = (token: string | null) => {
        if (!token)
            return tokens;

        const correspondingTokens: string[] = [];
        pools.forEach(pool => {
            if (pool.resourceA === token) {
                correspondingTokens.push(pool.resourceB);
            } else if (pool.resourceB === token) {
                correspondingTokens.push(pool.resourceA);
            }
        });
        return correspondingTokens;
    }

    const handleInputTokenSelected = (token: string | null) => {
        setSelectedInputToken(token);
        setInputTokenDialogOpen(false);
        setInputAmount("");

        // when the user selects a token, the other token must only correspond to existing pool pairs
        setOutputTokens(getCorrespondingPoolTokens(token));
    };

    const handleOutputTokenSelected = (token: string | null) => {
        setSelectedOutputToken(token);
        setOutputTokenDialogOpen(false);

        // when the user selects a token, the other token must only correspond to existing pool pairs
        setInputTokens(getCorrespondingPoolTokens(token));
    };

    const handleInputAmount = async (event) => {
        setInputAmount(event.target.value);
    };

    const handleSwap = async () => {
        let inputAmountNumber = parseInt(inputAmount);
        if (!inputAmountNumber || inputAmountNumber <= 0) {
            console.error("Invalid amount");
            return;
        }

        const pool = pools.find(pool =>
            (pool.resourceA === selectedInputToken && pool.resourceB === selectedOutputToken) ||
            (pool.resourceA === selectedOutputToken && pool.resourceB === selectedInputToken)
        );

        if (!pool) {
            console.error("Pool not found matching the swap operation");
            return;
        }

        const { poolComponent } = pool;

        console.log({
            poolComponent,
            selectedInputToken,
            inputAmountNumber,
            selectedOutputToken
        });
        
        const result = await tariswap.swap(
            provider,
            poolComponent,
            selectedInputToken,
            inputAmountNumber,
            selectedOutputToken
        );
        console.log(result);
    }

    const canSwap = () => {
        return selectedInputToken && selectedOutputToken;
    } 

    return <Box>
        <Paper variant="outlined" elevation={0} sx={{ my: { xs: 3, md: 6 }, p: { xs: 2, md: 3 }, borderRadius: 2 }}>
            <Box sx={{ my: 2, mx: 1.5 }}>
                <Stack direction="row" spacing={2}>
                    <Button
                        variant="outlined"
                        endIcon={<ArrowDropDownIcon/>}
                        onClick={() => {setInputTokenDialogOpen(true)}}
                        sx={{ width: '40%', borderRadius: 2, textTransform: 'none', fontSize: 16 }}>
                            {selectedInputToken ? (truncateResource(selectedInputToken, 10)) : 'Select token'}
                    </Button>
                    <TextField sx={{ width: '60%' }} placeholder="0"
                        value={inputAmount}
                        onChange={handleInputAmount}
                        InputProps={{
                            sx: { borderRadius: 2 },
                        }}
                        inputProps={{
                            style: { textAlign: "right" },
                        }} />
                </Stack>

                <Stack direction="row" alignItems="center" justifyContent="center" sx={{ mt: 2 }}>
                    <IconButton aria-label="delete">
                        <ArrowDownwardIcon />
                    </IconButton>
                </Stack>

                <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
                    <Button
                        variant="outlined"
                        endIcon={<ArrowDropDownIcon/>}
                        onClick={() => {setOutputTokenDialogOpen(true)}}
                        sx={{ width: '40%', borderRadius: 2, textTransform: 'none', fontSize: 16 }}>
                            {selectedOutputToken ? (truncateResource(selectedOutputToken, 10)) : 'Select token'}
                    </Button>
                    <TextField sx={{ width: '60%' }} placeholder="0"
                        InputProps={{
                            sx: { borderRadius: 2 },
                        }}
                        inputProps={{
                            style: { textAlign: "right" },
                        }} />
                </Stack>

                <Button variant="contained" disabled={!canSwap()}
                    onClick={async () => {handleSwap()}}
                    sx={{ mt: 6, py: 1, width: '50%', borderRadius: 2, fontSize: 20, textTransform: 'capitalize' }}>
                        Swap
                </Button>
            </Box>
        </Paper>
        <TokenSelectDialog
            open={inputTokenDialogOpen}
            onSelect={handleInputTokenSelected}
            onClose={() => {setInputTokenDialogOpen(false)}}
            tokens={inputTokens}
        />
        <TokenSelectDialog
            open={outputTokenDialogOpen}
            onSelect={handleOutputTokenSelected}
            onClose={() => {setOutputTokenDialogOpen(false)}}
            tokens={outputTokens}
        />
    </Box>;
}


export default Swap;
