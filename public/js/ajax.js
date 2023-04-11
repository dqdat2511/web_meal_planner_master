
function AddingFood(FoodID){
  const xhr = new XMLHttpRequest();
  xhr.open('POST','/FoodIndex');
  xhr.setRequestHeader('Content-Type','application/x-www-form-urlencoded');
  xhr.send(`id=${FoodID}`);   
  xhr.addEventListener('readystatechange',(e)=>{
    let resStatus= JSON.parse(e.currentTarget.responseText).done;
    let resWarn = JSON.parse(e.currentTarget.responseText).type;
    
    if(resStatus === 'done' && e.currentTarget.readyState === 4){
     showSuccessToast(resStatus);
    }
    else if(resWarn === 'warning'&& e.currentTarget.readyState === 4 ){
      showWarningToast(resWarn)
    }else if(resWarn === 'warning_gout'&& e.currentTarget.readyState === 4){
      showWarningToastGout(resWarn)
    }
    else if(resWarn === 'accountexits'){
      showWarningToastAccountexits(resWarn)
    }
  })  
}
function showSuccessToast(resStatus) {
  toasts({
    title: "Thêm món ăn",
    message: "Thêm món ăn thành công",
    type: "success",
    duration: 5000
  });
}

function showWarningToast(resWarn) {
  toasts({
    title: "Mức năng lượng vượt quá khuyến nghị trong ngày",
    message: "Thêm món ăn thành công",
    type: "warning",
    duration: 5000
  });
}
function showWarningToastGout(resWarn) {
  toasts({
    title: "Vượt quá mức dinh dưỡng ",
    message: "Đạm trong bữa ăn của bạn đã vượt quá mức cần thiết",
    type: "warning",
    duration: 5000
  });
}

document.querySelectorAll('.btn-submit').forEach((button)=>{
  button.addEventListener('click', () =>{
      AddingFood(button.id);    
  })
});
//them bua sang

function AddingFoodSang(FoodID){
  const xhr = new XMLHttpRequest();
  xhr.open('POST','/save-meal-sang');
  xhr.setRequestHeader('Content-Type','application/x-www-form-urlencoded');
  xhr.send(`id=${FoodID}`);   
  xhr.addEventListener('readystatechange',(e)=>{
    let resStatus= JSON.parse(e.currentTarget.responseText).message;
    let resWarn = JSON.parse(e.currentTarget.responseText).type;
    
    if(resStatus === 'done' && e.currentTarget.readyState === 4){
     showSuccessToast(resStatus);
    }
    else if(resWarn === 'warning'&& e.currentTarget.readyState === 4 ){
      showWarningToast(resWarn)
    }else if(resWarn === 'warning_gout'&& e.currentTarget.readyState === 4){
      showWarningToastGout(resWarn)
    }
    else if(resWarn === 'accountexits'){
      showWarningToastAccountexits(resWarn)
    }
  })  
}

document.querySelectorAll('.btn-submit-sang').forEach((button)=>{
  button.addEventListener('click', () =>{
      AddingFoodSang(button.id);    
  })
});

function DeleteFood(FoodID){
const xhr = new XMLHttpRequest();
xhr.open('POST','/FoodRemove');
xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
xhr.send(`id=${FoodID}`);
confirm("Món ăn sẽ bị xóa!");
window.location.href = window.location.href;

}
function DeleteFoodAdmin(FoodID){
  const xhr = new XMLHttpRequest();
  xhr.open('POST','/AdminDelete');
  xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
  xhr.send(`id=${FoodID}`);
  confirm("Món ăn sẽ bị xóa!");
  window.location.href = window.location.href;
  
  }
  


document.querySelectorAll('.btn-delete').forEach((button) =>{
button.addEventListener('click', () =>{
  DeleteFood(button.id);
})
})
document.querySelectorAll('.btn-delete-food').forEach((button) =>{
  button.addEventListener('click', () =>{
    DeleteFoodAdmin(button.id);
  })
  })

document.querySelector('.calorie-form').addEventListener('submit', (e)=>{
  e.preventDefault();
   let formElements = e.target.elements;
   let Age = formElements.Age.value;
   let Gender = formElements.Sex.value;
   let Weight = formElements.Weight.value;
   let Height = formElements.Height.value;
   let Activity = formElements.ActivityLevel.value;
   let Goal = formElements.Goal.value;
   let Benh = formElements.Benh.value;   
   let totalCalories = document.getElementById('total-calories');
    const xhr= new XMLHttpRequest();
    xhr.open('POST','bmr-build');
    xhr.setRequestHeader('Content-Type','application/x-www-form-urlencoded');
    xhr.send(`Age=${Age}&Sex=${Gender}&Weight=${Weight}&Height=${Height}&ActivityLevel=${Activity}&Goal=${Goal}&Benh=${Benh}`);
    xhr.addEventListener('readystatechange', (e)=>{ 
     if(e.currentTarget.readyState === 4){    
      totalCalories.value = JSON.parse(e.currentTarget.responseText).final;
    }   
    });
    document.getElementById('results').style.display = 'none';
    document.getElementById('loading').style.display = 'block';
    document.getElementById('build-meal-bmr').style.display='none';
    setTimeout(calculateCalories, 1000);
   
    //console.log(JSON.parse(xhr.response)["final"] );
})


function calculateCalories(a) {
  
    const age = document.getElementById('age');
    const gender = document.querySelector('input[name="Sex"]:checked');
    const weight = document.getElementById('weight');
    const height = document.getElementById('height');
    const activity = document.getElementById('mySelect').value;   
    const goal = document.getElementById('GoalSelected').value;
    document.getElementById('results').style.display = 'block';
    document.getElementById('loading').style.display = 'none';
    document.getElementById('build-meal-bmr').style.display='block';

  }
  function errorMessage(error) {
    document.getElementById('results').style.display = 'none';
    document.getElementById('build-meal-bmr').style.display='none';
    document.getElementById('loading').style.display = 'none';
    const errorDiv = document.createElement('div');
    const card = document.querySelector('.card');
    const heading = document.querySelector('.heading');
    errorDiv.className = 'alert alert-danger';
    errorDiv.appendChild(document.createTextNode(error));
  
    card.insertBefore(errorDiv, heading);
  
    setTimeout(clearError, 4000);
  }
  
  function clearError() {
    document.querySelector('.alert').remove();
  }

