import bcrypt from "bcrypt"
import { getConnection } from "../constants/db.connection.js";



export async function login(req, res) {
    const connection = await getConnection(res)
    const { username, password } = req.body
    if (!username) return res.json({ statusCode: 1, message: "Username is Required" })
    if (!password) return res.json({ statusCode: 1, message: "Password is Required" });

    const result = await connection.execute(`SELECT * FROM SPUSERLOG where username=:username`, { username })
    if (result.rows.length === 0) return res.json({ statusCode: 1, message: "Username Doesn't Exist" })
    let storedPassword = result.rows[0][1]
    const isMatched = await bcrypt.compare(password, storedPassword)
    if (!isMatched) return res.json({ statusCode: 1, message: "Password Doesn't Match" })
    // let gtCompMastId = result.rows[0][2]
    // let supplyDetails = await connection.execute(`
    // select pcategory 
    // from gtcompprodet 
    // join gtpartycatmast on gtcompprodet.partycat = gtpartycatmast.gtpartycatmastid
    // where gtcompmastid=:gtCompMastId
    // `, { gtCompMastId })
    // supplyDetails = supplyDetails.rows.map(item => item[0])

    await connection.close()
    return res.json({ statusCode: 0, message: "Login Sucessfull", message: "Login successfull" })

}

export async function create(req, res) {
    const connection = await getConnection();
    const { username, password, checkboxes } = req.body;
    const roles = checkboxes.map((item) => item.label)
    const createdDate = new Date();

    if (!username || !password) {
        return res.json({ statusCode: 1, message: 'Username and Password are Required' });
    }

    try {
        // Check if the username already exists
        const userNameResult = await connection.execute(
            'SELECT COUNT(*) as count FROM SPUSERLOG WHERE username = :username',
            { username }
        );

        if (userNameResult.rows[0][0] > 0) {
            await connection.close();
            return res.json({ statusCode: 1, message: 'UserName Already Exsist' });
        }

        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const sql = 'INSERT INTO SPUSERLOG(username, password) VALUES (:username, :hashedPassword)';
        await connection.execute(sql, { username, hashedPassword });

        const userRoleSql = 'INSERT INTO USERLOG(userName, role, createdDate) VALUES (:username, :role, :createdDate)';
        for (const role of roles) {
            await connection.execute(userRoleSql, { username, role, createdDate });
        }

        await connection.commit();
        await connection.close();

        return res.json({ statusCode: 0, message: 'User created successfully' });
    } catch (error) {
        console.error(error);
        await connection.close();
        return res.json({ statusCode: 1, message: 'An error occurred while creating the user' });
    }
}


export async function get(req, res) {

    const connection = await getConnection(res)
    try {
        const sql = `  
  select T.userName, userlog.ROLE
from spuserlog T
left join userlog on T.USERNAME = userlog.USERNAME
order by userName`
console.log(sql,"sql")
        const result = await connection.execute(sql)
        const resp = result.rows.map(user => ({ userName: user[0], role: user[1] }))
        return res.json({ statusCode: 0, data: resp })
    }
    catch (err) {
        console.log(err)
        res.status(500).json({ error: 'Internal Server Error' });
    }
    finally {
        await connection.close()
    }
}

export async function getOne(req, res) {
    const connection = await getConnection(res)
    try {
        const { gtCompMastId } = req.query;
        console.log(gtCompMastId, 'id');

        const result = await connection.execute(`
    select userName from spuserlog where gtcompmastid = :gtcompmastid
    `, { gtCompMastId })
        const resp = result.rows.map(user => ({ userName: user[0] }))
        console.log(resp, ' resp');
        return res.json({ statusCode: 0, data: resp })

    }
    catch (err) {
        console.log(err)
        res.status(500).json({ error: 'Internal Server Error' });
    }
    finally {
        await connection.close()
    }
}


// export async function getUserDet(req, res) {
//   const connection = await getConnection(res);

//   try {
//     const { gtCompMastId } = req.query;
//     const result = await connection.execute(`
//       SELECT spuserlog.userName, spuserlog.gtCompMastId, gtCompMast.compname, pcategory 
//       FROM spuserlog
//       JOIN gtCompMast ON gtCompMast.gtCompMastId = spuserlog.gtCompMastId
//       JOIN (
//         SELECT pcategory, gtcompprodet.gtCompMastId 
//         FROM gtcompprodet 
//         JOIN gtpartycatmast ON gtcompprodet.partycat = gtpartycatmast.gtpartycatmastid
//       ) partyCat ON gtCompMast.gtCompMastId = partyCat.gtCompMastId
//       WHERE gtCompMast.gtCompMastId = :gtCompMastId
//     `, { gtCompMastId });
//     const resp = result.rows.map(user => ({
//       userName: user[0], gtCompMastId: user[1], compName: user[2], pCategory: user[3]
//     }));

//     return res.json({ statusCode: 0, data: resp });
//   } catch (err) {
//     console.error('Error retrieving data:', err);
//     res.status(500).json({ error: 'Internal Server Error' });
//   } finally {
//     await connection.close();
//   }
// }

export async function remove(req, res) {
    const connection = await getConnection.apply(res);
    try {
    }
    catch (err) {
    }
}











