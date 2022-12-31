import { createContext, useState } from 'react';

export interface ShoppingCartItemInterface {
	item: string;
	quantity: number;
	listing: string;
}

interface GlobalContextInterface {
	addToShoppingCart: (item: ShoppingCartItemInterface) => void;
	shoppingCartItems: { [key: string]: ShoppingCartItemInterface };
	removeFromShoppingCart: (listing: string) => void;
}

const GlobalContext = createContext<GlobalContextInterface>(null);

export const GlobalProvider = ({ children }) => {
	const [shoppingCartItems, setShoppingCartItems] = useState({});
	const addToShoppingCart = ({
		item,
		quantity,
		listing,
	}: ShoppingCartItemInterface) =>
		setShoppingCartItems((prev) => {
			let prevItem = prev[listing];
			if (prevItem) {
				prevItem = {
					...prevItem,
					quantity: prevItem.quantity + quantity,
				};
			} else {
				prevItem = { item, quantity: 1, listing };
			}

			return { ...prev, [listing]: prevItem };
		});
	const removeFromShoppingCart = (listing: string) =>
		setShoppingCartItems((prev) => {
			let prevItem = prev[listing];
			if (prevItem && prevItem.quantity === 1) {
				delete prev[listing];
				return { ...prev };
			} else if (prevItem) {
				prevItem = { ...prevItem, quantity: prevItem.quantity - 1 };
				return { ...prev, [listing]: prevItem };
			} else {
				return { ...prev };
			}
		});

	return (
		<GlobalContext.Provider
			value={{
				shoppingCartItems,
				addToShoppingCart,
				removeFromShoppingCart,
			}}
		>
			{children}
		</GlobalContext.Provider>
	);
};

export default GlobalContext;
