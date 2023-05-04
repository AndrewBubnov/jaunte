import {Selector, Store} from "../types";
import {useSyncExternalStore} from "react";

export const useStore = <T, S extends T = T>(store: Store<T>, selector?: Selector<T, S> | Selector<T, T[keyof T]>) => {
    const { getState, subscribe, getComputedSelector, persistKey } = store;
    if (selector) getComputedSelector(selector as Selector<T, T[keyof T]>);
    if (persistKey) localStorage.setItem(persistKey, JSON.stringify(getState()));
    const getSnapshot = selector ? () => selector(getState()) : getState;
    return useSyncExternalStore(subscribe, getSnapshot as () => T);
};
