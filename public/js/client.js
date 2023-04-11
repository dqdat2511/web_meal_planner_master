function AddingMeal(userID ,mealID, foodChieuid){
    const xhr = new XMLHttpRequest();
    xhr.open('POST', `/save-meal/${userID}`);
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xhr.send(`idFood=${mealID}&idChieuFood=${foodChieuid}`);
    xhr.addEventListener('readystatechange',(e)=>{
      let resStatus= JSON.parse(e.currentTarget.responseText).message;
      let resWarn = JSON.parse(e.currentTarget.responseText).type;      
      if(resStatus === 'done' && e.currentTarget.readyState === 4){
       showSuccessToast(resStatus);
      }
    })
  }
  
  document.querySelector('#btn-add-lunch').addEventListener('click', (e)=>{
    e.preventDefault();
    const foodvalue = document.querySelector('#btn-add-lunch').value.split('/');
    const useriD = foodvalue[0]
    const foodID = foodvalue[1];
    const mealID = foodvalue[2];
    AddingMeal(useriD, foodID, mealID);
  })
  function showSuccessToast(resStatus) {
    toasts({
      title: "Lưu thực đơn",
      message: "Lưu thực đơn thành công",
      type: "success",
      duration: 5000
    });
  }


  // function AddingMealChieu(userID ,mealChieuID){
  //   const xhr = new XMLHttpRequest();
  //   xhr.open('POST', `/save-meal/${userID}`);
  //   xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
  //   xhr.send(`idFoodChieu=${mealChieuID}`);
  // }
  // document.querySelector('#btn-add-lunch').addEventListener('click', (e)=>{
  //   e.preventDefault();
  //   const foodvalue = document.querySelector('#btn-add-lunch').value.split('/');
  //   const useriD = foodvalue[0]
  //   const idFoodChieu = foodvalue[1];
  //   AddingMealChieu(useriD, idFoodChieu);
  // })
  