import { useSyncExternalStore } from 'react';
import {
    Create,
    FunctionalParam,
    ObjectParam,
    SetStateAction,
    Store,
    StoreCreator,
    StoreCreatorItem,
    SubscribeCallback
} from "./types";

const merge = (...args: object[]) => Object.assign({}, ...args);

const useStore = <T, S extends T = T>(store: Store<T>, selector?: (state: T) => S) => {
    const { getState, subscribe, persistKey } = store;

    if (persistKey) localStorage.setItem(persistKey, JSON.stringify(store.getState()));
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

export const create = (<T, S extends T>(storeCreator: StoreCreator<T, S>) => {
    const store = createStore(storeCreator);
    const hook = (store: Store<T>, selector?: (state: T) => S) => useStore(store, selector);
    return hook.bind(null, store);
}) as Create;

export const persist = <T, U>(
    storeCreator: StoreCreatorItem<T, U>,
    name: string
): [StoreCreatorItem<T, U>, string, T] => {
    const stored = localStorage.getItem(name) ? (JSON.parse(localStorage.getItem(name) as string) as T) : ({} as T);
    return [storeCreator, name, stored];
};
