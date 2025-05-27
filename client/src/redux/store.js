
import { configureStore } from "@reduxjs/toolkit";
import { openTabs } from "./features";

import { EmpApi } from './service'
import { setupListeners } from '@reduxjs/toolkit/query'

export const store = configureStore({
    reducer: {
        openTabs,
      
        [EmpApi.reducerPath]: EmpApi.reducer,
     
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat([
            
            EmpApi.middleware,
             ]
        ),
});

setupListeners(store.dispatch);
