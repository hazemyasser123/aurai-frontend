import { configureStore, combineReducers } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/es/storage";
import authReducer from "../slices/authSlice";

// 1. Combine reducers (even if we only have auth right now)
const rootReducer = combineReducers({
  auth: authReducer,
});

// 2. Configure persistence
const persistConfig = {
  key: "root",
  storage,
  whitelist: ["auth"], // Now this matches the 'auth' key in rootReducer
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ["persist/PERSIST", "persist/REHYDRATE"],
      },
    }),
});

export const persistor = persistStore(store);
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
