import axios from "axios";
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import * as dotenv from "dotenv";
dotenv.config();

const APPSYNC_URL = process.env.APPSYNC_URL!;
const API_KEY = process.env.APPSYNC_API_KEY!;

export const graphqlCaller = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  const body = event.body ? JSON.parse(event.body) : {};
  const id = body.id;

  if (!id) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "id is required in the request body" }),
    };
  }

  const query = `
    query GetUser($id: ID!) {
      getUser(id: $id) {
        id
        name
        email
      }
    }
  `;

  const variables = { id };

  try {
    const response = await axios.post(
      APPSYNC_URL,
      { query, variables },
      {
        headers: {
          "Content-Type": "application/json",
          "x-api-key": API_KEY,
        },
      }
    );

    return {
      statusCode: 200,
      body: JSON.stringify(response.data),
    };
  } catch (err: any) {
    console.error("Error calling AppSync:", err.message);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
