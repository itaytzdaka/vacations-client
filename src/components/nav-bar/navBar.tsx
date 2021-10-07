import React, { Component } from "react";
import "./navBar.css";
import Button from 'react-bootstrap/Button';
import { NavLink } from "react-router-dom";
import { UserModel } from "../../models/user-model";

interface userState {
    user: UserModel
}


export class NavBar extends Component<any, userState>{

    public constructor(props: any) {
        super(props);

        this.state = {
            user: new UserModel()
        }
    }

    componentDidMount() {
        if (sessionStorage.getItem("user")) {
            const user = JSON.parse(sessionStorage.getItem("user"));
            this.setState({ user });
        }

    }

    private logOut() {
        sessionStorage.clear();
    }

    public render() {
        return (
            <div className="barMenu">
                <div className="left">
                    <NavLink to="/" exact>Home</NavLink>
                    {this.state.user.isAdmin ? (<span> |
                                                <NavLink to="/admin" exact> Admin </NavLink>
                                                <span>|</span>
                                                <NavLink to="/admin/add" exact> Add Vacation</NavLink>
                                                <span>|</span>
                                                <NavLink to="/reports" exact> Reports </NavLink>
                                            </span>):null}

                    <div className="right">Hello {this.state.user.userName} </div>
                </div>
                <div>
                    <NavLink to="/login" exact>
                        <Button onClick={this.logOut}>Log out</Button>
                    </NavLink>
                </div>

            </div>
        )
    }
}