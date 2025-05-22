class UserDTO {
    id: string;
    nom: string;
    prenom: string;
    age: number;
    email: string;
    credit: number;

    constructor(id: string, nom: string, prenom: string, age: number, email: string, credit: number) {
        this.id = id;
        this.nom = nom;
        this.prenom = prenom;
        this.age = age;
        this.email = email;
        this.credit = credit;
    }
}

export default UserDTO;