import React from 'react'

export default function Middle() {
  return (
      <div className='max-w-[1240px] mx-auto p-2 md:grid grid-cols-2'>
          <div class="flex flex-wrap mt-0 -mx-3">
            <div className='col-span-1 md:w-[80%] text-left'>
              <div class="relative flex flex-col min-w-0 mt-32 break-words bg-transparent border-0 shadow-none rounded-2xl bg-clip-border">
                <div class="p-6 pb-0 mb-0 bg-transparent border-b-0 rounded-t-2xl">
                  <h3 class="relative z-10 font-bold text-transparent bg-gradient-to-tl from-blue-600 to-cyan-400 bg-clip-text text-4xl">Welcome back</h3>
                  <p class="mb-0">Create a new account</p>
                </div>
                <div class="flex-auto p-6">
                  <form role="form">
                    <label class="mb-2 ml-1 font-bold text-xs text-slate-700">Email</label>
                    <div class="mb-4">
                      <input type="email" class="focus:shadow-soft-primary-outline text-sm leading-5.6 ease-soft block w-full appearance-none rounded-lg border border-solid border-gray-300 bg-white bg-clip-padding px-3 py-2 font-normal text-gray-700 transition-all focus:border-fuchsia-300 focus:outline-none focus:transition-shadow" placeholder="Email" aria-label="Email" aria-describedby="email-addon" />
                    </div>
                    <label class="mb-2 ml-1 font-bold text-xs text-slate-700">Password</label>
                    <div class="mb-4">
                      <input type="email" class="focus:shadow-soft-primary-outline text-sm leading-5.6 ease-soft block w-full appearance-none rounded-lg border border-solid border-gray-300 bg-white bg-clip-padding px-3 py-2 font-normal text-gray-700 transition-all focus:border-fuchsia-300 focus:outline-none focus:transition-shadow" placeholder="Password" aria-label="Password" aria-describedby="password-addon" />
                    </div>
                    <div class="min-h-6 mb-0.5 block pl-12">
                      <input id="rememberMe" class="mt-0.54 rounded-10 duration-250 ease-soft-in-out after:rounded-circle after:shadow-soft-2xl after:duration-250 checked:after:translate-x-5.25 h-5 relative float-left -ml-12 w-10 cursor-pointer appearance-none border border-solid border-gray-200 bg-slate-800/10 bg-none bg-contain bg-left bg-no-repeat align-top transition-all after:absolute after:top-px after:h-4 after:w-4 after:translate-x-px after:bg-white after:content-[''] checked:border-slate-800/95 checked:bg-slate-800/95 checked:bg-none checked:bg-right" type="checkbox" checked="" />
                      <label class="mb-2 ml-1 font-normal cursor-pointer select-none text-sm text-slate-700" for="rememberMe">Remember me</label>
                    </div>
                    <div class="text-center">
                      <button type="button" class="inline-block w-full px-6 py-3 mt-6 mb-0 font-bold text-center text-white uppercase align-middle transition-all bg-transparent border-0 rounded-lg cursor-pointer shadow-soft-md bg-x-25 bg-150 leading-pro text-xs ease-soft-in tracking-tight-soft bg-gradient-to-tl from-blue-600 to-cyan-400 hover:scale-102 hover:shadow-soft-xs active:opacity-85">Sign in</button>
                    </div>
                  </form>
                </div>
                <div class="p-6 px-1 pt-0 text-center bg-transparent border-t-0 border-t-solid rounded-b-2xl lg:px-2">
                  <p class="mx-auto mb-6 leading-normal text-sm">
                    Don't have an account?
                    <a href="../pages/sign-up.html" class="relative z-10 font-semibold text-transparent bg-gradient-to-tl from-blue-600 to-cyan-400 bg-clip-text">Sign up</a>
                  </p>
                </div>
              </div>
            </div>
            <div className='z-0 col-span-1 flex flex-col justify-center'>
              <div class="z-0 top-0 hidden w-3/5 h-full -mr-32 overflow-hidden -skew-x-10 -right-40 rounded-bl-xl md:block">
                <div class="absolute inset-x-0 top-0 z-0 h-full -ml-16 bg-cover skew-x-10  bg-[url('https://xeyso.com/UI/public/assets/img/curved-images/curved6.jpg')]" style={{width:'45vw',height:'70vh', marginLeft:'auto', clipPath:'polygon(12% 0, 100% 0,100% 100%, 0 100%)'}}></div>
              </div>
            </div>
          </div>
    </div>
  )
}

