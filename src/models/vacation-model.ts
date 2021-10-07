export class VacationModel {

    public constructor( // Compiler Magic
        public description?: string,
        public destination?: string,
        public img?: string,
        public startingDate?: string,
        public endingDate?: string,
        public price?: number,
        public vacationId?: number,
        public follows?: number,
        public isFollow?: boolean) {
    }
}

