import { REPOSITORY_NAME } from "../constants.js";
import axios from "axios";

const connectDB = async() => {
    
    try {
        const endpoint = `${process.env.GRAPHDB_ENDPOINT}/${REPOSITORY_NAME}`;
        console.log("Connecting to GraphDB at:", endpoint); // Log endpoint for debugging

        const testQuery = `
            SELECT ?s ?p ?o 
            WHERE { ?s ?p ?o } 
            LIMIT 1
        `;

        const response = await axios.post(
            endpoint,
            testQuery,
            {
                headers: {
                    'Content-Type': 'application/sparql-query',
                    Accept: 'application/sparql-results+json',
                },
            }
        );
    
        console.log("GraphDB connection successful" + response); 
    } catch (error) {
        console.log("Database Connection Error :: connectDB :: Error " + error);
        process.exit(1);
    }
}

export default connectDB;