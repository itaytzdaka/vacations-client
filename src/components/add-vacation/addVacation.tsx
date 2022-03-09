import React, { Component, ChangeEvent } from "react";
import "./addVacation.css";
import { VacationModel } from "../../models/vacation-model";
import axios, { AxiosError } from "axios";
import { store } from "../../redux/store";
import { ActionType } from "../../redux/action-type";
import {
    validateDescription,
    validateDestination,
    validateImgUrl,
    validateStartingDate,
    validateEndingDate,
    validatePrice
} from "../../services/vacation-validation";
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import io from "socket.io-client";
import { NavBar } from "../nav-bar/navBar";
import { StringToJson } from "../../services/date";
import { Config } from "../../config";


interface VacationState {
    vacation: VacationModel;
    errors: {
        descriptionError: string,
        destinationError: string,
        imgError: string,
        startingDateError: string,
        endingDateError: string,
        priceError: string
    };

}

export class AddVacation extends Component<any, VacationState>{

    private socket;

    public constructor(props: any) {
        super(props);

        this.state = {
            vacation: new VacationModel(),
            errors: { descriptionError: "*", destinationError: "*", imgError: "*", startingDateError: "*", endingDateError: "*", priceError: "*" }

        };
    }


    public async componentDidMount() {

        //if there is no token, link to the login page
        if (!sessionStorage.getItem("token") || !sessionStorage.getItem("user")) {
            this.props.history.push("/login");
            return;
        }

        //if user is not admin, link to the Home page
        else if (!JSON.parse(sessionStorage.getItem("user")).isAdmin) {
            this.props.history.push("/");
        }

        //create connection to the server
        this.socket = io.connect(Config.serverUrl);
    }



    //get the data from inputs to the state
    private setDescription = (args: ChangeEvent<HTMLInputElement>) => {
        const description = args.target.value;
        let nameError;

        nameError = validateDescription(description);

        const errors = { ...this.state.errors };
        errors.descriptionError = nameError;
        this.setState({ errors });

        const vacation = { ...this.state.vacation };
        vacation.description = description;
        this.setState({ vacation });

    }

    private setDestination = (args: ChangeEvent<HTMLInputElement>) => {
        const destination = args.target.value;
        let nameError;


        nameError = validateDestination(destination);

        const errors = { ...this.state.errors };
        errors.destinationError = nameError;
        this.setState({ errors });

        const vacation = { ...this.state.vacation };
        vacation.destination = destination;
        this.setState({ vacation });
    }


    private setImgUrl = (args: ChangeEvent<HTMLInputElement>) => {
        const img = args.target.value;
        let nameError;


        nameError = validateImgUrl(img);

        const errors = { ...this.state.errors };
        errors.imgError = nameError;
        this.setState({ errors });

        const vacation = { ...this.state.vacation };
        vacation.img = img;
        this.setState({ vacation });
    }

    private setStartingDate = (args: ChangeEvent<HTMLInputElement>) => {
        const startingDate = args.target.value;
        let nameError;

        nameError = validateStartingDate(startingDate);

        const errors = { ...this.state.errors };
        errors.startingDateError = nameError;
        this.setState({ errors });

        const vacation = { ...this.state.vacation };
        vacation.startingDate = startingDate;
        this.setState({ vacation });
    }

    private setEndingDate = (args: ChangeEvent<HTMLInputElement>) => {
        const endingDate = args.target.value;
        let nameError;

        nameError = validateEndingDate(endingDate);

        const errors = { ...this.state.errors };
        errors.endingDateError = nameError;
        this.setState({ errors });

        const vacation = { ...this.state.vacation };
        vacation.endingDate = endingDate;
        this.setState({ vacation });
    }


    private setPrice = (args: ChangeEvent<HTMLInputElement>) => {
        const price = +args.target.value;
        let nameError;


        nameError = validatePrice(price);

        const errors = { ...this.state.errors };
        errors.priceError = nameError;
        this.setState({ errors });

        const vacation = { ...this.state.vacation };
        vacation.price = price;
        this.setState({ vacation });
    }

