import { createRequire } from "module";
const require = createRequire(import.meta.url);
const oracledb = require('oracledb');
oracledb.initOracleClient({ libDir: process.env.ORACLE_CLIENT_PATH });


const dbConfig = {
      user: "PSSNBL",
      password: "PSSNBL_SEP2024",
      connectString: "203.95.216.155:1555/avt05p",
};


export async function getConnection(res) {
      let connection;
      try {
            connection = await oracledb.getConnection({
                  user: dbConfig.user,
                  password: dbConfig.password,
                  connectString: dbConfig.connectString
            });
            return connection
      } catch (err) {
            return res.json({ statusCode: 1, message: "Database Connection Failed" })
      }
}
