Small and performant implementation of the React state management idea,
inspired by well-known Zustand library (https://github.com/pmndrs/zustand) approach.
Jaunte, however, can also easily handle computed values out of the box with
no performance loss.

Basic usage: create and export a hook, which is returned by `create` function.
Store creator function, which takes the built-in setter `set` and returns an object
with data and actions.
```
export const useDrinkStore = create<DrinkStore>(set => ({
    tea: 1,
    coffee: 12,
    moreTea: () => set(state => ({ tea: state.tea + 1 })),
    removeTea: () => set({ tea: 0 }),
    moreCoffee: () => set(state => ({ coffee: state.coffee + 1 })),
}));
```

You can than use this hook in React components, getting store content either using
destructuring of the hook return value:

`const { tea, coffee } = useDrinkStore();`

or using selector function like:

`const coffee = useDrinkStore(store => store.coffee);`

You can create as many stores as you need to separate data and logic.

To use a computed value, `create` function can take a second optional
argument - a function, taking the store as argument and returning object with computed values:
```
export const useDrinkStore = create<DrinkStore>((set) => ({
        tea: 1,
        coffee: 12,
        moreTea: () => set((state) => ({tea: state.tea + 1})),
        removeTea: () => set({ tea: 0 }),
        moreCoffee: () => set((state) => ({coffee: state.coffee + 1})),
    }),
        (state) => ({
        allDrinks: state.tea + state.coffee,
    })
)
```
And finally, to persist store values to browser local storage, first `create` argument
can be wrapped in `persist` function, also provided by Jaunte. Persist function takes the
store creator function and unique key for save:
```
export const useDrinkStore = create<DrinkStore>(persist((set) => ({
        tea: 1,
        coffee: 12,
        moreTea: () => set((state) => ({tea: state.tea + 1})),
        removeTea: () => set({ tea: 0 }),
        moreCoffee: () => set((state) => ({coffee: state.coffee + 1})),
    }), 'drinks'),
        (state) => ({
        allDrinks: state.tea + state.coffee,
    })
)
```
Jaunte is built on Typescript, so can be used without additional type dev-dependencies. 
