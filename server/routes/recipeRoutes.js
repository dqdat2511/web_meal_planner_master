const express = require('express');
const { requireAuth, logout } = require('../middleware/auth');
const router = express.Router();
const recipeController = require('../controllers/recipeController');
const Login = require('../controllers/Login');
const hash = require('object-hash');
const admin= require('../controllers/adminController');
const allItem= require('../controllers/AllController');
const adminAuth = require('../middleware/authAdmin');
const rateLimit = require('express-rate-limit');
const {check, validationResult } = require('express-validator');


const createAccountLimiter = rateLimit({
    windowMs: 10 * 60 *1000,
    max: 5, 
    message:"Quá nhiều yêu cầu từ client, vui lòng thử lại sao 10p"
});
/**
 * App Routes
 */
 //router.get('',recipeController.navbar);
router.get('/', requireAuth, recipeController.homepage);
router.get('/mymeal/:id',requireAuth, recipeController.mealHome);
router.get('/categories', requireAuth,recipeController.exploreCategories);
router.get('/categories/:id', requireAuth,recipeController.exploreCategoriesById);
router.get('/recipe/:id',requireAuth, recipeController.exploreRecipe );
router.post('/search',requireAuth, recipeController.searchRecipe );
router.get('/signup', recipeController.signUp);
router.post('/signup',[check("password").exists().withMessage("password không được để trống").isLength({min:6,max:40}).withMessage("Mật khẩu phải nhiều hơn 6 và ít hơn 40 kí tự")] ,recipeController.AfterSignUp);
router.get('/forgot-password',Login.forget_pass);
router.post('/forget_pass', Login.forget_Verify);
router.get('/reset-password',Login.resetPassword);
router.post('/reset-password',[check("password").exists().withMessage("password không được để trống").isLength({min:6,max:40}).withMessage("Mật khẩu phải nhiều hơn 6 và ít hơn 40 kí tự")],Login.resetPasswordPost);
//brm-calculate//
router.get('/bmr-build/',requireAuth,createAccountLimiter,recipeController.brmCalculateHomePage );
router.get('/bmr/:id',requireAuth,recipeController.brmCalculate );
router.post('/bmr-build',requireAuth, recipeController.brmCalculateResult );
router.get('/login/', Login.login);
router.post('/login/', Login.logIn);
router.get('/logout', logout);
router.post('/FoodIndex',requireAuth, recipeController.AddFood);
router.post('/FoodRemove',requireAuth, recipeController.DeleteFood);
router.get('/submit-recipe/:id' , requireAuth,recipeController.submitRecipe);  
router.post('/submit-recipe/:id',requireAuth, recipeController.submitPostRecipe);
router.post('/save-meal/:id' ,requireAuth, recipeController.AddMeal);
router.post('/save-meal-sang' , requireAuth,recipeController.AddMealSang);
// admin 
router.get('/admin',adminAuth.auth,adminAuth.adminAuth, admin.Admin);
router.get('/admin/update/:id',adminAuth.auth,adminAuth.adminAuth,admin.UpdateFood);
router.post('/update/:id',adminAuth.auth,adminAuth.adminAuth, admin.UpdateFoodOne);
router.post('/AdminDelete',adminAuth.auth,adminAuth.adminAuth, admin.DeleteAdminFood);
router.get('/submit-recipeadmin',adminAuth.auth,adminAuth.adminAuth, admin.CreateFood);
router.post('/submit-recipeadmin',adminAuth.auth,adminAuth.adminAuth, admin.CreateFoodPost);
router.get('/unfind',recipeController.unFind);
router.get('/admin/user', adminAuth.auth ,adminAuth.adminAuth, admin.user);



// function authenticateToken(req,res,next) {
//     const bearerHeader = req.headers['Authorization'];
//     if(typeof bearerHeader !== 'undefined')
//     {
//         const bearer = bearerHeader.split(' ')[1];
//         req.token = bearer
//         next();
//     }else
//     {
//       res.sendStatus(403);
//     }
//   }

// router.post('/signup', (req,res)=>{
//   Schema.find({}, (err,data)=>{
//     for(let i=0;i<data.length;i++){
//       if(req.body.username.toLowerCase()=== data[i].username.toLowerCase()){
//           //res.redirect('/loginalreadytaken')
//           res.status(200).send({
//             message:'error'
//           })
//           return
//       }
//     }
//     Schema.updateMany({status:'Active'},{status:'not active'}, {new:true}, (err,userInfo)=>{
//       const body = {
//         name:req.body.name,
//         username:req.body.username.toLowerCase(),
//         status:req.body.status,
//         password:hash(req.body.password)
//       }
//     Schema.create(body, (err,data)=>{
//       console.log(body)
//     // res.redirect('/bmr-build');
//      res.status(400).json({
//       done:'done'
//      })
//   })
//   })
// })
//   })

module.exports = router;