import { User } from "../models/users.js";
import { sendMail } from "../utils/sendMail.js";
import { sendToken } from "../utils/sendToken.js";
import cloudinary from 'cloudinary';
import fs from 'fs'

let dateArray = [new Date().getDate(),new Date().getMonth() +1,new Date().getFullYear(),new Date().getHours(),new Date().getMinutes(),new Date().getSeconds()]

export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    // console.log(name, email, password);
    const {avatar} = req.files;    
    const cloud_data = await cloudinary.v2.uploader.upload(avatar.tempFilePath,{
      folder: 'native_todoApp'
    })
    fs.rmSync("./tmp", { recursive: true });
    
    const user = await User.findOne({ email });
    if (user) {
      return res
      .status(400)
      .json({
        success: false,
        message: "User already exists in the database!",
      });
    }
    
    // console.log(cloud_data);
    // const otp = Math.floor(Math.random() * 1000000);
    const otp = Math.floor(Math.random() * (999999 - 100000 + 1) + 100000);
    await sendMail(email, "verify your account now", otp);
    const createdUser = await User.create({
      name,
      email,
      password,
      avatar: {
        public_id: cloud_data.public_id,
        url: cloud_data.secure_url,
      },
      otp,
      otp_expiry: new Date(
        Date.now() + process.env.OTP_EXPIRY_TIME * 60 * 1000
      ),
      createdDate:dateArray,
      dummy_data:[{ cloud_data,avatar}],
    });
 
    sendToken(res, createdUser, 200, 'otp send successful! Please verify your account.');
  } catch (error) {
    console.log(error)
    return res
      .status(500)
      .json({
        success: false,
        message: "error while creating user===>",
        error,
      });
  }
};

export const verify = async(req, res) => {
    try {
        const otp = Number(req.body.otp);
        // console.log(otp,req.user._id);
        const user = await User.findById(req.user._id);
        if(otp !== user.otp && user.otp_expiry < new Date(Date.now())){
            res.status(400).json({success: false,message: 'wrong or expired otp entered'});
        }
        // console.log(user);

        user.verified = true;
        user.otp = null;
        user.otp_expiry = null;
        await user.save();
        sendToken(res, user, 200, "Account Verified");
    } catch (error) {
        // console.log(error)
        res.status(500).json({success: false,message:"error verifing otp ==>",error});
    }
};

export const login = async(req,res)=>{
    try {
        const {email,password} = req.body;

        if(!email || !password){
            res.status(400).json({success: false, message:"Please enter your email and password"})
        }
        
        const user = await User.findOne({email}).select("+password");
        if(!user){
            return res.status(400).json({success: false,message: "invalid email and password"})
        }

        const isMatch = await user.comparePassword(password)

        if(!isMatch){
            return res.status(400).json({success: false,message: "invalid email and password"});
        }

        sendToken(res, user,200,"logged in successfully!")


    } catch (error) {
        return res
      .status(500)
      .json({
        success: false,
        message: "error while creating user===>",
        error,
      });
    }
}

export const logout = (req, res) => {
    try {
        res.status(200).cookie("token",null,{expires : new Date(Date.now())}).json({success: true,message: "User logged out successfully"});
    } catch (error) {
        res.status(500).json({success: false,message:"User not logged"});
    }
};

export const addTask = async(req, res) => {
  try {
    const {title, description} = req.body;
    console.log(title,description);
    if (!title || !description){
      return res.status(400).json({success: false,message: "Please enter a title and description"});
    }

    const user = await User.findById(req.user._id);
    user.tasks.push({title,description,completed:false,createdAt:new Date(Date.now()),createdDate:dateArray});

    user.save();
    return res.status(200).json({success: true,message:"Your task has been created successfully"});
  } catch (error) {
    res.status(500).json({success: false,message:"error in adding task"});
  }
};

