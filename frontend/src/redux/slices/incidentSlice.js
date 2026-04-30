import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  incidents: [],
  currentIncident: null,
  loading: false,
  error: null,
  filters: {
    status: 'all',
    severity: 'all'
  }
};

const incidentSlice = createSlice({
  name: 'incidents',
  initialState,
  reducers: {
    fetchIncidentsStart: (state) => { state.loading = true; state.error = null; },
    fetchIncidentsSuccess: (state, action) => {
      state.loading = false;
      state.incidents = action.payload;
    },
    fetchIncidentsFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    setCurrentIncident: (state, action) => {
      state.currentIncident = action.payload;
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    addIncident: (state, action) => {
      state.incidents.unshift(action.payload);
    },
    updateIncidentStatus: (state, action) => {
      const index = state.incidents.findIndex(inc => inc.id === action.payload.id);
      if (index !== -1) {
        state.incidents[index] = { ...state.incidents[index], ...action.payload };
      }
      if (state.currentIncident?.id === action.payload.id) {
        state.currentIncident = { ...state.currentIncident, ...action.payload };
      }
    }
  },
});

export const { fetchIncidentsStart, fetchIncidentsSuccess, fetchIncidentsFailure, setCurrentIncident, setFilters, addIncident, updateIncidentStatus } = incidentSlice.actions;
export default incidentSlice.reducer;
