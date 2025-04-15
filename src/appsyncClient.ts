import axios from "axios";
import { SecretsManager } from "aws-sdk";

const secretName = "AppSyncSecrets";
let cachedSecrets: any = null;

async function getAppSyncSecrets() {
  if (cachedSecrets) return cachedSecrets;

  const secretsManager = new SecretsManager();
  const response = await secretsManager
    .getSecretValue({ SecretId: secretName })
    .promise();

  if ("SecretString" in response) {
    cachedSecrets = JSON.parse(response.SecretString!);
    return cachedSecrets;
  }

  throw new Error("Secrets not found in Secrets Manager");
}

export async function callAppSync(query: string, variables: any = {}) {
  const { APPSYNC_URL, APPSYNC_API_KEY } = await getAppSyncSecrets();

  const response = await axios.post(
    APPSYNC_URL,
    {
      query,
      variables,
    },
    {
      headers: {
        "x-api-key": APPSYNC_API_KEY,
        "Content-Type": "application/json",
      },
    }
  );

  return response.data;
}
