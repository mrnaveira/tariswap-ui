// BackdropContext.tsx
import * as React from 'react';
import { createContext, useState, useContext } from 'react';
import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';

interface BackdropContextType {
  open: boolean;
  openBackdrop: () => void;
  closeBackdrop: () => void;
}

const BackdropContext = createContext<BackdropContextType>({
  open: false,
  openBackdrop: () => {},
  closeBackdrop: () => {},
});

export const BackdropProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [open, setOpen] = useState(false);

  const openBackdrop = () => {
    setOpen(true);
  };

  const closeBackdrop = () => {
    setOpen(false);
  };

  const value = {
    open,
    openBackdrop,
    closeBackdrop,
  };

  return (
    <BackdropContext.Provider value={value}>
      {children}
      <Backdrop
        sx={(theme) => ({ color: '#fff', zIndex: theme.zIndex.modal + 10 })}
        open={open}
        onClick={closeBackdrop}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
    </BackdropContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useBackdrop = () => useContext(BackdropContext);
