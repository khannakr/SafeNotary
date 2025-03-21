import { Client, Storage } from 'appwrite';
const client = new Client();
const storage = new Storage(client);
client.setProject('67dd39cf000a89529ff8').setEndpoint("https://cloud.appwrite.io/v1")

export { storage };

export default client;
