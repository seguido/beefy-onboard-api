import { FastifyPluginAsync } from "fastify"
import { getCountryFromIP } from "./ipService"
import { checkIpAddress, getData, getNetworkList, getTradePairs } from "./service"
import { getCountries, getCryptoCurrencies, getFiatCurrencies, getTransakData } from "./transakService"
import { getFake, getQuotes, onboardStart } from './onboard'

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
        enum: ['transak', 'binance']
      }
    }
  }
};

const example: FastifyPluginAsync = async (fastify, opts): Promise<void> => {
  fastify.get('/', async function (request, reply) {
    return 'Binance connect'
  })

  fastify.get('/network', async function (request, reply) {
    await getNetworkList();
    return 'network list';
  })

  fastify.get('/pairs', async function (request, reply) {
    await getTradePairs();
    return 'trade pairs';
  })

  fastify.get('/keys', async function (request, reply) {
    return 'networkListWithProxy';
  })

  fastify.get('/ip', async function (request, reply) {
    return await getCountryFromIP(request.ip);
  })

  fastify.get('/transak', async function (request, reply) {
    await getCryptoCurrencies();
    return request.ip;
  })

  fastify.get('/country', async function (request, reply) {
    await checkIpAddress('190.196.230.20');
    return request.ip;
  })

  fastify.get('/countries', async function (request, reply) {
    await getCountries();
    return request.ip;
  })

  fastify.get('/binanceData', async function (request, reply) {
    return await getData();;
  })

  fastify.get('/transakData', async function (request, reply) {
    return await getTransakData("GB");;
  })

  fastify.get('/onboard', async function (request, reply) {
    // return await onboardStart(request.ip);
    // return await onboardStart(request.ip);
    return await onboardStart("31.10.32.5");
  })



  fastify.post('/quote', { schema: { body: bodyJsonSchema } }, async function (request, reply) {
    let countryCode = await getCountryFromIP(request.ip);

    const body: any = request.body;
    try {
      let resp = await getQuotes(body.providers, body.network, body.cryptoCurrency, body.fiatCurrency, body.amountType, body.amount, countryCode);
      return resp;
    } catch (err) {
      console.log(err);
    }

  });

  fastify.post('/fake', { schema: { body: bodyJsonSchema } }, async function (request, reply) {
    let countryCode = await getCountryFromIP(request.ip);

    const body: any = request.body;
    try {
      let resp = await getFake(body.providers, body.network, body.cryptoCurrency, body.fiatCurrency, body.amountType, body.amount, countryCode);
      return resp;
    } catch (err) {
      console.log(err);
    }

  });

}


export default example;
