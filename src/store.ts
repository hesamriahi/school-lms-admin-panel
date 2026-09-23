// src/store.ts
import { configureStore, createSlice } from '@reduxjs/toolkit';


const homeSlice = createSlice({
  name : "homeSlice",
  initialState : {
    settings : {},
    totals : {},
    //permissions: [],
    //coreSettings: {}
  },
  reducers : {
    updateHomeSlice : (state, action) => {
      state.settings = action.payload.settings;
      state.totals = action.payload.totals;
      //state.permissions = action.payload.permissions;
      //state.coreSettings = action.payload.coreSettings;
    }
  }
})



// Configure store
const store = configureStore({
  reducer: {
    homeSlice: homeSlice.reducer,
  },
});

export const {updateHomeSlice} = homeSlice.actions

export default store;