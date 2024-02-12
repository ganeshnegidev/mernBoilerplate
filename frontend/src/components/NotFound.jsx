import React from 'react'
import { MdErrorOutline } from "react-icons/md";
import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className='bg-pink-300 py-[100px] flex flex-col items-center font-bold'>
        <div className='flex flex-row'><MdErrorOutline className='text-white' size={'6em'} /><p className='text-white text-3xl md:text-[80px] md:p-[24px]'>Page not Found</p></div>
        <div><Link to="/"><button className='mt-[144px] text-white bg-pink-800 py-5 p-5 rounded'>Back to Home</button></Link></div> 
    </div>
  )
}
