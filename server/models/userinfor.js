const mongoose = require('mongoose')

const user = new mongoose.Schema({
  username:{type:String, required:true, unique:true},
  Nutrition:{
  Age:String,
  Sex:String,
  Weight:Number,
  Height:Number,
  ActivityLevel:String,
  Goal:String,
  status:String},
  role:Number
})

const userInfo = mongoose.model('UserInfo', user)

module.exports = userInfo