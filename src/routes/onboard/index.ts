import { FastifyPluginAsync } from "fastify"
import { getCountryFromIPMM } from "./ipService"
import { getQuotes, getRedirect, onboardStart } from './onboard'
import { sign } from "./protocol"

const bodyJsonSchema = {
  type: 'object',
  required: ['cryptoCurrency', 'fiatCurrency', 'amountType', 'amount', 'network', 'providers'],
  properties: {
    cryptoCurrency: { type: 'string' },
    fiatCurrency: { type: 'string' },
    amountType: {
      type: 'string',
      enum: ['fiat', 'crypto']
    },
    amount: { type: 'number' },
    network: { type: 'string' },
    providers: {
      type: 'array',
      items: {
        type: 'string',
        enum: ['transak', 'mtpelerin']
      }
    }
  }
};

const signBodyJsonSchema = {
  type: 'object',
  required: ['stringToSign'],
  properties: {
    stringToSign: { type: 'string' }
    }
};

const redirectBodyJsonSchema = {
  type: 'object',
  required: ['cryptoCurrency', 'fiatCurrency', 'amountType', 'amount', 'network', 'provider'],
  properties: {
    cryptoCurrency: { type: 'string' },
    fiatCurrency: { type: 'string' },
    amountType: {
      type: 'string',
      enum: ['fiat', 'crypto']
    },
    amount: { type: 'number' },
    network: { type: 'string' },
    provider: {
      type: 'string',
      enum: ['transak', 'mtpelerin']
    },
    paymentMethod: { type: 'string'}
  }
};

const onboardRoutes: FastifyPluginAsync = async (fastify, opts): Promise<void> => {

  fastify.get('/', async function (request, reply) {
    return await onboardStart(request.ip);
  })

  fastify.post('/quote', { schema: { body: bodyJsonSchema } }, async function (request, reply) {
    const countryCode = await getCountryFromIPMM(request.ip);
    const body: any = request.body;

    try {
      const resp = await getQuotes(body.providers, body.network, body.cryptoCurrency, body.fiatCurrency, body.amountType, body.amount, countryCode);
      return resp;
    } catch (err) {
      console.log(err);
    }
  });

  fastify.post('/sign', { schema: { body: signBodyJsonSchema } } ,async function (request, reply) {
    const body: any = request.body;
    return sign(body.stringToSign).toString('base64');
  });

  fastify.post('/init', { schema: { body: redirectBodyJsonSchema } } ,async function (request, reply) {
    const body: any = request.body;

    if (body.provider === 'transak' && !body.paymentMethod) reply.badRequest("'paymentMethod' required for transak provider")
    
    return getRedirect(body.provider, body.network, body.cryptoCurrency, body.fiatCurrency, body.amountType, body.amount, body.address, body.paymentMethod);
  });

  fastify.get('/test', async function (request, reply) {
    const quotes = await getQuotes(['mtpelerin'], 'ethereum', 'ETH', 'GBP', 'fiat', 500, 'GB')
    console.log(quotes)
    return quotes;
  });

}


export default onboardRoutes;
