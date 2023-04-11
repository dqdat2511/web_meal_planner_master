require('../models/database');
const { render } = require('ejs');
const Category = require('../models/Category');
const Recipe = require('../models/Recipe');
const Schema = require('../models/UserSchema');
const {check,validationResult} = require('express-validator');
const benhSchema = require('../models/Benh');
const cookie = require('cookie-parser');
const { title } = require('process');
const session = require('express-session');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

//const userInfo = require('../models/userinfor');

let formula = 0;
exports.homepage = async(req, res) => {
    
    try {
  
        const limitNumber = 5;
        const categories = await Category.find({}).limit(limitNumber);
        const latest = await Recipe.find({}).sort({_id: -1}).limit(limitNumber);
        const chien = await Recipe.find({'category': 'Chiên'}).limit(limitNumber);
        const nuong = await Recipe.find({'category': 'Nướng'}).limit(limitNumber);
        const xao = await Recipe.find({'category': 'Xào'}).limit(limitNumber);
        const food = {latest,chien,nuong,xao};
        let username = req.cookies.username;  
        const userStatus = await Schema.find({'username':username});      
              
        res.render('index',{title: 'Meal planner - Home', categories, food,userStatus, username, user: req.session.user 
      })
    
    } catch (error) {
        res.status(500).send({message: error.message || "Error Occured" });
    }
    
}

/**
 * GET /categories
 * Categories 
*/
exports.exploreCategories = async(req, res) => {
    try {
      const limitNumber = 20;
      const categories = await Category.find({}).limit(limitNumber);
      res.render('categories', { title: 'Dishes - Categoreis', categories } );
    } catch (error) {
      res.status(500).send({message: error.message || "Error Occured" });
    }
  } 

/**
 * GET /categories/:id
 * Categories By Id
*/
exports.exploreCategoriesById = async(req, res) => { 
  try {
    let categoryId = req.params.id;
    const limitNumber = 20;
    const categoryById = await Recipe.find({ 'category': categoryId }).limit(limitNumber);
    res.render('categories', { title: 'Dishes - Categoreis', categoryById } );
  } catch (error) {
    res.status(500).send({message: error.message || "Error Occured" });
  }
} 
 
  /**
 * GET /recipes
 * Recipes 
*/
exports.exploreRecipe = async(req, res) => {
  try {
    let recipeId = req.params.id;
    const recipe = await Recipe.findById(recipeId);
    res.render('recipe', { title: 'Meal Planner - Recipe', recipe } );
  } catch (error) {
    res.status(500).send({message: error.message || "Error Occured" });
  }
} 


/**
 * POST /search
 * Search 
*/
exports.searchRecipe = async(req, res) => {
  try {
    let searchTerm = req.body.searchTerm;
    let recipe = await Recipe.find( { $text: { $search: searchTerm, $diacriticSensitive: true } });
   res.render('search', { title: 'Meal Planner - Search', recipe } );
   
  } catch (error) {
    res.status(500).send({message: error.message || "Error Occured" });
  }
  
}


//sign up
exports.signUp = async(req,res)=>{
  const check = await Schema.find({status:'Active'})
  const infoErrorsObj = req.flash('infoErrors');
  try {
    res.render('signup', {title: 'Sign Up',infoErrorsObj});   
  } catch (error) {
    console.log(error)
  }

}

exports.AfterSignUp =  async(req,res)=>{
  const error = validationResult(req);
  if(!error.isEmpty()){
    req.flash('infoErrors', error.array()[0].msg);  
    res.redirect('/signup');
  }else{
  const hashpass = await bcrypt.hash(req.body.password,10);
     Schema.find({}, (err,data)=>{
      for(let i=0;i<data.length;i++){
        if(req.body.username.toLowerCase()=== data[i].username.toLowerCase()||req.body.name===data[i].name){   
          req.flash('infoErrors', 'Tài khoản đã tồn tại');  
          res.redirect('/signup');
        } 
      }
      Schema.updateMany({status:'Active'},{status:'not active'}, {new:true}, (err,userInfo)=>{   
        const body = {
          name:req.body.name,
          username:req.body.username.toLowerCase(),
          status:req.body.status,
          password:hashpass,
          role: req.body.role
        }
            Schema.create(body, (err,data)=>{  
              if(!err){
                const name = body.username;
                let username = "username";
                res.cookie(username, body.username.toLowerCase());   
                req.session.user = { name };        
                res.redirect('/bmr-build');  
              }else{  
                console.log(err);
              }                                          
          })
      })
    
  })
  }

}

// brmCalculateHomePage
exports.brmCalculateHomePage = async(req,res) =>{
  let logined = req.cookies.username; 
const benh = await benhSchema.find({});
Schema.find({'username':logined} , {calories:formula}, {new:true}, (err,data)=>{
  if(!err){
    res.render('bmr-build', {final:formula, data,benh})
  }
 })
}

