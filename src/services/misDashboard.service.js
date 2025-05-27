import { getConnection } from "../constants/db.connection.js";
import { IN_HAND } from "../constants/dbConstants.js";
import { getTopCustomers, getProfit, getEmployees, getNewCustomers, getLoss, getLoss1, getEmployees1, getProfit1, getLoss11, getLoss01 }
    from "../queries/misDashboard.js";


export async function get(req, res) {
    const connection = await getConnection(res)
    try {
        const { type, filterYear, filterBuyer, filterMonth } = req.query

        const totalTurnOver = await getEmployees(connection, type, filterYear, filterBuyer, filterMonth);
        const totalTurnOver1 = await getEmployees1(connection, type, filterYear, filterBuyer, filterMonth);

        const profit = await getProfit(connection, type, filterYear, filterBuyer, filterMonth);
        const profit1 = await getProfit1(connection, type, filterYear, filterBuyer, filterMonth);

        const newCustomers = await getNewCustomers(connection, type, filterYear, filterBuyer, filterMonth);
        const topCustomers = await getTopCustomers(connection, type, filterYear, filterBuyer, filterMonth);

        const loss = await getLoss(connection, type, filterYear, filterMonth);
        const loss01 = await getLoss01(connection, type, filterYear, filterMonth);

        const loss1 = await getLoss1(connection, type, filterYear, filterMonth);
        const loss11 = await getLoss11(connection, type, filterYear, filterMonth);


        return res.json({
            statusCode: 0, data: {
                totalTurnOver,
                totalTurnOver1,
                profit,
                newCustomers,
                topCustomers,
                loss, loss1, profit1, loss11, loss01
            }
        })
    }
    catch (err) {
        console.error('Error retrieving data:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
    finally {
        await connection.close()
    }
}

export async function getOrdersInHand(req, res) {
    const connection = await getConnection(res)
    try {
        const { filterYear, filterBuyer } = req.query;

        const sql = ` 
SELECT X.SLAP,COUNT(X.SLAP) VAL FROM (
SELECT CASE WHEN X.AGE BETWEEN 18 AND 25 THEN '18 - 25'
WHEN X.AGE BETWEEN 25 AND 35 THEN '25 - 35' 
WHEN X.AGE BETWEEN 35 AND 45 THEN '35 - 45' 
WHEN X.AGE BETWEEN 45 AND 65 THEN '45 - 60'
WHEN X.AGE > 60 THEN '60 Above'  END SLAP FROM (
SELECT MONTHS_BETWEEN(TRUNC(SYSDATE),A.DOB)/12 AGE FROM MISTABLE A WHERE A.COMPCODE = '${filterBuyer}'
AND A.DOJ <= (
SELECT MIN(AA.STDT) STDT FROM MONTHLYPAYFRQ AA WHERE TO_DATE(SYSDATE) BETWEEN AA.STDT AND AA.ENDT 
) AND (A.DOL IS NULL OR A.DOL <= (
SELECT MIN(AA.ENDT) STDT FROM MONTHLYPAYFRQ AA WHERE TO_DATE(SYSDATE) BETWEEN AA.STDT AND AA.ENDT 
) )
) X
) X
WHERE X.SLAP IS NOT NULL
GROUP BY X.SLAP
ORDER BY 1
`
        console.log(sql, 'sql60');
        let result = await connection.execute(sql);
        result = result.rows.map(row => ({
            buyer: row[0], value: row[1], female: row[2], total: row[3]
        }))
        return res.json({
            statusCode: 0, data: result
        })
    }
    catch (err) {
        console.error('Error retrieving data:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
    finally {
        await connection.close()
    }
}

export async function getOrdersInHandMonthWise(req, res) {
    const connection = await getConnection(res)
    try {
        const monthArr =
            `
        SELECT B.PAYPERIOD,B.STDT,A.COMPCODE,COUNT(*) ATTRITION FROM MISTABLE A
JOIN MONTHLYPAYFRQ B ON A.COMPCODE = B.COMPCODE 
AND B.FINYR = :FINYEAR AND A.COMPCODE = :COMPCODE
AND A.DOL BETWEEN B.STDT AND B.ENDT
GROUP BY B.PAYPERIOD,B.STDT,A.COMPCODE
ORDER BY 2
        `



        let result = await connection.execute(monthArr);
        result = result.rows.map(row => ({
            date: row[0], planned: row[3], actual: row[4]
        }))
        return res.json({
            statusCode: 0, data: result, sql
        })
    }
    catch (err) {
        console.error('Error retrieving data:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
    finally {
        await connection.close()
    }
}


export async function getActualVsBudgetValueMonthWise(req, res) {
    const connection = await getConnection(res)
    try {
        const monthArr = [-6, -5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5, 6].map(i =>
            `
            select 
            to_char(ADD_MONTHS(CURRENT_DATE, ${i}), 'Mon-YYYY') as monthYear ,
            to_char(ADD_MONTHS(CURRENT_DATE, ${i}), 'MM') as monthOnly ,
            to_char(ADD_MONTHS(CURRENT_DATE, ${i}), 'YYYY') as yearOnly ,
            (
                select round(COALESCE(sum(PLANSALESVAL),0)) from MISORDSALESVAL
            where extract(YEAR from BPODATE) = extract(YEAR from ADD_MONTHS(CURRENT_DATE, ${i}))
            and extract(MONTH from BPODATE) = extract(MONTH from ADD_MONTHS(CURRENT_DATE, ${i}))
            ) AS PLANNED,
            (
                select round(COALESCE(sum(ACTSALVAL),0)) from MISORDSALESVAL
            where extract(YEAR from BPODATE) = extract(YEAR from ADD_MONTHS(CURRENT_DATE, ${i}))
            and extract(MONTH from BPODATE) = extract(MONTH from ADD_MONTHS(CURRENT_DATE, ${i}))
            ) AS ACTUAL
            FROM DUAL
        `
        )
        const sql = monthArr.join('union')
        console.log(sql, 'sql133');
        let result = await connection.execute(`select * from (${sql}) order by yearOnly,monthOnly`);
        result = result.rows.map(row => ({
            date: row[0], planned: row[3], actual: row[4]
        }))
        return res.json({
            statusCode: 0, data: result, sql
        })
    }
    catch (err) {
        console.error('Error retrieving data:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
    finally {
        await connection.close()
    }
}
export async function getYearlyComp(req, res) {
    const month = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const d = new Date();
    const monthName = month[d.getMonth()];
    const yearName = d.getFullYear();
    const lastmonth = month[d.getMonth() - 1]
    const currentDt = [monthName, yearName].join(' ')
    const lstMnth = [lastmonth, yearName].join(' ')
    const connection = await getConnection(res)
    try {
        const { } = req.query;

        const sql =
            `
           SELECT A.COMPCODE,SUM(MALE) MALE,SUM(FEMALE) FEMALE,SUM(MALE)+SUM(FEMALE) TOTAL FROM (
SELECT A.COMPCODE,CASE WHEN A.GENDER = 'MALE' THEN 1 ELSE 0 END MALE,
CASE WHEN A.GENDER = 'FEMALE' THEN 1 ELSE 0 END FEMALE FROM MISTABLE A WHERE  A.DOJ <= (
SELECT MIN(AA.STDT) STDT FROM MONTHLYPAYFRQ AA WHERE AA.PAYPERIOD = '${currentDt}' 
) AND (A.DOL IS NULL OR A.DOL <= (
SELECT MIN(AA.ENDT) STDT FROM MONTHLYPAYFRQ AA WHERE AA.PAYPERIOD = '${currentDt}'
) )
) A
GROUP BY A.COMPCODE
     `

        const result = await connection.execute(sql)
        let resp = result.rows.map(po => ({

            customer: po[0],
            male: po[1],
            female: po[2],

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
export async function getBuyerWiseRevenue(req, res) {
    const connection = await getConnection(res)
    try {
        const { filterYear, filterSupplier } = req.query;
        const supplierArray = filterSupplier.split(',');
        const sepComName = supplierArray.join('');
        const supplierList = supplierArray.map(supplier => `'${supplier}'`).join(',');
        const sql =
            `
         SELECT A.PAYPERIOD,A.STDT,ROUND(A.CLOSING/A.OPENING*100,2) RETENTIONPER FROM (
SELECT A.PAYPERIOD,A.STDT,SUM(A.OPENING) OPENING,SUM(A.ATTRITION) ATTRITION,SUM(A.OPENING) - SUM(A.ATTRITION) + SUM(A.JOINERS) CLOSING FROM (
SELECT B.PAYPERIOD,B.STDT,0 OPENING,COUNT(*) ATTRITION,0 JOINERS FROM MISTABLE A
JOIN MONTHLYPAYFRQ B ON A.COMPCODE = B.COMPCODE 
AND B.FINYR = '${filterYear}' AND A.COMPCODE IN (${supplierList})
AND A.DOL BETWEEN B.STDT AND B.ENDT
GROUP BY B.PAYPERIOD,B.STDT,A.COMPCODE
UNION ALL
SELECT B.PAYPERIOD,B.STDT,0 OPENING,0 ATTRITION,COUNT(*) JOINERS FROM MISTABLE A
JOIN MONTHLYPAYFRQ B ON A.COMPCODE = B.COMPCODE 
AND B.FINYR = '${filterYear}' AND A.COMPCODE  IN (${supplierList})
AND A.DOJ BETWEEN B.STDT AND B.ENDT
GROUP BY B.PAYPERIOD,B.STDT,A.COMPCODE
UNION ALL
SELECT B.PAYPERIOD,B.STDT,COUNT(*) OPENING,0 ATTRITION,0 JOINERS FROM MISTABLE A
JOIN MONTHLYPAYFRQ B ON A.COMPCODE = B.COMPCODE 
AND B.FINYR = '${filterYear}' AND A.COMPCODE  IN (${supplierList})
AND A.DOJ < B.STDT
GROUP BY B.PAYPERIOD,B.STDT
) A
GROUP BY A.PAYPERIOD,A.STDT
) A
ORDER BY 2
     `
        console.log(sql, '215');

        const result = await connection.execute(sql)
        let resp = result.rows.map(po => ({

            payPeriod: po[0],
            stdt: po[1],
            retention: po[2],

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


export async function getActualVsBudget(req, res) {
    const connection = await getConnection(res);
    try {
        const { filterMonth, filterSupplier, filterYear, filterAll = 'Detailed' } = req.query;

        let sql = '';

        if (filterAll === 'Detailed') {
            sql = `
              SELECT A.COMPCODE,SUM(MALE) MALE,SUM(FEMALE) FEMALE,SUM(MALE)+SUM(FEMALE) TOTAL FROM (
SELECT A.COMPCODE,CASE WHEN A.GENDER = 'MALE' THEN 1 ELSE 0 END MALE,
CASE WHEN A.GENDER = 'FEMALE' THEN 1 ELSE 0 END FEMALE FROM MISTABLE A WHERE A.COMPCODE = 'AGF'
AND A.DOJ <= (
SELECT MIN(AA.STDT) STDT FROM MONTHLYPAYFRQ AA WHERE AA.PAYPERIOD = 'July 2024' 
) AND (A.DOL IS NULL OR A.DOL <= (
SELECT MIN(AA.ENDT) STDT FROM MONTHLYPAYFRQ AA WHERE AA.PAYPERIOD = 'July 2024'
) )
) A
GROUP BY A.COMPCODE`;
            console.log(sql, 'dqw');

        } else {
            sql = `
                SELECT A.FINYR,ORDERNO,A.BUYERCODE,A.TYPENAME,A.YARNCOST,A.FABRICCOST,A.ACCCOST,A.CMTCOST,
                A.OTHERCOST,A.SALECOST,A.ACTPROFIT,A.ACTPROFITPER,A.ORD,A.MON,A.FINYR||A.MON GRP 
                FROM MISORDBUDACTCDETAILS A 
                WHERE A.TYPENAME <> 'Detailed1' AND A.BUYERCODE = :filterSupplier  
                AND A.Mon = :filterMonth AND A.finYr = :filterYear 
                ORDER BY BUYERCODE,ORDERNO,ORD`;
        }


        const result = await connection.execute(sql);
        let resp = result.rows.map(po => ({
            finYr: po[0],
            orderNo: po[1],
            buyerCode: po[2],
            typeName: po[3],
            yarnCost: po[4],
            fabricCost: po[5],
            accCost: po[6],
            cmtCost: po[7],
            otherCost: po[8],
            saleCost: po[9],
            actProfit: po[10],
            actProfitPer: po[11],
            ord: po[12],
            mon: po[13],
        }));

        return res.json({ statusCode: 0, data: resp });
    } catch (err) {
        console.error('Error retrieving data:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    } finally {
        await connection.close();
    }
}
//Event Beakup Current Month
export async function getShortShipmentRatio(req, res) {
    const connection = await getConnection(res)
    try {
        const { filterCat, filterBuyer } = req.query;
        console.log(filterBuyer, "filterBuyer")
        let sql
        if (filterCat === 'Birthday') {
            sql =
                `
     SELECT A.COMPCODE,A.IDCARD,A.FNAME,A.GENDER,A.DOB,TRUNC(MONTHS_BETWEEN(TRUNC(SYSDATE),A.DOB)/12) AGE,TRUNC(MONTHS_BETWEEN(TRUNC(SYSDATE),A.DOJ)/12) EXP ,A.DOJ FROM MISTABLE A 
WHERE TO_CHAR(SYSDATE, 'WW') = TO_CHAR(A.DOB, 'WW') AND A.PAYCAT = 'STAFF'
 ${filterBuyer ? `AND A.COMPCODE = '${filterBuyer}'` : ''}
AND A.DOJ <= (
SELECT MIN(AA.STDT) STDT FROM MONTHLYPAYFRQ AA WHERE TO_DATE(SYSDATE) BETWEEN AA.STDT AND AA.ENDT 
) AND (A.DOL IS NULL OR A.DOL <= (
SELECT MIN(AA.ENDT) STDT FROM MONTHLYPAYFRQ AA WHERE TO_DATE(SYSDATE) BETWEEN AA.STDT AND AA.ENDT 
) )
ORDER BY TO_CHAR(A.DOB, 'MM-DD')

 `
        } else {
            sql = `SELECT A.COMPCODE,A.IDCARD,A.FNAME,A.GENDER,A.DOB,TRUNC(MONTHS_BETWEEN(TRUNC(SYSDATE),A.DOB)/12) AGE,TRUNC(MONTHS_BETWEEN(TRUNC(SYSDATE),A.DOJ)/12) EXP ,A.DOJ FROM MISTABLE A 
WHERE TO_CHAR(SYSDATE, 'WW') = TO_CHAR(A.DOJ, 'WW') AND A.PAYCAT = 'STAFF'
 ${filterBuyer ? `AND A.COMPCODE = '${filterBuyer}'` : ''}
AND A.DOJ <= (
SELECT MIN(AA.STDT) STDT FROM MONTHLYPAYFRQ AA WHERE TO_DATE(SYSDATE) BETWEEN AA.STDT AND AA.ENDT 
) AND (A.DOL IS NULL OR A.DOL <= (
SELECT MIN(AA.ENDT) STDT FROM MONTHLYPAYFRQ AA WHERE TO_DATE(SYSDATE) BETWEEN AA.STDT AND AA.ENDT 
) )
ORDER BY TO_CHAR(A.DOB, 'MM-DD')
`
        }

        console.log(sql, "event Query sql")


        const result = await connection.execute(sql)
        let resp = result.rows.map(po => ({
            customer: po[0],
            idCard: po[1],
            name: po[2],
            gender: po[3],
            dob: po[4],
            age: po[5],
            exp: po[6],
            doj: po[7]

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


export async function getESIPF(req, res) {
    const connection = await getConnection(res)
    try {
        const { filterCat, filterSupplier, filterYear } = req.query;
        console.log(filterSupplier, "filterSupplier")
        let sql

        sql = `
        SELECT A.COMPCODE,A.PAYPERIOD ,EE.FINYR,SUM(A.ESI) ESI, SUM(A.PF) PF FROM HPAYROLL A
JOIN HREMPLOYMAST AA ON A.EMPID = AA.IDCARDNO
JOIN HREMPLOYDETAILS BB ON AA.HREMPLOYMASTID = BB.HREMPLOYMASTID
JOIN HRBANDMAST CC ON CC.HRBANDMASTID = BB.BAND
JOIN MONTHLYPAYFRQ EE ON EE.PAYPERIOD=A.PAYPERIOD AND EE.COMPCODE = A.COMPCODE
where EE.finyr ='${filterYear}'
AND A.COMPCODE = '${filterSupplier}'
group by A.COMPCODE,EE.FINYR,A.PAYPERIOD
        
        
        
        
        
        
 
`
        console.log(sql, "event Query sql")


        const result = await connection.execute(sql)
        let resp = result.rows.map(po => ({
            customer: po[0],
            month: po[1],
            Year: po[2],
            esi: po[3],
            pf: po[4]


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
