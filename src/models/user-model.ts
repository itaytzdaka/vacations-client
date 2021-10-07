
export class UserModel {

    public constructor( // Compiler Magic
        public firstName?: string,
        public lastName?: string,
        public userName?: string,
        public password?: string,
        public isAdmin?: boolean,
        ) {
    }
}
