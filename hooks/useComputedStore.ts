import {Selector, Store} from "../types";
import {useSyncExternalStore} from "react";

export const useComputedStore = <U, S extends U>(store: Store<U>, selector?: Selector<U, S>) => {
    const { getState, subscribe } = store;
    const getSnapshot = selector ? () => selector(getState()) : getState;
    return useSyncExternalStore(subscribe, getSnapshot);
};
