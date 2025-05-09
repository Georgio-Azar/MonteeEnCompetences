import { Sequelize, Options } from "sequelize";

import configEnv from "../config";
import user from "../models/User";

const config = configEnv["development"];
const sequelize = new Sequelize(
    config.database,
    config.username,
    config.password,
    config as Options
)

const db = {
    sequelize : sequelize,
    result : user(sequelize)
};

export default db;