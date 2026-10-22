import express, { Express } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { ClaimRegistrationService } from './modules/relief-claims/claim-registration-service.js';
import { ClaimsApiController } from './modules/relief-claims/claims-api-controller.js';
import { LineWebhookController } from './modules/line-webhook/webhook-controller.js';

dotenv.config();

const currentFilename = fileURLToPath(import.meta.url);
const currentDirectory = path.dirname(currentFilename);
const rootDirectory = path.resolve(currentDirectory, '..');

const serverApp: Express = express();
const serverPort = Number(process.env.PORT) || 3000;

const lineChannelSecret = process.env.LINE_CHANNEL_SECRET || 'MOCK_SECRET';
const lineAccessToken = process.env.LINE_CHANNEL_ACCESS_TOKEN || 'MOCK_TOKEN';
const liffAppUrl = process.env.LIFF_APP_URL || 'https://liff.line.me/MOCK_ID';

const claimService = new ClaimRegistrationService();
const claimsController = new ClaimsApiController(claimService);
const webhookController = new LineWebhookController(
  lineChannelSecret,
  lineAccessToken,
  liffAppUrl,
  claimService
);

// Serve static LIFF application
serverApp.use(express.static(path.join(rootDirectory, 'public')));

// LINE Webhook requires raw body buffer for HMAC verification
serverApp.post(
  '/api/v1/line/webhook',
  express.raw({ type: 'application/json' }),
  (incomingRequest, outgoingResponse) => {
    webhookController.processWebhookEvents(incomingRequest, outgoingResponse);
  }
);

// JSON parser for standard APIs
serverApp.use(express.json());

serverApp.post('/api/v1/claims', (incomingRequest, outgoingResponse) => {
  claimsController.createClaim(incomingRequest, outgoingResponse);
});

serverApp.get('/api/v1/claims/:claimId', (incomingRequest, outgoingResponse) => {
  claimsController.getClaimStatus(incomingRequest, outgoingResponse);
});

serverApp.patch('/api/v1/claims/:claimId/status', (incomingRequest, outgoingResponse) => {
  claimsController.updateClaimStatus(incomingRequest, outgoingResponse);
});

serverApp.get('/health', (_incomingRequest, outgoingResponse) => {
  outgoingResponse.status(200).json({ systemStatus: 'ONLINE', timestamp: new Date().toISOString() });
});

serverApp.listen(serverPort, () => {
  console.log(`[FloodReliefSystem] Service listening on port ${serverPort}`);
});
