import React, { createContext, useState, useContext } from 'react';
import { INITIAL_ITEMS, CampusItem } from '../data/mockItems';

interface ItemsContextType {
  items: CampusItem[];
  toggleSave: (id: string) => void;
  markAsClaimed: (id: string) => void;
}

const ItemsContext = createContext<ItemsContextType | undefined>(undefined);

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

  return (
    <ItemsContext.Provider value={{ items, toggleSave, markAsClaimed }}>
      {children}
    </ItemsContext.Provider>
  );
}

export const useItems = () => {
  const context = useContext(ItemsContext);
  if (!context) throw new Error('useItems must be used within ItemsProvider');
  return context;
};