import React, { Component } from "react";
import "./purchases.css";

//server
import axiosPrivate from "../../api/axios";
import io from "socket.io-client";
import { Config } from "../../config";

//store
import { Unsubscribe } from "redux";
import { store } from "../../redux/store";
import { ActionType } from "../../redux/action-type";

//components
import NavBar from "../nav-bar/navBar";
import Table from 'react-bootstrap/Table';

//models
import { VacationModel } from "../../models/vacation-model";
import { PurchaseModel } from "../../models/purchase-model";

//services
import { errorHandling, isAdmin, isLoggedIn } from "../../services/auth"



interface PurchaseState {
    purchases: PurchaseModel[];
    isLoggedIn: boolean;
}

export class Purchases extends Component<any, PurchaseState>{

    private unsubscribeStore: Unsubscribe;
    private socket;

    public constructor(props: any) {
        super(props);

        //get purchases, vacations, and login status from the store
        this.state = {
            purchases: store.getState().purchases,
            isLoggedIn: store.getState().isLoggedIn
        };

    }


    public componentDidMount() {

        if(!isLoggedIn(this.props)) return;
        if(!isAdmin(this.props)) return;

        //create connection to the server
        this.socket = io.connect(Config.serverUrl);

        //if is there any changes in the store get the vacations from the new store.
        this.unsubscribeStore = store.subscribe(() => {

            const purchases = store.getState().purchases;
            this.setState({ purchases });
        });

        this.getComponentDataWithAxios();

    }

    private getComponentDataWithAxios = async () => {
        try {

            //if the store is empty, get vacations and purchases data.

            if (store.getState().vacations.length === 0) {
                const response = await
                    axiosPrivate.get<VacationModel[]>(`/api/vacations`);
                const vacations = response.data;
                store.dispatch({ type: ActionType.SaveAllVacations, payload: vacations });
            }

            if (store.getState().purchases.length === 0) {
                const response = await
                    axiosPrivate.get<PurchaseModel[]>(`/api/purchases`);
                const purchases = response.data;

                purchases.forEach(p => {
                    p.vacation = store.getState().vacations.find(v => v.vacationId === p.vacationId);
                });

                store.dispatch({ type: ActionType.saveAllPurchases, payload: purchases });
            }
        }

        catch (err) {
            errorHandling(err, this.props);
        }
    }

    //disconnect from the server and the store
    public componentWillUnmount(): void {
        this.unsubscribeStore?.();
        this.socket?.disconnect();
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
                        <tbody>
                            {this.state.purchases ? this.state.purchases.map(p =>

                                <tr key={p.purchaseId}>
                                    <td>{p.userName}</td>
                                    <td>{p.tickets}</td>
                                    <td>{p.totalPrice}$</td>
                                    <td>{p.vacation.destination}</td>
                                    <td>{new Date(p.date).toDateString()}</td>
                                </tr>

                            ) : ""}
                        </tbody>
                    </Table>

                </div>
            </div>
        );
    }
}