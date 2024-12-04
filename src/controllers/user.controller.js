import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";
import axios from "axios";
import { REPOSITORY_NAME } from "../constants.js";

const getData = asyncHandler(async (req, res, next) => {
    const { query } = req.body;

    // Validate the presence of the query
    if (!query) {
        return next(new ApiError(400, "Query is required in the request body"));
    }

    try {
        const endpoint = `${process.env.GRAPHDB_ENDPOINT}/${REPOSITORY_NAME}`;

        // Make a request to GraphDB
        const response = await axios.post(
            endpoint,
            query,
            {
                headers: {
                    'Content-Type': 'application/sparql-query',
                    Accept: 'application/sparql-results+json',
                },
            }
        );

        // Format the response into the desired structure
        const formattedResponse = {
            columnHeaders: response.data.head.vars, // Column headers from response.head.vars
            rows: response.data.results.bindings.map(binding => {
                // Create a row object by iterating over the column headers
                const row = {};
                response.data.head.vars.forEach(column => {
                    row[column] = binding[column]?.value || null; // Handle cases where value may not exist
                });
                return row;
            })
        };

        // Send back the response from GraphDB
        res.status(200).json(
            new ApiResponse(200, formattedResponse, "getData :: SPARQL query executed successfully")
            // new ApiResponse(200, response.data, "getData :: SPARQL query executed successfully")
        );
    } catch (error) {
        console.error("Error executing SPARQL query:", error.message);
        return next(
            new ApiError(500, "Error executing SPARQL query. Please try again later.")
        );
    }
});


export { getData };