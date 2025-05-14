import { Sequelize } from 'sequelize-typescript';
import { User } from '../models/User';

import dotenv from 'dotenv';
dotenv.config();

console.log('DATABASE_URL:', process.env.DATABASE_URL);

export const sequelize = new Sequelize({
    dialect: 'postgres',
    host: 'database',
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
    //dialect: 'postgres',
    //models: [User],
});