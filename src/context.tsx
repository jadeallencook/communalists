import { createContext, useState } from 'react';

export interface ShoppingCartItemInterface {
	item: string;
	quantity: number;
	listing: string;
}

interface GlobalContextInterface {
	addToShoppingCart: (item: ShoppingCartItemInterface) => void;
	shoppingCartItems: { [key: string]: ShoppingCartItemInterface };
}

const GlobalContext = createContext<GlobalContextInterface>(null);

export const GlobalProvider = ({ children }) => {
	const [shoppingCartItems, setShoppingCartItems] = useState({});
	const addToShoppingCart = ({
		item,
		quantity,
		listing,
	}: ShoppingCartItemInterface) =>
		setShoppingCartItems((prev) => ({
			...prev,
			[listing]: {
				item,
				quantity: prev[listing] ? prev[listing].quantity + quantity : 1,
				listing,
			},
		}));

	return (
		<GlobalContext.Provider
			value={{ shoppingCartItems, addToShoppingCart }}
		>
			{children}
		</GlobalContext.Provider>
	);
};

export default GlobalContext;
