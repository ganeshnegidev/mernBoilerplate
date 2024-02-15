import React from 'react';
import LaptopImg from '../assets/laptop.jpg';

export default function Expert() {
  return (
    <div className='max-w-[1240px] mx-auto my-10 p-2 md:grid grid-cols-2'>
        <div className='col-span-1 md:w-[80%] text-center'>
            <img src={LaptopImg} alt="" className='inline'/>
        </div>
        <div className='col-span-1 flex flex-col justify-center'>
            <h1 className='text-[#00df9a] font-bold my-2'>LEARN FROM EXPERTS</h1>
            <p className='my-2 text-justify'>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc sit amet blandit elit, 
            at hendrerit urna. Nulla rhoncus pellentesque augue, id fringilla velit ullamcorper id. 
            Curabitur fermentum nulla justo, et malesuada ipsum fermentum id. Proin laoreet est sed finibus euismod. 
            Fusce tincidunt massa non vulputate lobortis. In at sem eros. Aliquam justo elit, dignissim vel mauris in, 
            tincidunt tincidunt arcu. Duis suscipit commodo massa et viverra. Integer elementum, elit eu rutrum imperdiet,
             ante ipsum euismod tellus, fringilla dapibus odio lectus ac eros. Aenean sed elementum purus,
              eu elementum ante. Donec mauris nisl, congue at eros nec, vehicula tincidunt libero.
            </p>
            <button className='w-[30%] inline bg-black text-white p-3 rounded'>Get Started</button>
        </div>
    </div>
  )
}
