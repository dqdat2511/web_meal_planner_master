 function checkAccount(){
    let loggedin =(document.cookie.split('='));
    let name = loggedin[1];
    let username = document.getElementById('nameUser');
    if(loggedin.length == 2){
        username.innerHTML = name      
        document.getElementById('logBtn').style.display = 'none';
    }
    else{
        document.getElementById('dropdownlist').style.display='none';
    }
}