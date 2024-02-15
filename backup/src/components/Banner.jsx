import React from 'react'
import { ReactTyped } from "react-typed";

export default function Banner() {
  return (
    <div className='bg-[#2699fb] w-full py-[100px]'>
        <div className='max-w-[1240px] my-[100px] mx-auto text-center font-bold'>
            <div className='text-xl md:text-3xl mb-4 md:p-[24px]'>
                Learn with us
            </div>
            <h2 className='text-white text-3xl md:text-[80px] md:p-[24px]'>Grow with us.</h2>
            <div className='text-[20px] md:text-[50px] md:p-[24px] text-white'>
                 Stock 
                 <ReactTyped 
                    className='p-3'
                    strings={['Trading','Automation Trading', 'Manual Trading']} 
                    typeSpeed={100} 
                    backSpeed={50}
                    loop={true}
                />
            </div>
            <button className='bg-black text-white p-3 rounded'>Get Started</button>
        </div>
    </div>
  )
}
