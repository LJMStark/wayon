/* tslint:disable */
import { RootLayout, handleServerFunctions } from "@payloadcms/next/layouts";
import type { ServerFunctionClient } from "payload";
import React from "react";

import { getPayloadConfig } from "@/lib/payload-config";

import { importMap } from "./admin/importMap.js";
import "./custom.css";

type Args = {
  children: React.ReactNode;
};

const serverFunction: ServerFunctionClient = async (args) => {
  "use server";
  return handleServerFunctions({
    ...args,
    config: getPayloadConfig(),
    importMap,
  });
};

const Layout = ({ children }: Args) => (
  <RootLayout
    config={getPayloadConfig()}
    importMap={importMap}
    serverFunction={serverFunction}
  >
    {children}
  </RootLayout>
);

export default Layout;
