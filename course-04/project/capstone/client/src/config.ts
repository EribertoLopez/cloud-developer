// TODO: Once your application is deployed, copy an API id here so that the frontend could interact with it
// const apiId = 'zo4uownkw5' # b9hccrvpvb
const apiId = 'fimrzlnvij'
export const apiEndpoint = `https://${apiId}.execute-api.us-east-1.amazonaws.com/dev`

export const authConfig = {
  domain: 'cloud-developer-2020.auth0.com',            // Auth0 domain
  clientId: 'bA9fQHIx0jEzgApJKW1vDj9jZ4pfG12S',          // Auth0 client id
  callbackUrl: 'http://localhost:3000/callback'
}