//bmr
exports.brmCalculate = async(req, res) =>{  
  try {
  const userID = req.params.id;
  const meal = await Recipe.find({});  
  Schema.find({'_id': userID} , (err,data)=>{    
    let total = 0;
    let targetcalorie = 0;
    let mon1 = 0
    let mon2 =0;  
    let mon3 =0;
    limitNumber=2;
    targetcalorie = data[0].calories;
    const minProtein = (((targetcalorie*0.1)/4)/3).toFixed(2);
  const maxProtenin = (((targetcalorie*0.2)/4)/3).toFixed(2);
  const minCarb = (((targetcalorie*0.25)/4)/3).toFixed(2);
  const maxCarb = (((targetcalorie*0.65)/4)/3).toFixed(2);
    canNang = data[0].Weight;
    doituong = data[0].Benh;
    if(doituong == 'Bệnh Gout'){
      forGout(targetcalorie, canNang , res, userID);
    }
    else if(doituong == 'Suy dinh dưỡng'){
      forSuyDinhDuong(targetcalorie, res, userID);
    }
    else if(doituong == 'Đái tháo đường'){
      forDaiThaoDuong(targetcalorie, res, userID);
    }
    else if(doituong == 'Bình thường'){
      try {
        const targetcalorieSang = targetcalorie*0.3 
      
        //chất xơ
      const Fiber = meal.filter(chatxo => chatxo.protein >= minProtein && chatxo.protein <=maxProtenin && chatxo.carbohydrates >= minCarb && chatxo.carbohydrates <= maxCarb );
      const fiberresult = Fiber[Math.floor(Math.random()*Fiber.length)]; 
      for(let i = 0; i< Fiber.length; i++){
        mon1 = fiberresult.calories
      }
        //chất đạm   
      const Protein = meal.filter(dam => dam.protein >= minProtein && dam.protein <=maxProtenin && dam.carbohydrates >= minCarb  && dam.carbohydrates <= maxCarb && dam.name != fiberresult.name );
      const protenresult = Protein[Math.floor(Math.random()*Protein.length)];
      for(let i = 0; i< Protein.length; i++){
        mon2 = protenresult.calories
      }
      //carb
      const Carb = meal.filter(tinhbot => tinhbot.fiber >3 && tinhbot.protein >= (targetcalorieSang*0.02) && tinhbot.protein <= (targetcalorieSang*0.12)&& tinhbot.carbohydrates >= 0.02*targetcalorieSang && tinhbot.name != protenresult.name && tinhbot.name != fiberresult.name );
      const Carbresult = Carb[Math.floor(Math.random()*Carb.length)];
        for(let i = 0; i< Carb.length; i++){
          mon3 = Carbresult.calories
        }
      let total = Math.max(mon1,mon2,mon3); 
      let totalMaxPro = Math.max(fiberresult.protein, protenresult.protein, Carbresult.protein);
      let totalMaxCarb = Math.max(fiberresult.carbohydrates, protenresult.carbohydrates, Carbresult.carbohydrates)
      const leftMaxCarb = (maxCarb*3-totalMaxCarb)/2;
      const leftMinCarb = (minCarb*3-totalMaxCarb)/2;
      const leftMaxProtein = ((maxProtenin*3 -totalMaxPro)/2).toFixed(2);
      const leftMinProtein = ((minProtein*3 - totalMaxPro)/2).toFixed(2);

      /////Bữa trưa
      const lunchCalories = (targetcalorie)*0.4 + (targetcalorie- total);
      const recipeTrua = meal.filter(foodTrua => foodTrua.calories <= lunchCalories);
      //Chất xơ
      const FiberLunch = meal.filter(chatxoTrua => chatxoTrua.fiber >=6  && chatxoTrua.protein <=(leftMinProtein/2)  );
      const fiberTruaresult = FiberLunch[Math.floor(Math.random()*FiberLunch.length)];
      
      //chất đạm       
      const ProteinTrua = recipeTrua.filter(damTrua => damTrua.protein >= (leftMinProtein-fiberTruaresult.protein) && damTrua.protein <=(leftMaxProtein-fiberTruaresult.protein) && damTrua.carbohydrates <= (leftMaxCarb - fiberTruaresult.carbohydrates)  && damTrua.calories >= lunchCalories*0.1 && damTrua.calories <= lunchCalories*0.2 ); 
      const protenTruaresult1 = ProteinTrua[Math.floor(Math.random()*ProteinTrua.length)];
      const ProteinTrua2 = recipeTrua.filter(damTrua2 => damTrua2.protein >= (leftMinProtein-protenTruaresult1.protein) && damTrua2.protein <=(leftMaxProtein-protenTruaresult1.protein) && damTrua2.carbohydrates <=(leftMaxCarb - (fiberTruaresult.carbohydrates + protenTruaresult1.carbohydrates)) && damTrua2.calories >= lunchCalories*0.1  && damTrua2.calories <= lunchCalories*0.3 && damTrua2.name != protenTruaresult1.name );
      const protenTruaresult2 = ProteinTrua2[Math.floor(Math.random()*ProteinTrua2.length)];  
      const protenTruaresult = {
        protenTruaresult1, protenTruaresult2,         
      } 

      const carbMinConLai=( minCarb*3 - (protenTruaresult1.carbohydrates+protenTruaresult2.carbohydrates+fiberTruaresult.carbohydrates+totalMaxCarb) )
      const carbMaxConLai= ((maxCarb*3 - (protenTruaresult1.carbohydrates+protenTruaresult2.carbohydrates+fiberTruaresult.carbohydrates+totalMaxCarb)) )
    
      //carb
      const CarbTrua = meal.filter(tinhbotTrua => tinhbotTrua.carbohydrates >= carbMinConLai  && tinhbotTrua.carbohydrates <= carbMaxConLai && tinhbotTrua.calories <= lunchCalories*0.4 - (protenTruaresult1.calories + protenTruaresult2.calories) );
      const CarbTruaresult = CarbTrua[Math.floor(Math.random()*CarbTrua.length)];
      const allTruaID =[ 
        fiberTruaresult._id,
        protenTruaresult1._id,
        protenTruaresult2._id,
        CarbTruaresult._id,
        
      ]
    
      let totaltrua = fiberTruaresult.calories + protenTruaresult1.calories + protenTruaresult2.calories + CarbTruaresult.calories
      const trua = {
        recipeTrua,fiberTruaresult,protenTruaresult,CarbTruaresult,totaltrua,allTruaID
      }
      chatxoTrua => chatxoTrua.fiber >=6  && chatxoTrua.protein <=(leftMinProtein/2)  && chatxoTrua.calories >= lunchCalories*0.05
      //Bữa Chiều
      const conlai = targetcalorie - (total + totaltrua);
      const caloriesChieu =  targetcalorie*0.3;
      const recipeChieu = meal.filter(foodChieu => foodChieu.calories <= caloriesChieu);
      //Chất xơ
      const FiberChieu = recipeChieu.filter(chatxoChieu => chatxoChieu.fiber>=6 && chatxoChieu.protein <=(caloriesChieu*0.03) && chatxoChieu.calories >=(caloriesChieu*0.1)  );
      const fiberChieuresult = FiberChieu[Math.floor(Math.random()*FiberChieu.length)];
        //chất đạm   
      const ProteinChieu = recipeChieu.filter(damChieu => damChieu.protein >= (caloriesChieu*0.025) && damChieu.protein <=(caloriesChieu*0.15) && damChieu.carbohydrates <= (caloriesChieu*0.1) && damChieu.calories <= (caloriesChieu*0.4) && damChieu.calories >= (caloriesChieu*0.2));
      const protenChieuresult1 = ProteinChieu[Math.floor(Math.random()*ProteinChieu.length)];
      const protenChieuresult = {
        protenChieuresult1
      } 
      //carb
      
      const CarbChieu = recipeTrua.filter(tinhbotChieu => tinhbotChieu.carbohydrates <= (caloriesChieu*0.6)  && tinhbotChieu.carbohydrates >= (caloriesChieu*0.1)  && tinhbotChieu.calories <= (caloriesChieu*0.6)  && tinhbotChieu.calories >= (caloriesChieu*0.1) );
      const CarbChieuresult = CarbChieu[Math.floor(Math.random()*CarbChieu.length)];
      const allChieuID = [
        fiberChieuresult._id,
        protenChieuresult1._id,
        CarbChieuresult._id
      ]   
      let totalChieu = fiberChieuresult.calories  + protenChieuresult1.calories + CarbChieuresult.calories
      const chieu = {
        recipeChieu,fiberChieuresult,protenChieuresult,CarbChieuresult,totalChieu,allChieuID
      }   
           
      
      const totalForAll = total + totaltrua + totalChieu
      res.render('bmr', {title:'Meal Hint', data, fiberresult,protenresult,Carbresult,total,trua,chieu,totalForAll, userID, meal});
      } catch (error) {
        const successMsg = req.flash('sorry');
        res.render('cannotFind', { message:"Xin lỗi" });
      }
      
      
    }
   
  })
  
  }  catch (error) {
    res.status(500).send({message: error.message || "Error Occured" });
  } 
}

