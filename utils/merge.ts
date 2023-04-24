import {ComputedStoreCreator} from "../types";

export const merge = (...args: object[]) => Object.assign({}, ...args);

export const mergeComputed = <T, S>(store: T, computed: ComputedStoreCreator<T, S>) =>
    merge(store as object, computed(store) as object);
