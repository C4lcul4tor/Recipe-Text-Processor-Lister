import * as fs from 'fs';
import { parseRecipe } from './recipeParser';

const text = fs.readFileSync('../../data/sample_recipe.txt', 'utf-8');
const result = parseRecipe(text);
console.log(result);
