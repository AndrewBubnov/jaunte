Small and performant implementation of the React state management idea,
inspired by well-known Zustand library (https://github.com/pmndrs/zustand).
The package however able to manage computed values out of the box without any 
lack of performance.
State management for React.

Basic usage: create and export a hook, which is returned by 'create' function.
Pass to it the store creator function,
which returns an object with data and actions.
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
destructuring of all hook return:

`const { tea, coffee } = useDrinkStore();`

or using selector function:

`const coffee = useDrinkStore(store => store.coffee);`

To get access to the computed value, 'create' function can take a second optional
argument - a function, getting the store and returning the computed value object:
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
And finally, to persist store values to browser local storage, first 'create' argument
can be wrapped in 'persist' function, provided by package. Persist function takes the
store creator function and unique key for save:
```
export const useDrinkStore = create<DrinkStore>(persist((set) => ({
        tea: 1,
        coffee: 12,
        moreTea: () => set((state) => ({tea: state.tea + 1})),
        removeTea: () => set({ tea: 0 }),
        moreCoffee: () => set((state) => ({coffee: state.coffee + 1})),
    }), 'animals'),
        (state) => ({
        allDrinks: state.tea + state.coffee,
    })
)
```
