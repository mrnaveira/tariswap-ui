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

import { useCallback, useEffect, useState } from "react";
import { Box, IconButton, Paper, Stack, Typography } from "@mui/material";
import Button from "@mui/material/Button";
import useTariProvider from "../store/provider.ts";
import * as tariswap from "../tariswap.ts";
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { copyToCliboard, truncateResource } from "../utils/text.ts";
import { AddLiquidityDialog } from "../components/AddLiquidityDialog.tsx";
import { CreatePoolDialog } from "../components/CreatePoolDialog.tsx";
import { RemoveLiquidityDialog } from "../components/RemoveLiquidityDialog.tsx";

function Pools() {
    const poolIndexComponent: string = import.meta.env.VITE_POOL_INDEX_COMPONENT;

    const { provider } = useTariProvider();

    const [pools, setPools] = useState<tariswap.PoolProps[]>([]);
    const [selectedPool, setSelectedPool] = useState<tariswap.PoolProps | null>(null);
    const [addLiquidityDialogOpen, setAddLiquidityDialogOpen] = useState(false);
    const [removeLiquidityDialogOpen, setRemoveLiquidityDialogOpen] = useState(false);
    const [createPoolDialogOpen, setCreatePoolDialogOpen] = useState(false);

    const refreshPools = useCallback(() => {
        if (!provider) {
            return;
        }

        tariswap.listPools(provider, poolIndexComponent)
            .then(pools => {
                setPools(pools);
                console.log(pools);
            })
            .catch(e => {
                console.error(e);
            });
    }, [provider, poolIndexComponent]);

    useEffect(() => {
        refreshPools();
    }, [refreshPools]);

    const handleAddLiquidity = async (pool: tariswap.PoolProps) => {
        setSelectedPool(pool);
        setAddLiquidityDialogOpen(true);
    };

    const handleRemoveLiquidity = async (pool: tariswap.PoolProps) => {
        setSelectedPool(pool);
        setRemoveLiquidityDialogOpen(true);
    };

    const handleCreatePoolOpen = async () => {
        setCreatePoolDialogOpen(true);
    };

    const handleCreatePoolDialogClose = async () => {
        setCreatePoolDialogOpen(false);
        refreshPools();
    };

    return <Box>
        {
            pools.map((pool, index) => (
                <Paper key={index} variant="outlined" elevation={0} sx={{ my: { xs: 3, md: 6 }, p: { xs: 2, md: 3 }, borderRadius: 2 }}>

                    <Stack direction='row' alignItems='center' spacing={4}>
                        <Stack direction='column' sx={{ width: '60%' }}>
                            <Stack direction='row' alignItems="center">
                                <Typography style={{ fontSize: 16 }}>{truncateResource(pool.resourceA, 30)}</Typography>
                                <IconButton aria-label="copy" onClick={() => copyToCliboard(pool.resourceA)}>
                                    <ContentCopyIcon />
                                </IconButton>
                            </Stack>

                            <Stack direction='row' alignItems="center">
                                <Typography style={{ fontSize: 16 }}>{truncateResource(pool.resourceB, 30)}</Typography>
                                <IconButton aria-label="copy" onClick={() => copyToCliboard(pool.resourceB)}>
                                    <ContentCopyIcon />
                                </IconButton>
                            </Stack>
                        </Stack>
                        <Stack direction='column' sx={{ width: '40%' }} spacing={1}>
                            <Button variant="contained"
                                onClick={() => {handleAddLiquidity(pool)}}
                                sx={{ borderRadius: 1, fontSize: 16, textTransform: 'none' }}>
                                Add Liquidity
                            </Button>
                            <Button variant="contained"
                                onClick={() => {handleRemoveLiquidity(pool)}}
                                sx={{ borderRadius: 1, fontSize: 16, textTransform: 'none' }}>
                                Remove Liquidity
                            </Button>
                        </Stack>
                    </Stack>

                </Paper>
            ))
        }
        <Button variant="contained"
            onClick={() => {handleCreatePoolOpen()}}
            sx={{ borderRadius: 1, fontSize: 16, textTransform: 'none' }}>
            Create New Pool
        </Button>

        <AddLiquidityDialog
            open={addLiquidityDialogOpen}
            onClose={() => {setAddLiquidityDialogOpen(false)}}
            pool={selectedPool}
        />

        <RemoveLiquidityDialog
            open={removeLiquidityDialogOpen}
            onClose={() => {setRemoveLiquidityDialogOpen(false)}}
            pool={selectedPool}
        />

        <CreatePoolDialog
            open={createPoolDialogOpen}
            onClose={handleCreatePoolDialogClose}
        />
    </Box>;
}


export default Pools;
