// You can import the whole module
import * as cocoSsd from '@tensorflow-models/coco-ssd';

// Or import specific functions if the module supports it
import { load } from '@tensorflow-models/coco-ssd';

// Example usage:
async function setupModel() {
  const model = await cocoSsd.load();
  console.log('Model loaded!');
  // ... use the model
}

setupModel();