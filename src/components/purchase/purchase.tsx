import React, { Component, ChangeEvent } from "react";
import "./purchase.css";

//models
import { VacationModel } from "../../models/vacation-model";
import { PurchaseModel } from "../../models/purchase-model";

//server
import axiosPrivate from "../../api/axios";
import io from "socket.io-client";
import { Config } from "../../config";

//store
import { Unsubscribe } from "redux";
import { store } from "../../redux/store";

//components
import NavBar from "../nav-bar/navBar";
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';

//services
import { JsonToString } from "../../services/date";
import { errorHandling, isLoggedIn } from "../../services/auth"

interface VacationState {
    vacations: VacationModel[];
    purchase: PurchaseModel;
    vacation: VacationModel;
    isLoggedIn: boolean;
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
    private socket;

    public constructor(props: any) {
        super(props);

        //get vacations, and login status from the store
        this.state = {
            vacations: store.getState().vacations,
            purchase: {},
            vacation: {},
            isLoggedIn: store.getState().isLoggedIn,
            errors: { descriptionError: "", destinationError: "", imgError: "", startingDateError: "", endingDateError: "", priceError: "" }
        };

    }


    public async componentDidMount() {

        if(!isLoggedIn(this.props)) return;

        //create connection to the server
        this.socket = io.connect(Config.serverUrl);

        //if is there any changes in the store get the vacations from the new store.
        this.unsubscribeStore = store.subscribe(() => {
            const vacations = store.getState().vacations;
            this.setState({ vacations });
        });

        this.getComponentData();
    }



    private getComponentData = async () => {

        let vacation;

        //if the store is not empty, find the purchase and don't use axios at all
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
                    axiosPrivate.get<VacationModel>(`/api/vacations/${+this.props.match.params.id}`);
                vacation = response.data;
            }

            catch (err) {
                errorHandling(err, this.props);
            }
        }

        //treatment with json date format
        vacation.startingDate = JsonToString(vacation.startingDate);
        vacation.endingDate = JsonToString(vacation.endingDate);
        this.setState({ vacation });


        const purchase = { ...this.state.purchase };
        purchase.vacationId = vacation.vacationId;
        purchase.userName = store.getState().user.userName;
        purchase.priceForTicket = vacation.price;
        this.setState({ purchase });
    }


    private setAmountOfTickets = (args: ChangeEvent<HTMLInputElement>) => {

        const purchase = { ...this.state.purchase };
        purchase.tickets = +args.target.value;
        purchase.totalPrice = purchase.tickets * this.state.vacation.price;

        this.setState({ purchase });

    }

    private isFormLegal() {
        if (this.state.purchase.totalPrice <= 0) {
            return false;
        }

        return true;
    }


    private send = async () => {
        const dateNow = new Date();
        let purchase = { ...this.state.purchase };
        purchase.date = dateNow;

        try {
            const response = await axiosPrivate.post<PurchaseModel>("/api/purchases",
                purchase);
            purchase = response.data;
            this.socket.emit("user-added-a-purchase-from-client", purchase);

            this.props.history.push("/");

        }
        catch (err) {
            errorHandling(err, this.props);
        }

    }

    //disconnect from the store
    public componentWillUnmount(): void {
        this.unsubscribeStore?.();
        this.socket?.disconnect();
    }

    public render() {
        return (
            <div className="purchaseVacation">
                <NavBar />
                <div className="card-container">
                    <Card className="card-purchase">
                        <Card.Header >
                            <div className="header">
                                <img className="img" alt="vacation" src={`${Config.serverUrl}/assets/images/vacations/${this.state.vacation.img}`} />
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