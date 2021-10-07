import React, { Component } from "react";
import "./app.css";
import { BrowserRouter, Switch, Route } from "react-router-dom";
import { Home } from "../home/home"
import { Registration } from "../registration/registration";
import { Login } from "../login/login";
import axios from "axios";
import { Admin } from "../admin/admin";
import { EditVacation } from "../edit-vacation/editVacation";
import { AddVacation } from "../add-vacation/addVacation";
import { Reports } from "../reports/reports";
import { Purchase } from "../purchase/purchase";


export class App extends Component<any>{

    public constructor(props: any) {
        super(props);
        axios.interceptors.request.use(req => {
            req.headers.authorization = 'Bearer '+sessionStorage.getItem("token");
            return req;
        });

        axios.interceptors.response.use(res => {
            return res;
          });
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