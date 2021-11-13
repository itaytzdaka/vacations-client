import React, { Component } from "react";
import "./reports.css";
import { VacationModel } from "../../models/vacation-model";
import { Unsubscribe } from "redux";
import { store } from "../../redux/store";
import { Bar } from 'react-chartjs-2';
import { FollowModel } from "../../models/follow-model";
import io from "socket.io-client";
import axios, { AxiosError } from "axios";
import { ActionType } from "../../redux/action-type";
import { getRandomColor } from "../../services/color";
import { NavBar } from "../nav-bar/navBar";
import { Config } from "../../config";

interface reportsState {
    vacations: VacationModel[];
    follows: FollowModel[];
    vacationsDestinations;
    vacationsFollows;
    colors;
}

export class Reports extends Component<any, reportsState>{

    private unsubscribeStore: Unsubscribe;
    private socket;

    public constructor(props: any) {
        super(props);
        this.state = {
            vacations: store.getState().vacations,
            follows: store.getState().follows,
            vacationsDestinations: [],
            vacationsFollows: [],
            colors: []
        }
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

        //if is there any changes in the store get the vacations and the follows from the new store.
        this.unsubscribeStore = store.subscribe(() => {
            const vacations = store.getState().vacations;
            const follows = store.getState().follows;
            this.setState({ vacations, follows });

        });

        // if the store is empty get the data with ajax
        if (this.state.vacations.length === 0 || this.state.follows.length===0) {
            this.getDataWithAjax();
        }

        else {
            const vacationsDestinations = [];
            const vacationsFollows = [];
            const colors = [];

            this.state.vacations.forEach(v => {
                if (v.follows > 0) {
                    vacationsDestinations.push(v.destination);
                    vacationsFollows.push(v.follows);
                    colors.push(getRandomColor());
                }

            });

            this.setState({ vacationsDestinations, vacationsFollows, colors });

        }




        this.socket.on("added-vacation-from-server", vacationAdded => {
            this.getDataWithAjax();
        });
        this.socket.on("removed-vacation-from-server", vacationRemoved => {
            this.getDataWithAjax();
        });
        this.socket.on("follows-updated-from-server", async () => {
            this.getDataWithAjax();
        });

    }

    private async getDataWithAjax() {
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
                alert((err as AxiosError).response?.data);
                this.props.history.push("/login");
                return;
            }

            else {
                alert(err);
            }

        }


        const vacationsDestinations = [];
        const vacationsFollows = [];
        const colors = [];



        this.state.vacations.forEach(v => {
            if (v.follows > 0) {
                vacationsDestinations.push(v.destination);
                vacationsFollows.push(v.follows);
                colors.push(getRandomColor());
            }

        });


        this.setState({ vacationsDestinations, vacationsFollows, colors });



    }

    public componentWillUnmount(): void {
        this.unsubscribeStore();
        this.socket.disconnect();
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