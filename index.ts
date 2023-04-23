import { useSyncExternalStore } from 'react';
import {
    ComputedStoreCreator,
    CreateSimple,
    CreateWithComputed,
    FunctionalParam,
    ObjectParam, Selector,
    SetStateAction,
    Store,
    StoreCreator,
    StoreCreatorItem,
    SubscribeCallback,
    UseStore
} from "./types";

const merge = (...args: object[]) => Object.assign({}, ...args);

const useStore = <T, S extends T>(store: Store<T>, selector?: Selector<T, S>) => {
    const { getState, subscribe, persistKey } = store;

    if (persistKey) localStorage.setItem(persistKey, JSON.stringify(store.getState()));
    const getSnapshot = selector ? () => selector(getState()) : getState;
    return useSyncExternalStore(subscribe, getSnapshot);
};

const useComputedStore = <U, S extends U>(store: Store<U>, selector?: Selector<U, S>) => {
    const { getState, subscribe } = store;
    const getSnapshot = selector ? () => selector(getState()) : getState;
    return useSyncExternalStore(subscribe, getSnapshot);
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

const createStoreWithComputed = <T, U>(storeCreatorArg: StoreCreator<T>, computed: ComputedStoreCreator<T, U>) => {
    const [storeCreator, persistKey, persisted] = Array.isArray(storeCreatorArg) ? storeCreatorArg : [storeCreatorArg];

    let store = {} as T;
    let computedStore = {} as U;

    const subscribers = new Set<SubscribeCallback<T>>();
    const computedSubscribers = new Set<SubscribeCallback<U>>();

    const setter = (setStateAction: SetStateAction<T>) => {
        const isFunction = typeof setStateAction === 'function';
        const updated = isFunction ? (setStateAction as FunctionalParam<T>)(store) : (setStateAction as ObjectParam<T>);
        store = merge(store as object, updated);
        computedStore = computed(store);
        subscribers.forEach(callback => callback(store));
        computedSubscribers.forEach(callback => callback(computedStore));
    };

    store = storeCreator(setter);
    computedStore = computed(store);

    if (persistKey && persisted) store = merge(store as object, persisted);

    const mainStoreApi = {
        getState: () => store,
        subscribe: (callback: SubscribeCallback<T>) => {
            subscribers.add(callback);
            return () => subscribers.delete(callback);
        },
        persistKey,
    };
    const computedStoreApi = {
        getState: () => computedStore,
        subscribe: (callback: SubscribeCallback<U>) => {
            computedSubscribers.add(callback);
            return () => computedSubscribers.delete(callback);
        },
    };
    return [mainStoreApi, computedStoreApi] as [Store<T>, Store<U>];
};

const createSimple = (<T, S extends T>(storeCreator: StoreCreator<T, S>) => {
    const store = createStore(storeCreator);
    const hook = (store: Store<T>, selector?: Selector<T, S>) => useStore(store, selector);
    return hook.bind(null, store);
}) as CreateSimple;

const createWithComputed = (<T, U, S extends T, V extends U>(
    storeCreator: StoreCreator<T, S>,
    computed: ComputedStoreCreator<T, U>
) => {
    const [mainStoreApi, computedStoreApi] = createStoreWithComputed(storeCreator, computed);
    const hook = (store: Store<T>, selector?: Selector<T, S>) => useStore(store, selector);
    const computedHook = (store: Store<U>, selector?: Selector<U, V>) => useComputedStore(store, selector);
    return [hook.bind(null, mainStoreApi), computedHook.bind(null, computedStoreApi)];
}) as CreateWithComputed;

export function create<T, S extends T>(storeCreator: StoreCreator<T, S>): UseStore<Store<T>>;
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

export const persist = <T, U>(
    storeCreator: StoreCreatorItem<T, U>,
    name: string
): [StoreCreatorItem<T, U>, string, T] => {
    const stored = localStorage.getItem(name) ? (JSON.parse(localStorage.getItem(name) as string) as T) : ({} as T);
    return [storeCreator, name, stored];
};
