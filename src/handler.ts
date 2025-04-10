import axios from "axios";
import { SecretsManager } from "aws-sdk";
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";

let cachedSecrets: { APPSYNC_URL: string; APPSYNC_API_KEY: string } | null =
  null;

const getSecrets = async () => {
  if (cachedSecrets) return cachedSecrets;

  const client = new SecretsManager();
  const secretName = "AppSyncSecrets";

  const data = await client.getSecretValue({ SecretId: secretName }).promise();

  if (!data.SecretString) throw new Error("No secret string found");

  const parsed = JSON.parse(data.SecretString);
  cachedSecrets = {
    APPSYNC_URL: parsed.APPSYNC_URL,
    APPSYNC_API_KEY: parsed.APPSYNC_API_KEY,
  };

  return cachedSecrets;
};

export const graphqlCaller = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  let id: string | undefined;

  if (event.body) {
    const body = JSON.parse(event.body);
    id = body.id;
  } else if ((event as any).id) {
    id = (event as any).id;
  }

  if (!id) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "id is required" }),
    };
  }

  try {
    const { APPSYNC_URL, APPSYNC_API_KEY } = await getSecrets();

    const query = `
      query GetUser($id: ID!) {
        getUser(id: $id) {
          id
          name
          email
        }
      }
    `;

    const response = await axios.post(
      APPSYNC_URL,
      { query, variables: { id } },
      {
        headers: {
          "Content-Type": "application/json",
          "x-api-key": APPSYNC_API_KEY,
        },
      }
    );

    return {
      statusCode: 200,
      body: JSON.stringify(response.data),
    };
  } catch (err: any) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
