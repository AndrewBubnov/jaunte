import { useSyncExternalStore } from 'react';
import {
    Bound,
    ComputedStoreCreator, CreateSimple,
    CreateWithComputed,
    FunctionalParam,
    ObjectParam,
    SetStateAction,
    Store,
    StoreCreator,
    StoreCreatorItem,
    SubscribeCallback, UseStore
} from "./types";

const merge = (...args: object[]) => Object.assign({}, ...args);

const useStore = <T, S extends T = T>(store: Store<T>, selector?: (state: T) => S) => {
    const { getState, subscribe, persistKey } = store;

    if (persistKey) localStorage.setItem(persistKey, JSON.stringify(store.getState()));
    const getSnapshot = selector ? () => selector(getState()) : getState;
    return useSyncExternalStore(subscribe, getSnapshot) as object;
};

const useComputedStore = <T, S extends T = T>(bound: Bound<T>, selector?: (state: Partial<T>) => S) => {
    const [store, computed] = bound;
    const { getState } = store;

    const computedState = computed(getState());
    return selector ? selector(computedState) : computedState;
};

const createStore = <T>(storeCreatorArg: StoreCreator<T>): Store<T> => {
    const [storeCreator, persistKey, persisted] = Array.isArray(storeCreatorArg) ? storeCreatorArg : [storeCreatorArg];

    let store = {} as T;

    const subscribers = new Set<SubscribeCallback<T>>();

    const setter = (setStateAction: SetStateAction<T>) => {
        const isFunction = typeof setStateAction === 'function';
        const updated = isFunction ? (setStateAction as FunctionalParam<T>)(store) : (setStateAction as ObjectParam<T>);
        store = merge(store as object, updated);
        subscribers.forEach(callback => callback(store));
    };

    store = storeCreator(setter);

    if (persistKey && persisted) store = merge(store as object, persisted);

    return {
        getState: () => store,
        subscribe: callback => {
            subscribers.add(callback);
            return () => subscribers.delete(callback);
        },
        persistKey,
    };
};

const createSimple = (<T, S extends T>(storeCreator: StoreCreator<T, S>) => {
    const store = createStore(storeCreator);
    const hook = (store: Store<T>, selector?: (state: T) => S) => useStore(store, selector);
    return hook.bind(null, store);
}) as CreateSimple;

const createWithComputed = (<T, S extends T>(storeCreator: StoreCreator<T, S>, computed: ComputedStoreCreator<T>) => {
    const store = createStore(storeCreator);
    const hook = (store: Store<T>, selector?: (state: T) => S) => useStore(store, selector);
    const computedHook = (bound: Bound<T>, selector?: (state: Partial<T>) => S) => useComputedStore(bound, selector);
    return [hook.bind(null, store), computedHook.bind(null, [store, computed])];
}) as CreateWithComputed;

export function create<T, S extends T = T>(storeCreator: StoreCreator<T, S>): UseStore<Store<T>>;
export function create<T, S extends T = T>(
    storeCreator: StoreCreator<T, S>,
    computed: ComputedStoreCreator<T>
): [UseStore<Store<T>>, UseStore<Store<T>>];

export function create<T, S extends T>(storeCreator: StoreCreator<T, S>, computed?: ComputedStoreCreator<T>) {
    if (computed) return createWithComputed(storeCreator, computed);
    return createSimple(storeCreator);
}

export const persist = <T, U>(
    storeCreator: StoreCreatorItem<T, U>,
    name: string
): [StoreCreatorItem<T, U>, string, T] => {
    const stored = localStorage.getItem(name) ? (JSON.parse(localStorage.getItem(name) as string) as T) : ({} as T);
    return [storeCreator, name, stored];
};
