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

import { useState } from "react";
import { Box, Paper, Stack, TextField } from "@mui/material";
import Button from "@mui/material/Button";
import useTariProvider from "../store/provider.ts";
import * as tariswap from "../tariswap.ts";
import * as faucet from "../faucet.ts";
import * as cbor from "../cbor.ts";
import { useSnackbar } from "../components/SnackbarContext.tsx";
import { useBackdrop } from "../components/BackdropContext.tsx";

function Utilities() {
    const FAUCET_SUPPLY: number = 1_000_000;
    const faucet_template: string = import.meta.env.VITE_FAUCET_TEMPLATE;
    const pool_index_template: string = import.meta.env.VITE_POOL_INDEX_TEMPLATE;
    const pool_template: string = import.meta.env.VITE_POOL_TEMPLATE;

    const { provider } = useTariProvider();
    const { showSnackbar } = useSnackbar();
    const { openBackdrop, closeBackdrop } = useBackdrop();

    const [newTokenName, setNewTokenName] = useState<string | null>(null);
    const [faucetComponent, setFaucetComponent] = useState<string | null>(null);

    const handleCreateToken = async () => {
        if (!provider) {
          showSnackbar("Provider is not set", "error");
          return;
        }
        if (!newTokenName) {
          showSnackbar("New token name is not set", "error");
          return;
        }

        openBackdrop();
        try {
          console.log({faucet_template, FAUCET_SUPPLY, newTokenName});
          const result = await faucet.createFaucet(provider, faucet_template, FAUCET_SUPPLY, newTokenName);
          console.log({ result });
          const response = result.result as { execution_results: { indexed: { value: string}}[]};
          const componentAddress = cbor.convertCborValue(response.execution_results[0].indexed.value);
          // result.result.execution_results[0].indexed.value (cbor encoded ComponentAddress)
          // result.result.result.Accept.up_substates => find (s => s.0.Component && s.1.version == 0)
          console.log({ componentAddress });
          showSnackbar(`Token faucet "${newTokenName}" was created!`, "success");
        } catch (error) {
          console.log(error);
          showSnackbar(`Failed to create faucet "${newTokenName}"`, "error");
        }
        closeBackdrop();
    }

    const handleGetTokens = async () => {
        if (!provider) {
          showSnackbar("Provider is not set", "error");
          return;
        }
        if (!faucetComponent) {
          showSnackbar("Faucet component is not set", "error");
          return;
        }

        openBackdrop();
        try {
          const result = await faucet.takeFreeCoins(provider, faucetComponent);
          console.log({ result });
          showSnackbar("Tokens fetched from faucet!", "success");
        } catch (error) {
          console.log(error);
          showSnackbar(`Failed to get tokens from faucet "${faucetComponent}"`, "error");
        }
        closeBackdrop();
    }

    const handleCreateIndexComponent = async () => {
        if (!provider) {
          showSnackbar("Provider is not set", "error");
          return;
        }

        openBackdrop();
        try {
          //TODO: constant?
          const market_fee = 10;
          const result = await tariswap.createPoolIndex(provider, pool_index_template, pool_template, market_fee);
          const response = result.result as { execution_results: { indexed: { value: string}}[]};
          const componentAddress = cbor.convertCborValue(response.execution_results[0].indexed.value);
          console.log({componentAddress});
          showSnackbar("A new index component was created!", "success");
        } catch (error) {
          console.log(error);
          showSnackbar("Failed to create a new index component", "error");
        }
        closeBackdrop();
    }

    const handleNewTokenName = async (event: React.ChangeEvent<HTMLInputElement>) => {
        setNewTokenName(event.target.value);
    };

    const handleFaucetComponent = async (event: React.ChangeEvent<HTMLInputElement>) => {
        setFaucetComponent(event.target.value);
    };

    return <Box>
        <Paper variant="outlined" elevation={0} sx={{ my: { xs: 3, md: 6 }, p: { xs: 2, md: 3 }, borderRadius: 2 }}>
            <Box sx={{ padding: 5, borderRadius: 4 }}>
                <Stack sx={{ mb: 2 }} direction="column" justifyContent="space-between" spacing={2}>
                    <TextField sx={{ mt: 1, width: '100%' }} id="getTokens" placeholder="Faucet component address"
                        onChange={handleFaucetComponent}
                        InputProps={{
                            sx: { borderRadius: 2 },
                        }}>
                    </TextField>
                </Stack>
                <Button variant='contained' onClick={async () => { await handleGetTokens(); }}>Take Tokens</Button>
            </Box>
        </Paper>

        <Paper variant="outlined" elevation={0} sx={{ my: { xs: 3, md: 6 }, p: { xs: 2, md: 3 }, borderRadius: 2 }}>
            <Box sx={{ padding: 1, borderRadius: 4 }}>
                <Stack sx={{ mb: 2 }} direction="column" justifyContent="space-between" spacing={2}>
                    <TextField sx={{ mt: 1, width: '100%' }} id="newTokenName" placeholder="New token name"
                        onChange={handleNewTokenName}
                        InputProps={{
                            sx: { borderRadius: 2 },
                        }}>
                    </TextField>
                </Stack>
                <Button variant='contained' onClick={async () => { await handleCreateToken(); }}>Create Token</Button>
            </Box>
        </Paper>

        <Paper variant="outlined" elevation={0} sx={{ my: { xs: 3, md: 6 }, p: { xs: 2, md: 3 }, borderRadius: 2 }}>
            <Button variant='contained' onClick={async () => { await handleCreateIndexComponent(); }}>Create New Index Component</Button>
        </Paper>
    </Box>;
}


export default Utilities;
