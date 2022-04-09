import React, { Component } from "react";
import "./app.css";

import { BrowserRouter, Switch, Route } from "react-router-dom";

//components
import { Home } from "../home/home"
import { Registration } from "../registration/registration";
import { Login } from "../login/login";
import { Admin } from "../admin/admin";
import { EditVacation } from "../edit-vacation/editVacation";
import { AddVacation } from "../add-vacation/addVacation";
import { Reports } from "../reports/reports";
import { Purchase } from "../purchase/purchase";
import { Purchases } from "../purchases/purchases";

//store
import { store } from "../../redux/store";
import { ActionType } from "../../redux/action-type";

//server
import axiosPrivate from "../../api/axios";
import axios from "../../api/axios";
import { Config } from "../../config";
import io from "socket.io-client";

//models
import { PurchaseModel } from "../../models/purchase-model";



export class App extends Component<any>{

    private socket;
    private axiosPrivate = axiosPrivate;

    public constructor(props: any) {
        super(props);

        if(this.axiosPrivate.interceptors.request["handlers"].length===0){
            this.axiosPrivate.interceptors.request.use(this.reqInterceptor);
            this.axiosPrivate.interceptors.response.use(this.resInterceptor,this.resErrInterceptor);
        }
    }


    private reqInterceptor = req => {

        if (!req.headers['authorization']) {
            req.headers["authorization"] = `Bearer ${store.getState().token}`;
        }
        // console.log("req");
        // console.log(req);
        return req;
    }

    private resInterceptor = res => {
        // console.log("res");
        // console.log(res);
        return res;
    }

    private resErrInterceptor = async err => {
        // console.log("response err");
        // console.log(err);
        // console.log("err?.response?.data");
        // console.log(err?.response?.data);
        // console.log("err?.config = req");
        console.log(err?.config);
        console.log(err?.config.url);


        const prevRequest = err?.config;
        // console.log("err?.response?.status");
        // console.log(err?.response?.status);
        // if(err?.response?.status === 403 || 401 && !prevRequest?.sent){
        if (err?.config.url!=="/api/auth/refresh" && (err?.response?.data === "You are not logged-in" || err?.response?.data === "Your login session has expired")) {
            //try to get access token
            // prevRequest.sent = true;
            try {
                console.log("refresh");
                const response = await axiosPrivate.get("/api/auth/refresh", { withCredentials: true });
                console.log("after refresh");
                const newAccessToken = response.data.accessToken;
                store.dispatch({ type: ActionType.saveToken, payload: newAccessToken });
                prevRequest.headers["authorization"] = `Bearer ${newAccessToken}`;
                return axios(prevRequest);
            } catch (error) {
                // console.log("req error");
                // console.log(err);
                // console.log(err?.response?.data);
                // console.log("refresh error");
                // console.log(error);
                // console.log(error?.response?.data);
                throw error;
            }

        }
        throw err;
    }

    public componentDidMount() {
        console.log("app componentDidMount");

        //create connection to the server
        this.socket = io.connect(Config.serverUrl);

        //listen to actions from the server
        this.socket.on("Admin-updated-a-vacation-from-server", vacationUpdated => {
            if (store.getState().vacations.length > 0)
                store.dispatch({ type: ActionType.saveOneVacation, payload: vacationUpdated });
        });

        this.socket.on("added-vacation-from-server", vacationAdded => {
            if (store.getState().vacations.length > 0)
                store.dispatch({ type: ActionType.addOneVacation, payload: vacationAdded });
        });

        this.socket.on("removed-vacation-from-server", vacationRemoved => {
            if (store.getState().vacations.length > 0)
                store.dispatch({ type: ActionType.deleteOneVacation, payload: vacationRemoved });
        });

        this.socket.on("follow-added-from-server", followAdded => {
            if (store.getState().vacations.length > 0 && store.getState().follows.length > 0) {
                store.dispatch({ type: ActionType.AddFollow, payload: followAdded });
                store.dispatch({ type: ActionType.setFollowsPerVacation });
                store.dispatch({ type: ActionType.sortVacations });
            }
        });

        this.socket.on("follow-removed-from-server", followId => {
            if (store.getState().vacations.length > 0 && store.getState().follows.length > 0) {
                store.dispatch({ type: ActionType.RemoveFollow, payload: followId });
                store.dispatch({ type: ActionType.setFollowsPerVacation });
                store.dispatch({ type: ActionType.sortVacations });
            }
        });

        this.socket.on("purchase-added-from-server", (purchase: PurchaseModel) => {
            if (store.getState().vacations.length > 0 && store.getState().purchases.length > 0) {
                purchase.vacation = store.getState().vacations.find(v => v.vacationId === purchase.vacationId);
                store.dispatch({ type: ActionType.addPurchase, payload: purchase });
            }
        });



    }

    //disconnect from the server
    public componentWillUnmount(): void {
        console.log("componentWillUnmount");
        this.socket?.disconnect();
    }

    public render() {
        return (
            <div className="layout">
                <BrowserRouter>
                    <Switch>
                        <Route
                            exact
                            path={"/"}
                            render={props => (
                                <Home
                                    {...props} key={"layout"}
                                />
                            )}
                        />
                        <Route
                            exact
                            path={"/login"} key={"login"}
                            render={props => (
                                <Login
                                    {...props}
                                />
                            )}
                        />
                        <Route
                            exact
                            path={"/registration"} key={"registration"}
                            render={props => (
                                <Registration
                                    {...props}
                                />
                            )}
                        />
                        <Route
                            exact
                            path={"/purchase/:id"} key={"purchase"}
                            render={props => (
                                <Purchase
                                    {...props}
                                />
                            )}
                        />
                        <Route
                            exact
                            path={"/purchases"} key={"purchases"}
                            render={props => (
                                <Purchases
                                    {...props}
                                />
                            )}
                        />
                        <Route
                            exact
                            path={"/admin"} key={"registration"}
                            render={props => (
                                <Admin
                                    {...props}
                                />
                            )}
                        />
                        <Route
                            exact
                            path={"/admin/add"} key={"add"}
                            render={props => (
                                <AddVacation
                                    {...props}
                                />
                            )}
                        />
                        <Route
                            exact
                            path={"/admin/:id"} key={"edit"}
                            render={props => (
                                <EditVacation
                                    {...props}
                                />
                            )}
                        />
                        <Route
                            exact
                            path={"/reports"} key={"reports"}
                            render={props => (
                                <Reports
                                    {...props}
                                />
                            )}
                        />
                    </Switch>
                </BrowserRouter>
            </div>
        );
    }
}