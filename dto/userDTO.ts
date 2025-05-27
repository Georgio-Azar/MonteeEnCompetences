class UserDTO {
    id: string;
    nom: string;
    prenom: string;
    age: number;
    email: string;
    credit: number;
    creditLastUpdated?: Date;

    constructor(id: string, nom: string, prenom: string, age: number, email: string, credit: number, creditLastUpdated?: Date) {
        this.id = id;
        this.nom = nom;
        this.prenom = prenom;
        this.age = age;
        this.email = email;
        this.credit = credit;
        this.creditLastUpdated = creditLastUpdated;
    }
}

export default UserDTO;