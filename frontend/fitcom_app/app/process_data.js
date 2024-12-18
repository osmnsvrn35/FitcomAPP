export const processApiResponse = (data) => {
    if (!data || data.items.length === 0) {
        throw new Error('No data provided to process');
    }

    const item = data.items[0];

    const highestConfidenceFood = item.food.reduce((max, current) =>
        current.confidence > max.confidence ? current : max,
        item.food[0]
    );

    const gPerServing = highestConfidenceFood.food_info.g_per_serving;
    const servingFactor = gPerServing / 100;

    const processedData = {
        display_name: highestConfidenceFood.food_info.display_name,
        ingredients: highestConfidenceFood.ingredients.length > 0
            ? highestConfidenceFood.ingredients
            : "This food does not have specific ingredients",
        g_per_serving: gPerServing,
        nutrition: {
            protein: Math.round((highestConfidenceFood.food_info.nutrition.proteins_100g * servingFactor + Number.EPSILON) * 10) / 10 || 0,
            calories: Math.round((highestConfidenceFood.food_info.nutrition.calories_100g * servingFactor + Number.EPSILON) * 10) / 10 || 0,
            carbs: Math.round((highestConfidenceFood.food_info.nutrition.carbs_100g * servingFactor + Number.EPSILON) * 10) / 10 || 0,
            fat: Math.round((highestConfidenceFood.food_info.nutrition.fat_100g * servingFactor + Number.EPSILON) * 10) / 10 || 0,
        }
    };

    console.log(JSON.stringify({ processedData }, null, 2));
    return processedData;
};
