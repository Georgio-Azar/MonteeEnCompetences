const configEnv = {
    "development": {
        "username": "root",
        "password": "root",
        "database": "database",
        "host": "localhost",
        "dialect": "postgres",
        "pool": {
            "max": 5,
            "min": 0,
            "acquire": 30000,
            "idle": 10000
        }
    },
}

export default configEnv;