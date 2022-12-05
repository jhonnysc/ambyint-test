import axios from 'axios'
import { PalpatineResponse, PlanetResponse } from './types'

export const palpatineApi = axios.create({
    baseURL: 'https://txje3ik1cb.execute-api.us-east-1.amazonaws.com/prod',
    headers: {
        'x-api-key': process.env.PALPATINE_API_KEY
    }
})


export const decrypt = async (data: string[]): Promise<PalpatineResponse[]> => {
    const response = await palpatineApi.post<string[]>('decrypt', data)

    return response.data.map((line) => {
        return JSON.parse(line)
    })
}   

export const planets = async (homeworld: string) => {
    const url = homeworld.replace('https://swapi.co', 'http://swapi.dev')

    return (await axios.get<PlanetResponse>(url)).data
}
