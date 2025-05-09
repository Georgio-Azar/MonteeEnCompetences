import { Sequelize, DataTypes } from "sequelize";
import { User } from "../types/User";

export default (sequelize: Sequelize) => {
    const user = sequelize.define<any, User>(
        "user",
        {
            id : {
                type: DataTypes.STRING,
                primaryKey: true,
                allowNull: false,
            },
            nom: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            prenom: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            age: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            email: {
                type: DataTypes.STRING,
                allowNull: false,
                unique: true,
            },
            password: {
                type: DataTypes.STRING,
                allowNull: false,
            },
        },
        { timestamps: true }
    );
    return user;
}