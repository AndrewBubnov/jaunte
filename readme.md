This branch contains implementation with lazy computed values. This means that each
computed is re-calculated with new state values only in case if this value is called using the selector
function somewhere in components. In case if computed value is unused in app, it's not get re-calculated
to improve performance. 

To achieve that computed values in this implementation should only be selected from the store only using 
the selector function, not destructuring.
There is also a different syntax of computed values declaration is used. Here it's an object, where keys 
represent computed values and object keys are calculating functions.
To create the type for computed values, which is passed to `create` function, use the `Computed` generic
type, also provided by Jaunte. This type consumes two parameters: basic store type and type for computed
values type designation.
```
interface DrinkStore {
	tea: number;
	coffee: number;
	moreTea: () => void;
	removeTea: () => void;
	moreCoffee: () => void;
}

interface ComputedDrinkStore {
	allDrinks: number;
}

export const useDrinkStore = create<DrinkStore, Computed<DrinkStore, ComputedDrinkStore>>((set) => ({
		tea: 1,
		coffee: 12,
		moreTea: () => set((state) => ({tea: state.tea + 1})),
		removeTea: () => set({ tea: 0 }),
		moreCoffee: () => set((state) => ({coffee: state.coffee + 1})),
	}),
	{
		allDrinks: state => state.tea + state.coffee,
		doubleDrinks: state => (state.tea + state.coffee) * 2,
	}
)
```
