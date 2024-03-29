import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from '../utils/ApiError.js';
import {User} from "../models/user.model.js";
import {uploadOnCloudinary} from "../utils/cloudinary.js";
import {ApiResponse} from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import passport from "passport";
import FacebookStrategy from 'passport-facebook';

const generateAccessAndRefreshTokens = async(userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();
    user.refreshToken = refreshToken;
    await user.save({validateBeforeSave: false});
    return { accessToken,refreshToken }
  } catch (error) {
     throw new ApiError(500, "Something went wrong while generating refresh and access token");
  }
}

const registerUser = asyncHandler( async (req,res) => {
  
    // Steps for register function are as follows:-
    // ############################################

    // get user details from frontend
    // validation - not empty
    // check if user already exists: username,email
    // check for images, check for avatar
    // upload them to cloudinary, avatar
    // create user object - create entry in db
    // remove password and refresh token field from response
    // check for user creation
    // return response

    const {fullName, email, username, password } = req.body

   if(
     [fullName,email,username,password].some((field) => 
       field?.trim() === "")
    ) {
        throw new ApiError(400, "All fields are required")
     }

     const existedUser = await User.findOne({
        $or: [{ username } , { email }]
     })

     if(existedUser) {
       throw new ApiError(409, "User with Username or Email is already exists");
     }

     const avatarLocalPath     = req.files?.avatar[0]?.path;
    //  const coverImageLocalPath = req.files?.coverImage[0]?.path;

     let coverImageLocalPath;
     if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path
     }

     if(!avatarLocalPath) {
       throw new ApiError(400,"Avatar1 file is required");
     }

     const avatar = await uploadOnCloudinary(avatarLocalPath)
     const coverImage = await uploadOnCloudinary(coverImageLocalPath)

     if(!avatar) {
      throw new ApiError(400,"Avatar2 file is required");
     }

    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        username: username.toLowerCase(),
        password
     })

     const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
     )

     if(!createdUser) {
      throw new ApiError(400, "Something went wrong while creating User");
     }

     return res.status(201).json(
       new ApiResponse(200,createdUser,"User registered Successfully")
     )

});

const loginUser = asyncHandler(async (req,res) => {

  const {email,username,password} = req.body;

  console.log(req.body);

  if (!(username || email)) {
    throw new ApiError(401, "username or email is required");
  }

  const user = await User.findOne({
    $or: [{username},{email}]
  });

  if(!user) {
    throw new ApiError(401, "User does not exists");
    
  }

  const isPasswordValid = await user.isPasswordCorrect(password);

  if(!isPasswordValid) {
    throw new ApiError(402, "Invalid Credentials");
  }

  const {accessToken,refreshToken} = await generateAccessAndRefreshTokens(user._id);
  const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

  const options = {
    httpOnly: true,
    secure: true
  }

  return res
      .status(200)
      .cookie("accessToken",accessToken, options)
      .cookie("refreshToken", refreshToken,options)
      .json(
        new ApiResponse(200,
        {
          user: loggedInUser, accessToken, refreshToken
        },
        "User logged In Successgully")
      )

});

const logoutUser = asyncHandler(async(req,res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken: undefined
      }
    },
    {
      new: true
    }
  )

  const options = {
    httpOnly: true,
    secure: true
  }

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {} , "User logged Out"))
})

const refreshAccessToken = asyncHandler(async (req,res) => {
  const inComingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

  if(!inComingRefreshToken) {
    throw new ApiError(401,"Unauthorized request");
  }

 try {
   const decodedToken = jwt.verify(inComingRefreshToken, process.env.REFRESH_TOKEN_SECRET)
   const user = await User.findById(decodedToken?._id);
 
   if(!user) {
     throw new ApiError(401,"Invalid refresh token");
   }
 
   if(inComingRefreshToken !== user?.refreshToken) {
     throw new ApiError(401,"Refresh token is expired or used");
   }
 
   const options = {
     httpOnly: true,
     secure: true
   }
 
   const {accessToken,refreshToken} = await generateAccessAndRefreshTokens(user._id);
 
   return res  
       .status(200)
       .cookie("accessToken", accessToken, options)
       .cookie("refreshToken", refreshToken, options)
       .json(
         new ApiResponse(
           200,
           {
             accessToken, refreshToken
           },
           "Access token refreshed"
         )
       )
 } catch (error) {
    throw new ApiError(401, error?.message || "Invalid refresh token")
 }

})

const changeCurrentPassword = asyncHandler(async (req,res) => {
   const {oldPassword, newPassword} = req.body

   const user = await User.findById(req.user?._id)

   const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)

   if(!isPasswordCorrect) {
    throw new ApiError(400, "Invalid old password");
   }

   user.password = newPassword
   await user.save({validateBeforeSave: false});

   return res
        .status(200)
        .json(new ApiResponse(200, {} , "password changed Successfully"));

})

const getCurrentUser = asyncHandler(async (req,res) => {
  return res
      .status(200)
      .json(200, req.user, "Current user fetched successfully")
})

const updateAccountDetails = asyncHandler(async (req,res) => {
  const {fullName,email} = req.body;

  if(!fullName || !email) {
    throw new ApiError(400, "All fields are reuired");
  }

  const user = await User.findByIdAndUpdate(req.user?._id,
    {
      $set: {
        fullName, 
        email
      }
    },
    {new: true}
  ).select("-password")

  return res.status(200).json(new ApiResponse(200, user, "Account details has been updated Successfully"));

})

const updateUserAvatar = asyncHandler(async(req,res) => {
  const avatarLocalPath = req.file?.path
  if(!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is missing");
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath)

  if(!avatar.url) {
    throw new ApiError(400, "Error while uploading on avatar");
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        avatar: avatar.url
      }
    },
    {new:true}
.select("-password"))

res.status(200).json(new ApiResponse(200,user,"Avatar image is updated successfully"))

})

const updateUserCoverImage = asyncHandler(async(req,res) => {
  const coverImageLocalPath = req.file?.path
  if(!coverImageLocalPath) {
    throw new ApiError(400, "Cover Image file is missing");
  }

  const coverImage = await uploadOnCloudinary(coverImageLocalPath)

  if(!coverImage.url) {
    throw new ApiError(400, "Error while uploading on Cover Image");
  }

   const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        coverImage: coverImage.url
      }
    },
    {new:true}
.select("-password"))

res.status(200).json(new ApiResponse(200,user,"Cover image is updated successfully"))

})

const loginWithfb = asyncHandler(async (req,res) => {
  passport.use(new FacebookStrategy({
    clientID: "865535167935964",
    clientSecret: "255e1728cb4bb63e10ffcda742a432b7",
    callbackURL: "http://localhost:5000/auth/facebook/callback"
  },
  function(accessToken, refreshToken, profile, cb) {
    console.log("accessToken", accessToken);
    console.log("refreshToken", refreshToken);
    console.log("profile", profile);
  }
));
})

passport.serializeUser(function(user, cb) {
  process.nextTick(function() {
    cb(null, { id: user.id, username: user.username, name: user.name });
  });
});

passport.deserializeUser(function(user, cb) {
  process.nextTick(function() {
    return cb(null, user);
  });
});




export {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  changeCurrentPassword,
  getCurrentUser,
  updateAccountDetails,
  updateUserAvatar,
  updateUserCoverImage
}