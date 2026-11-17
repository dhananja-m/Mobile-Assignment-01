import React, { createContext, useContext, useState } from 'react';
import { ImageSourcePropType } from 'react-native';
import { CampusItem, INITIAL_ITEMS } from '../data/mockItems';

interface NewItemInput extends Omit<CampusItem, 'id' | 'isSaved' | 'isClaimed' | 'image'> {
  imageUri?: string | null;
}

interface UpdateItemInput extends Omit<CampusItem, 'isSaved' | 'isClaimed' | 'image'> {
  imageUri?: string | null;
}

interface ItemsContextType {
  items: CampusItem[];
  toggleSave: (id: string) => void;
  markAsClaimed: (id: string) => void;
  addItem: (newItem: NewItemInput) => void;
  updateItem: (updatedItem: UpdateItemInput) => void;
  deleteItem: (id: string) => void;
}

const ItemsContext = createContext<ItemsContextType | undefined>(undefined);

// Make sure this path matches your working path in mockItems.ts!
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

  const addItem = ({ imageUri, ...rest }: NewItemInput) => {
    const imageSource: ImageSourcePropType = imageUri
      ? { uri: imageUri }
      : defaultImg;

    const createdItem: CampusItem = {
      ...rest,
      id: Date.now().toString(),
      image: imageSource,
      isSaved: false,
      isClaimed: false,
    };
    setItems((prev) => [createdItem, ...prev]);
  };

  const updateItem = ({ id, imageUri, ...rest }: UpdateItemInput) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        return {
          ...item,
          ...rest,
          image: imageUri ? { uri: imageUri } : item.image,
        };
      })
    );
  };

  const deleteItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <ItemsContext.Provider
      value={{
        items,
        toggleSave,
        markAsClaimed,
        addItem,
        updateItem,
        deleteItem,
      }}
    >
      {children}
    </ItemsContext.Provider>
  );
}

export const useItems = () => {
  const context = useContext(ItemsContext);
  if (!context) throw new Error('useItems must be used within ItemsProvider');
  return context;
};