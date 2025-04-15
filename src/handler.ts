import { APIGatewayProxyHandler } from "aws-lambda";
import { callAppSync } from "./appsyncClient";

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    const { id, name } = JSON.parse(event.body || "{}");

    if (!id || !name) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "Both 'id' and 'name' are required." }),
      };
    }

    const addUserQuery = `
      mutation AddUser($id: ID!, $name: String!) {
        addUser(id: $id, name: $name) {
          id
          name
        }
      }
    `;

    const newUser = await callAppSync(addUserQuery, { id, name });

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
        message: "User created and fetched successfully.",
        created: newUser,
        fetched: fetchedUser,
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
