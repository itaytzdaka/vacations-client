import axios from "axios";
import { Config } from "../config";


export default axios.create({
    baseURL: Config.serverUrl
});

export const axiosPrivate = axios.create({
        baseURL: Config.serverUrl,
        headers: {"Content-Type":"application/json"},
        withCredentials: true
    });

