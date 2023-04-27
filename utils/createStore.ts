import {
    ComputedStoreCreator,
    FunctionalParam,
    ObjectParam,
    SetStateAction,
    StoreCreator,
    SubscribeCallback
} from "../types";
import {merge, mergeComputed} from "./merge";

export const createStore = <T, U>(storeCreatorArg: StoreCreator<T>, computed?: ComputedStoreCreator<T, U>) => {
    const [storeCreator, persistKey, persisted] = Array.isArray(storeCreatorArg) ? storeCreatorArg : [storeCreatorArg];

    let store = {} as T;
    const subscribers = new Set<SubscribeCallback<T>>();

    const setter = (setStateAction: SetStateAction<T>) => {
        const isFunction = typeof setStateAction === 'function';
        const updated = isFunction ? (setStateAction as FunctionalParam<T>)(store) : (setStateAction as ObjectParam<T>);
        store = merge(store, updated);
        if (computed) store = mergeComputed(store, computed);
        subscribers.forEach(callback => callback(store));
    };

    store = computed ? mergeComputed(storeCreator(setter), computed) : storeCreator(setter);

    if (persistKey && persisted) store = merge(store, persisted);

    return {
        getState: () => store,
        subscribe: (callback: SubscribeCallback<T>) => {
            subscribers.add(callback);
            return () => subscribers.delete(callback);
        },
        persistKey,
    };
};
