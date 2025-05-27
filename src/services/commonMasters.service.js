import { getConnection } from "../constants/db.connection.js";


export async function get(req, res) {
    const connection = await getConnection(res)
    try {
        const result = await connection.execute(`
        select * from (select finyr  from GTFINANCIALYEAR order by finyr desc) finyr     
        where rownum <= 3
     `)
        let resp = result.rows.map(po => ({
            finYear: po[0]
        }))

        return res.json({ statusCode: 0, data: resp })
    }
    catch (err) {
        console.error('Error retrieving data:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
    finally {
        await connection.close()
    }
}

export async function getBuyer(req, res) {
    const connection = await getConnection(res)
    try {
        const result = await connection.execute(`
        SELECT C.COMPCODE,COUNT(*) TOT FROM HREMPLOYMAST A 
JOIN HREMPLOYDETAILS B ON A.HREMPLOYMASTID = B.HREMPLOYMASTID
JOIN GTCOMPMAST C ON C.GTCOMPMASTID = A.COMPCODE
WHERE B.IDACTIVE = 'YES'
GROUP BY C.COMPCODE
     `)
        let resp = result.rows.map(po => ({
            buyerName: po[0]
        }))

        return res.json({ statusCode: 0, data: resp })
    }
    catch (err) {
        console.error('Error retrieving data:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
    finally {
        await connection.close()
    }
}


export async function getMonthData(req, res) {
    const connection = await getConnection(res)
    try {
        const { filterYear, filterBuyer } = req.query;
        const result = await connection.execute(`
            SELECT A.PAYPERIOD FROM MONTHLYPAYFRQ A
              WHERE A.finyr = '${filterYear}' 
GROUP BY A.PAYPERIOD
      ORDER BY TO_DATE(A.PAYPERIOD, 'Month YYYY')        
     `)
        console.log(result, 'res');
        let resp = result.rows.map(po => ({
            month: po[0]
        }))

        return res.json({ statusCode: 0, data: resp })
    }
    catch (err) {
        console.error('Error retrieving data:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
    finally {
        await connection.close()
    }
}

export async function getCompCodeData(req, res) {
    const connection = await getConnection(res)
    try {
        const { } = req.query;
        const sql =
            `
       SELECT C.COMPCODE,COUNT(*) TOT FROM HREMPLOYMAST A 
JOIN HREMPLOYDETAILS B ON A.HREMPLOYMASTID = B.HREMPLOYMASTID
JOIN GTCOMPMAST C ON C.GTCOMPMASTID = A.COMPCODE
WHERE B.IDACTIVE = 'YES'
GROUP BY C.COMPCODE`
        console.log(sql, '84');
        const result = await connection.execute(sql)
        let resp = result.rows.map(po => ({
            com: po[0]
        }))

        return res.json({ statusCode: 0, data: resp })
    }
    catch (err) {
        console.error('Error retrieving data:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
    finally {
        await connection.close()
    }
}

