import Box from "@mui/material/Box";
import Dialog from "@mui/material/Dialog";
import Divider from "@mui/material/Divider";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import CloseIcon from '@mui/icons-material/Close';
import IconButton from "@mui/material/IconButton";
import { Button, TextField } from "@mui/material";
import { copyToCliboard, truncateResource } from "../utils/text";
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { useEffect, useState } from "react";
import useTariProvider from "../store/provider";
import * as tariswap from "../tariswap.ts";


export interface AddLiquidityDialogProps {
    open: boolean;
    pool: tariswap.PoolProps | null,
    onClose: () => void;
}

export function AddLiquidityDialog(props: AddLiquidityDialogProps) {
    const { provider } = useTariProvider();

    const { pool, onClose, open } = props;

    const [amountTokenA, setAmountTokenA] = useState<string | null>(null);
    const [amountTokenB, setAmountTokenB] = useState<string | null>(null);

    // clear dialog form each time it closes
    useEffect(() => {
        if (!open) {
            setAmountTokenA("");
            setAmountTokenB("");
        }
    }, [open]);

    const handleClose = () => {
        onClose();
    };

    const handleAmountTokenA = async (event: React.ChangeEvent<HTMLInputElement>) => {
        setAmountTokenA(event.target.value);
    };

    const handleAmountTokenB = async (event: React.ChangeEvent<HTMLInputElement>) => {
        setAmountTokenB(event.target.value);
    };

    const handleAddLiquidity = async () => {
        if (!amountTokenA || !amountTokenB || !provider || !pool) {
            console.error("Required data is missing");
            return;
        }

        const amountTokenAasNumber = parseInt(amountTokenA);
        if (!amountTokenAasNumber || amountTokenAasNumber <= 0) {
            console.error("Invalid amount");
            return;
        }
        const amountTokenBasNumber = parseInt(amountTokenB);
        if (!amountTokenBasNumber || amountTokenBasNumber <= 0) {
            console.error("Invalid amount");
            return;
        }


        const result = await tariswap.addLiquidity(
            provider,
            pool.poolComponent,
            pool.resourceA,
            amountTokenAasNumber,
            pool.resourceB,
            amountTokenBasNumber
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
                    <Typography style={{ fontSize: 24 }}>Add Liquidity</Typography>
                    <IconButton aria-label="copy" onClick={handleClose}>
                        <CloseIcon style={{ fontSize: 24 }} />
                    </IconButton>
                </Stack>
                <Divider sx={{ mt: 3, mb: 3 }} variant="middle" />

                <Stack direction="row" spacing={4} sx={{ mt: 2}} justifyContent="space-between">
                    <Stack direction='row' alignItems="center">
                        <Typography style={{ fontSize: 16 }}>{truncateResource(pool.resourceA, 20)}</Typography>
                        <IconButton aria-label="copy" onClick={() => copyToCliboard(pool.resourceA)}>
                            <ContentCopyIcon />
                        </IconButton>
                    </Stack>
                    <TextField placeholder="0"
                        value={amountTokenA}
                        onChange={handleAmountTokenA}
                        InputProps={{
                            sx: { borderRadius: 2 },
                        }}
                        inputProps={{
                            style: { textAlign: "right" },
                        }} />
                </Stack>

                <Stack direction="row" spacing={4} sx={{ mt: 2}} justifyContent="space-between">
                    <Stack direction='row' alignItems="center">
                        <Typography style={{ fontSize: 16 }}>{truncateResource(pool.resourceB, 20)}</Typography>
                        <IconButton aria-label="copy" onClick={() => copyToCliboard(pool.resourceB)}>
                            <ContentCopyIcon />
                        </IconButton>
                    </Stack>
                    <TextField placeholder="0"
                        value={amountTokenB}
                        onChange={handleAmountTokenB}
                        InputProps={{
                            sx: { borderRadius: 2 },
                        }}
                        inputProps={{
                            style: { textAlign: "right" },
                        }} />
                </Stack>

                <Stack direction="row" justifyContent="center" sx={{ mt: 5, width: '100%' }}>
                    <Button variant="contained"
                    onClick={async () => { await handleAddLiquidity(); }}
                    sx={{ borderRadius: 1, fontSize: 18, textTransform: 'none' }}>
                        Add Liquidity
                    </Button>
                </Stack>


            </Box>
        </Dialog >
    );
}
