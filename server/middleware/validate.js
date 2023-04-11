const body = require('express-validator');
let validateRegisterUser = () => {
    return [ 
      body('user.username', 'username does not Empty').not().isEmpty(),
      body('user.username', 'username must be Alphanumeric').isAlphanumeric(),
      body('user.username', 'username more than 6 degits').isLength({ min: 6 }),
      body('user.email', 'Invalid does not Empty').not().isEmpty(),
      body('user.email', 'Invalid email').isEmail(),  
      body('password', 'mật khẩu phải hơn 6 kí tự').isLength({ min: 6 })
    ]; 
  }