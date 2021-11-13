import React, { Component, ChangeEvent } from "react";
import "./editVacation.css";
import { VacationModel } from "../../models/vacation-model";
import axios, { AxiosError } from "axios";
import { Unsubscribe } from "redux";
import { store } from "../../redux/store";
import { JsonToString } from "../../services/date";
import { StringToJson } from "../../services/date";
import { validateDescription, validateDestination, validateImgUrl, validateStartingDate, validateEndingDate, validatePrice } from "../../services/vacation-validation";
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import io from "socket.io-client";
import { NavBar } from "../nav-bar/navBar";
import { ActionType } from "../../redux/action-type";
import { Config } from "../../config";

interface VacationState {
    vacations: VacationModel[];
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

export class EditVacation extends Component<any, VacationState>{

    private unsubscribeStore: Unsubscribe;
    private socket;

    public constructor(props: any) {
        super(props);

        //get vacations from the store
        this.state = {
            vacations: store.getState().vacations,
            vacation: {},
            errors: { descriptionError: "", destinationError: "", imgError: "", startingDateError: "", endingDateError: "", priceError: "" }
        };

    }



    public async componentDidMount() {


        //create connection to the server
        this.socket = io.connect("http://localhost:3000");


        //if is there any changes in the store get the vacations from the new store.
        this.unsubscribeStore = store.subscribe(() => {
            const vacations = store.getState().vacations;
            this.setState({ vacations });
        });

        //if there is no token, link to the login page
        if (!sessionStorage.getItem("token") || !sessionStorage.getItem("user")) {
            this.props.history.push("/login");
            return;
        }

        //if user is not admin, link to the Home page
        else if (!JSON.parse(sessionStorage.getItem("user")).isAdmin) {
            this.props.history.push("/");
        }



        let vacation;

        //if the store is not empty, find the vacation for edit and don't use axios at all
        if (this.state.vacations.length > 0) {

            for (let v of this.state.vacations) {
                if (v.vacationId === +this.props.match.params.id) {
                    vacation = ({ ...v });
                }

            }
        }

        // if the store is empty, get the vacation for edit with axios
        else {
            try {
                const response = await
                    axios.get<VacationModel>(`${Config.serverUrl}/api/vacations/${+this.props.match.params.id}`);
                // console.log(response);
                vacation = response.data;

            }


            catch (err) {
                console.log(err as AxiosError);
                if ((err as AxiosError).response?.data === "Your login session has expired") {
                    sessionStorage.clear();
                    alert(err);
                    // this.props.history.push("/login");
                    return;
                }

                else {
                    alert((err as AxiosError).response?.data);
                }

            }



        }

        //treatment with json date format
        vacation.startingDate = JsonToString(vacation.startingDate);
        vacation.endingDate = JsonToString(vacation.endingDate);
        this.setState({ vacation });

    }

    //disconnect from the server and the store
    public componentWillUnmount(): void {
        this.unsubscribeStore();
        this.socket.disconnect();
    }

    //get the data from inputs to the state
    public setDescription = (args: ChangeEvent<HTMLInputElement>) => {
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
    public setDestination = (args: ChangeEvent<HTMLInputElement>) => {
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

    public setImgUrl = (args: ChangeEvent<HTMLInputElement>) => {
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
    public setStartingDate = (args: ChangeEvent<HTMLInputElement>) => {
        const startingDate = args.target.value;
        let nameError;

        nameError = validateStartingDate(startingDate);

        const errors = { ...this.state.errors };
        errors.startingDateError = nameError;
        this.setState({ errors });

        const vacation = { ...this.state.vacation };
        // vacation.startingDate=new Date(startingDate).toJSON();
        vacation.startingDate = startingDate;
        this.setState({ vacation });
    }
    public setEndingDate = (args: ChangeEvent<HTMLInputElement>) => {
        const endingDate = args.target.value;
        let nameError;

        nameError = validateEndingDate(endingDate);

        const errors = { ...this.state.errors };
        errors.endingDateError = nameError;
        this.setState({ errors });

        const vacation = { ...this.state.vacation };
        // vacation.endingDate = new Date(endingDate).toJSON();
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

    private isFormLegal() {
        for (const prop in this.state.errors) {
            if (this.state.errors[prop].toString() !== "") {
                return false;
            }
        }
        return true;
    }

    public update = async () => {
        try {
            const vacationToUpdate = { ...this.state.vacation }
            console.log(vacationToUpdate);
            console.log(Config.serverUrl);
            await axios.put(`${Config.serverUrl}/api/vacations/${+this.props.match.params.id}`,
                vacationToUpdate);
            console.log("after axios");
            vacationToUpdate.startingDate = StringToJson(vacationToUpdate.startingDate);
            vacationToUpdate.endingDate = StringToJson(vacationToUpdate.endingDate);
            store.dispatch({ type: ActionType.saveOneVacation, payload: vacationToUpdate });
            this.socket.emit("Admin-updated-a-vacation-from-client", vacationToUpdate);
            this.props.history.push("/admin");
        }

        catch (err) {
            console.log("err");
            console.log(err);
            if ((err as AxiosError).response?.data === "Your login session has expired") {
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


    public render() {
        return (
            <div className="EditVacation">
                <NavBar />
                <div className="form-container">
                    <h1>Edit Vacation</h1>
                    <br />
                    <Form>

                        <Form.Group controlId="formBasicText">
                            <Form.Label>Destination</Form.Label>
                            <Form.Control type="text" placeholder="Enter description" value={this.state.vacation.destination || ""} onChange={this.setDestination} />
                            <Form.Text className="text-muted">
                                {this.state.errors.destinationError}
                            </Form.Text>
                        </Form.Group>

                        <Form.Group controlId="formBasicText">
                            <Form.Label>Description</Form.Label>
                            <Form.Control type="text" placeholder="Enter description" value={this.state.vacation.description || ""} onChange={this.setDescription} />
                            <Form.Text className="text-muted" >
                                {this.state.errors.descriptionError}
                            </Form.Text>
                        </Form.Group>

                        <Form.Group controlId="formBasicText">
                            <Form.Label>Image URL</Form.Label>
                            <Form.Control type="text" placeholder="Enter description" value={this.state.vacation.img || ""} onChange={this.setImgUrl} />
                            <Form.Text className="text-muted" >
                                {this.state.errors.imgError}
                            </Form.Text>
                        </Form.Group>

                        <Form.Group controlId="formBasicText">
                            <Form.Label>Start Date</Form.Label>
                            <Form.Control type="date" placeholder="Enter description" value={this.state.vacation.startingDate || ""} onChange={this.setStartingDate} />
                            <Form.Text className="text-muted">
                                {this.state.errors.startingDateError}
                            </Form.Text>
                        </Form.Group>

                        <Form.Group controlId="formBasicText">
                            <Form.Label>Ending Date</Form.Label>
                            <Form.Control type="date" placeholder="Enter description" value={this.state.vacation.endingDate || ""} onChange={this.setEndingDate} />
                            <Form.Text className="text-muted">
                                {this.state.errors.endingDateError}
                            </Form.Text>
                        </Form.Group>

                        <Form.Group controlId="formBasicText">
                            <Form.Label>Price</Form.Label>
                            <Form.Control type="text" placeholder="Enter description" value={this.state.vacation.price || ""} onChange={this.setPrice} />
                            <Form.Text className="text-muted">
                                {this.state.errors.priceError}
                            </Form.Text>
                        </Form.Group>

                        <Button variant="primary" type="submit" disabled={!this.isFormLegal()} onClick={this.update}>
                            Submit
                        </Button >
                    </Form>
                </div>

            </div>
        );
    }
}