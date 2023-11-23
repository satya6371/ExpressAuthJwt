import jwt from 'jsonwebtoken'
import UserModel from '../models/user.js'


var checkUserAuth = async (req, res, next) => {
  let token
  const { authorization } = req.headers
  if (authorization && authorization.startsWith('Bearer')) {
    try {
      // Get Token from header
      token = authorization.split(' ')[1]
     
      // Verify Token
      const  decodedUser  = jwt.verify(token, process.env.JWT_SECRET_KEY)
      const {userId} = decodedUser

      // Get User from Token
      let user = await UserModel.findById(userId).select('-password')
      req.user = user

      next()
    } catch (error) {
      console.log(error)
      res.status(401).send({ "status": "failed", "message": "Unauthorized User" })
    }
  }
  if (!token) {
    res.status(401).send({ "status": "failed", "message": "Unauthorized User, No Token" })
  }
}

export default checkUserAuth