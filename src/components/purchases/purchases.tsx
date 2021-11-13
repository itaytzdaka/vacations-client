import React, { Component, ChangeEvent } from "react";
import "./purchases.css";
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
import Table from 'react-bootstrap/Table';


import { Config } from "../../config";
import { VacationModel } from "../../models/vacation-model";

interface PurchaseState {
    purchases: PurchaseModel[];
    vacations: VacationModel[];
    // numberOfTickets: number;
    // totalPrice: number;
}

export class Purchases extends Component<any, PurchaseState>{

    private unsubscribeStore: Unsubscribe;

    public constructor(props: any) {
        super(props);

        let numberOfTickets = 0;
        let totalPrice = 0;

        //get vacations from the store
        this.state = {
            purchases: [],
            vacations: []
            // numberOfTickets: 0,
            // totalPrice: 0,
        };

    }



    public async componentDidMount() {


        //if is there any changes in the store get the vacations from the new store.
        this.unsubscribeStore = store.subscribe(() => {
            // const purchases = store.getState().purchases;
            const vacations = store.getState().vacations;
            this.setState({ vacations });
            // this.setState({ purchases });
        });

        let vacations = store.getState().vacations;
        let purchases;

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

            //if the store is not empty, find the vacation for edit and don't use axios at all
            if (this.state.purchases.length === 0) {
                const response = await
                    axios.get<PurchaseModel[]>(`${Config.serverUrl}/api/purchases`);
                purchases = response.data;
            }
            if (this.state.vacations.length === 0) {
                const response = await
                    axios.get<VacationModel[]>(`${Config.serverUrl}/api/vacations`);
                vacations = response.data;
            }




            //treatment with json date format
            // vacation.startingDate = JsonToString(vacation.startingDate);
            // vacation.endingDate = JsonToString(vacation.endingDate);

            // console.log("this.state.vacation");
            // console.log(this.state.vacation);
            // console.log(vacation);

            // const purchase = { ...this.state.purchase };
            // purchase.vacationId=vacation.vacationId;
            // purchase.userName=JSON.parse(sessionStorage.getItem("user")).userName;
            // purchase.priceForTicket=vacation.price;
            // this.setState({ purchase });
            // console.log("this.state.purchase");
            // console.log(this.state.purchase);
        }

        catch (err) {
            console.log(err);
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
        //     const errors = { ...this.state.errors };
        this.setState({ vacations });

        purchases.forEach(p => {
            p.vacation = vacations.find(v => v.vacationId == p.vacationId);
        });
        this.setState({ purchases });
        console.log(purchases);

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



    public render() {
        return (
            <div className="purchases">
                <NavBar />

                <div className="table-container">
                    <h1>Purchases</h1>
                    <br />
                    <Table striped bordered hover>
                        <thead>
                            <tr>
                                <th>User Name</th>
                                <th>Number of Tickets</th>
                                <th>Total price</th>
                                <th>Vacation</th>
                                <th>Date</th>
                            </tr>
                        </thead>
                        {this.state.purchases.map(p =>
                            <tbody>
                                <tr>
                                    <td>{p.userName}</td>
                                    <td>{p.tickets}</td>
                                    <td>{p.totalPrice}</td>
                                    <td>{p.vacation.destination}</td>
                                    <td>{new Date(p.date).toDateString()}</td>

                                </tr>
                            </tbody>
                        )}

                    </Table>

                </div>
            </div>
        );
    }
}