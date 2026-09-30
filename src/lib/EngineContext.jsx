import { createContext, useContext } from "react";
export const EngineCtx = createContext(null);
export const useEngine = () => useContext(EngineCtx);
