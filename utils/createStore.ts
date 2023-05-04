import {
    ComputedFn,
    FunctionalParam,
    Joint,
    ObjectParam, Selector,
    SetStateAction,
    StoreCreator,
    SubscribeCallback
} from "../types";
import { merge } from "./merge";

export const createStore = <T, U = never>(storeCreatorArg: StoreCreator<T>, computed?: U) => {
    const [storeCreator, persistKey, persisted] = Array.isArray(storeCreatorArg) ? storeCreatorArg : [storeCreatorArg];

    let store = {} as Joint<T, U>;
    const subscribers = new Set<SubscribeCallback<T>>();
    const usedComputed: Array<keyof U> = [];
    const computedKeys = Object.keys(computed || {}) as Array<keyof U>;
    const setter = (setStateAction: SetStateAction<T>) => {
        const isFunction = typeof setStateAction === 'function';
        const updated = isFunction ? (setStateAction as FunctionalParam<T>)(store) : (setStateAction as ObjectParam<T>);
        store = merge(store, updated);
        if (computed) {
            usedComputed.forEach(key => {
                store = merge(store, {
                    [key]: (computed[key] as ComputedFn<T, U>)(store),
                });
            });
        }
        subscribers.forEach(callback => callback(store));
    };
    const getComputedSelector = (selector: Selector<T & U, (T & U)[keyof U | keyof T]>) => {
        if (!computed) return;
        const selected = selector(computed as T & U);

        if (typeof selected === 'function') {
            const current = computedKeys.find(key => (computed[key] as ComputedFn<T, U>) === selected);
            if (current && !usedComputed.includes(current)) usedComputed.push(current);
        }
    };

    store = storeCreator(setter) as Joint<T, U>;

    if (computed) {
        computedKeys.forEach(key => {
            store = merge(store, { [key]: (computed[key] as ComputedFn<T, U>)(store) });
        });
    }

    if (persistKey && persisted) store = merge(store, persisted);

    return {
        getState: () => store,
        subscribe: (callback: SubscribeCallback<T>) => {
            subscribers.add(callback);
            return () => subscribers.delete(callback);
        },
        getComputedSelector,
        persistKey,
    };
};

