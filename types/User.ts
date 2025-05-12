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
}

export {
    userToAdd,
    userToModify
}
