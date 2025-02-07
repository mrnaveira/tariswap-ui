import Box from "@mui/material/Box";
import Dialog from "@mui/material/Dialog";
import Divider from "@mui/material/Divider";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import CloseIcon from '@mui/icons-material/Close';
import IconButton from "@mui/material/IconButton";
import { Button, TextField } from "@mui/material";
import { useEffect, useState } from "react";
import useTariProvider from "../store/provider.ts";
import * as tariswap from "../tariswap.ts";

export interface CreatePoolDialogProps {
    open: boolean;
    onClose: () => void;
}

export function CreatePoolDialog(props: CreatePoolDialogProps) {
    const pool_index_component: string = import.meta.env.VITE_POOL_INDEX_COMPONENT;

    const { provider } = useTariProvider();

    const { onClose, open } = props;

    const [tokenA, setTokenA] = useState<string | null>(null);
    const [tokenB, setTokenB] = useState<string | null>(null);

    // clear dialog form each time it closes
    useEffect(() => {
        if (!open) {
            setTokenA("");
            setTokenB("");
        }
    }, [open]);

    const handleClose = () => {
        onClose();
    };

    const handleTokenA = async (event: React.ChangeEvent<HTMLInputElement>) => {
        setTokenA(event.target.value);
    };

    const handleTokenB = async (event: React.ChangeEvent<HTMLInputElement>) => {
        setTokenB(event.target.value);
    };

    const handleCreatePool = async () => {
        if (!provider) {
            console.error("Provider is not set");
            return;
        }
        if (!tokenA || !tokenB) {
            console.error("Invalid tokens");
            return;
        }

        const result = await tariswap.createPool(
            provider,
            pool_index_component,
            tokenA,
            tokenB
        );
        console.log({ result });
        onClose();
    };

    return (
        <Dialog fullWidth={true} onClose={handleClose} open={open}>
            <Box sx={{ padding: 5, borderRadius: 4 }}>
                <Stack direction="row" justifyContent="space-between" spacing={2}>
                    <Typography style={{ fontSize: 24 }}>Create New Pool</Typography>
                    <IconButton aria-label="copy" onClick={handleClose}>
                        <CloseIcon style={{ fontSize: 24 }} />
                    </IconButton>
                </Stack>
                <Divider sx={{ mt: 3, mb: 3 }} variant="middle" />

                <Stack direction="column" spacing={2} alignItems="center">
                    <TextField placeholder="Token resource address"
                        value={tokenA}
                        onChange={handleTokenA}
                        InputProps={{
                            sx: { borderRadius: 2, minWidth: '300px' },
                        }}
                        inputProps={{
                            style: { textAlign: "right" },
                        }} />
                    <TextField placeholder="Token resource address"
                        value={tokenB}
                        onChange={handleTokenB}
                        InputProps={{
                            sx: { borderRadius: 2, minWidth: '300px' },
                        }}
                        inputProps={{
                            style: { textAlign: "right" },
                        }} />

                </Stack>

                <Stack direction="row" justifyContent="center" sx={{ mt: 5, width: '100%' }}>
                    <Button variant="contained"
                        onClick={async () => { await handleCreatePool(); }}
                        sx={{ borderRadius: 1, fontSize: 18, textTransform: 'none' }}>
                        Create New Pool
                    </Button>
                </Stack>

            </Box>
        </Dialog >
    );
}
