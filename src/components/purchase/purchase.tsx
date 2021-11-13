import React, { Component, ChangeEvent } from "react";
import "./purchase.css";
import { VacationModel } from "../../models/vacation-model";
import { PurchaseModel } from "../../models/purchase-model";

import axios from "axios";

import { Unsubscribe } from "redux";
import { store } from "../../redux/store";
import { ActionType } from "../../redux/action-type";

import { NavBar } from "../nav-bar/navBar";
import { JsonToString } from "../../services/date";
import { StringToJson } from "../../services/date";
import Card from 'react-bootstrap/Card';

import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';


import { Config } from "../../config";

interface VacationState {
    vacations: VacationModel[];
    purchase: PurchaseModel;
    vacation: VacationModel;
    // numberOfTickets: number;
    // totalPrice: number;
    errors: {
        descriptionError: string,
        destinationError: string,
        imgError: string,
        startingDateError: string,
        endingDateError: string,
        priceError: string
    };
}

export class Purchase extends Component<any, VacationState>{

    private unsubscribeStore: Unsubscribe;

    public constructor(props: any) {
        super(props);

        let numberOfTickets = 0;
        let totalPrice = 0;

        //get vacations from the store
        this.state = {
            vacations: store.getState().vacations,
            purchase: {},
            vacation: {},
            // numberOfTickets: 0,
            // totalPrice: 0,
            errors: { descriptionError: "", destinationError: "", imgError: "", startingDateError: "", endingDateError: "", priceError: "" }
        };

    }



    public async componentDidMount() {


        //if is there any changes in the store get the vacations from the new store.
        this.unsubscribeStore = store.subscribe(() => {
            const vacations = store.getState().vacations;
            this.setState({ vacations });
        });

        //if there is no token, link to the login page
        // if (!sessionStorage.getItem("token") || !sessionStorage.getItem("user")) {
        //     this.props.history.push("/login");
        //     return;
        // }

        //if user is not admin, link to the Home page
        // else if (!JSON.parse(sessionStorage.getItem("user")).isAdmin) {
        //     this.props.history.push("/");
        // }


        try {
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
                const response = await
                    axios.get<VacationModel>(`${Config.serverUrl}/api/vacations/${+this.props.match.params.id}`);
                vacation = response.data;
            }

            //treatment with json date format
            vacation.startingDate = JsonToString(vacation.startingDate);
            vacation.endingDate = JsonToString(vacation.endingDate);
            this.setState({ vacation });
            // console.log("this.state.vacation");
            // console.log(this.state.vacation);
            // console.log(vacation);

            const purchase = { ...this.state.purchase };
            purchase.vacationId = vacation.vacationId;
            purchase.userName = JSON.parse(sessionStorage.getItem("user")).userName;
            purchase.priceForTicket = vacation.price;
            this.setState({ purchase });
            console.log("this.state.purchase");
            console.log(this.state.purchase);
        }

