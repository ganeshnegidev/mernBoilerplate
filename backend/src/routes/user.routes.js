import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import { loginUser, logoutUser, refreshAccessToken, registerUser } from "../controllers/user.controller.js";
import passport from "passport";

const router = Router()

router.route("/register").post(
   upload.fields([
    {
       name: "avatar",
       maxCount: 1
    },
    {
       name: "coverImage",
       maxCount:1
    }
    ]),
    registerUser);

router.route("/login").post(loginUser);

// secured routes
router.route("/logout").post(verifyJWT, logoutUser);

router.route("refresh-token").post(refreshAccessToken)

router.get('/loginWithfb', passport.authenticate('facebook'));

router.get('/oauth2/redirect/facebook', passport.authenticate('facebook', {
  successReturnToOrRedirect: '/',
  failureRedirect: '/login'
}));

export default router;