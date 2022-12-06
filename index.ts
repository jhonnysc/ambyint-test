import './config';
import fs from 'fs';
import readline from 'readline';
import { decrypt, getAllPlanets } from './services';
import { PalpatineResponse } from './types/responses';
import { getUrlId } from './utils';

const start = async () => {
  // Creating file stream to read individual lines to prepare for the batch creation
  const linesStream = fs.createReadStream('./super-secret-data.txt', {
    encoding: 'utf-8',
  });
  const rl = readline.createInterface({
    input: linesStream,
  });

  // Create batch of 1000 lines since it is the rate, as described in the README.
  let count = 1;
  const maxPerBatch = 1000;
  let currentBatch: string[] = [];
  const batches: string[][] = [];

  for await (const line of rl) {
    currentBatch.push(line);
    if (count === maxPerBatch) {
      count = 0;
      batches.push(currentBatch);
      currentBatch = [];
    }
    count += 1;
  }

  // Start requesting the batches
  const responses: PalpatineResponse[] = [];
  let promises: Promise<PalpatineResponse[]>[] = [];

  let batchCounter = 0;
  for await (const batch of batches) {
    promises.push(decrypt(batch));
    batchCounter += 1;
    console.log(`Batch ${batchCounter} of ${batches.length}`);
    // Rate limite seems to baround 15~20 sec with some limite by minute so even if 15 works,
    // it fails before reaching 100?
    // Leaving as 5/sec for safety as it seems to work fine
    // There seems to be more a bigger rate limit, minute maybe?
    if (batchCounter % 5 === 0) {
      // Process the current batch
      await (
        await Promise.all(promises)
      ).forEach(
        (data) => data.forEach((line) => responses.push(line)),
      );

      // Wait 1sec to prevent rate limit
      await new Promise((resolve) => {
        setTimeout(resolve, 1001);
      });

      // Clear queue
      promises = [];
    }
  }

  console.log('Cleaning up dupe data');
  // Clean up the replicate data by name
  const found = new Set();
  const filteredResidents = responses.filter((data) => {
    if (found.has(data.name)) return false;
    found.add(data.name);
    return true;
  });

  console.log('Requesting planets data...');
  let planets: { name: string | null, homeworld: string }[] = [];

  try {
    const allPlanets = await getAllPlanets();

    planets = allPlanets
      .map((data) => ({ name: data.name, homeworld: data.url }));
  } catch (e) {
    const parsedHomeworlds = new Set();

    filteredResidents.forEach((data) => {
      if (parsedHomeworlds.has(data.homeworld)) return;
      parsedHomeworlds.add(data.homeworld);
      planets.push({ name: null, homeworld: data.homeworld });
    });
  }

  console.log('Creating grouping data...');
  // Create the grouping
  const grouping: string[] = planets.reduce<string[]>((acc, curr) => {
    if (!curr) return acc;

    const key = curr.name || curr.homeworld;
    const planetResident: string[] = [];
    filteredResidents.forEach((resident) => {
      if (getUrlId(curr.homeworld) === getUrlId(resident.homeworld)) {
        planetResident.push(resident.name);
      }
    });

    acc.push(`${key}:${planetResident.join(',')}`);
    return acc;
  }, []);

  console.log('Writing file...');
  // Write to the file
  fs.writeFileSync('./output/citizens-super-secret-info.txt', grouping.join('\n'), {
    encoding: 'utf-8',
  });
};

start()
  .then(console.log)
  .catch(console.error)
  .finally(() => {
    process.exit(0);
  });
