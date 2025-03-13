"use client";

import { useContext } from "react";
import { BetaModeContext } from "src/app/providers";

export const useBetaMode = () => useContext(BetaModeContext);
