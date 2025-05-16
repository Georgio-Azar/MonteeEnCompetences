class UserDTO {
    id: string;
    nom: string;
    prenom: string;
    age: number;
    email: string;

    constructor(id: string, nom: string, prenom: string, age: number, email: string) {
        this.id = id;
        this.nom = nom;
        this.prenom = prenom;
        this.age = age;
        this.email = email;
    }
}

export default UserDTO;