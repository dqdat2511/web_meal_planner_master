const session = require('express-session');
const requireAuth = (req, res, next) => {
    if (req.session && req.session.user) { // kiểm tra nếu người dùng đã đăng nhập
      next();
    } else {
      res.redirect('/login/'); // chuyển hướng về trang đăng nhập nếu chưa đăng nhập
    }
  };
  
  const logout = (req, res, next) => {
    if (req.session) { // kiểm tra nếu session của người dùng tồn tại
      req.session.destroy((err) => {
        if (err) {
          return next(err);
        }
        res.clearCookie('connect.sid'); // xóa cookie để đăng xuất hoàn toàn
        res.clearCookie('username');
        res.redirect('/login/'); // chuyển hướng về trang đăng nhập sau khi đăng xuất
      });
    } else {
      res.redirect('/login/'); // chuyển hướng về trang đăng nhập nếu chưa đăng nhập
    }
  };
module.exports = { requireAuth,logout };