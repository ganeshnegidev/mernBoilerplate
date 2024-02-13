import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
const hostname = 'http://localhost:5000';
import axios from 'axios';

export const loginUser = createAsyncThunk(
    'user/loginUser',
    async(userCredentials) => {
        const request = await axios.post(`${hostname}/api/v1/users/login`, userCredentials);
        const response = await request.data.data;
        localStorage.setItem('user', JSON.stringify(response));
        return response;
    }   
);

const userSlice = createSlice({
    name: 'user',
    initialState: {
        loading: false,
        user: null,
        error: null,
        isAuthenticated: false
    },
    reducers: {
      clearuser:(state) => {
        state.user = null,
        state.loading = false,
        state.error = null,
        state.isAuthenticated = false,
        localStorage.clear();
      }
    },
    extraReducers:(builder) => {
        builder
            .addCase(loginUser.pending,(state) => {
                state.loading = true;
                state.user = null;
                state.error = null;
                state.isAuthenticated = false;
            })
            .addCase(loginUser.fulfilled,(state,action) => {
                state.loading = false;
                state.user = action.payload;
                state.error = null;
                state.isAuthenticated = true;
            })
            .addCase(loginUser.rejected, (state,action) => {
                state.loading = false;
                state.user = null;
                if(action.error.message === "Request failed with status code 401") {
                    state.error = "User does not exists";
                } else if(action.error.message === "Request failed with status code 402") {
                    state.error = "Invalid Credentials";
                } else {
                    state.error = action.error.message;
                }
                state.isAuthenticated = false;
            })
    }
});

export default userSlice.reducer;
export const {clearuser} = userSlice.actions;