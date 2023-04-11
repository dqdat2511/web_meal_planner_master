const mongoose = require('mongoose');

const users = new mongoose.Schema({
  name:String,
  username:{type:String, required:true, unique:true},
  password:{type:String, unique:false},
  Age:Number,
  Benh:String,
  Sex:String,
  Weight:Number,
  Height:Number,
  ActivityLevel:String,
  Goal:String,
  status:String,
  calories:Number,
  role:Number,
  token:{
    type:String,
    default:''
  },
  foodinformation:[{
    name:String,
    calories:Number,
    protein:Number,
    carbohydrates:Number,
    fat:Number,
    fiber:Number,
    sugar:Number,
    servingsize:Number,
    numberofservingsize:Number,
    image:String,
    totalCalories:Number}],
  meal:{
    Sang:{
      id:String
    },
    Trua:{
      id:Array
    },
    Chieu:{
      id:Array
    },
    Phu:{
      id:Array
    }
  }
})


module.exports = mongoose.model('users', users);;
