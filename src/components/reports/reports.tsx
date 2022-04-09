import React, { Component } from "react";
import "./reports.css";

//models
import { VacationModel } from "../../models/vacation-model";
import { FollowModel } from "../../models/follow-model";

//store
import { Unsubscribe } from "redux";
import { store } from "../../redux/store";
import { ActionType } from "../../redux/action-type";

//components
import { Bar } from 'react-chartjs-2';
import NavBar from "../nav-bar/navBar";

//server
import io from "socket.io-client";
import axiosPrivate from "../../api/axios";
import { Config } from "../../config";

//services
import { getRandomColor } from "../../services/color";
import { errorHandling, isLoggedIn, isAdmin } from "../../services/auth"



interface reportsState {
    isLoggedIn: boolean;
    vacationsDestinations: Array<string>;
    vacationsFollows: Array<number>;
    colors: Array<string>;
}

export class Reports extends Component<any, reportsState>{

    private socket;
    private unsubscribeStore: Unsubscribe;

    public constructor(props: any) {
        super(props);
        this.state = {
            isLoggedIn: store.getState().isLoggedIn,
            vacationsDestinations: [],
            vacationsFollows: [],
            colors: []
        }
    }


    public async componentDidMount() {

        if(!isLoggedIn(this.props)) return;
        if(!isAdmin(this.props)) return;

        //create connection to the server
        this.socket = io.connect(Config.serverUrl);

        //if is there any changes in the store get the vacations and the follows from the new store.
        this.unsubscribeStore = store.subscribe(() => {

            const isLoggedIn = store.getState().isLoggedIn;            
            this.setState({ isLoggedIn });

            if(store.getState().vacations.length>0 && store.getState().follows.length>0){
                this.updateGraphState();
            }
        });

        this.getComponentData();

    }

    private async getComponentData() {

        let vacations = store.getState().vacations;
        let follows = store.getState().follows;

        // if the store is empty get the data with ajax
        try {
            if (vacations.length === 0) {
                const response = await
                    axiosPrivate.get<VacationModel[]>("/api/vacations");
                vacations = response.data;
                store.dispatch({ type: ActionType.SaveAllVacations, payload: vacations });
            }
            if (follows.length === 0) {
                const response = await
                    axiosPrivate.get<FollowModel[]>("/api/follows");
                follows = response.data;
                store.dispatch({ type: ActionType.SaveAllFollows, payload: follows });
            }

            store.dispatch({ type: ActionType.setFollowsPerVacation });
        }
        catch (err) {
            errorHandling(err, this.props);
            return;
        }


        this.updateGraphState();

    }

    private updateGraphState = () => {
        const vacationsDestinations = [];
        const vacationsFollows = [];
        const colors = [];


        store.getState().vacations.forEach(v => {
            if (v.follows > 0) {
                vacationsDestinations.push(v.destination);
                vacationsFollows.push(v.follows);
                colors.push(getRandomColor());
            }
        });

        this.setState({ vacationsDestinations, vacationsFollows, colors });
    }


    //disconnect from the server and the store
    public componentWillUnmount(): void {
        this.unsubscribeStore?.();
        this.socket?.disconnect();
    } 


    public render() {
        return (

            <div className="reports">
                <NavBar />
                <br></br>
                <Bar
                    data={
                        {
                            labels: this.state.vacationsDestinations,
                            datasets: [
                                {
                                    label: 'Follows',
                                    data: this.state.vacationsFollows,
                                    backgroundColor: this.state.colors
                                }
                            ]
                        }
                    }
                    options={{
                        scales: {
                            yAxes: [{
                                ticks: {
                                    beginAtZero: true,
                                    userCallback: function (label, index, labels) {
                                        // when the floored value is the same as the value we have a whole number
                                        if (Math.floor(label) === label) {
                                            return label;
                                        }

                                    },
                                }
                            }]
                        }
                    }}
                />


            </div>
        )
    }

}