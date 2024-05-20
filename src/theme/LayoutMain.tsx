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

import { useState } from "react";
import { styled } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import MuiDrawer from "@mui/material/Drawer";
import Box from "@mui/material/Box";
import MuiAppBar, { AppBarProps as MuiAppBarProps } from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import List from "@mui/material/List";
import IconButton from "@mui/material/IconButton";
import MenuOpenOutlinedIcon from "@mui/icons-material/MenuOpenOutlined";
import MenuOutlinedIcon from "@mui/icons-material/MenuOutlined";
import { mainListItems } from "../components/MenuItems";
import { AppBar, Stack, ThemeProvider, Typography } from "@mui/material";
import theme from "./theme";
import { Outlet, Link } from "react-router-dom";
import Logo from "../assets/Logo";
import Container from "@mui/material/Container";
import Breadcrumbs from "../components/Breadcrumbs";
import { breadcrumbRoutes } from "../App";
import Grid from "@mui/material/Grid";
import { TariConnectButton } from "../connect/TariConnectButton.tsx";
import tariLogo from "../assets/tari-logo.svg";

export default function Layout() {
  return (
    <ThemeProvider theme={theme}>

        <CssBaseline />
        <AppBar
          position="static"
          color="transparent"
          elevation={0}
        >
          <Toolbar sx={{ justifyContent: 'space-between' }}>
            <Stack direction='row' alignItems="center">
              <img width="35px" height="35px" src={tariLogo} />
              <Typography variant="h4" color="inherit" noWrap sx={{ mx: 1, height: '100%' }}>
                TariSwap
              </Typography>
            </Stack>
            <TariConnectButton />
          </Toolbar>
        </AppBar>

        <Container maxWidth="sm">
          <Outlet />
        </Container>

    </ThemeProvider>
  );
}
