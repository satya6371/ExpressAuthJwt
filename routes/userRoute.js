import express from 'express'
const router = express.Router()
import { UserController } from '../controllers/userController.js'
import checkUserAuth from '../middlewares/authMiddleware.js'

// Route Level Middleware - To Protect Route
router.use('/changepassword',checkUserAuth)
router.use('/loggeduser',checkUserAuth)

// Public route
router.post('/register',UserController.userRegistration)
router.post('/login',UserController.userLogin)
router.post('/send-reset-password-email',UserController.sendUserPasswordResetemail)
router.post('/reset-password/:id/:token',UserController.userPasswordReset)

// Protected route
router.post('/changepassword',UserController.changeUserPassword)
router.get('/loggeduser',UserController.loggedUser)

export default router