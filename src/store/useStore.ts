import { create } from 'zustand';
import { User, Contact, TapEvent } from '../types';

interface StookStore {
  user: User | null;
  contacts: Contact[];
  tapEvents: TapEvent[];
  
  setUser: (user: User) => void;
  addContact: (contact: Contact) => void;
  removeContact: (contactId: string) => void;
  addTapEvent: (event: TapEvent) => void;
  updateUser: (userData: Partial<User>) => void;
}

export const useStore = create<StookStore>((set) => ({
  user: null,
  contacts: [],
  tapEvents: [],
  
  setUser: (user) => set({ user }),
  
  addContact: (contact) => set((state) => ({
    contacts: [...state.contacts, contact]
  })),
  
  removeContact: (contactId) => set((state) => ({
    contacts: state.contacts.filter(c => c.id !== contactId)
  })),
  
  addTapEvent: (event) => set((state) => ({
    tapEvents: [...state.tapEvents, event]
  })),
  
  updateUser: (userData) => set((state) => ({
    user: state.user ? { ...state.user, ...userData } : null
  })),
}));