//theo doi tuong
async function forGout(targetcalorie, canNang , res,userID) {

const meal = await Recipe.find({});
const minProtein = (((targetcalorie*0.1)/4)/3).toFixed(2);
const maxProtenin = (((targetcalorie*0.15)/4)/3).toFixed(2);
const minCarb = (((targetcalorie*0.25)/4)/3).toFixed(2);
const maxCarb = (((targetcalorie*0.7)/4)/3).toFixed(2);

let mon1 = 0
let mon2 =0;  
let mon3 =0;

  try {
    //Bua sang
    const recipe = meal.filter(food => food.protein >= minProtein && food.protein <= maxProtenin  && food.carbohydrates >= minCarb && food.carbohydrates <= maxCarb );
    const BuaSangresult= recipe[Math.floor(Math.random()*recipe.length)];
    for(let i =0;BuaSangresult.length;i++){
      mon1 = BuaSangresult.calories
    }
    const Protein = meal.filter(dam => dam.protein >= minProtein && dam.protein <= maxProtenin && dam.carbohydrates >= minCarb  && dam.carbohydrates <= maxCarb && dam.name != BuaSangresult.name );
    const protenresult = Protein[Math.floor(Math.random()*Protein.length)];
    for(let i = 0; i< Protein.length; i++){
      mon2 = protenresult.calories
    }
    
    const Carb = meal.filter(food => food.protein >= minProtein && food.protein <= maxProtenin  && food.carbohydrates >= minCarb && food.carbohydrates <= maxCarb && food.name != protenresult.name  );
      const Carbresult = Carb[Math.floor(Math.random()*Carb.length)];
      for(let i = 0; i< Carb.length;i++){
          mon3 = Carbresult.calories
      }
    
   //leftCarb
 
   let total = Math.max(mon1,mon2,mon3); 
   let totalMaxPro = Math.max(BuaSangresult.protein, protenresult.protein, Carbresult.protein);
   let totalMaxCarb = Math.max(BuaSangresult.carbohydrates, protenresult.carbohydrates, Carbresult.carbohydrates);
   let totalMaxFiber = Math.max(BuaSangresult.fiber, protenresult.fiber, Carbresult.fiber);
   let totalMaxSugar = Math.max(BuaSangresult.sugar, protenresult.sugar, Carbresult.sugar);
   let totalMaxFat = Math.max(BuaSangresult.fat, protenresult.fat, Carbresult.fat);

   const leftMaxCarb = (maxCarb*3-totalMaxCarb)/2;
   const leftMinCarb = (minCarb*3-totalMaxCarb)/2;
   const leftMaxProtein = ((maxProtenin*3 -totalMaxPro)/2).toFixed(2);
   const leftMinProtein = ((minProtein*3 - totalMaxPro)/2).toFixed(2);
   
   const lunchCalories = (targetcalorie)*0.4 + (targetcalorie- total);

   //Bua trua 
    const chatxo  = meal.filter(food => food.fiber >=6 && food.protein <= leftMinProtein/3);
    const XoTruaResult = chatxo[Math.floor(Math.random()*chatxo.length)];
    
   const recipeTrua = meal.filter(food => food.protein >= leftMinProtein-XoTruaResult.protein && food.protein <= leftMaxProtein-XoTruaResult.protein &&food.carbohydrates <= leftMaxCarb-XoTruaResult.carbohydrates && food.calories >= lunchCalories*0.1 && food.calories <= lunchCalories*0.4);
   const DamTruaresult= recipeTrua[Math.floor(Math.random()*recipeTrua.length)];
  
  //  const recipeTrua2 = meal.filter(food => food.protein >= 0.2*canNang && food.protein <= 0.3*canNang && food.calories >= 0.05*caloriesTrua && food.carbohydrates <= caloriesTrua*0.3 && food.name != DamTruaresult.name);
  //  const DamTruaresult2= recipeTrua2[Math.floor(Math.random()*recipeTrua2.length)];
   const Damtrua ={
    DamTruaresult
   }
   
    const tinhbot = meal.filter(food =>food.carbohydrates >= leftMinCarb-DamTruaresult.carbohydrates && food.carbohydrates <= leftMaxCarb-DamTruaresult.carbohydrates && food.protein >= leftMinProtein - DamTruaresult.protein && food.protein <= leftMaxProtein - DamTruaresult.protein && food.calories >= lunchCalories*0.1 && food.calories <= lunchCalories*0.4);
    const tinhbotresult = tinhbot[Math.floor(Math.random()*tinhbot.length)];
    
    //ID cac Mon
    const allTruaID = [
      XoTruaResult._id,
      DamTruaresult._id,  
      tinhbotresult._id
    ]
    
    totalSangTrua =  XoTruaResult.calories + DamTruaresult.calories  + tinhbotresult.calories;
    const trua ={ XoTruaResult,Damtrua,tinhbotresult,totalSangTrua,allTruaID }

    //Bua toi
    const caloriesChieu =  targetcalorie*0.3;

    
    const leftMaxProForChieu = maxProtenin*3 - (BuaSangresult.protein+XoTruaResult.protein + DamTruaresult.protein + tinhbotresult.protein);
    const leftMinProForChieu = minProtein*3 - (BuaSangresult.protein+XoTruaResult.protein + DamTruaresult.protein + tinhbotresult.protein);
    const leftMaxCarbForChieu = maxCarb*3 - (BuaSangresult.carbohydrates+XoTruaResult.carbohydrates + DamTruaresult.carbohydrates + tinhbotresult.carbohydrates);
    const leftMinCarbForChieu = minCarb*3 - (XoTruaResult.carbohydrates + DamTruaresult.carbohydrates + tinhbotresult.carbohydrates);
     
    
    const chatxoChieu  = meal.filter(food => food.fiber >=6 && food.protein <=leftMaxProForChieu/3);
    const XoChieuResult = chatxoChieu[Math.floor(Math.random()*chatxoChieu.length)];

   const recipeChieu = meal.filter(food => food.protein >= leftMinProForChieu-XoChieuResult.protein  && food.protein <= leftMaxProForChieu-XoChieuResult.protein && food.carbohydrates >=leftMinCarbForChieu-XoChieuResult.carbohydrates && food.calories >=(caloriesChieu*0.1)  && food.calories <= (caloriesChieu*0.4) );
   const DamChieuresult= recipeChieu[Math.floor(Math.random()*recipeChieu.length)];
   const DamChieu ={
    DamChieuresult
   }
  
    const tinhbotChieu = meal.filter(food =>food.carbohydrates >= leftMinCarbForChieu-DamChieuresult.carbohydrates && food.carbohydrates <= leftMaxCarbForChieu && food.protein >= (leftMinProForChieu - DamChieuresult.protein) && food.protein <= (leftMaxProForChieu - DamChieuresult.protein) && food.calories <= (caloriesChieu*0.6)  && food.calories >= (caloriesChieu*0.2));
    const tinhbotChieuresult = tinhbotChieu[Math.floor(Math.random()*tinhbotChieu.length)];
   
    const allChieuID = [
      XoChieuResult._id,
      DamChieuresult._id,
      tinhbotChieuresult._id
    ]
    totalChieu = XoChieuResult.calories  + DamChieuresult.calories +  tinhbotChieuresult.calories;
    const chieu ={
      XoChieuResult,DamChieu,tinhbotChieuresult,totalChieu,allChieuID
    }

   const totalAll = totalSangTrua+totalChieu + total;
   const proteinAll = (totalMaxPro + XoTruaResult.protein + DamTruaresult.protein + tinhbotresult.protein + XoChieuResult.protein + DamChieuresult.protein  + tinhbotChieuresult.protein ).toFixed(2);
   const fiberAll =(totalMaxFiber + XoTruaResult.fiber + DamTruaresult.fiber + tinhbotresult.fiber + XoChieuResult.fiber + DamChieuresult.fiber + tinhbotChieuresult.fiber ).toFixed(2);
   const fatAll =(totalMaxFat + XoTruaResult.fat + DamTruaresult.fat  + tinhbotresult.fat + XoChieuResult.fat + DamChieuresult.fat + tinhbotChieuresult.fat ).toFixed(2);
   const CarbAll =(totalMaxCarb + XoTruaResult.carbohydrates + DamTruaresult.carbohydrates + tinhbotresult.carbohydrates + XoChieuResult.carbohydrates + DamChieuresult.carbohydrates  + tinhbotChieuresult.carbohydrates ).toFixed(2);
   const sugarAll =(totalMaxSugar + XoTruaResult.sugar + DamTruaresult.sugar  + tinhbotresult.sugar + XoChieuResult.sugar + DamChieuresult.sugar +  tinhbotChieuresult.sugar ).toFixed(2);
   const allNutri ={ proteinAll,fiberAll,fatAll,CarbAll,sugarAll, }
  
   res.render('forpatent', {title:'Meal Hint', targetcalorie,BuaSangresult,protenresult,Carbresult,trua,chieu,totalAll,allNutri,userID, meal});
  } catch (error) {
    
    res.render('cannotFind', { message:"Xin lỗi" });
  }
 
}