export const removeTask = async (req, res) => {
  try {
    const taskId = req.params.taskId;
    const user = await User.findById(req.user._id);
    user.tasks = user.tasks.filter(task => task._id.toString() !== taskId.toString());
    user.save();
    res.status(200).json({success:true,message:"Task removed successfully"});
  } catch (error) {
    res.status(500).json({success:false,message:"error removing task"});
  }
};
export const updateTask = async (req, res) => {
  try {
    const taskId = req.params.taskId;
    const user = await User.findById(req.user._id);
    if(!taskId){      
      return res.status(200).json({success:true,message:"Task fetched successfully",task:user.tasks});
     }
    // console.log(user)
    let thisTask = user.tasks.find(task => task._id.toString() === taskId.toString());
    // console.log(thisTask)
    thisTask.completed = !thisTask.completed;
    user.save();
    res.status(200).json({success:true,message:"Task updated successfully",thisTask});
  } catch (error) {
    res.status(500).json({success:false,message:"error updating task"});
  }
};
export const getTask = async (req, res) => {
  try {
    const taskId = req.params.taskId;
    const user = await User.findById(req.user._id);

    if(!taskId){      
     return res.status(200).json({success:true,message:"Task fetched successfully",task:user.tasks});
    }
    // console.log(user)
    let thisTask = user.tasks.find(task => task._id.toString() === taskId.toString());
    if(!thisTask){      
     return res.status(400).json({success:false,message:"Task fetch failed",task:user.tasks});
    }
    res.status(200).json({success:true,message:"Task fetched successfully",thisTask});
  } catch (error) {
    res.status(500).json({success:false,message:"error updating task"});
  }
};

export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    sendToken(res, user, 201, `Welcome back ${user.name}`);
  } catch (error) {
    res.status(500).json({success:false,message:"error while fetching profile"});
  }
};

export const updateProfile = async(req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const {name} = req.body;
    const {avatar} = req.files;

    if(name){
      user.name = name;
    }
    if(avatar){
      const cloud_data = await cloudinary.v2.uploader.upload(avatar.tempFilePath,{
        folder: 'native_todoApp_updated'
      })
      fs.rmSync("./tmp", { recursive: true });
      user.avatar.public_id = cloud_data.public_id;
      user.avatar.url = cloud_data.secure_url;
      user.dummy_data.push({avatar,cloud_data})
    }

    user.save();
    sendToken(res,user,200,"Profile updated successfully");
  } catch (error) {
    
    res.status(500).json({success:false,message:"error while updating profile"});
  }
};

export const updatePassword = async (req,res)=>{
  try {
    const {oldPassword,newPassword} = req.body;
    const user = await User.findById(req.user._id).select('+password');
    let isMatch = await user.comparePassword(oldPassword);
    if(!isMatch) {
      return res.status(400).json({success: false, message: 'Password mismatch'});
    }
    user.password = newPassword;
    user.save();
    
    res.status(200).json({success: true, message:"password updated successfully",user});
  } catch (error) {
    res.status(500).json({success: false, message:"Error updating password"});
  }
}

export const forgetPassword = async(req,res)=>{
  try {
    const {email} = req.body;
    const user = await User.findOne({email: email});
    if(!user){
      return res.status(400).json({success: false, message:"User not found"});
    }

    const otp = Math.floor(Math.random() * (999999 - 100000 + 1) + 100000);
    await sendMail(email, "verify your account now", otp);
    
    user.resetPasswordOtp = otp;
    user.resetPasswordOtpExpiry = new Date(Date.now() + process.env.OTP_EXPIRY_TIME * 60 * 1000);

    user.save();

    return res.status(200).json({success: true, message:` Otp successfully send to ${email}`});

  } catch (error) {
    res.status(500).json({success: false, message:"Error sending Otp"});
  }
}
export const resetPassword = async(req,res)=>{
  try {
    const {otp,newPassword} = req.body;
    const user = await User.findOne({resetPasswordOtp:otp,resetPasswordOtpExpiry:{$gt:Date.now()}});

  if(!user) {
    return res.status(400).json({success:false,message:"Invalid or Expired Otp"});
  }

  user.password = newPassword;
  
  user.resetPasswordOtp = null;
  user.resetPasswordExpiry = null;

  user.save();

    return res.status(200).json({success: true, message:`Password successfully reset for ${user.email}`});

  } catch (error) {
    res.status(500).json({success: false, message:"Error sending Otp"});
  }
}