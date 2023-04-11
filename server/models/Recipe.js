const mongoose = require('mongoose');

const recipeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: 'This field is required.'
  },
  description: {
    type: String,
    required: 'This field is required.'
  },
  email: {
    type: String,
    required: 'This field is required.'
  },
  ingredients: {
    type: Array,
    required: 'This field is required.'
  },
  category: {
    type: String,
    enum: ['Chiên', 'Luộc', 'Nướng', 'Xào', 'Kho', 'Lẩu'],
    required: 'This field is required.'
  },
  image: {
    type: String,
    required: 'This field is required.'
  },
  calories:Number,
  protein:Number,
  carbohydrates:Number,
  fat:Number,
  fiber:Number,
  sugar:Number,
  servingsize:Number,
  numberofservingsize:Number,  
  totalCalories:Number
});

//recipeSchema.index({ name: 'text', description: 'text' });
// WildCard Indexing
recipeSchema.index({ "$**" : 'text' });

module.exports = mongoose.model('Recipe', recipeSchema);