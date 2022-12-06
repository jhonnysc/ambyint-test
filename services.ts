/* eslint-disable no-await-in-loop */
import axios from 'axios';
import { PalpatineResponse, PlanetResponse } from './types/responses';

export const palpatineApi = axios.create({
  baseURL: 'https://txje3ik1cb.execute-api.us-east-1.amazonaws.com/prod',
  headers: {
    'x-api-key': process.env.PALPATINE_API_KEY,
  },
});

export const decrypt = async (data: string[]): Promise<PalpatineResponse[]> => {
  const response = await palpatineApi.post<string[]>('decrypt', data);

  return response.data.map((line) => JSON.parse(line));
};

export const getPlanets = async (page = 1) => axios.get<PlanetResponse>('https://swapi.dev/api/planets', {
  params: {
    page,
  },
});

export const getAllPlanets = async () => {
  let planets: PlanetResponse['results'] = [];

  // There is only 6 with 10 items pages for now
  let page = 1;

  while (page <= 6) {
    const response = await getPlanets(page);
    planets = planets.concat(response.data.results);

    if (response.data.next) {
      page += 1;
    } else {
      break;
    }
  }

  return planets;
};
