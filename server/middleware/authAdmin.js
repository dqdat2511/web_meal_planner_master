const db = require('../models/UserSchema');


exports.auth = (req,res,next)=>{
  if (req.session && req.session.user) { // kiểm tra nếu người dùng đã đăng nhập
    next();
  } else {
    res.redirect('/login'); // chuyển hướng về trang đăng nhập nếu chưa đăng nhập
  }
}

exports.adminAuth = (req, res, next) => {
try {
  const userId = req.cookies.username;
  db.find({username: userId }, (err, user) => {
    if (err || !user) {
      res.render('fobiden',{message: "Có gì đó không đúng vui lòng thử lại sao"})
    }
    
   if(user[0].role==0){
    res.render('fobiden',{message: "Có gì đó không đúng vui lòng thử lại sao"})
   }
   else
   {
    next();
   }
  });
} catch (error) {
  res.status(401).json({ message: "Authorization failed!" });
}

};
