import { VacationModel } from "../models/vacation-model";
import { FollowModel } from "../models/follow-model";
import { UserModel } from "../models/user-model";

export class AppState {
    
    public vacations: VacationModel[];
    public follows: FollowModel[];
    public user: UserModel;

    public constructor() {
        this.vacations = [];
        this.follows=[];
        this.user=new UserModel();
    }
}