async function forDaiThaoDuong(targetcalorie,res,userID) {
  const meal = await Recipe.find({});
const minProtein = (((targetcalorie*0.1)/4)/3).toFixed(2);
const maxProtenin = (((targetcalorie*0.2)/4)/3).toFixed(2);
const minCarb = (((targetcalorie*0.3)/4)/3).toFixed(2);
const maxCarb = (((targetcalorie*0.5)/4)/3).toFixed(2);
let mon1 = 0
let mon2 =0;  
let mon3 =0;

  try {
    const caloriesSang = targetcalorie*0.3
    const caloriesTrua = targetcalorie*0.3
    const caloriesChieu = targetcalorie*0.3
    const caloriesPhu = targetcalorie*0.1
    
    //Bua sang
    const recipe = meal.filter(food =>food.carbohydrates >=minCarb && food.carbohydrates <= maxCarb  && food.protein >= minProtein && food.protein <= maxProtenin )
    const BuaSangresult= recipe[Math.floor(Math.random()*recipe.length)]; 
    for(let i =0;BuaSangresult.length;i++){
      mon1 = BuaSangresult.calories
    }
    const Protein = meal.filter(dam => dam.protein >= minProtein && dam.protein <= maxProtenin && dam.carbohydrates >= minCarb  && dam.carbohydrates <= maxCarb && dam.name != BuaSangresult.name );
    const protenresult = Protein[Math.floor(Math.random()*Protein.length)];
    for(let i = 0; i< Protein.length; i++){
      mon2 = protenresult.calories
    }
    
    const Carb = meal.filter(food => food.protein >= minProtein && food.protein <= maxProtenin  && food.carbohydrates >= minCarb && food.carbohydrates <= maxCarb && food.name != protenresult.name  );
      const Carbresult = Carb[Math.floor(Math.random()*Carb.length)];
      for(let i = 0; i< Carb.length;i++){
          mon3 = Carbresult.calories
      }
    
    let total = Math.max(mon1,mon2,mon3); 
    let totalMaxPro = Math.max(BuaSangresult.protein, protenresult.protein, Carbresult.protein);
    let totalMaxCarb = Math.max(BuaSangresult.carbohydrates, protenresult.carbohydrates, Carbresult.carbohydrates);
    let totalMaxFiber = Math.max(BuaSangresult.fiber, protenresult.fiber, Carbresult.fiber);
    let totalMaxSugar = Math.max(BuaSangresult.sugar, protenresult.sugar, Carbresult.sugar);
    let totalMaxFat = Math.max(BuaSangresult.fat, protenresult.fat, Carbresult.fat);
    
    const leftMaxCarb = (maxCarb*3-totalMaxCarb)/2;
    const leftMinCarb = (minCarb*3-totalMaxCarb)/2;
    const leftMaxProtein = ((maxProtenin*3 -totalMaxPro)/2).toFixed(2);
    const leftMinProtein = ((minProtein*3 - totalMaxPro)/2).toFixed(2);
    
    //Lunch 
    const chatxo  = meal.filter(food => food.fiber >=6 && food.protein <= leftMinProtein/2 );
    const XoTruaResult = chatxo[Math.floor(Math.random()*chatxo.length)];

   const recipeTrua = meal.filter(food => food.protein >= leftMinProtein-XoTruaResult.protein && food.protein <= (leftMaxProtein-XoTruaResult.protein)  && food.carbohydrates <= (leftMaxCarb-XoTruaResult.carbohydrates));
   const DamTruaresult= recipeTrua[Math.floor(Math.random()*recipeTrua.length)];
  //  const recipeTrua2 = meal.filter(food => food.protein >= (leftMinProtein-DamTruaresult.protein - XoTruaResult.protein)  && food.protein <= (leftMaxProtein-DamTruaresult.protein - XoTruaResult.protein)  && food.carbohydrates <= (leftMaxCarb - DamTruaresult.carbohydrates - XoTruaResult.carbohydrates)   && food.name != DamTruaresult.name);
  //  const DamTruaresult2= recipeTrua2[Math.floor(Math.random()*recipeTrua2.length)];
   const Damtrua ={
    DamTruaresult
   }

   const carbMinConLai=( minCarb*3 - (DamTruaresult.carbohydrates+XoTruaResult.carbohydrates+totalMaxCarb) )
   const carbMaxConLai= ((maxCarb*3 - (DamTruaresult.carbohydrates+XoTruaResult.carbohydrates+totalMaxCarb)) )
   

    const tinhbot = meal.filter(food =>food.carbohydrates >= carbMinConLai && food.carbohydrates <= carbMaxConLai && food.protein >= leftMinProtein - DamTruaresult.protein && food.protein <= leftMaxProtein - DamTruaresult.protein);
    const tinhbotresult = tinhbot[Math.floor(Math.random()*tinhbot.length)];
    const allTruaID = [
      XoTruaResult._id,
      DamTruaresult._id,
      tinhbotresult.id
    ]
  let totalSangTrua =  XoTruaResult.calories + DamTruaresult.calories +  tinhbotresult.calories
    const trua ={ XoTruaResult,Damtrua,tinhbotresult,totalSangTrua,allTruaID }
   
    //Dinner 

    const leftMaxProForChieu = maxProtenin*3 - (totalMaxPro+XoTruaResult.protein + DamTruaresult.protein + tinhbotresult.protein);
    const leftMinProForChieu = minProtein*3 - (totalMaxPro+XoTruaResult.protein + DamTruaresult.protein + tinhbotresult.protein);
    const leftMaxCarbForChieu = maxCarb*3 - (totalMaxCarb+XoTruaResult.carbohydrates + DamTruaresult.carbohydrates + tinhbotresult.carbohydrates);
    const leftMinCarbForChieu = minCarb*3 - (totalMaxCarb+XoTruaResult.carbohydrates + DamTruaresult.carbohydrates + tinhbotresult.carbohydrates);
     
    const chatxoChieu  = meal.filter(food => food.fiber >=6 && food.protein <=leftMaxProForChieu/3 <= caloriesChieu*0.15  && food.protein <=0.03*caloriesChieu);
    const XoChieuResult = chatxoChieu[Math.floor(Math.random()*chatxoChieu.length)];

   const recipeChieu = meal.filter(food => food.protein >= leftMinProForChieu-XoChieuResult.protein  && food.protein <= leftMaxProForChieu-XoChieuResult.protein   && food.carbohydrates >=leftMinCarbForChieu-XoChieuResult.carbohydrates && food.calories >= 0.05*caloriesChieu  && food.calories <=0.4*caloriesChieu );
   const DamChieuresult= recipeChieu[Math.floor(Math.random()*recipeChieu.length)];
  //  const recipeChieu2 = meal.filter(food => food.protein >= 0.03*caloriesChieu && food.protein <= 0.05*caloriesChieu && food.calories >= 0.05*caloriesChieu && food.carbohydrates <= caloriesChieu*0.3 && food.calories <=0.35*caloriesChieu && food.name != DamChieuresult.name);
  //  const DamChieuresult2= recipeChieu2[Math.floor(Math.random()*recipeChieu2.length)];
   const DamChieu ={
    DamChieuresult
   }
    const tinhbotChieu = meal.filter(food =>food.carbohydrates >= leftMinCarbForChieu-DamChieuresult.carbohydrates && food.carbohydrates <= leftMaxCarbForChieu && food.protein >= leftMinProForChieu - DamChieuresult.protein && food.protein <= leftMaxProForChieu - DamChieuresult.protein);
    const tinhbotChieuresult = tinhbotChieu[Math.floor(Math.random()*tinhbotChieu.length)];
    const allChieuID = [
      XoChieuResult._id,
      DamChieuresult._id,
      tinhbotChieuresult._id
    ]
   let totalChieu = XoChieuResult.calories  + DamChieuresult.calories  + tinhbotChieuresult.calories;
    const chieu ={
      XoChieuResult,DamChieu,tinhbotChieuresult,totalChieu,allChieuID
    }

//Nutrition
   const totalAll =totalSangTrua+ totalChieu + total;
   const proteinAll =totalMaxPro + XoTruaResult.protein + DamTruaresult.protein + tinhbotresult.protein + XoChieuResult.protein + DamChieuresult.protein  + tinhbotChieuresult.protein;
   const fiberAll =totalMaxFiber + XoTruaResult.fiber + DamTruaresult.fiber  + tinhbotresult.fiber + XoChieuResult.fiber + DamChieuresult.fiber  + tinhbotChieuresult.fiber;
   const fatAll =totalMaxFat + XoTruaResult.fat + DamTruaresult.fat+ tinhbotresult.fat + XoChieuResult.fat + DamChieuresult.fat + tinhbotChieuresult.fat;
   const CarbAll =totalMaxCarb+ XoTruaResult.carbohydrates + DamTruaresult.carbohydrates  + tinhbotresult.carbohydrates + XoChieuResult.carbohydrates + DamChieuresult.carbohydrates  + tinhbotChieuresult.carbohydrates;
   const sugarAll =totalMaxSugar + XoTruaResult.sugar + DamTruaresult.sugar + tinhbotresult.sugar + XoChieuResult.sugar + DamChieuresult.sugar + tinhbotChieuresult.sugar;
   const allNutri ={ proteinAll,fiberAll,fatAll,CarbAll,sugarAll, }
 
   res.render('forpatent', {title:'Meal Hint', targetcalorie,BuaSangresult,protenresult,Carbresult,trua,chieu,totalAll,allNutri,userID, meal});
  }catch(error){
    res.render('cannotFind', { message:"Xin lỗi"});
  }
}
exports.brmCalculateResult = async(req,res) => {
      let username = req.cookies.username;  
      Schema.findOneAndUpdate({username:username},req.body, {new:true}, (err,updateData)=>{
        if(!err){
        Schema.find({status:'Active'}, (err,results)=>{
          
        if(!err){       
          if(results[0].Benh === "Đái tháo đường"){
            if(results[0].ActivityLevel === "None"){
              results[0].ActivityLevel=25
            }else if(results[0].ActivityLevel === "Light"){
              results[0].ActivityLevel=30
            }else if(results[0].ActivityLevel === "Moderate"){
              results[0].ActivityLevel=35
            }else if(results[0].ActivityLevel === "VeryActive"){
              results[0].ActivityLevel=40
            }else {
              results[0].ActivityLevel=45
            }if(results[0].Sex=== "male"){
              formula = Math.round(((((results[0].Height)/100)*((results[0].Height)/100))*22)*results[0].ActivityLevel);
            }else {
              formula = Math.round(((((results[0].Height)/100)*((results[0].Height)/100))*21)*results[0].ActivityLevel);
            }
          } 
          else if(results[0].Benh === "Bình thường" || results[0].Benh === "Bệnh Gout" || results[0].Benh === "Suy dinh dưỡng"){
          if(results[0].ActivityLevel==="None"){
            results[0].ActivityLevel=1.2
          } else if(results[0].ActivityLevel==="Light"){
            results[0].ActivityLevel=1.37
          } else if(results[0].ActivityLevel==="Moderate"){
            results[0].ActivityLevel=1.55
          } else if(results[0].ActivityLevel==="VeryActive"){
            results[0].ActivityLevel=1.725
          }else{
            results[0].ActivityLevel=1.9
          }
          if(results[0].Goal==="loseWeight"){
            results[0].Goal=0.8
          } else if(results[0].Goal==="maintainWeight"){
            results[0].Goal=1
          } else {
            results[0].Goal=1.2
          }
          if(results[0].Sex==="male"){       
            formula = Math.round(((88.362+(13.397 * results[0].Weight)+(4.799 * results[0].Height)-(5.677 * results[0].Age))*results[0].ActivityLevel)*results[0].Goal);
          } 
          else{
            formula = Math.round(((447.593+((9.563* results[0].Weight) + (1.85 * results[0].Height) - (4.676 * results[0].Age)))*results[0].ActivityLevel)*results[0].Goal);
          }
         if(results[0].Benh === "Suy dinh dưỡng"){
          formula += 500;
         }
        }
          Schema.findOneAndUpdate({status:'Active'} , {calories:formula}, {new:true}, (err,data)=>{
           if(!err){
            res.status(200).json({final:formula});
           }                   
           else{
            res.status(500).json({message:'error'});
           }
          })
          }
        })
        }
        
      })
 }
