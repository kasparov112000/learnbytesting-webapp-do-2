/* eslint-disable @typescript-eslint/naming-convention */

import { ENV } from "./models/env.config";

interface AuthConfig {
  CLIENT_ID: string;
  CLIENT_DOMAIN: string;
  AUDIENCE: string;
  REDIRECT: string;
  SCOPE: string;
  NAMESPACE: string;
}

export const AUTH_CONFIG: AuthConfig =
{
  CLIENT_ID: 'EtW0PTOXURWw6aHf1fu98c6tfvamo1zC',  // Updated with the new client ID
  CLIENT_DOMAIN: 'dev-6rq3kqps6pmvhyy3.us.auth0.com',  // Updated with the new domain
  AUDIENCE: 'https://dev-6rq3kqps6pmvhyy3.us.auth0.com/api/v2/',  // Updated audience to reflect the new domain
  REDIRECT: `${ENV.BASE_URI}/callback`,  // Kept as is, assuming no change
  SCOPE: 'openid groups profile email permissions roles',  // Kept the same
  NAMESPACE: 'https://example.com/roles'  // Kept the same, adjust if the namespace needs updating
}

