import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api/deals';
const QUOTES_API_URL = 'http://localhost:5000/api/quotes';

// Get all deals
export const getDeals = createAsyncThunk(
  'deals/getAll',
  async (_, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState();
      const config = {
        headers: {
          Authorization: `Bearer ${auth.token}`,
        },
      };

      const response = await axios.get(API_URL, config);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message
      );
    }
  }
);

// Get deal by ID
export const getDealById = createAsyncThunk(
  'deals/getById',
  async (id, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState();
      const config = {
        headers: {
          Authorization: `Bearer ${auth.token}`,
        },
      };

      const response = await axios.get(`${API_URL}/${id}`, config);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message
      );
    }
  }
);

// Create deal
export const createDeal = createAsyncThunk(
  'deals/create',
  async (dealData, { rejectWithValue, getState }) => {
    try {
      console.log('dealSlice - createDeal - Input Data:', dealData);

      const { auth } = getState();
      console.log('dealSlice - createDeal - Auth State:', auth);

      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${auth.token}`,
        },
      };

      console.log('dealSlice - createDeal - Request Config:', config);
      console.log('dealSlice - createDeal - API URL:', API_URL);

      const response = await axios.post(API_URL, dealData, config);
      console.log('dealSlice - createDeal - Response:', response.data);
      return response.data;
    } catch (error) {
      console.error('dealSlice - createDeal - Error:', error);
      console.error('dealSlice - createDeal - Error Response:', error.response);
      return rejectWithValue(
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message
      );
    }
  }
);

// Update deal
export const updateDeal = createAsyncThunk(
  'deals/update',
  async ({ id, dealData }, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState();
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${auth.token}`,
        },
      };

      const response = await axios.put(`${API_URL}/${id}`, dealData, config);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message
      );
    }
  }
);

// Delete deal
export const deleteDeal = createAsyncThunk(
  'deals/delete',
  async (id, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState();
      const config = {
        headers: {
          Authorization: `Bearer ${auth.token}`,
        },
      };

      await axios.delete(`${API_URL}/${id}`, config);
      return id;
    } catch (error) {
      return rejectWithValue(
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message
      );
    }
  }
);

// Get deals by company
export const getDealsByCompany = createAsyncThunk(
  'deals/getByCompany',
  async (companyId, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState();
      const config = {
        headers: {
          Authorization: `Bearer ${auth.token}`,
        },
      };

      const response = await axios.get(`${API_URL}/company/${companyId}`, config);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message
      );
    }
  }
);

// Update deal status
export const updateDealStatus = createAsyncThunk(
  'deals/updateStatus',
  async ({ id, status }, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState();
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${auth.token}`,
        },
      };

      const response = await axios.put(
        `${API_URL}/${id}/status`,
        { status },
        config
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message
      );
    }
  }
);

// Generate PDF
export const generatePdf = createAsyncThunk(
  'deals/generatePdf',
  async (id, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState();
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${auth.token}`,
        },
      };

      const response = await axios.post(
        `${QUOTES_API_URL}/${id}/generate-pdf`,
        {},
        config
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message
      );
    }
  }
);

// Send signature request
export const sendSignatureRequest = createAsyncThunk(
  'deals/sendSignature',
  async ({ id, recipientEmail, recipientName }, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState();
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${auth.token}`,
        },
      };

      const response = await axios.post(
        `${QUOTES_API_URL}/${id}/send-signature`,
        { recipientEmail, recipientName },
        config
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message
      );
    }
  }
);

// Verify signature token
export const verifySignatureToken = createAsyncThunk(
  'deals/verifySignature',
  async (token, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${QUOTES_API_URL}/verify-signature/${token}`
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message
      );
    }
  }
);

// Process signature
export const processSignature = createAsyncThunk(
  'deals/processSignature',
  async ({ token, signatureData }, { rejectWithValue }) => {
    try {
      const config = {
        headers: {
          'Content-Type': 'application/json',
        },
      };

      const response = await axios.post(
        `${QUOTES_API_URL}/process-signature/${token}`,
        signatureData,
        config
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message
      );
    }
  }
);

const initialState = {
  deals: [],
  deal: null,
  companyDeals: [],
  loading: false,
  error: null,
  success: false,
  pdfUrl: null,
  signatureToken: null,
  signatureData: null,
};

const dealSlice = createSlice({
  name: 'deals',
  initialState,
  reducers: {
    resetDealState: (state) => {
      state.loading = false;
      state.error = null;
      state.success = false;
    },
    clearDealDetail: (state) => {
      state.deal = null;
    },
    clearPdfUrl: (state) => {
      state.pdfUrl = null;
    },
    clearSignatureData: (state) => {
      state.signatureToken = null;
      state.signatureData = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Get all deals
      .addCase(getDeals.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getDeals.fulfilled, (state, action) => {
        state.loading = false;
        state.deals = action.payload;
      })
      .addCase(getDeals.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Get deal by ID
      .addCase(getDealById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getDealById.fulfilled, (state, action) => {
        state.loading = false;
        state.deal = action.payload;
      })
      .addCase(getDealById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Create deal
      .addCase(createDeal.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(createDeal.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.deals = [action.payload, ...state.deals];
      })
      .addCase(createDeal.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update deal
      .addCase(updateDeal.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(updateDeal.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.deal = action.payload;
        state.deals = state.deals.map((deal) =>
          deal._id === action.payload._id ? action.payload : deal
        );
      })
      .addCase(updateDeal.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Delete deal
      .addCase(deleteDeal.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteDeal.fulfilled, (state, action) => {
        state.loading = false;
        state.deals = state.deals.filter((deal) => deal._id !== action.payload);
        state.success = true;
      })
      .addCase(deleteDeal.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Get deals by company
      .addCase(getDealsByCompany.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getDealsByCompany.fulfilled, (state, action) => {
        state.loading = false;
        state.companyDeals = action.payload;
      })
      .addCase(getDealsByCompany.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update deal status
      .addCase(updateDealStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(updateDealStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.deal = action.payload;
        state.deals = state.deals.map((deal) =>
          deal._id === action.payload._id ? action.payload : deal
        );
      })
      .addCase(updateDealStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Generate PDF
      .addCase(generatePdf.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(generatePdf.fulfilled, (state, action) => {
        state.loading = false;
        state.pdfUrl = action.payload.pdfUrl;
      })
      .addCase(generatePdf.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Send signature request
      .addCase(sendSignatureRequest.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(sendSignatureRequest.fulfilled, (state) => {
        state.loading = false;
        state.success = true;
      })
      .addCase(sendSignatureRequest.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Verify signature token
      .addCase(verifySignatureToken.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifySignatureToken.fulfilled, (state, action) => {
        state.loading = false;
        state.signatureToken = action.payload;
      })
      .addCase(verifySignatureToken.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Process signature
      .addCase(processSignature.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(processSignature.fulfilled, (state) => {
        state.loading = false;
        state.success = true;
      })
      .addCase(processSignature.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const {
  resetDealState,
  clearDealDetail,
  clearPdfUrl,
  clearSignatureData,
} = dealSlice.actions;

export default dealSlice.reducer;
