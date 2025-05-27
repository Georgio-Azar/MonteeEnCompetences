type userToAdd = {
    id: string;
    nom: string;
    prenom: string;
    age: number;
    email: string;
    password: string;
}

type userToModify = {
    nom?: string;
    prenom?: string;
    age?: number;
    email?: string;
    password?: string;
    credit?: number;
    creditLastUpdated?: Date;
}

export type {
    userToAdd,
    userToModify
}