//End calories calculate

//AddFood choose
exports.AddFood = async(req,res) =>{
  let username = req.cookies.username; 
  const foodid = await Schema.find({username:username});
  const trua = await Recipe.find({'_id':foodid[0].meal.Trua.id});
  const chieu = await Recipe.find({'_id':foodid[0].meal.Chieu.id});
    Schema.find({status:'Active'}, (err,userId)=>{
        Recipe.findById(req.body.id, (err,data)=>{          
          for(let i = 0;i<userId[0].foodinformation.length;i++){
            if(userId[0].foodinformation[i].name===data.name){            
              Schema.findOneAndUpdate({status:'Active', "foodinformation.name":userId[0].foodinformation[i].name},{$set:{'foodinformation.$.numberofservingsize':userId[0].foodinformation[i].numberofservingsize+1}} , (err,data)=>{
                let updatedServingSize = userId[0].foodinformation[i].calories * (userId[0].foodinformation[i].numberofservingsize+1)
                Schema.findOneAndUpdate({status:'Active', "foodinformation.name":userId[0].foodinformation[i].name},{$set:{'foodinformation.$.totalCalories':updatedServingSize}}, (err,data2)=>{    
                       
            })
            })
              res.status(200).json({done:'done'});   
              return         
            }
          }
            Schema.findOneAndUpdate({status:'Active'},{$push:{foodinformation:data}}, {new:true}, (err,updateData)=>{           
              let totalPro = 0;
              let total = 0;
              for(let i = 0; i < userId[0].foodinformation.length;i++){
              total += userId[0].foodinformation[i].totalCalories 
              totalPro += userId[0].foodinformation[i].protein
              }   
              for (let i = 0; i < trua.length; i++) {
                total  += trua[i].calories;
                totalPro += trua[i].protein;
              }
              for (let i = 0; i < chieu.length; i++) {
                total  += chieu[i].calories;
                totalPro += chieu[i].protein
              }
             
                if(userId[0].calories < total){
                let alertValue = total - userId[0].calories;
                  res.status(200).json({type:'warning'});
                }else if(userId[0].Benh == 'Bệnh Gout' && totalPro > ((userId[0].calories*0.15)/4)){
                 res.status(200).json({type:'warning_gout'});
                }
                else{
                  res.status(200).json({done:'done'}); 
                }                 
            })
          })
         
         
  

    })
}


