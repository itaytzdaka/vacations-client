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

        case ActionType.saveOneVacation:

            for (let i in newAppState.vacations) {
                if (newAppState.vacations[i].vacationId === action.payload.vacationId) {
                    const follows=newAppState.vacations[i].follows;
                    const isFollow=newAppState.vacations[i].isFollow;
                    newAppState.vacations[i] = action.payload;
                    newAppState.vacations[i].follows=follows;
                    newAppState.vacations[i].isFollow=isFollow;
                    
                }

            }

            break;

        case ActionType.addOneVacation:
            newAppState.vacations.push(action.payload);
            break;

        case ActionType.deleteOneVacation:
            // for(let i in newAppState.vacations){
            newAppState.vacations = newAppState.vacations.filter(v => { return v.vacationId !== action.payload });
            break;

        case ActionType.AddFollow:
            newAppState.follows.push(action.payload);
            break;

        case ActionType.RemoveFollow:
            // for(let i in newAppState.vacations){
            newAppState.follows = newAppState.follows.filter(f => { return f.followId !== action.payload });
            break;

        case ActionType.PrepareVacationsForUser:
            //add per vacation number of followers and if the user is following
            let counter = 0;
            newAppState.vacations.forEach((v) => {
                v.isFollow = false;
                newAppState.follows.forEach((f) => {
                    if (f.vacationId === v.vacationId) {
                        counter++;
                        if (f.userName === JSON.parse(sessionStorage.getItem("user")).userName) {
                            v.isFollow = true;
                        }
                    }
                });
                v.follows = counter;
                counter = 0;
            });

            //sort array by followed vacations first
            const isFollow = newAppState.vacations.filter((v) => v.isFollow === true);
            const isNotFollow = newAppState.vacations.filter((v) => v.isFollow === false);
            newAppState.vacations = isFollow.concat(isNotFollow);

            break;

        default: break;
    }

    return newAppState;
}