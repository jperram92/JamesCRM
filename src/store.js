import { configureStore } from '@reduxjs/toolkit';
import authReducer from './store/slices/authSlice';
import companyReducer from './slices/companySlice';
import contactReducer from './slices/contactSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    companies: companyReducer,
    contacts: contactReducer,
  },
});

export default store;
