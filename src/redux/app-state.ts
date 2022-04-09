import { PurchaseModel } from './../models/purchase-model';
import { VacationModel } from "../models/vacation-model";
import { FollowModel } from "../models/follow-model";
import { UserModel } from "../models/user-model";
import Cookies from 'universal-cookie';

export class AppState {
    
    public vacations: VacationModel[];
    public follows: FollowModel[];
    public purchases: PurchaseModel[];
    public user: UserModel;
    public token: string;
    public isLoggedIn: boolean;

    public constructor() {
        const cookies = new Cookies();

        this.vacations = [];
        this.follows=[];
        this.purchases=[];

        this.user=cookies.get('user');
        this.isLoggedIn= this.user? true :false;

        this.token=null;
    }
}