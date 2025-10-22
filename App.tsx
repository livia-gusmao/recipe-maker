
import React, { useState, useCallback, FormEvent, FC } from 'react';
import { generateRecipes } from './services/geminiService';
import { Recipe } from './types';
import { ChefHatIcon } from './components/icons/ChefHatIcon';
import { TrashIcon } from './components/icons/TrashIcon';
import { SparklesIcon } from './components/icons/SparklesIcon';

const RecipeCard: FC<{ recipe: Recipe }> = ({ recipe }) => (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden transform hover:scale-105 transition-transform duration-300">
        <img src={`https://picsum.photos/seed/${recipe.recipeName}/600/400`} alt={recipe.recipeName} className="w-full h-48 object-cover"/>
        <div className="p-6">
            <h3 className="text-2xl font-bold text-primary-600 dark:text-primary-400 mb-3">{recipe.recipeName}</h3>
            <div className="mb-4">
                <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">Ingredientes</h4>
                <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-400">
                    {recipe.ingredients.map((ingredient, i) => <li key={i}>{ingredient}</li>)}
                </ul>
            </div>
            <div>
                <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">Instruções</h4>
                <ol className="list-decimal list-inside space-y-2 text-gray-600 dark:text-gray-400">
                    {recipe.instructions.map((step, i) => <li key={i}>{step}</li>)}
                </ol>
            </div>
        </div>
    </div>
);

const App: React.FC = () => {
    const [ingredients, setIngredients] = useState<string[]>(['Tomate', 'Cebola', 'Alho']);
    const [currentIngredient, setCurrentIngredient] = useState<string>('');
    const [recipes, setRecipes] = useState<Recipe[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const handleAddIngredient = (e: FormEvent) => {
        e.preventDefault();
        if (currentIngredient && !ingredients.map(i => i.toLowerCase()).includes(currentIngredient.toLowerCase())) {
            setIngredients([...ingredients, currentIngredient.trim()]);
            setCurrentIngredient('');
        }
    };

    const handleRemoveIngredient = (ingredientToRemove: string) => {
        setIngredients(ingredients.filter(ingredient => ingredient !== ingredientToRemove));
    };

    const handleGenerateRecipes = useCallback(async () => {
        if (ingredients.length === 0) {
            setError('Por favor, adicione ao menos um ingrediente.');
            return;
        }
        setIsLoading(true);
        setError(null);
        setRecipes([]);

        try {
            const result = await generateRecipes(ingredients);
            setRecipes(result);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Ocorreu um erro.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, [ingredients]);
    
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-sans transition-colors duration-300">
            <main className="container mx-auto px-4 py-8 md:py-12">
                <header className="text-center mb-12">
                    <div className="inline-flex items-center gap-4">
                        <ChefHatIcon className="h-12 w-12 text-primary-600 dark:text-primary-400" />
                        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
                            RecipeGenius AI
                        </h1>
                    </div>
                    <p className="mt-4 text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                        Insira os ingredientes que você tem AI e nosso chef Recipe Maker vai preparar algumas receitinhas para você!
                    </p>
                </header>

                <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg">
                    <h2 className="text-2xl font-bold mb-4">Your Ingredients</h2>
                    <form onSubmit={handleAddIngredient} className="flex gap-2 mb-4">
                        <input
                            type="text"
                            value={currentIngredient}
                            onChange={(e) => setCurrentIngredient(e.target.value)}
                            placeholder="e.g., chicken breast, rice"
                            className="flex-grow bg-gray-100 dark:bg-gray-700 border-2 border-transparent focus:border-primary-500 focus:ring-primary-500 rounded-lg px-4 py-2 transition"
                        />
                        <button type="submit" className="bg-primary-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition">
                            Add
                        </button>
                    </form>
                    
                    <div className="flex flex-wrap gap-2 min-h-[40px]">
                        {ingredients.map((ingredient) => (
                            <span key={ingredient} className="flex items-center bg-primary-100 dark:bg-primary-900/50 text-primary-800 dark:text-primary-200 text-sm font-medium px-3 py-1 rounded-full">
                                {ingredient}
                                <button onClick={() => handleRemoveIngredient(ingredient)} className="ml-2 text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-200 transition">
                                    <TrashIcon className="w-4 h-4" />
                                </button>
                            </span>
                        ))}
                    </div>

                    <button
                        onClick={handleGenerateRecipes}
                        disabled={isLoading || ingredients.length === 0}
                        className="mt-6 w-full flex items-center justify-center gap-2 bg-gradient-to-r from-primary-500 to-primary-600 text-white font-bold py-3 px-6 rounded-lg shadow-md hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                    >
                        {isLoading ? (
                           <>
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                             Conjuring Recipes...
                           </>
                        ) : (
                            <>
                                <SparklesIcon className="w-5 h-5" />
                                Generate Recipes
                            </>
                        )}
                    </button>
                </div>

                <div className="mt-12">
                    {error && <div className="text-center text-red-500 bg-red-100 dark:bg-red-900/50 p-4 rounded-lg">{error}</div>}
                    
                    {recipes.length > 0 && (
                       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                           {recipes.map((recipe, index) => (
                               <RecipeCard key={index} recipe={recipe} />
                           ))}
                       </div>
                    )}

                    {!isLoading && recipes.length === 0 && !error && (
                         <div className="text-center text-gray-500 dark:text-gray-400 mt-16">
                            <p className="text-xl">Your culinary creations will appear here.</p>
                            <p>Agora é colocar a mão na massa! Vamos nessa?</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default App;
