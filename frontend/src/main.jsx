import './index.css'
import React from 'react'
import ReactDOM from 'react-dom/client'
import Layout from './components/Layout.jsx'
import Home from './components/Home/Home.jsx'
import About from './components/About/About.jsx'
import NotFound from './components/NotFound.jsx'
import Login from './components/Login/Login.jsx'
import Contact from './components/Contact/Contact.jsx'
import Signup from './components/Register/Signup.jsx'
import { Provider } from 'react-redux';
import store from './Store/Index.jsx'
import ProtectedRoute from './utils/ProtectedRoute.jsx'
import { Route, Navigate, RouterProvider, createBrowserRouter, createRoutesFromElements } from 'react-router-dom'
import Dashboard from './components/Dashboard/Dashboard.jsx'
import persistStore from "redux-persist/es/persistStore.js"
import { PersistGate } from 'redux-persist/integration/react'

const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      <Route path='/' element={<Layout />}>
        <Route path='' element={<Home />} />
        <Route path='about' element={<About />} />
        <Route path='contact' element={<Contact />} />
        <Route path="/404" element={ <NotFound /> } />
        <Route path="*" element={ <Navigate to="/404" replace />} />
      </Route>
      <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }/>
      <Route path='login' element={<Login />} />
      <Route path='register' element={<Signup />} />
    </>
  )
)

const persistor = persistStore(store);

ReactDOM.createRoot(document.getElementById('root')).render(
  <Provider store={store}>
    <PersistGate persistor={persistor}>
      <RouterProvider router={router} />
    </PersistGate>
  </Provider>
)
