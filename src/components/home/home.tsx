import React, { Component } from "react";
import "./home.css";
import { VacationModel } from "../../models/vacation-model";
import axios, { AxiosError } from "axios";
import { Unsubscribe } from "redux";
import { store } from "../../redux/store";
import { FollowModel } from "../../models/follow-model";
import { ActionType } from "../../redux/action-type";
import Card from 'react-bootstrap/Card';
import ListGroupItem from 'react-bootstrap/ListGroupItem';
import ListGroup from 'react-bootstrap/ListGroup';
import { StarFill } from 'react-bootstrap-icons';
import io from "socket.io-client";
import { NavBar } from "../nav-bar/navBar";
import { Config } from "../../config";
import { NavLink } from "react-router-dom";



interface VacationsState {
    vacations: VacationModel[];
    follows: FollowModel[];
}

export class Home extends Component<any, VacationsState>{

    private unsubscribeStore: Unsubscribe;
    private socket;

    public constructor(props: any) {
        super(props);

        //get vacations and follows from the store
        this.state = {
            vacations: store.getState().vacations,
            follows: store.getState().follows
        };

    }



    public async componentDidMount() {

        //if there is no token, link to the login page
        if (!sessionStorage.getItem("token") || !sessionStorage.getItem("user")) {
            this.props.history.push("/login");
            return;
        }

        //create connection to the server
        this.socket = io.connect("http://localhost:3000");

        //if is there any changes in the store get the vacations and the follows from the new store.
        this.unsubscribeStore = store.subscribe(() => {
            const vacations = store.getState().vacations;
            const follows = store.getState().follows;
            this.setState({ vacations, follows });
        });

        //if the store is empty, get the data with ajax
        if (!(store.getState().follows.length > 0 && store.getState().vacations.length > 0)) {

            try {
                const response = await
                    axios.get<VacationModel[]>(Config.serverUrl+"/api/vacations");
                const vacations = response.data;

                const response2 = await
                    axios.get<FollowModel[]>(Config.serverUrl+"/api/follows");
                const follows = response2.data;

                store.dispatch({ type: ActionType.SaveAllFollows, payload: follows });
                store.dispatch({ type: ActionType.SaveAllVacations, payload: vacations });
                store.dispatch({ type: ActionType.PrepareVacationsForUser });
            }

            catch (err) {
                if ((err as AxiosError).response?.data === "Your login session has expired") {
                    sessionStorage.clear();
                    this.props.history.push("/login");
                    return;
                }

                else {
                    alert(err);
                }
            }
        }

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
        this.socket.on("follows-updated-from-server", async () => {
            const response2 = await
                axios.get<FollowModel[]>(Config.serverUrl+"/api/follows");
            const follows = response2.data;
            store.dispatch({ type: ActionType.SaveAllFollows, payload: follows });
            store.dispatch({ type: ActionType.PrepareVacationsForUser });
        });

    }



    //add a follow for vacation in the database, and emit
    private addFollow = async (vacationId) => {
        const followToAdd = new FollowModel();
        followToAdd.userName = JSON.parse(sessionStorage.getItem("user")).userName;
        followToAdd.vacationId = vacationId;
        try {
            await axios.post<FollowModel>(Config.serverUrl+"/api/follows", followToAdd);
            this.socket.emit("user-changed-a-follow-from-client");
        }

        catch (err) {
            if ((err as AxiosError).response?.data === "Your login session has expired") {
                sessionStorage.clear();
                this.props.history.push("/login");
                return;
            }

            else {
                alert(err);
            }
        }
    }

    //add a follow for vacation in the database, and emit
    private removeFollow = async (vacationId) => {

        const userName = JSON.parse(sessionStorage.getItem("user")).userName;

        const followToRemove = this.state.follows.find(f => {
            return f.userName === userName && f.vacationId === vacationId
        });

        try {
            await axios.delete(`${Config.serverUrl}/api/follows/${followToRemove.followId}`);
            this.socket.emit("user-changed-a-follow-from-client");
        }

        catch (err) {
            if ((err as AxiosError).response?.data === "Your login session has expired") {
                sessionStorage.clear();
                this.props.history.push("/login");
                return;
            }

            else {
                alert(err);
            }
        }
    }

    //disconnect from the server and the store
    /*
    public componentWillUnmount(): void {
        this.unsubscribeStore();
        this.socket.disconnect();
    }*/



    public render() {

        return (
            <div className="home">
                <NavBar />
                <div className="card-container">
                    {this.state.vacations.map(v =>


                        <Card   key={v.vacationId}>
                            <Card.Img variant="top" className="img" src={"/assets/images/vacations/" + v.img} />
                            <Card.Body>
                                {v.isFollow ? <StarFill className="star-fill" color="yellow" size={"1.5rem"} onClick={() => this.removeFollow(v.vacationId)} /> : <StarFill className="star-fill" color="grey" size={"1.5rem"} onClick={() => this.addFollow(v.vacationId)} />}

                                <Card.Title>{v.destination}</Card.Title>
                                <Card.Text>
                                    {v.description}
                                </Card.Text>
                            </Card.Body>
                            <ListGroup className="list-group-flush">
                                <ListGroupItem>Follows: {v.follows}</ListGroupItem>
                                <ListGroupItem>Start: {new Date(v.startingDate).toDateString()}</ListGroupItem>
                                <ListGroupItem>end: {new Date(v.endingDate).toDateString()}</ListGroupItem>
                                <ListGroupItem>Cost: {v.price}$</ListGroupItem>
                                <ListGroupItem><NavLink className="purchase" to={"/purchase/"+v.vacationId} exact> purchase </NavLink></ListGroupItem>
                            </ListGroup>
                        </Card>
                    )}
                </div>

            </div>
        );
    }
}