console.log('login functionality comeing');
document.getElementById("login-btn").addEventListener("click",function () {
    console.log('click btn');
    // 1-get the input username
    const inputUsername = document.getElementById('input-Username');
    const Username = inputUsername.value;
    console.log(Username);
    
    //2- get the input Password
    const inputPassword = document.getElementById("input-Password")
    const Password = inputPassword.value;
    console.log(Password);

    //3- match pin & mobile number
    if (Username === "admin" && Password === "admin123") {
        // 3.1- true alert :::> homepage
        alert('your are success')
        window.location.assign("/Issue-Tracker/home.html")
    }
    //  3.2- false alert :::> return
    else{
        alert('Login Error')
    }
})

