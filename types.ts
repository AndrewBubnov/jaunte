type Selector<T, S> = (state: Inferred<T>) => S;
export type ObjectParam<S> = Partial<S>;
export type FunctionalParam<S> = (arg: S) => Partial<S>;
export type SetStateAction<S> = ObjectParam<S> | FunctionalParam<S>;
export type StoreCreatorItem<T, U> = (set: (action: SetStateAction<T>) => void) => U;
export type StoreCreator<T, U = T> = StoreCreatorItem<T, U> | [StoreCreatorItem<T, U>, string, T];
export type ComputedStoreCreator<T> = (arg: T) => Partial<T>;
export type Bound<T> = [Store<T>, ComputedStoreCreator<T>];
export type SubscribeCallback<T> = (arg: T) => void;
export type Inferred<S> = S extends { getState: () => infer T } ? T : never;
export type UseStore<T extends Store<unknown>> = {
    (): Inferred<T>;
    <S>(selector?: Selector<T, S>): S;
} & T;
export type CreateSimple = {
    <T>(creator: StoreCreator<T>): UseStore<Store<T>>;
};
export type CreateWithComputed = {
    <T>(creator: StoreCreator<T>, computed?: ComputedStoreCreator<T>): [UseStore<Store<T>>, UseStore<Store<T>>];
};

export interface Store<T> {
    getState: () => T;
    subscribe: (callback: SubscribeCallback<T>) => () => void;
    persistKey?: string;
}
