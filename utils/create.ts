import {
    ComputedStoreCreator, CreateSimple, CreateWithComputed,
    FunctionalParam,
    ObjectParam, Selector,
    SetStateAction,
    Store,
    StoreCreator,
    SubscribeCallback
} from "../types";
import { useStore } from "../hooks/useStore";
import { useComputedStore } from "../hooks/useComputedStore";
import { merge } from "./merge";

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

export const createSimple = (<T, S extends T = T>(storeCreator: StoreCreator<T, S>) => {
    const store = createStore(storeCreator);
    const hook = (store: Store<T>, selector?: Selector<T, S>) => useStore(store, selector);
    return hook.bind(null, store);
}) as CreateSimple;

export const createWithComputed = (<T, U, S extends T, V extends U>(
    storeCreator: StoreCreator<T, S>,
    computed: ComputedStoreCreator<T, U>
) => {
    const [mainStoreApi, computedStoreApi] = createStoreWithComputed(storeCreator, computed);
    const hook = (store: Store<T>, selector?: Selector<T, S>) => useStore(store, selector);
    const computedHook = (store: Store<U>, selector?: Selector<U, V>) => useComputedStore(store, selector);
    return [hook.bind(null, mainStoreApi), computedHook.bind(null, computedStoreApi)];
}) as CreateWithComputed;