        catch (err) {
            // if (err.response.data === "Your login session has expired") {
            //     sessionStorage.clear();
            //     alert(err.response.data);
            //     this.props.history.push("/login");
            //     return;
            // }

            // else {
            //     alert(err);
            // }

        }

    }

    //disconnect from the server and the store
    public componentWillUnmount(): void {
        this.unsubscribeStore();
    }

    //get the data from inputs to the state
    // public setDescription = (args: ChangeEvent<HTMLInputElement>) => {
    //     const description = args.target.value;
    //     let nameError;

    //     nameError = validateDescription(description);

    //     const errors = { ...this.state.errors };
    //     errors.descriptionError = nameError;
    //     this.setState({ errors });

    //     const vacation = { ...this.state.vacation };
    //     vacation.description = description;
    //     this.setState({ vacation });
    // }
    // public setDestination = (args: ChangeEvent<HTMLInputElement>) => {
    //     const destination = args.target.value;
    //     let nameError;

    //     nameError = validateDestination(destination);

    //     const errors = { ...this.state.errors };
    //     errors.destinationError = nameError;
    //     this.setState({ errors });

    //     const vacation = { ...this.state.vacation };
    //     vacation.destination = destination;
    //     this.setState({ vacation });
    // }

    // public setImgUrl = (args: ChangeEvent<HTMLInputElement>) => {
    //     const img = args.target.value;
    //     let nameError;

    //     nameError = validateImgUrl(img);

    //     const errors = { ...this.state.errors };
    //     errors.imgError = nameError;
    //     this.setState({ errors });

    //     const vacation = { ...this.state.vacation };
    //     vacation.img = img;
    //     this.setState({ vacation });
    // }
    // public setStartingDate = (args: ChangeEvent<HTMLInputElement>) => {
    //     const startingDate = args.target.value;
    //     let nameError;

    //     nameError = validateStartingDate(startingDate);

    //     const errors = { ...this.state.errors };
    //     errors.startingDateError = nameError;
    //     this.setState({ errors });

    //     const vacation = { ...this.state.vacation };
    //     // vacation.startingDate=new Date(startingDate).toJSON();
    //     vacation.startingDate = startingDate;
    //     this.setState({ vacation });
    // }
    // public setEndingDate = (args: ChangeEvent<HTMLInputElement>) => {
    //     const endingDate = args.target.value;
    //     let nameError;

    //     nameError = validateEndingDate(endingDate);

    //     const errors = { ...this.state.errors };
    //     errors.endingDateError = nameError;
    //     this.setState({ errors });

    //     const vacation = { ...this.state.vacation };
    //     // vacation.endingDate = new Date(endingDate).toJSON();
    //     vacation.endingDate = endingDate;
    //     this.setState({ vacation });
    // }

    private setAmountOfTickets = (args: ChangeEvent<HTMLInputElement>) => {
        console.log("this.state.purchase");
        console.log(this.state.purchase);

        const purchase = { ...this.state.purchase };
        purchase.tickets = +args.target.value;
        purchase.totalPrice = purchase.tickets * this.state.vacation.price;
        // console.log(purchase);

        // const vacation = { ...this.state.vacation };
        // const totalPrice= numberOfTickets*vacation.price;
        this.setState({ purchase });
        console.log("this.state.purchase");
        console.log(this.state.purchase);

        // this.state.numberOfTickets=amount;
        // let nameError;
        // nameError = validatePrice(price);

        // const errors = { ...this.state.errors };
        // errors.priceError = nameError;
        // this.setState({ errors });

        // const vacation = { ...this.state.vacation };
        // vacation.price = price;
        // this.setState({ vacation });
    }

    private isFormLegal() {
        if (this.state.purchase.totalPrice <= 0) {
            return false;
        }

        return true;
    }

    // public update = async () => {
    //     try {
    //         const vacationToUpdate = { ...this.state.vacation }
    //         console.log(vacationToUpdate);
    //         console.log(Config.serverUrl);
    //         await axios.put(`${Config.serverUrl}/api/vacations/${+this.props.match.params.id}`,
    //             vacationToUpdate);
    //         console.log("after axios");
    //         vacationToUpdate.startingDate = StringToJson(vacationToUpdate.startingDate);
    //         vacationToUpdate.endingDate = StringToJson(vacationToUpdate.endingDate);
    //         store.dispatch({ type: ActionType.saveOneVacation, payload: vacationToUpdate });
    //         this.socket.emit("Admin-updated-a-vacation-from-client", vacationToUpdate);
    //         this.props.history.push("/admin");
    //     }

    //     catch (err) {
    //         console.log("err");
    //         console.log(err);
    //         if (err.response.data === "Your login session has expired") {
    //             sessionStorage.clear();
    //             alert(err.response.data);
    //             this.props.history.push("/login");
    //             return;
    //         }

    //         else if (err.response.data === "You are not admin!") {
    //             this.props.history.push("/login");
    //             return;
    //         }

    //         else {
    //             alert(err);
    //         }
    //     }
    // }

    private send = async () => {
        try {
            const dateNow = new Date();
            let purchase = { ...this.state.purchase };
            purchase.date = dateNow;
            console.log("send")
            console.log("purchase");
            console.log(purchase);
            const response = await axios.post<PurchaseModel>(Config.serverUrl + "/api/purchases",
                purchase);
            console.log("response.data");
            console.log(response.data);
            purchase = response.data;
            this.props.history.push("/");

            // console.log(response);
            // console.log("purchase");
            // console.log(purchase);
        }
        catch (err) {
            console.log(err);
        }

    }


    public render() {
        return (
            <div className="purchaseVacation">
                <NavBar />
                <div className="card-container">
                    <Card className="card-purchase">
                        <Card.Header >
                            <div className="header">
                                <img className="img" src={"/assets/images/vacations/" + this.state.vacation.img} />
                                <span className="destination">{this.state.vacation.destination || ""}</span>
                            </div>
                        </Card.Header>
                        <Card.Body>
                            <Card.Title>Description:</Card.Title>
                            <Card.Text>
                                {this.state.vacation.description || ""}
                            </Card.Text>
                            <Card.Title>Vacation Date:</Card.Title>
                            <Card.Text>
                                From {new Date(this.state.vacation.startingDate).toDateString()} to  {new Date(this.state.vacation.endingDate).toDateString()}
                            </Card.Text>
                            <Card.Title>One ticket cost:</Card.Title>
                            <Card.Text>
                                {this.state.vacation.price || ""}$
                            </Card.Text>
                        </Card.Body>
                        <Card.Header >
                            <h2>Purchase</h2>
                        </Card.Header>
                        <Card.Body>
                            <Card.Text>
                                Number Of tickets: <input type="text" pattern="[0-9]*" onInput={this.setAmountOfTickets.bind(this)} value={this.state.purchase.tickets} />
                                {/* <input type="number" value={this.state.numberOfTickets || ""} onChange={this.setAmountOfTickets} ></input> */}
                            </Card.Text>
                            <Card.Text>
                                Total price: {this.state.purchase.totalPrice || ""}$
                            </Card.Text>
                            <Card.Text>
                                <Button variant="primary" type="submit" disabled={!this.isFormLegal()} onClick={this.send} >
                                    Buy
                                </Button >
                            </Card.Text>
                        </Card.Body>

                    </Card>
                </div>


            </div>
        );
    }
}