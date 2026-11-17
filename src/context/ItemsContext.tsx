import React, { createContext, useContext, useState } from 'react';
import { CampusItem, INITIAL_ITEMS } from '../data/mockItems';

interface ItemsContextType {
  items: CampusItem[];
  toggleSave: (id: string) => void;
  markAsClaimed: (id: string) => void;
  addItem: (newItem: Omit<CampusItem, 'id' | 'isSaved' | 'isClaimed' | 'image'>) => void;
}

const ItemsContext = createContext<ItemsContextType | undefined>(undefined);

// Make sure this path matches the exact image path in your mockItems.ts!
const defaultImg = require('../../assets/images/icon.png');

export function ItemsProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CampusItem[]>(INITIAL_ITEMS);

  const toggleSave = (id: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, isSaved: !item.isSaved } : item
      )
    );
  };

  const markAsClaimed = (id: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, isClaimed: true, isSaved: true } : item
      )
    );
  };

  const addItem = (
    newItem: Omit<CampusItem, 'id' | 'isSaved' | 'isClaimed' | 'image'>
  ) => {
    const createdItem: CampusItem = {
      ...newItem,
      id: Date.now().toString(),
      image: defaultImg,
      isSaved: false,
      isClaimed: false,
    };
    setItems((prev) => [createdItem, ...prev]);
  };

  return (
    <ItemsContext.Provider value={{ items, toggleSave, markAsClaimed, addItem }}>
      {children}
    </ItemsContext.Provider>
  );
}

export const useItems = () => {
  const context = useContext(ItemsContext);
  if (!context) throw new Error('useItems must be used within ItemsProvider');
  return context;
};