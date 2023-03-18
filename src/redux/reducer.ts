import { AppState } from "./app-state";
import { Action } from "./action";
import { ActionType } from "./action-type";
export function reduce(oldAppState: AppState, action: Action): AppState {

    const newAppState = { ...oldAppState }; // Duplicate the old state into a new state.

    switch (action.type) {


        case ActionType.SaveAllFollows:
            newAppState.follows = action.payload;
            break;

        case ActionType.SaveAllVacations:
            newAppState.vacations = action.payload;
            break;

        case ActionType.saveToken:
            newAppState.token = action.payload;
            break;

        case ActionType.saveAllPurchases:
            newAppState.purchases = action.payload;
            break;

        case ActionType.saveUser:
            newAppState.user = action.payload;
            newAppState.isLoggedIn = action.payload? true : false;
            break;

        case ActionType.saveOneVacation:

            for (let i in newAppState.vacations) {
                if (newAppState.vacations[i].vacationId === action.payload.vacationId) {
                    const follows = newAppState.vacations[i].follows;
                    const isFollow = newAppState.vacations[i].isFollow;
                    newAppState.vacations[i] = action.payload;
                    newAppState.vacations[i].follows = follows;
                    newAppState.vacations[i].isFollow = isFollow;

                }
            }

            break;

        case ActionType.addOneVacation:
            newAppState.vacations.push(action.payload);
            break;

        case ActionType.deleteOneVacation:
            newAppState.vacations = newAppState.vacations.filter(v => v.vacationId !== action.payload );
            break;

        case ActionType.AddFollow:
            newAppState.follows.push(action.payload);
            break;

        case ActionType.RemoveFollow:
            newAppState.follows = newAppState.follows.filter(f =>  f.followId !== action.payload );
            break;

        case ActionType.setFollowsPerVacation:
            //add per vacation number of followers and if the user is following
            let counter = 0;
            newAppState.vacations.forEach((v) => {
                v.isFollow = false;
                newAppState.follows.forEach((f) => {
                    if (f.vacationId === v.vacationId) {
                        counter++;
                        if (f.userName === newAppState.user.userName) {
                            v.isFollow = true;
                        }
                    }
                });
                v.follows = counter;
                counter = 0;
            });
            break;


        case ActionType.sortVacations:
            //sort array by followed vacations first
            const isFollow = newAppState.vacations.filter((v) => v.isFollow === true);
            const isNotFollow = newAppState.vacations.filter((v) => v.isFollow === false);
            newAppState.vacations = isFollow.concat(isNotFollow);

            break;

        case ActionType.addPurchase:
            newAppState.purchases.push(action.payload);
            break;

        default: break;
    }

    return newAppState;
}