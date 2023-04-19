import {useDebugValue, useSyncExternalStore} from 'react';
import {
    Bound,
    ComputedStoreCreator,
    FunctionalParam, HookReturnType, ObjectParam,
    Selector,
    SetStateAction, Store,
    StoreCreator,
    StoreCreatorItem,
    SubscribeCallback
} from "./types";

const merge = (...args: object[]) => Object.assign({}, ...args);

const extractData = <T extends object>(debugValue: T) => (Object.keys(debugValue) as Array<keyof T>)
    .filter(key => typeof debugValue[key] !== 'function')
    .reduce((acc,cur) => {
        acc[cur] = debugValue[cur];
        return acc;
    }, {} as T);

const useStore = <T extends object>(bound: Bound<T>, selector?: Selector<T>): HookReturnType<T> => {
    const [store, computed] = bound;
    const {getState, subscribe, persistKey} = store;

    if (persistKey) localStorage.setItem(persistKey, JSON.stringify(store.getState()));

    const snapshot = useSyncExternalStore(subscribe, getState);
    const united = computed ? merge(snapshot, computed(snapshot)) : snapshot;

    const returnValue = selector ? selector(united) : united;
    useDebugValue(returnValue, extractData);
    return returnValue;
};

const createStore = <T extends object>(storeCreatorArg: StoreCreator<T>): Store<T> => {
    const [storeCreator, persistKey, persisted] = Array.isArray(storeCreatorArg) ? storeCreatorArg : [storeCreatorArg];

    let store = {} as T;

    const subscribers = new Set<SubscribeCallback<T>>();

    const setter = (setStateAction: SetStateAction<T>) => {
        const isFunction = typeof setStateAction === 'function';
        const updated = isFunction ? (setStateAction as FunctionalParam<T>)(store) : (setStateAction as ObjectParam<T>);
        store = merge(store, updated);
        subscribers.forEach(callback => callback(store));
    };

    store = storeCreator(setter);

    if (persistKey && persisted) store = merge(store, persisted);

    return {
        getState: () => store,
        subscribe: callback => {
            subscribers.add(callback);
            return () => subscribers.delete(callback);
        },
        persistKey,
    };
};

export const create = <T extends object>(storeCreator: StoreCreator<T>, computed?: ComputedStoreCreator<T>) => {
    const store = createStore(storeCreator);
    const hook = (bound: Bound<T>, selector?: Selector<T>) => useStore(bound, selector);
    return hook.bind(null, [store, computed]);
};

export const persist = <T extends object>(
    storeCreator: StoreCreatorItem<T>,
    name: string
): [StoreCreatorItem<T>, string, T] => {
    const stored = localStorage.getItem(name) ? (JSON.parse(localStorage.getItem(name) as string) as T) : ({} as T);
    return [storeCreator, name, stored];
};
