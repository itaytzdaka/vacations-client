import React, { Component } from "react";
import "./home.css";

//models
import { VacationModel } from "../../models/vacation-model";
import { FollowModel } from "../../models/follow-model";

//server
import axiosPrivate from "../../api/axios";
import io from "socket.io-client";
import { Config } from "../../config";

//store
import { Unsubscribe } from "redux";
import { store } from "../../redux/store";
import { ActionType } from "../../redux/action-type";

//components
import Card from 'react-bootstrap/Card';
import ListGroupItem from 'react-bootstrap/ListGroupItem';
import ListGroup from 'react-bootstrap/ListGroup';
import { StarFill } from 'react-bootstrap-icons';
import NavBar from "../nav-bar/navBar";
import { NavLink } from "react-router-dom";

//services
import { errorHandling, isLoggedIn } from "../../services/auth"


interface VacationsState {
    vacations: VacationModel[];
    follows: FollowModel[];
    isLoggedIn: boolean; //for listener event
}

export class Home extends Component<any, VacationsState>{

    private unsubscribeStore: Unsubscribe;
    private socket;

    public constructor(props: any) {
        super(props);

        //get vacations and follows from the store
        this.state = {
            vacations: store.getState().vacations,
            follows: store.getState().follows,
            isLoggedIn: store.getState().isLoggedIn
        };

    }


    public async componentDidMount() {

        if(!isLoggedIn(this.props)) return;
        
        //create connection to the server
        this.socket = io.connect(Config.serverUrl);

        //if is there any changes in the store get the vacations and the follows from the new store.
        this.unsubscribeStore = store.subscribe(() => {
            const vacations = store.getState().vacations;
            const follows = store.getState().follows;
            const isLoggedIn = store.getState().isLoggedIn;
            this.setState({ vacations, follows, isLoggedIn });
        });

        //if the store is empty, get the data with ajax
        this.getComponentData();

    }

    private getComponentData = async () => {
        
        try {
            if (store.getState().vacations.length === 0) {
                const response = await
                    axiosPrivate.get<VacationModel[]>("/api/vacations");
                const vacations = response.data;
                store.dispatch({ type: ActionType.SaveAllVacations, payload: vacations });
            }

            if (store.getState().follows.length === 0) {
                const response = await
                    axiosPrivate.get<FollowModel[]>("/api/follows");
                const follows = response.data;
                store.dispatch({ type: ActionType.SaveAllFollows, payload: follows });
                store.dispatch({ type: ActionType.setFollowsPerVacation });
                store.dispatch({ type: ActionType.sortVacations });    
            }
        }

        catch (err) {
            console.log("home err")
            console.log(err);
            errorHandling(err, this.props);
        }

    }

    //add a follow for vacation in the database, and emit
    private addFollow = async (vacationId) => {
        const followToAdd = new FollowModel();
        followToAdd.userName = store.getState().user.userName;
        followToAdd.vacationId = vacationId;

        try {
            const response = await axiosPrivate.post<FollowModel>("/api/follows", followToAdd);
            if (response.data) {
                const followAdded = response.data;
                this.socket.emit("user-added-a-follow-from-client", followAdded);
            }
        }

        catch (err) {
            errorHandling(err, this.props);
        }
    }

    //remove a follow for vacation in the database, and emit
    private removeFollow = async (vacationId) => {

        const userName = store.getState().user.userName;

        const followToRemove = this.state.follows.find(f => {
            return f.userName === userName && f.vacationId === vacationId
        });

        try {
            await axiosPrivate.delete(`/api/follows/${followToRemove.followId}`);
            this.socket.emit("user-removed-a-follow-from-client", followToRemove.followId);
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
                                <ListGroupItem><NavLink className="purchase" to={"/purchase/" + v.vacationId} exact> purchase </NavLink></ListGroupItem>
                            </ListGroup>
                        </Card>
                    )}
                </div>

            </div>
        );
    }
}