import {persist} from "./utils/persist";
import {
    ComputedStoreCreator,
    Store,
    StoreCreator,
    UseStore
} from "./types";
import {createSimple, createWithComputed} from "./utils/create";

export function create<T, S extends T = T>(storeCreator: StoreCreator<T, S>): UseStore<Store<T>>;

export function create<T, U = never, S extends T = T>(
    storeCreator: StoreCreator<T, S>,
    computed: ComputedStoreCreator<T, U>
): [UseStore<Store<T>>, UseStore<Store<U>>];

export function create<T, U = never, S extends T = T>(
    storeCreator: StoreCreator<T, S>,
    computed?: ComputedStoreCreator<T, U>
) {
    if (computed) return createWithComputed(storeCreator, computed);
    return createSimple(storeCreator);
}

export { persist };
