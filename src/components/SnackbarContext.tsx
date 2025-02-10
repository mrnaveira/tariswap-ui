// SnackbarContext.tsx
import * as React from 'react';
import { createContext, useState, useContext } from 'react';
import { AlertProps } from '@mui/material/Alert';
import { Alert, Snackbar, SnackbarCloseReason } from '@mui/material';

interface SnackbarContextType {
  open: boolean;
  message: string;
  severity: AlertProps['severity'];
  showSnackbar: (message: string, severity: AlertProps['severity']) => void;
  closeSnackbar: () => void;
}

const SnackbarContext = createContext<SnackbarContextType>({
  open: false,
  message: '',
  severity: 'info',
  showSnackbar: () => {},
  closeSnackbar: () => {},
});

export const SnackbarProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [severity, setSeverity] = useState<AlertProps['severity']>("info");

  const showSnackbar = (message: string, severity: AlertProps["severity"]) => {
    setMessage(message);
    setSeverity(severity);
    setOpen(true);
  };

  const closeSnackbar = () => {
    setOpen(false);
  };

  const value = {
    open,
    message,
    severity,
    showSnackbar,
    closeSnackbar,
  };

  const handleClose = (
    _event?: React.SyntheticEvent | Event,
    reason?: SnackbarCloseReason,
  ) => {
    if (reason === 'clickaway') {
      return;
    }

    setOpen(false);
  };

  return <SnackbarContext.Provider value={value}>
    {children}
    <Snackbar
      anchorOrigin={{ vertical: severity === "success" ? "top" : "bottom", horizontal: "center"}}
      open={open}
      autoHideDuration={6000}
      onClose={handleClose}>
        <Alert
          onClose={handleClose}
          severity={severity}
          sx={{ width: '100%' }}
        >
        {message}
        </Alert>
      </Snackbar>
  </SnackbarContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useSnackbar = () => useContext(SnackbarContext);
