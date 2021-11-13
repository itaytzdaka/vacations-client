import React, { Component } from "react";
import "./admin.css";
import { VacationModel } from "../../models/vacation-model";
import axios, { AxiosError } from "axios";
import { Unsubscribe } from "redux";
import { store } from "../../redux/store";
import { ActionType } from "../../redux/action-type";
import { NavLink } from "react-router-dom";
import Card from 'react-bootstrap/Card';
import ListGroupItem from 'react-bootstrap/ListGroupItem';
import ListGroup from 'react-bootstrap/ListGroup';
import { X } from 'react-bootstrap-icons';
import { Pencil } from 'react-bootstrap-icons';
import io from "socket.io-client";
import { NavBar } from "../nav-bar/navBar";
import { Config } from "../../config";



interface VacationsState {
    vacations: VacationModel[];
}

export class Admin extends Component<any, VacationsState>{

    private unsubscribeStore: Unsubscribe;
    private socket;

    public constructor(props: any) {
        super(props);

        //get vacations from the store
        this.state = {
            vacations: store.getState().vacations
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
        this.socket = io.connect("http://localhost:3000");

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

        //listen to actions from the server
        this.socket.on("Admin-updated-a-vacation-from-server", vacationUpdated => {
            store.dispatch({ type: ActionType.saveOneVacation, payload: vacationUpdated });
        });
        this.socket.on("added-vacation-from-server", vacationAdded => {
            store.dispatch({ type: ActionType.addOneVacation, payload: vacationAdded });
        });
        this.socket.on("removed-vacation-from-server", vacationRemoved => {
            store.dispatch({ type: ActionType.deleteOneVacation, payload: vacationRemoved });
        });


    }

    //disconnect from the server and the store
    public componentWillUnmount(): void {
        this.unsubscribeStore();
        this.socket.disconnect();
    }

    //function for getting the vacations with ajax and save in the store
    private getDataWithAjax= async ()=>{
        try {
            const response = await
                axios.get<VacationModel[]>(Config.serverUrl+"/api/vacations");
            const vacations = response.data;
            store.dispatch({ type: ActionType.SaveAllVacations, payload: vacations });
        }

        catch (err) {
            if ((err as AxiosError).response?.data === "Your login session has expired") {
                sessionStorage.clear();
                alert((err as AxiosError).response?.data);
                this.props.history.push("/login");
                return;
            }

            else {
                alert(err);
            }

        }
    }

    //delete a vacation from the database and the store, and emit
    private async delete(vacationId) {
        try {
            await axios.delete(`${Config.serverUrl}/api/vacations/${vacationId}`);
            store.dispatch({ type: ActionType.deleteOneVacation, payload: vacationId });
            this.socket.emit("Admin-removed-a-vacation-from-client", vacationId);
        }

        catch (err) {
            if ((err as AxiosError).response?.data === "Your login session has expired") {
                sessionStorage.clear();
                alert((err as AxiosError).response?.data);
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
            <div className="home">
                <NavBar />
                <div className="card-container">
                {this.state.vacations.map(v =>

                    <Card key={v.vacationId}>
                        <Card.Img variant="top" className="img" src={"/assets/images/vacations/"+v.img} />
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