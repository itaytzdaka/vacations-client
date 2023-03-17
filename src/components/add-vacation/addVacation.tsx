import React, { Component, ChangeEvent } from "react";
import "./addVacation.css";

//server
import {axiosPrivate} from "../../api/axios";
import axios from "../../api/axios";
import io from "socket.io-client";
import { Config } from "../../config";

//models
import { VacationModel } from "../../models/vacation-model";

//store
import { store } from "../../redux/store";

//validation
import {
    validateDescription,
    validateDestination,
    validateImgUrl,
    validateStartingDate,
    validateEndingDate,
    validatePrice
} from "../../services/vacation-validation";

//components
import NavBar from "../nav-bar/navBar";
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';

//services
import { StringToJson } from "../../services/date";
import { errorHandling, isLoggedIn, isAdmin, } from "../../services/auth"


interface VacationState {
    vacation: VacationModel;
    isLoggedIn: boolean;
    file: File;
    errors: {
        descriptionError: string,
        destinationError: string,
        imgError: string,
        startingDateError: string,
        endingDateError: string,
        priceError: string
    };

}

export class AddVacation extends Component<any, VacationState>{

    private socket;

    public constructor(props: any) {
        super(props);

        this.state = {
            vacation: new VacationModel(),
            isLoggedIn: store.getState().isLoggedIn,
            file: null,
            errors: { descriptionError: "*", destinationError: "*", imgError: "*", startingDateError: "*", endingDateError: "*", priceError: "*" }

        };
    }


    public async componentDidMount() {
        if(!isLoggedIn(this.props)) return;
        if(!isAdmin(this.props)) return;

        //create connection to the server
        this.socket = io.connect(Config.serverUrl);
    }


    //get the data from inputs to the state
    private setDescription = (args: ChangeEvent<HTMLInputElement>) => {
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

    private setDestination = (args: ChangeEvent<HTMLInputElement>) => {
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
        console.log("File: ");
        console.log(file);
        if (file) {
            this.setImgUrl(file.name);
            this.setState({ file });
        }
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

    private setStartingDate = (args: ChangeEvent<HTMLInputElement>) => {
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

    private setEndingDate = (args: ChangeEvent<HTMLInputElement>) => {
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

    //check if the form is legal
    private isFormLegal() {
        for (const prop in this.state.errors) {
            if (this.state.errors[prop].toString() !== "") {
                return false;
            }
        }
        return true;
    }



    //add a new vacation, to database and store, emit, and redirect to /login
    private add = async () => {

        const vacation = { ...this.state.vacation };

        console.log("this.state.file");
        console.log(this.state.file);

        const formData = new FormData();
        formData.append(

            "file",
            this.state.file
        );

        // formData.append('image', this.state.file, this.state.file.name);

        try {

            //upload vacation image
            await axiosPrivate.post<File>("/upload-image", formData, {
                headers: {
                  "Content-Type": "multipart/form-data",
                },
              });

            //add vacation
            const response = await axiosPrivate.post<VacationModel>("/api/vacations",
                vacation);
            const addedVacation = response.data;

            addedVacation.follows = 0;
            addedVacation.startingDate = StringToJson(addedVacation.startingDate);
            addedVacation.endingDate = StringToJson(addedVacation.endingDate);

            this.socket.emit("Admin-added-a-vacation-from-client", addedVacation);
            this.props.history.push("/admin");

        }
        catch (err) {
            errorHandling(err, this.props);
        }
    }

    //disconnect from the server
    public componentWillUnmount(): void {
        this.socket?.disconnect();
    }

    public render() {

        return (
            <div className="EditVacation">
                <NavBar />
                <div className="edit-container">
                    <h1>Add Vacation</h1>
                    <br />
                    <Form.Group controlId="formTextDestination">
                        <Form.Label>Destination</Form.Label>
                        <Form.Control type="text" placeholder="Enter destination" value={this.state.vacation.destination || ""} onChange={this.setDestination} />
                        <Form.Text className="text-muted">
                            {this.state.errors.destinationError === "*" ? "" : this.state.errors.destinationError}
                        </Form.Text>
                    </Form.Group>

                    <Form.Group controlId="formTextDescription">
                        <Form.Label>Description</Form.Label>
                        <Form.Control type="text" placeholder="Enter description" value={this.state.vacation.description || ""} onChange={this.setDescription} />
                        <Form.Text className="text-muted">
                            {this.state.errors.descriptionError === "*" ? "" : this.state.errors.descriptionError}
                        </Form.Text>
                    </Form.Group>

                    <Form.Group controlId="formFileImage">
                        <Form.Label>Upload image</Form.Label>
                        <Form.Control type="file" name="file" onChange={this.onFileChange} />
                    </Form.Group>

                    <Form.Group controlId="formStartDate">
                        <Form.Label>Start Date</Form.Label>
                        <Form.Control type="date" value={this.state.vacation.startingDate || ""} onChange={this.setStartingDate} />
                        <Form.Text className="text-muted">
                            {this.state.errors.startingDateError === "*" ? "" : this.state.errors.startingDateError}
                        </Form.Text>
                    </Form.Group>

                    <Form.Group controlId="formEndingDate">
                        <Form.Label>Ending Date</Form.Label>
                        <Form.Control type="date" value={this.state.vacation.endingDate || ""} onChange={this.setEndingDate} />
                        <Form.Text className="text-muted">
                            {this.state.errors.endingDateError === "*" ? "" : this.state.errors.endingDateError}
                        </Form.Text>
                    </Form.Group>

                    <Form.Group controlId="formTextPrice">
                        <Form.Label>Price</Form.Label>
                        <Form.Control type="text" placeholder="Enter description" value={this.state.vacation.price || ""} onChange={this.setPrice} />
                        <Form.Text className="text-muted">
                            {this.state.errors.priceError === "*" ? "" : this.state.errors.priceError}
                        </Form.Text>
                    </Form.Group>

                    <Button variant="primary" type="submit" disabled={!this.isFormLegal()} onClick={this.add}>
                        Submit
                    </Button >

                </div>
            </div>
        );
    }
}