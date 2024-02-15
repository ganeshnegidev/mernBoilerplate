import React ,{useState} from 'react'
import Logo from '../assets/tulip-logo-preview.png';
import { AiOutlineMenu , AiOutlineClose } from "react-icons/ai";

export default function Header() {
  const [toggle,setToggle] = useState(false);
  return (
    <div className='bg-[#2699fb] p-4'>
        <div className='max-w-[1240px] flex items-center py-[12px] justify-between mx-auto'>
            <div className='text-3xl'>
            <a href="https://tuliptechnicals.com/" class="flex items-center mb-4 sm:mb-0 space-x-3 rtl:space-x-reverse">
                <img src={Logo} class="h-5" alt="Tulip Technical" />
                <span class="self-center text-2xl font-semibold whitespace-nowrap dark:text-white">Tulip Technical</span>
            </a>
            </div>
            {
                toggle ?
                <AiOutlineClose onClick={() => setToggle(!toggle)} className='text-white text-2xl md:hidden block'/>
                :
                <AiOutlineMenu onClick={() => setToggle(!toggle)} className='text-white text-2xl md:hidden block'/>
            }
            

            <ul className='hidden md:flex text-white gap-10'>
                <li>
                    Home
                </li>
                <li>
                    Company
                </li>
                <li>
                    Resources
                </li>
                <li>
                    About
                </li>
                <li>
                    Contact
                </li>
            </ul>

            {/* Responsive Menu */}
            <ul className={`duration-300 md:hidden w-full h-screen text-white fixed bg-black top-[92px] ${toggle ? 'left-0': 'left-[-100%]'}`}>
                <li className='p-5'>
                    Home
                </li>
                <li className='p-5'>
                    Company
                </li>
                <li className='p-5'>
                    Resources
                </li>
                <li className='p-5'>
                    About
                </li>
                <li className='p-5'>
                    Contact
                </li>
            </ul>
        </div>
    </div>
  )
}
