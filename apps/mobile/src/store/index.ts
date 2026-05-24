import { configureStore, createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface WalletState {
  accountId: string | null;
  hbarBalance: number | null;
  connected: boolean;
  hnetBalance: number;
  hecBalance: number;
}

const walletSlice = createSlice({
  name: 'wallet',
  initialState: {
    accountId: null,
    hbarBalance: null,
    connected: false,
    hnetBalance: 0,
    hecBalance: 0,
  } as WalletState,
  reducers: {
    setWallet(state, action: PayloadAction<{ accountId: string; hbarBalance: number }>) {
      state.accountId = action.payload.accountId;
      state.hbarBalance = action.payload.hbarBalance;
      state.connected = true;
    },
    updateBalance(state, action: PayloadAction<{ hbar?: number; hnet?: number; hec?: number }>) {
      if (action.payload.hbar !== undefined) state.hbarBalance = action.payload.hbar;
      if (action.payload.hnet !== undefined) state.hnetBalance = action.payload.hnet;
      if (action.payload.hec !== undefined) state.hecBalance = action.payload.hec;
    },
    disconnectWallet(state) {
      state.accountId = null;
      state.hbarBalance = null;
      state.connected = false;
      state.hnetBalance = 0;
      state.hecBalance = 0;
    },
  },
});

interface EnergyState {
  listings: unknown[];
  myTrades: unknown[];
  loading: boolean;
}

const energySlice = createSlice({
  name: 'energy',
  initialState: { listings: [], myTrades: [], loading: false } as EnergyState,
  reducers: {
    setListings(state, action: PayloadAction<unknown[]>) {
      state.listings = action.payload;
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
  },
});

export const { setWallet, updateBalance, disconnectWallet } = walletSlice.actions;
export const { setListings } = energySlice.actions;

export const store = configureStore({
  reducer: {
    wallet: walletSlice.reducer,
    energy: energySlice.reducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
