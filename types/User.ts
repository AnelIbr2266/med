export interface IUser {
    userId: string;
    name: string;
    sub: string;
    role: string;
    secure: string;
    group: string;
}

export interface IAppUser {
    id: string;
    userId: string;
    name: string;
    sub: string;
    role: string;
    secure: string;
    group: string;
}

export interface IUserGroup {
    id: number;
    userId: string;
    userName: string;
    position_id: string;
    position_name: string;
    position_parent_id: string;
    additionalData: string;
    displayedPosition: string;
    email: string;
    firstname: string;
    lastname: string;
    middlename: string;
    mobilePhone: string;
    parentAdditionalData: string;
}
