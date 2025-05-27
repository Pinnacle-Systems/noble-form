import bcrypt from "bcrypt"
import { getConnection } from "../constants/db.connection.js";

import oracledb from 'oracledb';

export async function create(req, res) {
    let connection;
    try {
        connection = await getConnection();

        const {
            employeeId,
            fullName,
            dob,
            gender,
            aadhaar,
            city,
            streetAddress,
            country,
            email,
            phone,
            marriedStatus,
            pan,
            postalCode,
            state,
            fatherName
        } = req.body;

        if (!phone || !employeeId) {
            return res.json({ statusCode: 1, message: 'Phone and Employee ID are required' });
        }

        const checkSql = `
            SELECT COUNT(*) as count 
            FROM HREMPLINK 
            WHERE PHNO = :phone AND DOCID = :employeeId
        `;
        const checkParams = { phone, employeeId };

        console.log('Check SQL:', checkSql);
        console.log('Check Params:', checkParams);

        const checkResult = await connection.execute(checkSql, checkParams);
        const exists = checkResult.rows[0][0] > 0;

        if (exists) {
            const updateSql = `
                UPDATE HREMPLINK
                SET FNAME = :fullName,
                    DOB = TO_DATE(:dob, 'YYYY-MM-DD'),
                    GENDER = :gender,
                    ADHARNO = :aadhaar,
                    CITY = :city,
                    FATHERNAME = :fatherName,
                    COUNTRY = :country,
                    MSTATUS = :marriedStatus,
                    STATE = :state,
                    EMAIL = :email,
                    PANNO = :pan,
                    CADD =  : streetAddress,
                    PINCODE = :postalCode,
                    ACTIVE= : true
                WHERE PHNO = :phone AND DOCID = :employeeId
            `;

            const updateParams = {
                fullName,
                dob,
                gender,
                aadhaar,
                city,
                fatherName,
                country,
                marriedStatus,
                state,
                email,
                pan,
                postalCode,
                streetAddress,
                phone,
                employeeId
            };

            console.log('Update SQL:', updateSql);
            console.log('Update Params:', updateParams);

            await connection.execute(updateSql, updateParams, { autoCommit: true });

            return res.json({ statusCode: 0, message: 'Employee record updated successfully' });
        } else {
            return res.json({ statusCode: 1, message: 'Employee not found with given phone and employeeId' });
        }
    } catch (error) {
        console.error('Error:', error);
        return res.json({ statusCode: 1, message: 'An error occurred while processing the request' });
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (err) {
                console.error('Error closing connection:', err);
            }
        }
    }
}

export async function get(req, res) {
  console.log("its working");
  const connection = await getConnection(res);

  try {
    const sql = `SELECT * FROM hremplink`;
    console.log(sql, "sql");

    const result = await connection.execute(sql);

    const columns = result.metaData.map(col => col.name);

    const resp = result.rows.map(row => {
      const obj = {};
      row.forEach((value, index) => {
        obj[columns[index]] = value;
      });
      return obj;
    });

    return res.json({ statusCode: 0, data: resp });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Internal Server Error' });
  } finally {
    await connection.close();
  }
}


