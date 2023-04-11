const { render } = require('ejs');
const Schema = require('../models/UserSchema');
exports.brmCalculate = async(req, res) =>{      
    try {
      Schema.get({status:'Active'}, (err,results)=>{
        let formula = 0
        if(results[0].ActivityLevel==="None"){
          results[0].ActivityLevel=1.2
        } else if(results[0].ActivityLevel==="Light"){
          results[0].ActivityLevel=1.37
        } else if(results[0].ActivityLevel==="Moderate"){
          results[0].ActivityLevel=1.55
        } else if(results[0].ActivityLevel=="VeryActive"){
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
          formula = Math.round(((66.47+(13.75 * results[0].Weight) + (5.003 * results[0].Height) - (6.755 * results[0].Age))*results[0].ActivityLevel)*results[0].Goal)
        } else{
          formula = Math.round(((655.1+(9.563* results[0].Weight) + (1.85 * results[0].Height) - (4.676 * results[0].Age))*results[0].ActivityLevel)*results[0].Goal)
        }
    
        Schema.findOneAndUpdate({status:'Active'} , {calories:formula}, {new:true}, (err,data)=>{
        res.render('bmr-build.ejs', {result:results, final:formula})
        })
      })
     
    } catch (error) {
      res.status(500).send({message: error.message || "Error Occured" });
    }
    
    
  }



  
 