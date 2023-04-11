require('dotenv').config();

const { render, name } = require('ejs');
const Schema = require('../models/UserSchema');
const hash = require('object-hash');
const cookie = require('cookie-parser');
const jwt = require('jsonwebtoken');
const { model } = require('mongoose');
const { request } = require('express');
const nodemailer = require('nodemailer');
const config = require('../config/config');
const randomstring = require('randomstring');
const bcrypt = require('bcrypt');


exports.login = async(req, res)=>{  
  const infoErrorsObj = req.flash('infoErrors');
    res.render('login', {title: "Login Meal-Planner",infoErrorsObj});        
}


exports.logIn = async(req, res) =>{
  let username = "username";
  const name = req.body.username.toLowerCase();
  const user = await Schema.find({'username': name});
  const password = bcrypt.compare(req.body.password , user[0].password , async function(err,result){
   
  if (!user || result !== true) {
    // Nếu thông tin đăng nhập không chính xác, hiển thị lại trang đăng nhập
    req.flash('infoErrors', 'Thông tin đăng nhập không chính xác');  
    res.redirect('/login');
    
  } else 
  {
    const update = { $set: { status: "Active" } };
   await Schema.findOneAndUpdate({'username': name}, update);
    res.cookie(username, req.body.username.toLowerCase());   
    req.session.user = { name }; 
    var token = jwt.sign({_id:user[0]._id},'secretkey');
    res.redirect('/'); 
  }
});
    // Schema.find({}, (err,data)=>{
    //     for(let i=0; i<data.length;i++){
    //       if(req.body.username.toLowerCase()=== data[i].username.toLowerCase()){
    //         Schema.updateMany({status:'Active'}, {status:'not active'}, {new:true}, (err,userInfo)=>{
    //           Schema.findOneAndUpdate({username:req.body.username.toLowerCase()}, {status:'Active'}, {new:true}, (err,active)=>{
    //             // res.redirect(`/Nutrition/${active._id}/`)                             
    //                  if(password === data[i].password){  
    //                   res.cookie(username, req.body.username.toLowerCase());      
    //                   req.session.user = { username };            
    //                   return res.redirect('/');                  
    //                  }else {
    //                   // Nếu thông tin đăng nhập không chính xác, hiển thị lại trang đăng nhập
    //                   res.render('login', { error: 'Thông tin đăng nhập không chính xác' });
    //                 }              
    //           })
    //         })
    //       }
    //     }
    //   })
}

exports.forget_pass = async(req,res)=>{
  try {
    res.render('forget_pass');
  } catch (error) {
    res.status(500).send({message: error.message || "Error Occured" });
  }
}
exports.forget_Verify = async(req,res)=>{
  try {
    var email = req.body.name;
    const userEmail =  await Schema.findOne({name:email});
    if(userEmail){
      const randomString = randomstring.generate();
      const updatedData = await Schema.updateOne({name:email},{$set:{token:randomString}});
      sendResetPasswordMail(userEmail.username, userEmail.name, randomString);
      res.render('forget_pass',{message:'Kiểm tra email để reset mật khẩu'});

    }else
    {
      res.render('forget_pass',{message:'Không tìm thấy email'});
    }
  } catch (error) {
    
  }
}

const sendResetPasswordMail = async(name,email,token)=>{
  try {
   const transporter =  nodemailer.createTransport({
      host:'smtp.gmail.com',
      port:587,
      secure:false,
      requireTLS: true,
      auth:{
        user:config.emailUser,
        pass:config.emailPassword
      }
    });
    const mailOption = {
      from:config.emailUser,
      to:email,
      subject:'Khởi tạo lại mật khẩu',
      html:'<p>Chào' + name +', Nhấn vào đây để <a href="http://localhost:3000/reset-password?token='+token+'">đổi mật khẩu</a></p>'
    }
    transporter.sendMail(mailOption, function(error,info){
      if(error){
        console.log(error);
      }else{
        console.log("Đã gửi thư xác nhận dến email", info.response);
      }
    })
  } catch (error) {
    
  }
}

exports.resetPassword = async(req,res)=>{
  try {
    const token = req.query.token;
    const tokenData =await Schema.findOne({token:token});
    if(tokenData){
      res.render('reset_pass',{user_id:tokenData._id});
    }else{
      res.render('404',{message:"Token không hợp lệ"});
    }
  } catch (error) {
   console.log(error);
  }
}
exports.resetPasswordPost = async(req,res)=>{
  try {
    const user_id = req.body.user_id;
    const password =req.body.password;
    const password2 = req.body.password2;
    if(password !== password2){
      res.render('reset_pass',{message:'mật khẩu không trùng khớp'});
    }else{
      const passwordHash = await bcrypt.hash(password,10);
    const updateData =  await Schema.findByIdAndUpdate({_id:user_id},{$set:{password:passwordHash, token:''}});
    res.redirect('/');
    }
  } catch (error) {
    console.log(error);
  }
}
// exports.logout = async(req, res) =>{
//     Schema.find({}, (err,data)=>{      
//       let username = "username";
//           // if(req.body.username.toLowerCase()=== data[i].username.toLowerCase()){
//           //   Schema.updateMany({status:'not active'}, {status:'Active'}, {new:true}, (err,userInfo)=>{
//           //     Schema.findOneAndUpdate({username:req.body.username.toLowerCase()}, {status:'no active'}, {new:true}, (err,active)=>{
//           //    console.log(data[i].username);
//           //     //  res.redirect('/');
//           //   //    return
//           //     })
//           //   })
//           // }    
//           console.log(req.body.username)   
//       })
// }
