import React, { Component, ChangeEvent } from "react";
import "./editVacation.css";

//models
import { VacationModel } from "../../models/vacation-model";

//store
import { Unsubscribe } from "redux";
import { store } from "../../redux/store";

//services
import { JsonToString } from "../../services/date";
import { StringToJson } from "../../services/date";
import { errorHandling, isLoggedIn, isAdmin } from "../../services/auth"

//validations
import { validateDescription, validateDestination, validateImgUrl, validateStartingDate, validateEndingDate, validatePrice } from "../../services/vacation-validation";

//components
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import NavBar from "../nav-bar/navBar";

//server
import io from "socket.io-client";
import { Config } from "../../config";
import axiosPrivate from "../../api/axios";



interface VacationState {
    vacations: VacationModel[];
    vacation: VacationModel;
    isLoggedIn: boolean; //for listener event
    file: any;
    errors: {
        descriptionError: string,
        destinationError: string,
        imgError: string,
        startingDateError: string,
        endingDateError: string,
        priceError: string
    };
}

export class EditVacation extends Component<any, VacationState>{

    private unsubscribeStore: Unsubscribe;
    private socket;

    public constructor(props: any) {
        super(props);

        //get vacations and login status from the store
        this.state = {
            vacations: store.getState().vacations,
            vacation: {},
            isLoggedIn: store.getState().isLoggedIn,
            file: null,
            errors: { descriptionError: "", destinationError: "", imgError: "", startingDateError: "", endingDateError: "", priceError: "" }
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
            const isLoggedIn = store.getState().isLoggedIn;
            this.setState({ vacations, isLoggedIn });
        });

        let vacation;

        //if the store is not empty, find the vacation for edit and don't use axios at all
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
    }


    //get the data from inputs to the state
    public setDescription = (args: ChangeEvent<HTMLInputElement>) => {
        const description = args.target.value;
        let nameError;

        nameError = validateDescription(description);

        const errors = { ...this.state.errors };
        errors.descriptionError = nameError;
        this.setState({ errors });

        const vacation = { ...this.state.vacation };
        vacation.description = description;
        this.setState({ vacation });
    }

    public setDestination = (args: ChangeEvent<HTMLInputElement>) => {
        const destination = args.target.value;
        let nameError;

        nameError = validateDestination(destination);

        const errors = { ...this.state.errors };
        errors.destinationError = nameError;
        this.setState({ errors });

        const vacation = { ...this.state.vacation };
        vacation.destination = destination;
        this.setState({ vacation });
    }

    private onFileChange = (args: ChangeEvent<HTMLInputElement>) => {
        const file = args.target.files[0];
        this.setImgUrl(file.name);
        this.setState({ file });
    }

    private setImgUrl = (fileName: string) => {
        const img = fileName;
        let nameError;

        nameError = validateImgUrl(img);

        const errors = { ...this.state.errors };
        errors.imgError = nameError;
        this.setState({ errors });

        const vacation = { ...this.state.vacation };
        vacation.img = img;
        this.setState({ vacation });
    }

    public setStartingDate = (args: ChangeEvent<HTMLInputElement>) => {
        const startingDate = args.target.value;
        let nameError;

        nameError = validateStartingDate(startingDate);

        const errors = { ...this.state.errors };
        errors.startingDateError = nameError;
        this.setState({ errors });

        const vacation = { ...this.state.vacation };
        vacation.startingDate = startingDate;
        this.setState({ vacation });
    }

    public setEndingDate = (args: ChangeEvent<HTMLInputElement>) => {
        const endingDate = args.target.value;
        let nameError;

        nameError = validateEndingDate(endingDate);

        const errors = { ...this.state.errors };
        errors.endingDateError = nameError;
        this.setState({ errors });

        const vacation = { ...this.state.vacation };
        vacation.endingDate = endingDate;
        this.setState({ vacation });
    }

    private setPrice = (args: ChangeEvent<HTMLInputElement>) => {
        const price = +args.target.value;
        let nameError;

        nameError = validatePrice(price);

        const errors = { ...this.state.errors };
        errors.priceError = nameError;
        this.setState({ errors });

        const vacation = { ...this.state.vacation };
        vacation.price = price;
        this.setState({ vacation });
    }

    private isFormLegal() {
        for (const prop in this.state.errors) {
            if (this.state.errors[prop].toString() !== "") {
                return false;
            }
        }
        return true;
    }


    public update = async () => {
        try {
            
            if (this.state.file){
                const formData = new FormData();
                formData.append(
                    "file",
                    this.state.file
                );
                await axiosPrivate.post("/upload-image", formData);
            }

            const vacationToUpdate = { ...this.state.vacation }
            await axiosPrivate.put(`/api/vacations/${+this.props.match.params.id}`,
                vacationToUpdate);

            vacationToUpdate.startingDate = StringToJson(vacationToUpdate.startingDate);
            vacationToUpdate.endingDate = StringToJson(vacationToUpdate.endingDate);
            this.socket.emit("Admin-updated-a-vacation-from-client", vacationToUpdate);
            this.props.history.push("/admin");
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
            <div className="EditVacation">
                <NavBar />
                <div className="form-container">
                    <h1>Edit Vacation</h1>
                    <br />
                    <Form.Group controlId="formTextDestination">
                        <Form.Label>Destination</Form.Label>
                        <Form.Control type="text" placeholder="Enter description" value={this.state.vacation.destination || ""} onChange={this.setDestination} />
                        <Form.Text className="text-muted">
                            {this.state.errors.destinationError}
                        </Form.Text>
                    </Form.Group>

                    <Form.Group controlId="formTextDescription">
                        <Form.Label>Description</Form.Label>
                        <Form.Control type="text" placeholder="Enter description" value={this.state.vacation.description || ""} onChange={this.setDescription} />
                        <Form.Text className="text-muted" >
                            {this.state.errors.descriptionError}
                        </Form.Text>
                    </Form.Group>

                    <Form.Group controlId="formFileImage">
                        <Form.Label>Upload image</Form.Label>
                        <Form.Control type="file" name="file" onChange={this.onFileChange} />
                    </Form.Group>

                    <Form.Group controlId="formStartDate">
                        <Form.Label>Start Date</Form.Label>
                        <Form.Control type="date" placeholder="Enter description" value={this.state.vacation.startingDate || ""} onChange={this.setStartingDate} />
                        <Form.Text className="text-muted">
                            {this.state.errors.startingDateError}
                        </Form.Text>
                    </Form.Group>

                    <Form.Group controlId="formEndingDate">
                        <Form.Label>Ending Date</Form.Label>
                        <Form.Control type="date" placeholder="Enter description" value={this.state.vacation.endingDate || ""} onChange={this.setEndingDate} />
                        <Form.Text className="text-muted">
                            {this.state.errors.endingDateError}
                        </Form.Text>
                    </Form.Group>

                    <Form.Group controlId="formTextPrice">
                        <Form.Label>Price</Form.Label>
                        <Form.Control type="text" placeholder="Enter description" value={this.state.vacation.price || ""} onChange={this.setPrice} />
                        <Form.Text className="text-muted">
                            {this.state.errors.priceError}
                        </Form.Text>
                    </Form.Group>

                    <Button variant="primary" type="submit" disabled={!this.isFormLegal()} onClick={this.update}>
                        Submit
                    </Button >
                </div>

            </div>
        );
    }
}