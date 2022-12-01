import mysql, { Connection, RowDataPacket } from "mysql2";
import { GetSecretValueCommand, SecretsManagerClient } from "@aws-sdk/client-secrets-manager";
import { Client } from '@opensearch-project/opensearch';

let dbConnection: Connection;
let osClient: Client;

export interface Item extends RowDataPacket {
    readonly id:string; 
    readonly name: string;
    readonly price: number;
}

export async function findAllItems(): Promise<Item[]> {

    return new Promise<Item[]>((resolve, reject) => {

        dbConnection.query<Item[]>("select id, name, price from items", (err, res) => {

            if(err) {
                reject(err);
            }
            
            resolve(res);
        });
        
    });

}

export async function createItem(name: string, price: number): Promise<number> {

    return new Promise<number>((resolve, reject) => {

        dbConnection.execute<mysql.ResultSetHeader>("insert into items (name, price) values (?,?)", [name, price], async (err, res) => {

            if(err) {
                reject(err);
            }
            
            resolve(res.insertId);
        });
        
    });
    
}

export async function generateRandomOpenSearchData(): Promise<number> {

    try {    
        var response = await osClient.indices.create({
        index: "items",
        body: {},
        });
    } catch(e: any) {
        console.log(e);
        if(e.body.error.type !== 'resource_already_exists_exception') {
            throw e;
        } else {
            console.log("index already exists");
        }
    }

    let data = new Array<number>();

    for(let i=0; i < 100; i++) {
        data.push(Math.random()*100000000);
    }       

    return new Promise<number>(async (resolve, reject) => {

        const requestPromises = data.map((id: number) => {

            osClient.index({
                id: id.toString(),
                index: 'items',
                body: { 
                    name : 'item ' + id.toString() 
                },
                refresh: true
            });

        });

        await Promise.all(requestPromises);
        
        resolve(requestPromises.length);
    });    
}

export async function searchItems(queryString: string): Promise<any[]> {

    let query = {
        query: {
          wildcard: {
            name: {
              value: '*' + queryString + "*",
            },
          },
        },
      };
    
    var response = await osClient.search({
        index: "items",
        body: query,
    });

    if(response.body.hits.total.value > 0) {

        const items = response.body.hits.hits.map((_sourceItem: any) => {
            return {
                id: _sourceItem._id,
                name: _sourceItem._source.name
            }
        });

        return items;
    }

    return [];
}

async function buildConnection(): Promise<Connection> {

    if(!process.env.AWS_REGION) {
        
        console.log("local connection");

        const connection = mysql.createConnection({
            host     : process.env.DB_LOCAL_HOST, 
            user     : process.env.DB_LOCAL_USERNAME,
            password : process.env.DB_LOCAL_PASSWORD, 
            database : process.env.DATABASE_NAME, 
        });

        await connection.connect();

        return connection;
    } else {

        console.log("remote connection");

        const client = new SecretsManagerClient({ region: process.env.AWS_REGION });
        const command = new GetSecretValueCommand({ SecretId: process.env.DB_SECRET_NAME });
        const data = await client.send(command);

        if(data.SecretString) {
            const secretJson = JSON.parse(data.SecretString);
            
            const connection = mysql.createConnection({
                host     : secretJson.host,
                user     : secretJson.username,
                password : secretJson.password,
                database : process.env.DATABASE_NAME
            });

            await connection.connect();

            return connection;

        } else {
            throw new Error("Not able to create connection because secret string is empty");
        }
    }
}

async function buildOpenSearchClient(): Promise<Client> {

    let openSearchHostName = "";

    if(!process.env.AWS_REGION) {

        let auth = process.env.OS_LOCAL_USERNAME + ":" + process.env.OS_LOCAL_PASSWORD;
        let host = process.env.OS_HOSTNAME;
        let port = process.env.OS_PORT;
        let localNode = "https://" + auth + "@" + host + ":" + port;
        process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
        return new Client({
            node: localNode
        });

    } else {

        const client = new SecretsManagerClient({ region: process.env.AWS_REGION });
        const command = new GetSecretValueCommand({ SecretId: process.env.OS_SECRET_NAME });
        const data = await client.send(command);

        if(data.SecretString) {
            const secretJson = JSON.parse(data.SecretString);

            const hostname = process.env.OS_HOSTNAME;
            let port = process.env.OS_PORT;

            if(!process.env.OS_PORT) {
                port = '443';
            }

            // assuming port 443 so not overloading it
            // Basic auth is not very secure => use sign with SigV4 (URL to provide)
            const nodeURL = "https://" + secretJson.username + ":" + encodeURIComponent(secretJson.password) + "@" + hostname + ":" + port;

            return new Client({
                node: nodeURL,
                ssl: { rejectUnauthorized: false }
            });
        } else {
            console.log("No secret found for OpenSearch");
        }
    }

    // default localhost
    return new Client({ node: "http://localhost" });
}

await buildConnection().then((connection: Connection) => {
    dbConnection = connection;  
});

await buildOpenSearchClient().then((client: Client) => {
    osClient = client;
});

