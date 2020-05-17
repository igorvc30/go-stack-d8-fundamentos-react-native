import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';
import api from 'src/services/api';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Product): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      const products = await AsyncStorage.getItem('@D8:products');
      if (products) {
        const parsedProducts: Array<Product> = JSON.parse(products);
        setProducts(parsedProducts);
      }
    }

    loadProducts();
  }, []);

  const addToCart = useCallback(
    async (product: Omit<Product, 'quantity'>) => {
      const foundedProduct = products.find(p => p.id == product.id);

      if (!foundedProduct) {
        const updatedList = [...products, { ...product, quantity: 1 }];
        setProducts(updatedList);
        await AsyncStorage.setItem('@D8:products', JSON.stringify(updatedList));
      } else {
        const filteredList = products.filter(p => p.id !== product.id);
        const updatedQuantity = {
          ...foundedProduct,
          quantity: foundedProduct.quantity + 1,
        };
        const updatedList = [...filteredList, updatedQuantity];
        setProducts(updatedList);
        await AsyncStorage.setItem('@D8:products', JSON.stringify(updatedList));
      }
    },
    [products],
  );

  const increment = useCallback(
    async id => {
      const foundedProduct = products.find(p => p.id == id);
      const filteredList = products.filter(p => p.id !== id);
      const updatedQuantity = {
        ...foundedProduct,
        quantity: foundedProduct && foundedProduct.quantity + 1,
      };
      const updatedList = [...filteredList, updatedQuantity];
      setProducts(updatedList);
      await AsyncStorage.setItem('@D8:products', JSON.stringify(updatedList));
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      const foundedProduct = products.find(p => p.id == id);
      const filteredList = products.filter(p => p.id !== id);
      const updatedQuantity = {
        ...foundedProduct,
        quantity: foundedProduct && foundedProduct.quantity - 1,
      };
      if (updatedQuantity.quantity === 0) {
        setProducts(filteredList);
        await AsyncStorage.setItem(
          '@D8:products',
          JSON.stringify(filteredList),
        );
      } else {
        const updatedList = [...filteredList, updatedQuantity];
        setProducts(updatedList);
        await AsyncStorage.setItem('@D8:products', JSON.stringify(updatedList));
      }
    },
    [products],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