    //check if the form is legal
    private isFormLegal() {
        for (const prop in this.state.errors) {
            if (this.state.errors[prop].toString() !== "") {
                return false;
            }
        }
        return true;
    }

    //add a new vacation, to database and store, emit, and redirect to /login
    private add = async () => {
        try {
            const response = await axios.post<VacationModel>(Config.serverUrl + "/api/vacations",
                this.state.vacation);
            const addedVacation = response.data;
            addedVacation.follows = 0;
            addedVacation.startingDate = StringToJson(addedVacation.startingDate);
            addedVacation.endingDate = StringToJson(addedVacation.endingDate);
            console.log(addedVacation);
            store.dispatch({ type: ActionType.addOneVacation, payload: addedVacation });
            this.socket.emit("Admin-added-a-vacation-from-client", addedVacation);
            this.props.history.push("/admin");

        }
        catch (err) {
            if ((err as AxiosError).response?.data === "Your login session has expired") {
                // alert(err.response.data);
                sessionStorage.clear();
                alert((err as AxiosError).response?.data);
                this.props.history.push("/login");
                return;
            }

            else if ((err as AxiosError).response?.data === "You are not admin!") {
                this.props.history.push("/login");
                return;
            }

            else {
                alert(err);
            }
        }
    }

    //disconnect from the server
    public componentWillUnmount(): void {
        this.socket.disconnect();
    }

    public render() {

        return (
            <div className="EditVacation">
                <NavBar />
                <div className="edit-container">
                    <h1>Add Vacation</h1>
                    <br />
                    <Form.Group controlId="formBasicText">
                        <Form.Label>Destination</Form.Label>
                        <Form.Control type="text" placeholder="Enter destination" value={this.state.vacation.destination || ""} onChange={this.setDestination} />
                        <Form.Text className="text-muted">
                            {this.state.errors.destinationError=="*"? "" : this.state.errors.destinationError }
                        </Form.Text>
                    </Form.Group>

                    <Form.Group controlId="formBasicText">
                        <Form.Label>Description</Form.Label>
                        <Form.Control type="text" placeholder="Enter description" value={this.state.vacation.description || ""} onChange={this.setDescription} />
                        <Form.Text className="text-muted">
                            {this.state.errors.descriptionError=="*"? "" : this.state.errors.descriptionError}
                        </Form.Text>
                    </Form.Group>

                    <Form.Group controlId="formBasicText">
                        <Form.Label>Image URL</Form.Label>
                        <Form.Control type="text" placeholder="Enter img" value={this.state.vacation.img || ""} onChange={this.setImgUrl} />
                        <Form.Text className="text-muted">
                            {this.state.errors.imgError=="*"? "" : this.state.errors.imgError}
                        </Form.Text>
                    </Form.Group>

                    <Form.Group controlId="formBasicText">
                        <Form.Label>Start Date</Form.Label>
                        <Form.Control type="date" value={this.state.vacation.startingDate || ""} onChange={this.setStartingDate} />
                        <Form.Text className="text-muted">
                            {this.state.errors.startingDateError=="*"? "" : this.state.errors.startingDateError}
                        </Form.Text>
                    </Form.Group>

                    <Form.Group controlId="formBasicText">
                        <Form.Label>Ending Date</Form.Label>
                        <Form.Control type="date" value={this.state.vacation.endingDate || ""} onChange={this.setEndingDate} />
                        <Form.Text className="text-muted">
                            {this.state.errors.endingDateError=="*"? "" : this.state.errors.endingDateError}
                        </Form.Text>
                    </Form.Group>

                    <Form.Group controlId="formBasicText">
                        <Form.Label>Price</Form.Label>
                        <Form.Control type="text" placeholder="Enter description" value={this.state.vacation.price || ""} onChange={this.setPrice} />
                        <Form.Text className="text-muted">
                            {this.state.errors.priceError=="*"? "" : this.state.errors.priceError}
                        </Form.Text>
                    </Form.Group>

                    <Button variant="primary" type="submit" disabled={!this.isFormLegal()} onClick={this.add}>
                        Submit
                    </Button >

                </div>
            </div>
        );
    }
}