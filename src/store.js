import { configureStore } from '@reduxjs/toolkit';
import authReducer from './store/slices/authSlice';
import companyReducer from './slices/companySlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    companies: companyReducer,
  },
});

export default store;
