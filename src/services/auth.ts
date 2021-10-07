export function isUserLoggedIN(){
    return sessionStorage.getItem("token") !== null;
}

