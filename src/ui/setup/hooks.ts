// We ban use of `useDispatch/useSelector` in the codebase in favor of the typed hooks,
// but this is the one file that needs them
// eslint-disable-next-line no-restricted-imports
import { TypedUseSelectorHook, useDispatch, useSelector, useStore } from "react-redux";

import type { UIState } from "ui/state";

import type { AppDispatch, AppStore } from "./store";

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppStore = useStore as () => AppStore;
export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<UIState> = useSelector;
