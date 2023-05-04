import {persist} from "./utils/persist";
import {
    ComputedReturn,
    CreateSelector,
    Joint,
    Store,
    StoreCreator,
    UseStore,
    Computed
} from "./types";
import { createStore } from "./utils/createStore";
import { useStore } from "./hooks/useStore";

export function create<T, S extends T = T>(storeCreator: StoreCreator<T, S>): UseStore<Store<T>>;

export function create<T, U = never, S extends T = T>(
    storeCreator: StoreCreator<T, S>,
    computed: U
): UseStore<Store<T & ComputedReturn<U>>>;

export function create<T, U, S extends T = T>(
    storeCreator: StoreCreator<T, S>,
    computed?: U
): UseStore<Store<Joint<T, U>>> {
    const storeInstance = createStore(storeCreator, computed) as Store<Joint<T, U>>;
    const hook = (
        store: Store<Joint<T, U>>,
        selector?: CreateSelector<T, U>
    ) => useStore(store, selector);
    return hook.bind(null, storeInstance);
}

export { persist, Computed };
