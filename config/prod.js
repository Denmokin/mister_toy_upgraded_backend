import 'dotenv/config'

const dbPassword = process.env.DATABASE_PASSWORD

export default {
    dbURL: `mongodb+srv://denmokin_db_user:${dbPassword}@denistest.3ri5mye.mongodb.net/`,
    dbName: 'toy_store',
}
