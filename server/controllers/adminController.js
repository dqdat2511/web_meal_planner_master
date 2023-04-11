require('../models/database');
const { render } = require('ejs');
const Food = require('../models/Recipe');
const Category = require('../models/Category');
const User = require('../models/UserSchema');
const body = require('body-parser');
const hash = require('object-hash');
const cookie = require('cookie-parser');
const { title } = require('process');
const session = require('express-session');

exports.Admin = async(req,res)=>{
    const recipe = await Food.find({});
    res.render('admin',{title: 'Admin - Layout',recipe } );
}

exports.UpdateFood = async(req,res)=>{
    try {
    let reqId = req.params.id
    const recipe = await Food.findById(reqId);
    const category = await Category.find({});
  
    res.render('updateAdmin',{title: 'Update', recipe,category});
    } catch (error) {
        res.status(500).send({message: error.message || "Error Occured" });
    }
    
}

exports.UpdateFoodOne = async(req,res)=>{
    try {
        let imageUploadFile;
        let uploadPath;
        let newImageName;
        const userID = req.params.id;
        if(!req.files || Object.keys(req.files).length === 0){
          console.log('No Files where uploaded.');
        } else {
      
          imageUploadFile = req.files.image;
          newImageName = Date.now() + imageUploadFile.name;
      
          uploadPath = require('path').resolve('./') + '/public/uploads/' + newImageName;
      
          imageUploadFile.mv(uploadPath, function(err){
            if(err) return res.status(500).send(err);
          })
      
        }
    let reqId = req.params.id
    const update = { 
        name: req.body.name,
        description: req.body.description,
        ingredients: req.body.ingredients,
        category: req.body.category,
        calories:req.body.calories,
        protein:req.body.protein,
        carbohydrates:req.body.carbohydrates,
        fat:req.body.fat,
        fiber:req.body.fiber,
        sugar:req.body.sugar,
        servingsize:req.body.servingsize,
        numberofservingsize:req.body.numberofservingsize,  
        totalCalories:req.body.calories,
        image: newImageName
    }
    Food.findByIdAndUpdate(reqId, update ,{new:true}, (err,updateData)=>{
        if(!err){
        res.redirect('/admin');
    
        } else{console.log(err)}
    });    

    } catch (error) {
        res.status(500).send({message: error.message || "Error Occured" });
    }
    
}


exports.CreateFood =async (req,res) =>{
    res.render('submit-recipeadmin', {title:'Cập nhật món ăn cho riêng bạn' });
  }
  
  exports.CreateFoodPost =async (req,res) =>{
    try {

        let imageUploadFile;
        let uploadPath;
        let newImageName;
    
        if(!req.files || Object.keys(req.files).length === 0){
          console.log('No Files where uploaded.');
        } else {
    
          imageUploadFile = req.files.image;
          newImageName = Date.now() + imageUploadFile.name;
    
          uploadPath = require('path').resolve('./') + '/public/uploads/' + newImageName;
    
          imageUploadFile.mv(uploadPath, function(err){
            if(err) return res.satus(500).send(err);
          })
    
        }
        const newRecipe = new Food({
            name: req.body.name,
            description: req.body.description,
            email: req.body.email,
            ingredients: req.body.ingredients,
            category: req.body.category,
            calories:req.body.calories,
            protein:req.body.protein,
            carbohydrates:req.body.carbohydrates,
            fat:req.body.fat,
            fiber:req.body.fiber,
            sugar:req.body.sugar,
            servingsize:req.body.servingsize,
            numberofservingsize:req.body.numberofservingsize,  
            totalCalories:req.body.calories,
            image: newImageName
          });
        
        await newRecipe.save();
    
        res.redirect('/submit-recipeadmin');
      } catch (error) {
     
   
        res.redirect('/submit-recipeadmin');
      }
    
    }

    exports.DeleteAdminFood = async(req,res)=>{
      try {
        await Food.findByIdAndDelete(req.body.id);
      } catch (error) {
        console.log(error);
      }
    }
exports.user = async(req,res)=>{
  try {
    const user = await User.find({'role':0});
    const admin = await User.find({'role':1});
    console.log(admin);
    res.render('admin/user',{title:'Account page',user,admin});
  } catch (error) {
    
  }
}