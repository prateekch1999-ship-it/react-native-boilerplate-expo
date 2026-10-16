import { configureStore } from '@reduxjs/toolkit';
import { useDispatch, useSelector } from 'react-redux';

import languageReducer, { initialLanguageState } from '@app-store/language.slice';

/**
 * The store is built with state already read out of storage rather than
 * rehydrated into it afterwards.
 *
 * That is deliberate and worth keeping: MMKV and SecureStore both read
 * synchronously, so the first render is already correct. redux-persist would
 * rehydrate a tick later and bring back the flash of the wrong screen —
 * English before Hindi, signed out before signed in — that this setup never
 * has.
 *
 * Add a slice by registering its reducer here, and its `initial*State()` reader
 * alongside in `preloadedState`.
 */
export const store = configureStore({
  reducer: {
    language: languageReducer,
  },
  preloadedState: {
    language: initialLanguageState(),
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

/** Use these, never the untyped `useDispatch` / `useSelector`. */
export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();
