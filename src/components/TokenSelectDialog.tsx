import Box from "@mui/material/Box";
import Dialog from "@mui/material/Dialog";
import Divider from "@mui/material/Divider";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import CloseIcon from '@mui/icons-material/Close';
import IconButton from "@mui/material/IconButton";
import { List, ListItemButton } from "@mui/material";
import { truncateText } from "../utils/text";

export interface TokenSelectDialogProps {
    open: boolean;
    tokens: string[],
    onSelect: (token: string | null) => void;
    onClose: () => void;
}

export function TokenSelectDialog(props: TokenSelectDialogProps) {
    const { tokens, onSelect, onClose, open } = props;

    const handleTokenSelect = async (token: string | null) => {
        onSelect(token);
    };

    const handleClose = () => {
        onClose();
    };

    return (
        <Dialog fullWidth={true} onClose={handleClose} open={open}>
            <Box sx={{ padding: 5, borderRadius: 4 }}>
                <Stack direction="row" justifyContent="space-between" spacing={2}>
                    <Typography style={{ fontSize: 24 }}>Select Token</Typography>
                    <IconButton aria-label="copy" onClick={handleClose}>
                        <CloseIcon style={{ fontSize: 24 }} />
                    </IconButton>
                </Stack>
                <Divider sx={{ mt: 3, mb: 3 }} variant="middle" />
                <List sx={{ width: '100%' }}>
                    <ListItemButton onClick={() => handleTokenSelect(null)}>
                        <Typography flexGrow="1" textAlign="center" style={{ fontSize: 18 }}>Clear</Typography>
                    </ListItemButton>
                    {
                        tokens.map(token => (
                            <ListItemButton onClick={() => handleTokenSelect(token)}>
                                 <Typography flexGrow="1" textAlign="center" style={{ fontSize: 18 }}>{truncateText(token, 40)}</Typography>
                            </ListItemButton>
                        ))
                    }
                </List>
            </Box>
        </Dialog >
    );
}
