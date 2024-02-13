import React , {useState} from 'react'
import { Link, NavLink } from 'react-router-dom'
import { AiOutlineMenu , AiOutlineClose } from "react-icons/ai";
import { useDispatch, useSelector } from 'react-redux';
import { clearuser } from '../Store/UserSlice';

export default function Header() {
  const [menuToggle,setMenuToggle] = useState(false);
  const user = useSelector(state => state.user);  
  const dispatch = useDispatch();
  return (
    <>
        <header className='shadow sticky z-50 top-0'>
            <nav className='bg-white border-gray-200 px-4 lg:px-6 py-2.5'>
                <div className='flex items-center justify-between mx-auto'>
                    <Link to = "/" className='flex items-center'>
                    <img
                      src="https://alexharkness.com/wp-content/uploads/2020/06/logo-2.png"
                      className="mr-3 h-12"
                      alt="Logo"
                    />
                    </Link>

                    {
                        menuToggle ?
                        <AiOutlineClose onClick={() => setMenuToggle(!menuToggle)} className='text-orange text-2xl lg:hidden block'/>
                        :
                        <AiOutlineMenu onClick={() => setMenuToggle(!menuToggle)} className='text-orange text-2xl lg:hidden block'/>
                    }

                    <div
                        className="hidden justify-between items-center w-full lg:flex lg:w-auto lg:order-1"
                        id="mobile-menu-2"
                    >
                         <ul className="flex flex-col mt-4 font-medium lg:flex-row lg:space-x-8 lg:mt-0 m-100">
                            <li>
                                <NavLink
                                    to="/"
                                    className={({isActive}) => 
                                        `block py-2 pr-4 pl-3 duration-200 ${isActive ? "text-orange-700" : "text-gray-700 border-b border-gray-100 hover:bg-gray-50  lg:hover:bg-transparent lg:border-0 hover:text-orange-700 lg:p-0`"}`
                                    }
                                >Home</NavLink>
                            </li>
                            <li> <NavLink
                                    to="/company"
                                    className={({isActive}) => 
                                        `block py-2 pr-4 pl-3 duration-200 ${isActive ? "text-orange-700" : "text-gray-700 border-b border-gray-100 hover:bg-gray-50  lg:hover:bg-transparent lg:border-0 hover:text-orange-700 lg:p-0`"}`
                                    }
                                >Company</NavLink></li>
                             <li> <NavLink
                                    to="/blog"
                                    className={({isActive}) => 
                                        `block py-2 pr-4 pl-3 duration-200 ${isActive ? "text-orange-700" : "text-gray-700 border-b border-gray-100 hover:bg-gray-50  lg:hover:bg-transparent lg:border-0 hover:text-orange-700 lg:p-0`"}`
                                    }
                                >Blog</NavLink></li>
                            <li> <NavLink
                                    to="/testimonial"
                                    className={({isActive}) => 
                                        `block py-2 pr-4 pl-3 duration-200 ${isActive ? "text-orange-700" : "text-gray-700 border-b border-gray-100 hover:bg-gray-50  lg:hover:bg-transparent lg:border-0 hover:text-orange-700 lg:p-0`"}`
                                    }
                                >Testimonial</NavLink></li>
                            <li> <NavLink
                                    to="/contact"
                                    className={({isActive}) => 
                                        `block py-2 pr-4 pl-3 duration-200 ${isActive ? "text-orange-700" : "text-gray-700 border-b border-gray-100 hover:bg-gray-50  lg:hover:bg-transparent lg:border-0 hover:text-orange-700 lg:p-0`"}`
                                    }
                                >Contact</NavLink></li>
                         </ul>   
                    </div>

                    <div
                        className={`lg:hidden duration-300 w-full h-screen  bg-black fixed top-[50px] ${menuToggle ? 'left-0' : 'left-[-100%]'}`}
                        id="mobile-menu-2"
                    >
                         <ul className="flex flex-col mt-4 items-center font-medium lg:flex-row lg:space-x-8 lg:mt-0">
                            <li>
                                <NavLink
                                    to="/"
                                    className={({isActive}) => 
                                     `block py-2 pr-4 pl-3 duration-200 ${isActive ? "text-orange-700" : "text-white hover:bg-gray-50 lg:hover:bg-transparent lg:border-0 hover:text-orange-700 lg:p-0`"}`
                                    }
                                >Home</NavLink>
                            </li>
                            <li> <NavLink
                                    to="/company"
                                    className={({isActive}) => 
                                        `block py-2 pr-4 pl-3 duration-200 ${isActive ? "text-orange-700" : "text-white hover:bg-white lg:hover:bg-transparent lg:border-0 hover:text-orange-700 lg:p-0`"}`
                                    }
                                >Company</NavLink></li>
                             <li> <NavLink
                                    to="/blog"
                                    className={({isActive}) => 
                                        `block py-2 pr-4 pl-3 duration-200 ${isActive ? "text-orange-700" : "text-white hover:bg-gray-50  lg:hover:bg-transparent lg:border-0 hover:text-orange-700 lg:p-0`"}`
                                    }
                                >Blog</NavLink></li>
                            <li> <NavLink
                                    to="/testimonial"
                                    className={({isActive}) => 
                                        `block py-2 pr-4 pl-3 duration-200 ${isActive ? "text-orange-700" : "text-white hover:bg-gray-50  lg:hover:bg-transparent lg:border-0 hover:text-orange-700 lg:p-0`"}`
                                    }
                                >Testimonial</NavLink></li>
                            <li> <NavLink
                                    to="/contact"
                                    className={({isActive}) => 
                                        `block py-2 pr-4 pl-3 duration-200 ${isActive ? "text-orange-700" : "text-white hover:bg-gray-50  lg:hover:bg-transparent lg:border-0 hover:text-orange-700 lg:p-0`"}`
                                    }
                                >Contact</NavLink></li>
                         </ul>   
                    </div>

                    <div className='hidden lg:flex items-center gap-10 order-2'>
                        {
                            user?.isAuthenticated ?
                            <button onClick={() => dispatch(clearuser())}>Logout</button>
                            :
                            <Link to="/login">Login</Link>
                        }
                        
                        <Link to="/register" className='border border-[#2699fb] bg-[#2699fb] text-white py-2 p-2 rounded'>Get Started</Link>
                    </div>
  
                </div>
            </nav>
        </header>
    </>
  )
}
