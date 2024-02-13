class ApiError extends Error {
    constructor(
        statusCode,
        message= "Something went wrong",
        errors = [],
        stack = ""
    ){
        super(message)
        this.statusCode = statusCode
        this.data = null
        this.message = message
        this.success = false;
        this.errors = errors
        if (stack) {
          this.stack = stack
        } else{
          Error.captureStackTrace(this, this.constructor)
        }
    }
}

export {ApiError}

// captureStackTrace returns a string that represents the location of that particular error in the call. 
// It gives us a stack that helps us to find the location of that error in the code at which new Error() was Called. 
// This will help us to find the exact error in our code.