exports.mealHome = async(req,res)=>{
  let username = req.cookies.username; 
    const foodid = await Schema.find({'_id':req.params.id});
    const sang = await Recipe.find({'_id':foodid[0].meal.Sang.id});
    const trua = await Recipe.find({'_id':foodid[0].meal.Trua.id});
    const chieu = await Recipe.find({'_id':foodid[0].meal.Chieu.id})
    Schema.find({username:username}, (err,userData)=>{
    let total = 0
    for(let i = 0; i < userData[0].foodinformation.length;i++){
    total += userData[0].foodinformation[i].totalCalories 
    }   
    for (let i = 0; i < trua.length; i++) {
      total  += trua[i].calories;
    }
    for (let i = 0; i < chieu.length; i++) {
      total  += chieu[i].calories;
    }
    for (let i = 0; i < sang.length; i++) {
      total  += sang[i].calories;
    }
      res.render('mymeal.ejs', {title:'My Meal Meal-Planner', userInfo:userData, totals:total,trua,chieu,sang})
  })
 
}

exports.DeleteFood = async(req,res) =>{
  let username = req.cookies.username; 
  Schema.find({username:username}, (err,id)=>{
    Schema.updateOne({status:'Active'}, {$pull:{foodinformation:{_id:req.body.id}}},(err,data)=>{    
      //res.redirect(`/ /${id[0]._id}/`)   
      res.status(200).json({done:'done'});
    })
  })
}

