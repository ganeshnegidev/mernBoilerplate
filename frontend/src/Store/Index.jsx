import {combineReducers, configureStore} from "@reduxjs/toolkit";
import userSlice from './UserSlice';
import {
    persistStore,
    persistReducer,
    FLUSH,
    REHYDRATE,
    PAUSE,
    PERSIST,
    PURGE,
    REGISTER,
  } from 'redux-persist'

import storage from "redux-persist/lib/storage"
import TodoSlice from "./TodoSlice";

const rootReducer = combineReducers({
    user: userSlice, 
    todo: TodoSlice
})

const persistConfig = {
    key: "root",
    version: 1,
    storage // browser local storage  by default value
}

const persistedReducer = persistReducer(persistConfig,rootReducer);

const store = configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) => 
        getDefaultMiddleware({
            serializableCheck: {
              ignoreActions: [FLUSH,REHYDRATE,PAUSE, PERSIST, PURGE, REGISTER]
            }
        })
});

export default store;