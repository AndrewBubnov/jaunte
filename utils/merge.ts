import {ComputedStoreCreator} from "../types";

export const merge = (...args: unknown[]) => Object.assign({}, ...args);

export const mergeComputed = <T, S>(store: T, computed: ComputedStoreCreator<T, S>) =>
    merge(store, computed(store));
