import {Selector, Store} from "../types";
import {useSyncExternalStore} from "react";

export const useStore = <T, S extends T>(store: Store<T>, selector?: Selector<T, S>) => {
    const { getState, subscribe, persistKey } = store;

    if (persistKey) localStorage.setItem(persistKey, JSON.stringify(store.getState()));
    const getSnapshot = selector ? () => selector(getState()) : getState;
    return useSyncExternalStore(subscribe, getSnapshot);
};
