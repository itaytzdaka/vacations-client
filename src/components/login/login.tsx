import React, { Component, ChangeEvent } from "react";
import "./login.css";

//server
import axios from "../../api/axios";

//models
import { UserModel } from "../../models/user-model";

//validation
import { validateUserName, validatePassword } from "../../services/user-validation";

//components
import Button from 'react-bootstrap/Button';
import { NavLink } from "react-router-dom";

//services
import Cookies from 'universal-cookie';
import { errorHandling } from "../../services/auth"

//store
import { store } from "../../redux/store";
import { ActionType } from "../../redux/action-type";


interface UserState {
    user: UserModel;
    errors: {
        userNameError: string,
        passwordError: string,
    };
}

export class Login extends Component<any, UserState>{

    public constructor(props: any) {
        super(props);
        this.state = {
            user: new UserModel(),
            errors: { userNameError: "*", passwordError: "*" }

        };
    }

    public componentDidMount() {
        console.log("login componentDidMount");

        //if the user is logged in, navigate to Home page
        if (store.getState().user) {
            this.props.history.push("/");
            return;
        }
    }

    private setUserName = (args: ChangeEvent<HTMLInputElement>) => {
        const userName = args.target.value;

        let nameError = validateUserName(userName);

        const errors = { ...this.state.errors };
        errors.userNameError = nameError;
        this.setState({ errors });

        const user = { ...this.state.user };
        user.userName = userName;
        this.setState({ user });

    }

    private setPassword = (args: ChangeEvent<HTMLInputElement>) => {
        const password = args.target.value;

        let nameError = validatePassword(password);

        const errors = { ...this.state.errors };
        errors.passwordError = nameError;
        this.setState({ errors });

        const user = { ...this.state.user };
        user.password = password;
        this.setState({ user });
    }

    //check if the form is legal
    private isFormLegal = () => {
        for (const prop in this.state.errors) {
            if (this.state.errors[prop].toString() !== "") {
                return false;
            }
        }
        return true;
    }


    private login = async (e) => {

        try {
            e.preventDefault();
            const response = await axios.post("/api/auth/login",
                this.state.user, { withCredentials: true });

            store.dispatch({ type: ActionType.saveUser, payload: response.data.user });
            store.dispatch({ type: ActionType.saveToken, payload: response.data.accessToken });

            const cookies = new Cookies();
            cookies.set('user', response.data.user, { path: '/', maxAge: 24 * 60 * 60 });

            this.props.history.push("/");
        }

        catch (err) {
            errorHandling(err, this.props);
        }
    }


    public render() {
        return (
            <div className="login">
                <div className="card-login">
                    <form className="form-login" onSubmit={this.login}>
                        <h1>Login</h1>
                        <input type="text" name="" id="userBox" placeholder="User Name" onChange={this.setUserName} />
                        <input type="password" name="" id="userBox" placeholder="Password" onChange={this.setPassword} />
                        <br />
                        <Button variant="primary" type="submit" disabled={!this.isFormLegal()} >
                            Login
                        </Button >
                    </form>
                    <NavLink className="navigate" to="/registration" exact>Not a member? Sign up now</NavLink>

                </div>
            </div>
        );
    }
}