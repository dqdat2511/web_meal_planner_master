require('../models/database');
const { render } = require('ejs');
const Category = require('../models/Category');

exports.getAll = async(req, res) => {
    
    try {
        const categories = await Category.find({});                   
        res.render('getAll',{title: 'Home', categories})
    
    } catch (error) {
        res.status(500).send({message: error.message || "Error Occured" });
    }
    
}