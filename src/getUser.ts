import { APIGatewayProxyHandler } from "aws-lambda";
import { callAppSync } from "./appsyncClient";

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    const id = event.pathParameters?.id;

    if (!id) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "'id' path parameter is required." }),
      };
    }

    const getUserQuery = `
        query GetUser($id: ID!) {
          getUser(id: $id) {
            id
            name
          }
        }
      `;

    const fetchedUser = await callAppSync(getUserQuery, { id });

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "User fetched successfully",
        user: fetchedUser,
      }),
    };
  } catch (error: any) {
    console.error("Error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Internal server error",
        error: error.message,
      }),
    };
  }
};
