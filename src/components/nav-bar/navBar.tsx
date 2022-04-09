import React, { Component } from "react";
import "./navBar.css";
import Button from 'react-bootstrap/Button';
import { NavLink } from "react-router-dom";
import { UserModel } from "../../models/user-model";
import { store } from "../../redux/store";
import { disconnect } from "../../services/auth"
import { withRouter } from 'react-router-dom';

interface userState {
    user: UserModel
}


class NavBar extends Component<any, userState>{

    public constructor(props: any) {
        super(props);

        this.state = {
            user: store.getState().user
        }
    }

    private logOut =async () => {
        await disconnect();
        this.props.history.push("/login");
    }

    public render() {
        return (
            <div className="nav-bar">
                <div className="nav-container">
                    <nav>
                        {this.state.user?.isAdmin ? (
                            <ul>
                                <li>
                                    <NavLink to="/" exact>Home</NavLink>
                                </li>
                                <li>
                                    <NavLink to="/admin" exact> Edit Vacation </NavLink>
                                </li>
                                <li>
                                    <NavLink to="/admin/add" exact> Add Vacation</NavLink>
                                </li>
                                <li>
                                    <NavLink to="/purchases" exact> Purchases</NavLink>
                                </li>
                                <li>
                                    <NavLink to="/reports" exact> Reports </NavLink>
                                </li>
                            </ul>
                        ) :
                            <ul>
                                <li>
                                    <NavLink to="/" exact>Home</NavLink>
                                </li>
                            </ul>

                        }
                        <div className="user">
                            <div> Hello {this.state.user?.userName} </div>

                            <div>
                                <Button onClick={this.logOut}>Log out</Button>
                            </div>
                        </div>


                    </nav>

                </div>
                <div className="space">

                </div>
            </div>



        )
    }
}

export default withRouter(NavBar);