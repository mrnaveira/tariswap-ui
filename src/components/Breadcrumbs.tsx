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

import React from "react";
import { Link as RouterLink } from "react-router-dom";
import { Breadcrumbs, Link } from "@mui/material";
import useBreadcrumbs from "use-react-router-breadcrumbs";

interface BreadcrumbsItem {
  label: string;
  path: string;
  dynamic: boolean;
}

interface BreadcrumbsProps {
  items: BreadcrumbsItem[];
}

const BreadcrumbsComponent: React.FC<BreadcrumbsProps> = ({ items }) => {
  const breadcrumbs = useBreadcrumbs(items);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const links = breadcrumbs.map(({ match, breadcrumb }: any) => {
    const breadcrumbLabel = breadcrumb.props.children;
    const { label, path, dynamic } = match.route;
    return (
      <Link key={breadcrumbLabel} component={RouterLink} to={path} underline="none" color="inherit">
        {dynamic ? breadcrumbLabel.toLowerCase() : label}
      </Link>
    );
  });

  return (
    <>
      <Breadcrumbs
        aria-label="breadcrumb"
        separator="›"
        style={{
          fontSize: "0.8rem",
          paddingBottom: "1rem",
        }}
      >
        {links}
      </Breadcrumbs>
    </>
  );
};

export default BreadcrumbsComponent;
