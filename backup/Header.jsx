import React from 'react'

export default function Header() {
  return (
            <div className="sticky top-0 z-0 z-stickybg-[#2699fb] p-4">
             <div className='max-w-[1240px] flex z-0 items-center py-[12px] shadow justify-between mx-auto  border border-bg-black rounded-full p-10'>
                <div className='text-xl'>
                  <a href="https://tuliptechnicals.com/" class="flex items-center mb-4 sm:mb-0 space-x-3 rtl:space-x-reverse">
                    <span class="self-center text-xl font-semibold whitespace-nowrap dark:text-black">Soft UI Dashboard Laravel</span>
                  </a>
                </div>
                <ul className='hidden md:flex text-black gap-10'>
                    <li>
                        Sign Up
                    </li>
                    <li>
                        Sign In
                    </li>
                </ul>
                <ul className='hidden md:flex text-black gap-10'>
               
                </ul>
             </div>
          </div>
  )
}
