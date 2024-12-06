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

    // Pagination parameters from the query params (with default values)
    const page = parseInt(req.query.page) || 1;  // Default to page 1
    const pageSize = parseInt(req.query.pageSize) || 10;  // Default to 10 items per page

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
                    // Extract the value, clean it, and replace %20 with space
                    let value = binding[column]?.value || null;
                    if (value) {
                        if (value.includes('#')) {
                            value = value.split('#').pop(); // Keep only the part after the last '#'
                        }
                        value = value.replace(/%20/g, ' '); // Replace %20 with space
                    }
                    row[column] = value;
                });
                return row;
            })
        };

        // Pagination logic: Calculate total pages, current page, and slice data
        const totalResults = formattedResponse.rows.length;
        const totalPages = Math.ceil(totalResults / pageSize);

        // Ensure the page number is within the valid range
        if (page > totalPages) {
            return next(new ApiError(400, "Page number exceeds total pages"));
        }

        // Get the data for the current page
        const offset = (page - 1) * pageSize;
        const paginatedRows = formattedResponse.rows.slice(offset, offset + pageSize);

        // Prepare the paginated response
        const paginatedResponse = {
            formattedResponse: {
                columnHeaders: formattedResponse.columnHeaders,
                rows: paginatedRows,
            },
            pagination: {
                currentPage: page,
                totalPages,
                pageSize,
                totalResults,
            },
        };

        // Send back the paginated response
        res.status(200).json(
            new ApiResponse(200, paginatedResponse, "getData :: SPARQL query executed successfully with pagination")
        );

    } catch (error) {
        console.error("Error executing SPARQL query:", error.message);
        return next(
            new ApiError(500, "Error executing SPARQL query. Please try again later.")
        );
    }
});

export { getData };