exports.submitRecipe =async (req,res) =>{
  //console.log(req.params.id);
  let username = req.cookies.username;
  Schema.find({username:username}, (err,data)=>{   
  const infoErrorsObj = req.flash('infoErrors');
  const infoSubmitObj = req.flash('infoSubmit');
  res.render('submit-recipe', {title:'Cập nhật món ăn cho riêng bạn', infoErrorsObj, infoSubmitObj, userInfo:data});
})
}


exports.submitPostRecipe =async (req,res) =>{
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
      if(err) return res.satus(500).send(err);
    })

  }

  const newRecipe = new Recipe({
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


  Schema.findOneAndUpdate({'_id':userID} , {$push:{foodinformation:newRecipe}},{new:true}, (err,updateData)=>{

  req.flash('infoSubmit', ' Thêm món ăn thành công');
  
})
} catch (error) {
  req.flash('infoErrors', error);
}
  const userID = req.params.id;
  const infoErrorsObj = req.flash('infoErrors');
  const infoSubmitObj = req.flash('infoSubmit');
  res.render('submit-recipe', {title:'Cập nhật món ăn cho riêng bạn', infoErrorsObj, infoSubmitObj,userInfo:userID });

}

exports.AddMeal = async(req,res)=>{
  try {
    const userID = req.params.id;
    let trua = req.body.idFood;
    let foodvalue = trua.split(',');
    let chieu = req.body.idChieuFood;
    let foodChieuvalue = chieu.split(',');
    const data ={
          Trua:{id:foodvalue},
          Chieu:{id:foodChieuvalue}
        }
   Schema.findByIdAndUpdate(userID, {meal:data}, {upsert:true},(err,updateData) =>{
       if(!err){
         res.status(200).json({message:'done'});    
       }
       else{
         res.status(500).json({message:'error'});
       }
    })

    
  } catch (error) {
    res.status(500).json({message: error.message});
  }

}

exports.AddMealSang = async(req,res)=>{
  try {
    const username = req.cookies.username;
    let sang = req.body.id;
   
   Schema.findOneAndUpdate({'username':username}, {"meal.Sang.id":sang},{upsert: true}, (err,updateData) =>{
       if(!err){
         res.status(200).json({message:'done'});    
       }
       else{
         res.status(500).json({message:'error'});
       }
    })

  } catch (error) {
    res.status(500).json({message: error.message});
  }

}

exports.unFind = async(req,res)=>{
  res.render('cannotFind',{title:'Sorry'});
}




// async function insertDymmyBenhData(){
//   try{
//     await benh.insertMany([
//       {
//         "name":"Bình thường"        
//       },
//       {
//         "name":"Bệnh Gout"
//       },
//       {
//         "name":"Suy dinh dưỡng"
//       },
//       {
//         "name":"Thừa cân, béo phì"
//       }
//     ])
//   }catch (error){

//   }
// }
// insertDymmyBenhData();
// async function insertDymmyCategoryData(){
//     try {
//         await Category.insertMany([
//             {
//               "name": "Chiên",
//               "image": "chiên.jpg"
//             },
//             {
//               "name": "Luộc",
//               "image": "luoc.jpg"
//             }, 
//             {
//               "name": "Nướng",
//               "image": "nuong.jpg"
//             },
//             {
//               "name": "Xào",
//               "image": "xao.jpg"
//             }, 
//             {
//               "name": "Kho",
//               "image": "kho.jpg"
//             },
//             {
//               "name": "Lẩu",
//               "image": "lau.jpg"
//             }
//           ]);
//     } catch (error) {
//         console.log('err', + error)
//     }
// }

// insertDymmyCategoryData();

