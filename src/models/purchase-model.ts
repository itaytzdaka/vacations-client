import { VacationModel } from './vacation-model';
export class PurchaseModel {

    public constructor( // Compiler Magic
        public purchaseId?: string,
        public userName?: string,
        public vacationId?: number,
        public vacation?: VacationModel,
        public priceForTicket?: number,
        public tickets?: number,
        public totalPrice?: number,
        public date?: Date) {
    }
}

