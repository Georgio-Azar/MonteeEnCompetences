import { Sequelize } from 'sequelize-typescript';
import { User } from '../models/User';

export const sequelize = new Sequelize({
    dialect: 'postgres',
    host: 'localhost',
    username: 'root',
    password: 'root',
    database: 'database',
    port: 5432,
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000,
    },
    models : [User]
});