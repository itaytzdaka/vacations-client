export function validateAvailableUserName(userName,usersNames){
    let error="";
    usersNames.forEach(user=>{
        if(userName===user.userName){
            error="user name is not available";
        }
    });
    return error;
}

export function validateUserName(userName){

    if (userName === "") {
        return "Missing user name";
    }

    else if(userName.length < 2){
        return "User name too short";
    }

    else if (userName.length > 15) {
        return "User name too long";
    }
    return "";
}


export function validateFirstName(firstName){
    if (firstName === "") {
        return "Missing first name";
    }

    else if(firstName.length < 2){
        return  "first name is too short";
    }
    
    else if (firstName.length > 10) {
        return  "first name is too long";
    }

    else if(!('A'<=firstName[0] && firstName[0] <='Z')){
        return  "first name must start with a capital letter";
    }

    return "";
}


export function validateLastName(lastName){
    if (lastName === "") {
        return  "Missing last name";
    }

    else if(lastName.length < 2){
        return  "last name is too short";
    }
    
    else if (lastName.length > 10) {
        return  "last name is too long";
    }

    else if(!('A'<=lastName[0] && lastName[0] <='Z')){
        return  "first name must start with a capital letter";
    }

    return "";
}



export function validatePassword(password){
    if (password === "") {
        return "Missing password";
    }

    else if(password.length < 6){
        return "password is too short";
    }
    
    else if (password.length > 10) {
        return "password is too long";
    }
    return "";
}

export function verifyPassword(verifyPassword,password){
    if(verifyPassword===""){
        return "Missing verified password";
    }
    else if (verifyPassword !== password) {
        return "verify password";
    }
    return "";
}