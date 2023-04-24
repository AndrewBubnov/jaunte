export type ObjectParam<S> = Partial<S>;
export type FunctionalParam<S> = (arg: S) => Partial<S>;
export type SetStateAction<S> = ObjectParam<S> | FunctionalParam<S>;
export type StoreCreatorItem<T, U> = (set: (action: SetStateAction<T>) => void) => U;
export type StoreCreator<T, U = T> = StoreCreatorItem<T, U> | [StoreCreatorItem<T, U>, string, T];
export type ComputedStoreCreator<T, S> = (arg: T) => S;
export type SubscribeCallback<T> = (arg: T) => void;
export type InferredSelector<T, S> = (state: Inferred<T>) => S;
export type Selector<T, S> = (state: T) => S;
export type Inferred<S> = S extends { getState: () => infer T } ? T : never;
export type UseStore<T extends Store<unknown>> = {
    (): Inferred<T>;
    <S>(selector?: InferredSelector<T, S>): S;
} & T;

export type CreateSimple = {
    <T>(creator: StoreCreator<T>): UseStore<Store<T>>;
};
export type CreateWithComputed = {
    <T, S>(creator: StoreCreator<T>, computed?: ComputedStoreCreator<T, S>): UseStore<Store<T & S>>;
};

export interface Store<T> {
    getState: () => T;
    subscribe: (callback: SubscribeCallback<T>) => () => void;
    persistKey?: string;
}
