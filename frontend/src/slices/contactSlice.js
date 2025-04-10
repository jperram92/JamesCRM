import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api/contacts';

// Get all contacts
export const getContacts = createAsyncThunk(
  'contacts/getAll',
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

// Get contact by ID
export const getContactById = createAsyncThunk(
  'contacts/getById',
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

// Get contacts by company
export const getContactsByCompany = createAsyncThunk(
  'contacts/getByCompany',
  async (companyId, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState();
      const config = {
        headers: {
          Authorization: `Bearer ${auth.token}`,
        },
      };

      const response = await axios.get(`${API_URL}/company/${companyId}`, config);
      return { companyId, contacts: response.data };
    } catch (error) {
      return rejectWithValue(
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message
      );
    }
  }
);

// Create contact
export const createContact = createAsyncThunk(
  'contacts/create',
  async (contactData, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState();
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${auth.token}`,
        },
      };

      const response = await axios.post(API_URL, contactData, config);
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

// Update contact
export const updateContact = createAsyncThunk(
  'contacts/update',
  async ({ id, contactData }, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState();
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${auth.token}`,
        },
      };

      const response = await axios.put(`${API_URL}/${id}`, contactData, config);
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

// Delete contact
export const deleteContact = createAsyncThunk(
  'contacts/delete',
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

// Get contact notes
export const getContactNotes = createAsyncThunk(
  'contacts/getNotes',
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

// Create contact note
export const createContactNote = createAsyncThunk(
  'contacts/createNote',
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

// Get contact messages
export const getContactMessages = createAsyncThunk(
  'contacts/getMessages',
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

// Create contact message
export const createContactMessage = createAsyncThunk(
  'contacts/createMessage',
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

// Mark contact messages as read
export const markContactMessagesAsRead = createAsyncThunk(
  'contacts/markMessagesAsRead',
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
  contacts: [],
  contact: null,
  companyContacts: {},
  notes: {},
  messages: {},
  loading: false,
  error: null,
  success: false,
};

const contactSlice = createSlice({
  name: 'contacts',
  initialState,
  reducers: {
    resetContactState: (state) => {
      state.loading = false;
      state.error = null;
      state.success = false;
    },
    clearContactDetail: (state) => {
      state.contact = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Get all contacts
      .addCase(getContacts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getContacts.fulfilled, (state, action) => {
        state.loading = false;
        state.contacts = action.payload;
      })
      .addCase(getContacts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Get contact by ID
      .addCase(getContactById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getContactById.fulfilled, (state, action) => {
        state.loading = false;
        state.contact = action.payload;
      })
      .addCase(getContactById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Get contacts by company
      .addCase(getContactsByCompany.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getContactsByCompany.fulfilled, (state, action) => {
        state.loading = false;
        state.companyContacts = {
          ...state.companyContacts,
          [action.payload.companyId]: action.payload.contacts,
        };
      })
      .addCase(getContactsByCompany.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Create contact
      .addCase(createContact.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(createContact.fulfilled, (state, action) => {
        state.loading = false;
        state.contacts = [action.payload, ...state.contacts];
        
        // If this contact belongs to a company, update companyContacts
        if (action.payload.company) {
          const companyId = action.payload.company._id;
          if (state.companyContacts[companyId]) {
            state.companyContacts[companyId] = [
              action.payload,
              ...state.companyContacts[companyId],
            ];
          }
        }
        
        state.success = true;
      })
      .addCase(createContact.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Update contact
      .addCase(updateContact.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(updateContact.fulfilled, (state, action) => {
        state.loading = false;
        
        // Update in contacts array
        state.contacts = state.contacts.map((contact) =>
          contact._id === action.payload._id ? action.payload : contact
        );
        
        // Update in contact detail
        if (state.contact && state.contact._id === action.payload._id) {
          state.contact = action.payload;
        }
        
        // Update in companyContacts if applicable
        if (action.payload.company) {
          const companyId = action.payload.company._id;
          if (state.companyContacts[companyId]) {
            state.companyContacts[companyId] = state.companyContacts[companyId].map(
              (contact) => (contact._id === action.payload._id ? action.payload : contact)
            );
          }
        }
        
        state.success = true;
      })
      .addCase(updateContact.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Delete contact
      .addCase(deleteContact.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(deleteContact.fulfilled, (state, action) => {
        state.loading = false;
        
        // Remove from contacts array
        state.contacts = state.contacts.filter(
          (contact) => contact._id !== action.payload
        );
        
        // Remove from companyContacts if applicable
        Object.keys(state.companyContacts).forEach((companyId) => {
          state.companyContacts[companyId] = state.companyContacts[companyId].filter(
            (contact) => contact._id !== action.payload
          );
        });
        
        state.success = true;
      })
      .addCase(deleteContact.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Get contact notes
      .addCase(getContactNotes.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getContactNotes.fulfilled, (state, action) => {
        state.loading = false;
        state.notes = {
          ...state.notes,
          [action.payload.id]: action.payload.notes,
        };
      })
      .addCase(getContactNotes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Create contact note
      .addCase(createContactNote.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(createContactNote.fulfilled, (state, action) => {
        state.loading = false;
        const contactId = action.payload.id;
        const newNote = action.payload.note;
        
        if (state.notes[contactId]) {
          state.notes[contactId] = [newNote, ...state.notes[contactId]];
        } else {
          state.notes[contactId] = [newNote];
        }
        
        state.success = true;
      })
      .addCase(createContactNote.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Get contact messages
      .addCase(getContactMessages.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getContactMessages.fulfilled, (state, action) => {
        state.loading = false;
        state.messages = {
          ...state.messages,
          [action.payload.id]: action.payload.messages,
        };
      })
      .addCase(getContactMessages.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Create contact message
      .addCase(createContactMessage.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(createContactMessage.fulfilled, (state, action) => {
        state.loading = false;
        const contactId = action.payload.id;
        const newMessage = action.payload.message;
        
        if (state.messages[contactId]) {
          state.messages[contactId] = [...state.messages[contactId], newMessage];
        } else {
          state.messages[contactId] = [newMessage];
        }
        
        state.success = true;
      })
      .addCase(createContactMessage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { resetContactState, clearContactDetail } = contactSlice.actions;

export default contactSlice.reducer;
