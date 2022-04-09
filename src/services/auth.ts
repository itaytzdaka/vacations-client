// import axios, { AxiosError } from "axios";
import { AxiosError } from "axios";
import axios from "../api/axios";
import privateAxios from "../api/axios";
import { store } from "../redux/store";
import { ActionType } from "../redux/action-type";
import Cookies from 'universal-cookie';



export async function refreshToken() {
    try {
        const response = await privateAxios.get("/api/auth/refresh", { withCredentials: true });
        store.dispatch({ type: ActionType.saveToken, payload: response.data.accessToken });
        return response.data;
    }

    catch (error) {
        if ((error as AxiosError).response?.data === "Your login session has expired") {
            console.log("Your login session has expired");
            return;
        }

        else {
            console.log("refresh err");
            alert((error as AxiosError).response?.data);
        }
    }
}

export function isLoggedIn(props): boolean {
    //if not loggedIn, navigate to the login page
    if (!store.getState().isLoggedIn) {
        if(props.location.pathname!=="/")
            alert("Error: You are not logged-in");
        props.history.push("/login");
        return false;
    }
    else {
        return true;
    }
}

export function isAdmin(props): boolean {
    //if user is not admin, navigate to the Home page
    if (!store.getState().user?.isAdmin) {
        alert("Error: You are not admin");
        props.history.push("/");
        return false;
    }
    else {
        return true;
    }
}

export async function disconnect() {
    try {
        console.log("disconnect");
        await axios.get("/api/auth/logout", { withCredentials: true });
        const cookies = new Cookies();
        cookies.remove('user');

        store.dispatch({ type: ActionType.saveUser, payload: null });
        store.dispatch({ type: ActionType.saveToken, payload: null });

    } catch (error) {
        alert(error);
    }
}

export async function errorHandling(error, props) {

    if (!error) return;

    if (error === "Error: Network Error") {
        alert(error);
        return;
    }

    if ((error as AxiosError).response?.data === "You are not logged-in") {
        await disconnect();
        alert("Error: You are not logged-in");
        props.history.push("/login");
        return;
    }

    if ((error as AxiosError).response?.data === "Your login session has expired") {
        await disconnect();
        alert("Error: Your login session has expired");
        props.history.push("/login");
        return;
    }

    if ((error as AxiosError).response?.data === "You are not admin!") {
        await disconnect();
        alert("Error: You are not admin!");
        props.history.push("/login");
        return;
    }

    if ((error as AxiosError).response?.data === "Illegal username or password") {
        alert("Error: Illegal username or password");
        return;
    }


    alert((error as AxiosError).response?.data);

}