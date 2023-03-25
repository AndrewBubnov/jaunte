export type ObjectParam<S> = Partial<S>;
export type FunctionalParam<S> = (arg: S) => Partial<S>;
export type SetStateAction<S> = ObjectParam<S> | FunctionalParam<S>;
export type StoreCreatorItem<T> = (set: (action: SetStateAction<T>) => void) => T;
export type StoreCreator<T> = StoreCreatorItem<T> | [StoreCreatorItem<T>, string, T];
export type ComputedStoreCreator<T> = (arg: T) => Partial<T>;
export type Bound<T> = [Store<T>, ComputedStoreCreator<T> | undefined];
export type SubscribeCallback<T> = (arg: T) => void;
export type Selector <T> = (arg: T) => T[keyof T];

export interface Store<T> {
    getState: () => T;
    subscribe: (callback: SubscribeCallback<T>) => () => void;
    persistKey?: string;
}
