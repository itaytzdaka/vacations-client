import React, { Component } from "react";
import "./admin.css";

//models
import { VacationModel } from "../../models/vacation-model";

//server
import axiosPrivate from "../../api/axios";
import io from "socket.io-client";
import { Config } from "../../config";

//store
import { Unsubscribe } from "redux";
import { store } from "../../redux/store";
import { ActionType } from "../../redux/action-type";

//components
import { NavLink } from "react-router-dom";
import Card from 'react-bootstrap/Card';
import ListGroupItem from 'react-bootstrap/ListGroupItem';
import ListGroup from 'react-bootstrap/ListGroup';
import { X } from 'react-bootstrap-icons';
import { Pencil } from 'react-bootstrap-icons';
import NavBar from "../nav-bar/navBar";

//services
import { errorHandling, isLoggedIn, isAdmin } from "../../services/auth"



interface VacationsState {
    vacations: VacationModel[];
    isLoggedIn: boolean;
}

export class Admin extends Component<any, VacationsState>{

    private unsubscribeStore: Unsubscribe;
    private socket;

    public constructor(props: any) {
        super(props);

        //get vacations from the store
        this.state = {
            vacations: store.getState().vacations,
            isLoggedIn: store.getState().isLoggedIn
        };
    }


    public async componentDidMount() {

        if(!isLoggedIn(this.props)) return;
        if(!isAdmin(this.props)) return;

        //create connection to the server
        this.socket = io.connect(Config.serverUrl);

        //if is there any changes in the store get the vacations from the new store.
        this.unsubscribeStore = store.subscribe(() => {
            const vacations = store.getState().vacations;
            this.setState({ vacations });
        });


        // if the store is not empty, cancel the function and don't use axios
        if (this.state.vacations.length > 0) {
            return;
        }

        //if the store is empty, get the data with ajax
        this.getDataWithAjax();

    }

    //function for getting the vacations with ajax and save in the store
    private getDataWithAjax = async () => {
        try {
            const response = await
                axiosPrivate.get<VacationModel[]>("/api/vacations");
            const vacations = response.data;
            store.dispatch({ type: ActionType.SaveAllVacations, payload: vacations });
        }

        catch (err) {
            errorHandling(err, this.props);
        }
    }


    //delete a vacation from the database and the store, and emit
    private async delete(vacationId) {
        try {
            await axiosPrivate.delete(`/api/vacations/${vacationId}`);
            this.socket.emit("Admin-removed-a-vacation-from-client", vacationId);
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
            <div className="home">
                <NavBar />
                <div className="card-container">
                    {this.state.vacations.map(v =>

                        <Card key={v.vacationId}>
                            <Card.Img variant="top" className="img" src={Config.serverUrl + "/assets/images/vacations/" + v.img} />
                            <Card.Body>
                                <X className="delete" color="black" size={"1.5rem"} onClick={() => this.delete(v.vacationId)} />
                                <NavLink to={"/admin/" + v.vacationId}>
                                    <Pencil color="black" size={"1.5rem"} />
                                </NavLink>
                                <Card.Title>{v.destination}</Card.Title>
                                <Card.Text>
                                    {v.description}
                                </Card.Text>

                            </Card.Body>
                            <ListGroup className="list-group-flush">
                                <ListGroupItem>Start: {new Date(v.startingDate).toDateString()}</ListGroupItem>
                                <ListGroupItem>end: {new Date(v.endingDate).toDateString()}</ListGroupItem>
                                <ListGroupItem>Cost: {v.price}$</ListGroupItem>
                            </ListGroup>
                        </Card>
                    )}
                </div>
                <br />

            </div>
        );
    }
}