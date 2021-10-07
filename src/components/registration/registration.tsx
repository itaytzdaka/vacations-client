import React, { Component, ChangeEvent } from "react";
import "./registration.css";
import axios from "axios";
import { UserModel } from "../../models/user-model";
import { NavLink } from "react-router-dom";
import {
    validateAvailableUserName,
    validateUserName,
    validateFirstName,
    validateLastName,
    validatePassword,
    verifyPassword}
     from "../../services/user-validation";
import { Config } from "../../config";

interface UserState {
    user: UserModel;
    usersNames: UserModel[];
    errors: {   userNameError: string,
                firstNameError: string,
                lastNameError: string,
                passwordError: string,
                verifyPasswordError: string
              };

}

export class Registration extends Component<any,UserState>{

    public constructor(props: any) {
        super(props);
        this.state = {
            user: new UserModel(),
            usersNames: [],
            errors: { userNameError: "*", firstNameError: "*", lastNameError: "*",passwordError:"*",verifyPasswordError:"*"}
        };
    }

    private setUserName = (args: ChangeEvent<HTMLInputElement>) => {
        const userName = args.target.value;

        let nameError;

        nameError = validateAvailableUserName(userName,this.state.usersNames);
        if(nameError!=="user name is not available"){
            nameError=validateUserName(userName);
        }
        
        const errors = { ...this.state.errors };
        errors.userNameError = nameError;
        this.setState({ errors });

        const user = { ...this.state.user };
        user.userName = userName;
        this.setState({ user });
    }

    private setFirstName = (args: ChangeEvent<HTMLInputElement>) => {
        const firstName = args.target.value;

        let nameError = validateFirstName(firstName);

        const errors = { ...this.state.errors };
        errors.firstNameError = nameError;
        this.setState({ errors });

        const user = { ...this.state.user };
        user.firstName = firstName;
        this.setState({ user });

    }

    private setLastName = (args: ChangeEvent<HTMLInputElement>) => {
        const lastName = args.target.value;

        let nameError = validateLastName(lastName);

        const errors = { ...this.state.errors };
        errors.lastNameError = nameError;
        this.setState({ errors });

        const user = { ...this.state.user };
        user.lastName = lastName;
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

    private verifyPasswordUser = (args: ChangeEvent<HTMLInputElement>) => {
        const verifiedPassword = args.target.value;
        const user = { ...this.state.user };
        
        let nameError = verifyPassword(verifiedPassword,user.password);

        const errors = { ...this.state.errors };
        errors.verifyPasswordError = nameError;
        this.setState({ errors });
    }

    private isFormLegal = () => {
        for (const prop in this.state.errors) {
            if (this.state.errors[prop].toString() !== "") {
                return false;
            }
        }
        return true;
    }

    private register = async () => {

        try {
            const response = await axios.post(Config.serverUrl+"/api/auth/register",
                this.state.user);

            sessionStorage.setItem("user", JSON.stringify(response.data.user));
            sessionStorage.setItem("token", response.data.token);

            this.props.history.push("/");
        }

        catch (err) {
            alert(err.message);
        }

    }

    public async getAllUsersNames(){
        try{
            const response = await axios.get<UserModel[]>(Config.serverUrl+"/api/auth/usersNames");
            const usersNames=response.data;

            this.setState({usersNames});
        }

        catch(err)
        {
            alert(err);
        }
    }


    public componentDidMount(){
        //if the user is logged in, navigate to home page
        if (sessionStorage.getItem("token")) {
            this.props.history.push("/");
            return;
        }

        this.getAllUsersNames();
    }

    public render() {
        return (
            <div className="registration">
                <div className="cardRegistration">
                    <h1>Sign up</h1>
                    <input type="text" name="" id="userBox" placeholder="User Name" onChange={this.setUserName}/>
                    <span>{this.state.errors.userNameError}</span>
                    <input type="text" name="" id="userBox" placeholder="First Name" onChange={this.setFirstName}/>
                    <span>{this.state.errors.firstNameError}</span>
                    <input type="text" name="" id="userBox" placeholder="Last Name" onChange={this.setLastName}/>
                    <span>{this.state.errors.lastNameError}</span>
                    <input type="password" name="" id="userBox" placeholder="Password" onChange={this.setPassword}/>
                    <span>{this.state.errors.passwordError}</span>
                    <input type="password" name="" id="userBox" placeholder="Verify Password" onChange={this.verifyPasswordUser}/>
                    <span>{this.state.errors.verifyPasswordError}</span>
                    <br/>
                    <button disabled={!this.isFormLegal()} onClick={this.register}>Sign up</button>
                    <NavLink className="navigateLogin" to="/login" exact>Do you have an account? Sign in now</NavLink>

                </div>
            </div>
        );
    }
}