// async function insertDymmyfoodData(){
//   try {
//     await Recipe.insertMany([
//       {
//         description: `Recipe Description Goes Here`,
//         email: "recipeemail@raddy.co.uk",
//         ingredients: [
//           "1 level teaspoon baking powder",
//           "1 level teaspoon cayenne pepper",
//           "1 level teaspoon hot smoked paprika",
//         ],
//         category: "Kho", 
//     name:'Gà kho xả',
//     calories:239,
//     totalCalories:239,
//     protein:27,
//     carbohydrates:0,
//     fat:14,
//     fiber:0,
//     sugar:0,
//     servingsize:100,
//     numberofservingsize:1,
//     image:"southern-friend-chicken.jpg"
//       },
//       {
//         description: `Recipe Description Goes Here`,
//         email: "recipeemail@raddy.co.uk",
//         ingredients: [
//           "1 level teaspoon baking powder",
//           "1 level teaspoon cayenne pepper",
//           "1 level teaspoon hot smoked paprika",
//         ],
//         category: "Nướng", 
//         name:'Gà nướng',
//         calories:203,
//         totalCalories:203,
//         protein:27,
//         carbohydrates:0,
//         fat:10,
//         fiber:0,
//         sugar:0,
//         servingsize:100,
//         numberofservingsize:1,
//         image:"southern-friend-chicken.jpg"
//       },
//       {
//         description: `Recipe Description Goes Here`,
//         email: "recipeemail@raddy.co.uk",
//         ingredients: [
//           "1 level teaspoon baking powder",
//           "1 level teaspoon cayenne pepper",
//           "1 level teaspoon hot smoked paprika",
//         ],
//         category: "Chiên", 
//         name:'Cá chiên',
//         calories:208,
//         totalCalories:208,
//         totalCalories:208,
//         protein:20,
//         carbohydrates:0,
//         fat:13,
//         fiber:0,
//         sugar:0,
//         servingsize:100,
//         numberofservingsize:1,
//         image:"grilled-lobster-rolls.jpg"
//       },
//       {
//         description: `Recipe Description Goes Here`,
//         email: "recipeemail@raddy.co.uk",
//         ingredients: [
//           "1 level teaspoon baking powder",
//           "1 level teaspoon cayenne pepper",
//           "1 level teaspoon hot smoked paprika",
//         ],
//         category: "Nướng", 
//         name:'SomeThing nướng',
//         calories:129,
//         totalCalories:129,
//         protein:26,
//         carbohydrates:0,
//         fat:2.7,
//         fiber:0,
//         sugar:0,
//         servingsize:100,
//         numberofservingsize:1,
//         image:"tom-daley.jpg"
//       },
//       {
//         description: `Recipe Description Goes Here`,
//         email: "recipeemail@raddy.co.uk",
//         ingredients: [
//           "1 level teaspoon baking powder",
//           "1 level teaspoon cayenne pepper",
//           "1 level teaspoon hot smoked paprika",
//         ],
//         category: "Luộc", 
//         name:'Mì luộc',
//         calories:210,
//         totalCalories:210,
//         protein:6,
//         carbohydrates:37,
//         fat:1.5,
//         fiber:5,
//         sugar:3,
//         servingsize:57,
//         numberofservingsize:1,
//         image:"tom-daley.jpg"
//       },
//       {
//         description: `Recipe Description Goes Here`,
//         email: "recipeemail@raddy.co.uk",
//         ingredients: [
//           "1 level teaspoon baking powder",
//           "1 level teaspoon cayenne pepper",
//           "1 level teaspoon hot smoked paprika",
//         ],
//         category: "Lẩu", 
//         name:'Quinoa',
//         calories:170,
//         totalCalories:170,
//         protein:6,
//         carbohydrates:27,
//         fat:1.5,
//         fiber:5,
//         sugar:1,
//         servingsize:47,
//         numberofservingsize:1,
//         image:"tom-daley.jpg"
//       },
//       {
        
//         description: `Recipe Description Goes Here`,
//         email: "recipeemail@raddy.co.uk",
//         ingredients: [
//           "1 level teaspoon baking powder",
//           "1 level teaspoon cayenne pepper",
//           "1 level teaspoon hot smoked paprika",
//         ],
//         category: "Luộc", 
//         name:'Brown Rice',
//         calories:160,
//         totalCalories:160,
//         protein:4,
//         carbohydrates:32,
//         fat:1,
//         fiber:3,
//         sugar:0,
//         servingsize:45,
//         numberofservingsize:1,
//         image:"tom-daley.jpg"
//       },
//       {
        
//         description: `Recipe Description Goes Here`,
//         email: "recipeemail@raddy.co.uk",
//         ingredients: [
//           "1 level teaspoon baking powder",
//           "1 level teaspoon cayenne pepper",
//           "1 level teaspoon hot smoked paprika",
//         ],
//         category: "Xào", 
//         name:'Spinach',
//         calories:25,
//         totalCalories:25,
//         protein:2,
//         carbohydrates:1,
//         fat:0,
//         fiber:2,
//         sugar:0,
//         servingsize:85,
//         numberofservingsize:1,
//         image:"tom-daley.jpg"
//       },
//       {
        
//         description: `Recipe Description Goes Here`,
//         email: "recipeemail@raddy.co.uk",
//         ingredients: [
//           "1 level teaspoon baking powder",
//           "1 level teaspoon cayenne pepper",
//           "1 level teaspoon hot smoked paprika",
//         ],
//         category: "Xào", 
//         name:'Kale',
//         calories:40,
//         totalCalories:40,
//         protein:4,
//         carbohydrates:5,
//         fat:1,
//         fiber:3,
//         sugar:2,
//         servingsize:85,
//         numberofservingsize:1,
//         image:"tom-daley.jpg"
//       },
//     ])
//   } catch (error) {
//     console.log('err', + error)
//   }
// }
// insertDymmyfoodData();

// async function insertDymmyRecipeData(){
//   try {
//     await Recipe.insertMany([
//       { 
//         "name": "Recipe Name Goes Here",
//         "description": `Recipe Description Goes Here`,
//         "email": "recipeemail@raddy.co.uk",
//         "ingredients": [
//           "1 level teaspoon baking powder",
//           "1 level teaspoon cayenne pepper",
//           "1 level teaspoon hot smoked paprika",
//         ],
//         "category": "Kho", 
//         "image": "southern-friend-chicken.jpg"
//       },
//       { 
//         "name": "Recipe Name Goes Here",
//         "description": `Recipe Description Goes Here`,
//         "email": "recipeemail@raddy.co.uk",
//         "ingredients": [
//           "1 level teaspoon baking powder",
//           "1 level teaspoon cayenne pepper",
//           "1 level teaspoon hot smoked paprika",
//         ],
//         "category": "Chiên", 
//         "image": "southern-friend-chicken.jpg"
//       },
//     ]);
//   } catch (error) {
//     console.log('err', + error)
//   }
// }

// insertDymmyRecipeData();