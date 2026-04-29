import { ResourcesConfig } from "aws-amplify";

export const amplifyConfig: ResourcesConfig = {
  Auth: {
    Cognito: {
      userPoolId: process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID || "",
      userPoolClientId: process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID || "",
      loginWith: {
        email: true,
        oauth: {
          domain: process.env.NEXT_PUBLIC_COGNITO_DOMAIN || "",
          scopes: ["email", "openid", "profile"],
          redirectSignIn: [
            "http://localhost:3000/oauth-callback",
            "https://ngoctin.me/oauth-callback",
          ],
          redirectSignOut: [
            "http://localhost:3000/login",
            "https://ngoctin.me/login",
          ],
          responseType: "code",
          providers: ["Google"],
        },
      },
    },
  },
  API: {
    REST: {
      LexiApi: {
        endpoint: process.env.NEXT_PUBLIC_API_URL || "",
        region: process.env.NEXT_PUBLIC_AWS_REGION || "ap-southeast-1",
      },
    },
  },
};
