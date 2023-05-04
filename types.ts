export type Computed<T, U> = {
    [K in keyof U]: (state: T) => U[K];
};
export type ObjectParam<S> = Partial<S>;
export type FunctionalParam<S> = (arg: S) => Partial<S>;
export type SetStateAction<S> = ObjectParam<S> | FunctionalParam<S>;
export type StoreCreatorItem<T, S> = (set: (action: SetStateAction<T>) => void) => S;
export type StoreCreator<T, S = T> = StoreCreatorItem<T, S> | [StoreCreatorItem<T, S>, string, T];
export type SubscribeCallback<T> = (arg: T) => void;
export type Selector<T, S> = (state: T) => S;
export type Inferred<S> = S extends { getState: () => infer T } ? T : never;
export type UseStore<T extends Store<any>> = {
    (): Inferred<T>;
    <S>(selector?: Selector<Inferred<T>, S>): S;
};
export type ComputedReturn<T> = { [K in keyof T]: T[K] extends (...args: any) => any ? ReturnType<T[K]> : never };
export type ComputedFn<T, U> = Selector<T, U[keyof U]>;
export type Joint<T, U> = T & ComputedReturn<U>;
export type CreateSelector<T, U> =
    | Selector<Joint<T, U>, Joint<T, U>>
    | Selector<Joint<T, U>, Joint<T, U>[keyof U | keyof T]>
    | undefined;
export interface Store<T, U = T> {
    getState: () => T & U;
    subscribe: (callback: SubscribeCallback<T>) => () => void;
    getComputedSelector: (fn: Selector<T & U, (T & U)[keyof U | keyof T]>) => void;
    persistKey?: string;
}