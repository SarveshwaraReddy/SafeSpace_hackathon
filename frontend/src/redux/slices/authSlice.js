import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authAPI } from '../../api/auth';
import { AUTH_TOKEN_KEY } from '../../api/axios';

const initialState = {
  user: null,
  isAuthenticated: false,
  loading: false,
  error: null,
  /** False until first bootstrapAuth completes (avoids redirect flash on protected routes). */
  authHydrated: false,
};

function unwrapAuthPayload(body) {
  if (!body) return null;
  return body.data !== undefined ? body.data : body;
}

export const bootstrapAuth = createAsyncThunk(
  'auth/bootstrap',
  async (_, { dispatch }) => {
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    if (!token) return null;
    try {
      await dispatch(getCurrentUser()).unwrap();
    } catch {
      localStorage.removeItem(AUTH_TOKEN_KEY);
    }
    return null;
  }
);

export const loginUser = createAsyncThunk(
  'auth/login',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const body = await authAPI.login(email, password);
      const data = unwrapAuthPayload(body);
      if (!data?.user || !data?.token) {
        return rejectWithValue('Invalid response from server');
      }
      return data;
    } catch (error) {
      const msg =
        error.response?.data?.message ||
        error.message ||
        'Login failed';
      return rejectWithValue(msg);
    }
  }
);

export const registerUser = createAsyncThunk(
  'auth/register',
  async ({ name, email, password, role }, { rejectWithValue }) => {
    try {
      const body = await authAPI.register(name, email, password, role);
      const data = unwrapAuthPayload(body);
      if (!data?.user || !data?.token) {
        return rejectWithValue('Invalid response from server');
      }
      return data;
    } catch (error) {
      const msg =
        error.response?.data?.message ||
        error.message ||
        'Registration failed';
      return rejectWithValue(msg);
    }
  }
);

export const getCurrentUser = createAsyncThunk(
  'auth/getCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const body = await authAPI.getCurrentUser();
      const user = unwrapAuthPayload(body);
      if (!user || typeof user !== 'object') {
        return rejectWithValue('Failed to get user');
      }
      return user;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to get user'
      );
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      localStorage.removeItem(AUTH_TOKEN_KEY);
      state.user = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(bootstrapAuth.fulfilled, (state) => {
        state.authHydrated = true;
      })
      .addCase(bootstrapAuth.rejected, (state) => {
        state.authHydrated = true;
      })

      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.error = null;
        if (action.payload.token) {
          localStorage.setItem(AUTH_TOKEN_KEY, action.payload.token);
        }
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.error = action.payload;
      })

      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.error = null;
        if (action.payload.token) {
          localStorage.setItem(AUTH_TOKEN_KEY, action.payload.token);
        }
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.error = action.payload;
      })

      .addCase(getCurrentUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(getCurrentUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload;
      })
      .addCase(getCurrentUser.rejected, (state) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.user = null;
      });
  },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;
