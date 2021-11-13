import React, { Component, ChangeEvent } from "react";
import "./login.css";
import { NavLink } from "react-router-dom";
import axios, { AxiosError } from "axios";
import { UserModel } from "../../models/user-model";
import { validateUserName, validatePassword } from "../../services/user-validation";
import { Config } from "../../config";
import Button from 'react-bootstrap/Button';



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

    private login = async () => {

        try {
            const response = await axios.post(Config.serverUrl + "/api/auth/login",
                this.state.user);
            sessionStorage.setItem("user", JSON.stringify(response.data.user));
            sessionStorage.setItem("token", response.data.token);

            this.props.history.push("/");
        }

        catch (err) {
            if ((err as AxiosError).response?.data === "Illegal username or password") {
                alert((err as AxiosError).response?.data);
                return;
            }

            else {
                alert(err);
            }
        }


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


    public componentDidMount() {
        //if the user is logged in, navigate to Home page
        if (sessionStorage.getItem("token") && JSON.parse(sessionStorage.getItem("user"))) {
            this.props.history.push("/");
            return;
        }
    }

    public render() {
        return (
            <div className="login">
                <div className="card-login">
                    <form className="form-login" action="">
                        <h1>Login</h1>
                        <input type="text" name="" id="userBox" placeholder="User Name" onChange={this.setUserName} />
                        <input type="password" name="" id="userBox" placeholder="Password" onChange={this.setPassword} />
                        <br />
                        {/* <button disabled={!this.isFormLegal()} onClick={this.login}>Login</button> */}
                        <Button variant="primary" type="submit" disabled={!this.isFormLegal()} onClick={this.login}>
                            Login
                        </Button >
                    </form>
                    <NavLink className="navigate" to="/registration" exact>Not a member? Sign up now</NavLink>

                </div>
            </div>
        );
    }
}