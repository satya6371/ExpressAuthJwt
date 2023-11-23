import userModel from "../models/user.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import transpoter from "../config/emailConfig.js";

export class UserController {
  // Register a New user
  static userRegistration = async (req, res) => {
    const { name,email, password,password_confirmation, tc } = req.body;
    const user = await userModel.findOne({ email: email });
    if (user) {
      res.send({ status: "failed", message: "Email already exist" });
    } else {
      if (name && email && password && password_confirmation) {
        if (password === password_confirmation) {
           try {
             const salt = await bcrypt.genSalt(12)
             const hashedPassword = await bcrypt.hash(password,salt)
            const doc = new userModel({
                name:name,
                email:email,
                password:hashedPassword,
                tc:tc,
            })
            await doc.save()
            const saved_user = await userModel.findOne({email:email})

            // Generate JWT Token for Registration
            const token = jwt.sign({userId:saved_user._id},process.env.JWT_SECRET_KEY,{ expiresIn:"10d"})

            res.status(201).send({ status: "Success", message: "Register Successfully" , Token:token });
           } catch (error) {
            console.log(error)
            res.send({ status: "failed", message: "Unable to register" });
           }
        } else {
          res.send({
            status: "failed",
            message: "Password and password_confirmation doesn't match",
          });
        }
      } else {
        res.send({ status: "failed", message: "All fields are required" });
      }
    }
  };
  // Login the Registered User
  static userLogin = async (req,res) =>{
    try {
        const {email,password}= req.body
        if(email && password){
          const user = await userModel.findOne({ email: email })
          if(user !=null){
            const isMatch = await bcrypt.compare(password,user.password)
            if(user.email && isMatch){
              // Generate JWT Token 
            const token = jwt.sign({userId:user._id},process.env.JWT_SECRET_KEY,{ expiresIn:"10d"})
            res.send({ status: "Success", message: "Login Successed" ,"token":token});

            }else{
            res.send({ status: "failed", message: "Email or password is not valid" });
            }
          }else{
            res.send({ status: "failed", message: "You are not a registered User" });
          } 
        }else{
            res.send({ status: "failed", message: "Email and Password both required" })
        }
    } catch (error) {
        console.log(error)
        res.send({ status: "failed", message: "Unable to Login" });
    }
  }
  // Change password
  static changeUserPassword = async (req,res) =>{
     const {password ,password_confirmation} = req.body
     if(password && password_confirmation){
      if(password !==password_confirmation){
        res.send({ status: "failed", message: "New password and Confirm New password doesn't match"})
      }else{
         const salt = await bcrypt.genSalt(12)
         const newHashedPassword = await bcrypt.hash(password,salt)
         console.log(req.user._id)
         await userModel.findByIdAndUpdate(req.user._id, {$set :{password:newHashedPassword}})
        res.send({ status: "Success", message: "Password changed successfully",newHashedPassword})
      }
     }else{
        res.send({ status: "failed", message: "All fields required"})
     }
  }
  // Logged user
  static loggedUser = async (req,res) =>{
    res.send({"user": req.user})
  }
  
  // Send reset passeord to user
  static sendUserPasswordResetemail = async(req,res,next) =>{
    const {email} = req.body
    if(email){
      const user = await userModel.findOne({email:email})
      if(user){
        const secret = user._id + process.env.JWT_SECRET_KEY
        const token = jwt.sign({UserID:user._id},secret,{expiresIn:'15m'})
        const link = `http://localhost:3000/api/user/reset/${user._id}/${token}`
        console.log(link)
        // Send Email
        let info = await transpoter.sendMail({
          to: user.email,
          from: process.env.EMAIL_FROM,
          subject: 'Password-reset Link',
          html: `<a href=${link}>Click here</a> to Reset Your Password`
        })
      res.send({"status":"success","message":"Password reset  email sent successfully"})
      }else{
      res.send({"status":"failed","message":"Email doesn't exists"})
      }
    }else{
      res.send({"status":"failed","message":"Email field is required"})
    }
  }
  
  static userPasswordReset = async (req,res) =>{
    const {password,password_confirmation} = req.body
    const {id,token} = req.params
    const user = await  userModel.findById(id)
    const new_secret= user._id + process.env.JWT_SECRET_KEY
    try {
      jwt.verify( token, new_secret)
      if(password && password_confirmation){
        if(password !== password_confirmation){
          res.send({"status":"failed","message":"New password and confirm_password doesn't match"})
        }else{
          const salt = await bcrypt.genSalt(12)
          const newHashedPassword = await bcrypt.hash(password,salt)
          await userModel.findByIdAndUpdate(user._id, {$set :{password:newHashedPassword}})
          res.send({"status":"Success","message":"Password reset successfuly "})
        }
      }else{
      res.send({"status":"failed","message":"All fields are required "})
      }
    } catch (error) {
      console.log(error)
    }

  }
}
