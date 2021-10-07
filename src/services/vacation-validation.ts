
export function validateDescription(description){

    if (description === "") {
        return "Missing description";
    }

    else if(description.length < 3){
        return "Description is too short";
    }

    else if (description.length > 200) {
        return "Description is too long";
    }
    return "";
}


export function validateDestination(destination){
    if (destination === "") {
        return "Missing destination";
    }

    else if(destination.length < 2){
        return  "Destination is too short";
    }
    
    else if (destination.length > 30) {
        return  "Destination is too long";
    }

    else if(!('A'<=destination[0] && destination[0] <='Z')){
        return  "Destination must start with a capital letter";
    }
    return "";
}


export function validateImgUrl(img){
    return "";
}

export function validateStartingDate(date){
    return "";
}

export function validateEndingDate(date){
    return "";

}



export function validatePrice(price){

    if (!price) {
        return "Missing price";
    }

    else if(price < 0){
        return "Price can't be negative";
    }
    
    else if (price > 50000) {
        return "Price is too high";
    }
    return "";
}

