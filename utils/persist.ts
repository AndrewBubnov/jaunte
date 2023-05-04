import {StoreCreatorItem} from "../types";

export const persist = <T, U>(
    storeCreator: StoreCreatorItem<T, U>,
    name: string
): [StoreCreatorItem<T, U>, string, T] => {
    const stored = localStorage.getItem(name);
    const parsed = stored ? JSON.parse(stored) : {};
    return [storeCreator, name, parsed];
};
