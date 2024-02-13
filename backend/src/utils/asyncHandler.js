// const asyncHandler = (requestHandler) => {
//   return (req,res,next) => {
//     Promise.resolve(requestHandler(req,res,next)).catch((error) = next(error))
//   }
// }

// export { asyncHandler }


const asyncHandler = (fn) => async (req,res,next) => {
    try {
      await fn(req,res,next)
    } catch (error) {
        console.log("error", error.message);
        res.status(error.statusCode).json({
          success: false,
          message: error.message,
        })
    }
}

export {asyncHandler}

