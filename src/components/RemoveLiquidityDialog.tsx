import Box from "@mui/material/Box";
import Dialog from "@mui/material/Dialog";
import Divider from "@mui/material/Divider";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import CloseIcon from '@mui/icons-material/Close';
import IconButton from "@mui/material/IconButton";
import { Button, TextField } from "@mui/material";
import { copyToCliboard, truncateResource } from "../utils/text.ts";
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { useEffect, useState } from "react";
import useTariProvider from "../store/provider.ts";
import * as tariswap from "../tariswap.ts";

export interface RemoveLiquidityDialogProps {
    open: boolean;
    pool: object | null,
    onClose: () => void;
}

export function RemoveLiquidityDialog(props: RemoveLiquidityDialogProps) {
    const { provider } = useTariProvider();
    
    const { pool, onClose, open } = props;

    const [lpToken, setLpToken] = useState<string | null>("");
    const [amount, setAmount] = useState<string | null>("");

    // clear dialog form each time it closes
    useEffect(() => {
        if (!open) {
            setLpToken("");
            setAmount("");
        }
    }, [open]);

    useEffect(() => {
       if (pool) {
            console.log({pool});
            tariswap.getPoolLiquidityResource(provider, pool.poolComponent)
                .then(lpResource => {
                    setLpToken(lpResource);
                })
                .catch(e => {
                    console.error(e);
                });
       }
    }, [pool]);

    const handleClose = () => {
        onClose();
    };

    const handleAmount = async (event) => {
        setAmount(event.target.value);
    };

    const handleRemoveLiquidity = async () => {
        if (!pool || !lpToken) {
            console.error("Invalid pool");
            return;
        }

        const amountNumber = parseInt(amount);
        if (!amountNumber || amountNumber <= 0) {
            console.error("Invalid amount");
            return;
        }

        const result = await tariswap.removeLiquidity(
            provider,
            pool.poolComponent,
            lpToken,
            amountNumber,
        );
        console.log({result});

        onClose();
    };

    if (!pool) {
        return (<></>);
    }

    return (
        <Dialog fullWidth={true} onClose={handleClose} open={open}>
            <Box sx={{ padding: 5, borderRadius: 4 }}>
                <Stack direction="row" justifyContent="space-between" spacing={2}>
                    <Typography style={{ fontSize: 24 }}>Remove Liquidity</Typography>
                    <IconButton aria-label="copy" onClick={handleClose}>
                        <CloseIcon style={{ fontSize: 24 }} />
                    </IconButton>
                </Stack>
                <Divider sx={{ mt: 3, mb: 3 }} variant="middle" />
                
                <Stack direction="row" spacing={4} sx={{ mt: 2}} justifyContent="space-between">
                    <Stack direction='row' alignItems="center">
                        <Typography style={{ fontSize: 16 }}>{truncateResource(lpToken, 20)}</Typography>
                        <IconButton aria-label="copy" onClick={() => copyToCliboard(lpToken)}>
                            <ContentCopyIcon />
                        </IconButton>
                    </Stack>
                    <TextField placeholder="0"
                        value={amount}
                        onChange={handleAmount}
                        InputProps={{
                            sx: { borderRadius: 2 },
                        }}
                        inputProps={{
                            style: { textAlign: "right" },
                        }} />
                </Stack>

                <Stack direction="row" justifyContent="center" sx={{ mt: 5, width: '100%' }}>         
                    <Button variant="contained"
                    onClick={async () => { await handleRemoveLiquidity(); }}
                    sx={{ borderRadius: 1, fontSize: 18, textTransform: 'none' }}>
                        Remove Liquidity
                    </Button>
                </Stack>
                

            </Box>
        </Dialog >
    );
}