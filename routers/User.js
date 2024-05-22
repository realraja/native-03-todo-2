import express from 'express';
import { addTask, forgetPassword, getProfile, getTask, login, logout, register, removeTask, resetPassword, updatePassword, updateProfile, updateTask, verify } from '../controllers/User.js';
import { isAuthenticated } from '../middleware/auth.js';
import { User } from '../models/users.js';

const router = express.Router();

router.route('/getalldatabasedata').get(async(req,res)=>{
    try {
        const allusers = await User.find().select('+password')
        return res.status(200).json({success:true, message:"All data fetched successfully", data:allusers,date:new Date(Date.now())})
    } catch (error) {
        return res.status(500).json({success:false, message:"error fetching getalldatabasedata"});
    }
})

router.route("/register").post(register);

router.route("/register").get((req,res)=>{
    return res.status(200).json({success: true,message: "User registered"})
});
router.route("/verify").post(isAuthenticated, verify);
router.route("/login").post(login);
router.route("/logout").get(logout);

router.route("/addtask").post(isAuthenticated , addTask);
router.route("/removetask/:taskId").delete(isAuthenticated , removeTask);
router.route("/updatetask/:taskId").get(isAuthenticated , updateTask);
router.route("/task/:taskId?").delete(isAuthenticated , removeTask).get(isAuthenticated , updateTask);
router.route("/gettask/:taskId?").get(isAuthenticated , getTask);

router.route("/me").get(isAuthenticated , getProfile);
router.route("/updateprofile").put(isAuthenticated , updateProfile);
router.route("/updatepassword").put(isAuthenticated , updatePassword);

router.route("/forgetpassword").post(forgetPassword);
router.route("/resetpassword").post(resetPassword);

export default router;