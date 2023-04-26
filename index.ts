import {persist} from "./utils/persist";
import {
    ComputedStoreCreator, Selector,
    Store,
    StoreCreator,
    UseStore
} from "./types";
import { createStore } from "./utils/createStore";
import { useStore } from "./hooks/useStore";

export function create<T, S extends T = T>(storeCreator: StoreCreator<T, S>): UseStore<Store<T>>;

export function create<T, U = never, S extends T = T>(
    storeCreator: StoreCreator<T, S>,
    computed: ComputedStoreCreator<T, U>
): UseStore<Store<T & U>>;

export function create<T, U = never, S extends T = T>(
    storeCreator: StoreCreator<T, S>,
    computed?: ComputedStoreCreator<T, U>
) {
    const storeInstance = createStore(storeCreator, computed);
    const hook = (store: Store<T>, selector?: Selector<T, S>) => useStore(store, selector);
    return hook.bind(null, storeInstance);
}

export { persist };
