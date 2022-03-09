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

    }

    //disconnect from the server and the store
    public componentWillUnmount(): void {
        this.unsubscribeStore();
    }



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