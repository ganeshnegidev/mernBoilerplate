import { createSlice, nanoid } from "@reduxjs/toolkit";

// export const todo = createAsyncThunk(
//     'user/loginUser',
//     async(userCredentials) => {
//       const request = await axios.post(`${hostname}/api/v1/users/login`, userCredentials);
//       const response = await request.data.data;
//       localStorage.setItem('user', JSON.stringify(response));
//       return response;
//     }   
// );

const initialState = {
    todos: [{id:1 , email: "ganesh@gmail.com", fName: "Ganesh", lName: 'Negi', phone: '8285380675', company: 'Itio'}]
}

const TodoSlice = createSlice({
    name: 'todo',
    initialState,
    reducers: {
        createTodo: (state,action) => {
          const todo = {
            id: nanoid(),
            email: action.payload.email,
            fName: action.payload.fName,
            lName: action.payload.lName,
            phone: action.payload.phone,
            company: action.payload.company,
          }
          state.todos.push(todo);
        },
        updateTodo: (state,action) => {
          const {todos} = state;
          state.todos = todos.map((item) => 
            item.id === action.payload.id ? action.payload: item
          )  
        },
        removeTodo: (state,action) => {
          state.todos = state.todos.filter((todo) => todo.id !== action.payload)
        }
    },
    extraReducers: (builder) => {

    }

});

export default TodoSlice.reducer;
export const {createTodo,removeTodo,updateTodo} = TodoSlice.actions;