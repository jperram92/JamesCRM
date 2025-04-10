import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api/companies';

// Get all companies
export const getCompanies = createAsyncThunk(
  'companies/getAll',
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

// Get company by ID
export const getCompanyById = createAsyncThunk(
  'companies/getById',
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

// Create company
export const createCompany = createAsyncThunk(
  'companies/create',
  async (companyData, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState();
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${auth.token}`,
        },
      };

      const response = await axios.post(API_URL, companyData, config);
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

// Update company
export const updateCompany = createAsyncThunk(
  'companies/update',
  async ({ id, companyData }, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState();
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${auth.token}`,
        },
      };

      const response = await axios.put(`${API_URL}/${id}`, companyData, config);
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

// Delete company
export const deleteCompany = createAsyncThunk(
  'companies/delete',
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

// Get company notes
export const getCompanyNotes = createAsyncThunk(
  'companies/getNotes',
  async (id, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState();
      const config = {
        headers: {
          Authorization: `Bearer ${auth.token}`,
        },
      };

      const response = await axios.get(`${API_URL}/${id}/notes`, config);
      return { id, notes: response.data };
    } catch (error) {
      return rejectWithValue(
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message
      );
    }
  }
);

// Create company note
export const createCompanyNote = createAsyncThunk(
  'companies/createNote',
  async ({ id, content }, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState();
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${auth.token}`,
        },
      };

      const response = await axios.post(`${API_URL}/${id}/notes`, { content }, config);
      return { id, note: response.data };
    } catch (error) {
      return rejectWithValue(
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message
      );
    }
  }
);

// Get company messages
export const getCompanyMessages = createAsyncThunk(
  'companies/getMessages',
  async (id, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState();
      const config = {
        headers: {
          Authorization: `Bearer ${auth.token}`,
        },
      };

      const response = await axios.get(`${API_URL}/${id}/messages`, config);
      return { id, messages: response.data };
    } catch (error) {
      return rejectWithValue(
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message
      );
    }
  }
);

// Create company message
export const createCompanyMessage = createAsyncThunk(
  'companies/createMessage',
  async ({ id, content, mentions }, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState();
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${auth.token}`,
        },
      };

      const response = await axios.post(`${API_URL}/${id}/messages`, { content, mentions }, config);
      return { id, message: response.data };
    } catch (error) {
      return rejectWithValue(
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message
      );
    }
  }
);

// Mark company messages as read
export const markCompanyMessagesAsRead = createAsyncThunk(
  'companies/markMessagesAsRead',
  async (id, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState();
      const config = {
        headers: {
          Authorization: `Bearer ${auth.token}`,
        },
      };

      await axios.post(`${API_URL}/${id}/messages/read`, {}, config);
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

const initialState = {
  companies: [],
  company: null,
  notes: {},
  messages: {},
  loading: false,
  error: null,
  success: false,
};

const companySlice = createSlice({
  name: 'companies',
  initialState,
  reducers: {
    resetCompanyState: (state) => {
      state.loading = false;
      state.error = null;
      state.success = false;
    },
    clearCompanyDetail: (state) => {
      state.company = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Get all companies
      .addCase(getCompanies.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getCompanies.fulfilled, (state, action) => {
        state.loading = false;
        state.companies = action.payload;
      })
      .addCase(getCompanies.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Get company by ID
      .addCase(getCompanyById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getCompanyById.fulfilled, (state, action) => {
        state.loading = false;
        state.company = action.payload;
      })
      .addCase(getCompanyById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Create company
      .addCase(createCompany.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(createCompany.fulfilled, (state, action) => {
        state.loading = false;
        state.companies.push(action.payload);
        state.success = true;
      })
      .addCase(createCompany.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })
      
      // Update company
      .addCase(updateCompany.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(updateCompany.fulfilled, (state, action) => {
        state.loading = false;
        state.companies = state.companies.map((company) =>
          company._id === action.payload._id ? action.payload : company
        );
        state.company = action.payload;
        state.success = true;
      })
      .addCase(updateCompany.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })
      
      // Delete company
      .addCase(deleteCompany.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteCompany.fulfilled, (state, action) => {
        state.loading = false;
        state.companies = state.companies.filter(
          (company) => company._id !== action.payload
        );
        state.success = true;
      })
      .addCase(deleteCompany.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Get company notes
      .addCase(getCompanyNotes.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getCompanyNotes.fulfilled, (state, action) => {
        state.loading = false;
        state.notes = {
          ...state.notes,
          [action.payload.id]: action.payload.notes,
        };
      })
      .addCase(getCompanyNotes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Create company note
      .addCase(createCompanyNote.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createCompanyNote.fulfilled, (state, action) => {
        state.loading = false;
        const companyId = action.payload.id;
        const newNote = action.payload.note;
        
        if (state.notes[companyId]) {
          state.notes[companyId] = [newNote, ...state.notes[companyId]];
        } else {
          state.notes[companyId] = [newNote];
        }
        
        state.success = true;
      })
      .addCase(createCompanyNote.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Get company messages
      .addCase(getCompanyMessages.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getCompanyMessages.fulfilled, (state, action) => {
        state.loading = false;
        state.messages = {
          ...state.messages,
          [action.payload.id]: action.payload.messages,
        };
      })
      .addCase(getCompanyMessages.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Create company message
      .addCase(createCompanyMessage.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createCompanyMessage.fulfilled, (state, action) => {
        state.loading = false;
        const companyId = action.payload.id;
        const newMessage = action.payload.message;
        
        if (state.messages[companyId]) {
          state.messages[companyId] = [...state.messages[companyId], newMessage];
        } else {
          state.messages[companyId] = [newMessage];
        }
        
        state.success = true;
      })
      .addCase(createCompanyMessage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { resetCompanyState, clearCompanyDetail } = companySlice.actions;

export default companySlice.reducer;
