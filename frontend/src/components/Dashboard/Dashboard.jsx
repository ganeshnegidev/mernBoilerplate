import React from 'react'
import { useDispatch } from 'react-redux'
import { clearuser } from '../../Store/UserSlice';

export default function Dashboard() {

  const dispatch = useDispatch();

  return (
    <>
        <div>Dashboard</div>
        <button className='bg-black text-white py-4 p-4' onClick={() => dispatch(clearuser())}>Logout</button>
    </>
  )
}
