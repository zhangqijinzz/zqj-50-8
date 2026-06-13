import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  StockIngredient,
  StockIngredientWithStatus,
  ExpiryStatus,
  Recipe,
  MatchedRecipe,
  UserPreferences,
  Ingredient,
  IngredientCategory,
  ExcludedRecipe,
  DietarySettings,
  DietType,
  DietTypeInfo,
} from '@/types';
import { INGREDIENTS, INGREDIENT_MAP } from '@/data/ingredients';
import { RECIPES } from '@/data/recipes';

export const DIET_TYPE_LIST: DietTypeInfo[] = [
  { key: 'vegetarian', label: '素食', emoji: '🥗', description: '不吃肉类、海鲜' },
  { key: 'vegan', label: '纯素', emoji: '🌱', description: '不吃任何动物来源食物' },
  { key: 'lowCarb', label: '低碳水', emoji: '🥑', description: '减少米饭、面条等主食' },
  { key: 'lowFat', label: '低脂肪', emoji: '🥬', description: '减少高脂肪食材' },
  { key: 'highProtein', label: '高蛋白', emoji: '💪', description: '健身减脂，优先高蛋白' },
  { key: 'glutenFree', label: '无麸质', emoji: '🌾', description: '不吃小麦等含麸质食物' },
];

const COMMON_AVOID_CATEGORIES: { category: string; label: string; emoji: string; ingredientIds: string[] }[] = [
  {
    category: 'allium',
    label: '葱姜蒜类',
    emoji: '🧄',
    ingredientIds: ['v-garlic', 'v-green-onion', 'se-ginger', 'v-onion'],
  },
  {
    category: 'spicy',
    label: '辛辣刺激',
    emoji: '🌶️',
    ingredientIds: ['v-chili', 'v-pepper', 'se-pepper'],
  },
  {
    category: 'seafood',
    label: '海鲜水产',
    emoji: '🦐',
    ingredientIds: ['p-shrimp', 'p-fish'],
  },
  {
    category: 'dairy',
    label: '奶制品',
    emoji: '🥛',
    ingredientIds: ['p-milk', 'p-cheese'],
  },
  {
    category: 'meat',
    label: '畜禽肉',
    emoji: '🥩',
    ingredientIds: ['p-beef', 'p-pork', 'p-chicken', 'p-bacon', 'p-sausage'],
  },
  {
    category: 'egg',
    label: '蛋类',
    emoji: '🥚',
    ingredientIds: ['p-egg'],
  },
  {
    category: 'staple',
    label: '主食谷物',
    emoji: '🍚',
    ingredientIds: ['s-rice', 's-noodle', 's-bread', 's-bun', 's-dumpling', 's-instant-noodle', 's-oat'],
  },
];

const initialDietarySettings: DietarySettings = {
  avoidedIngredients: [],
  dietTypes: [],
};

interface StoreState {
  stockIngredients: StockIngredient[];
  preferences: UserPreferences;
  customIngredients: Ingredient[];
  dietarySettings: DietarySettings;

  addStockIngredient: (ingredientId: string, purchaseDate?: string) => void;
  removeStockIngredient: (ingredientId: string) => void;
  isInStock: (ingredientId: string) => boolean;
  updatePurchaseDate: (ingredientId: string, purchaseDate: string) => void;
  togglePreference: (key: keyof UserPreferences) => void;
  addCustomIngredient: (ingredient: Ingredient) => void;

  toggleAvoidedIngredient: (ingredientId: string) => void;
  toggleDietType: (dietType: DietType) => void;
  isIngredientAvoided: (ingredientId: string) => boolean;
  hasDietType: (dietType: DietType) => boolean;
  getAvoidedIngredients: () => Ingredient[];
  getCommonAvoidCategories: () => typeof COMMON_AVOID_CATEGORIES;

  getAllIngredients: () => Ingredient[];
  getIngredientsByCategory: (category: IngredientCategory) => Ingredient[];
  getStockWithStatus: () => StockIngredientWithStatus[];
  getStockByStatus: () => {
    urgent: StockIngredientWithStatus[];
    warning: StockIngredientWithStatus[];
    fresh: StockIngredientWithStatus[];
    expired: StockIngredientWithStatus[];
  };
  getStockIds: () => string[];
  getMatchedRecipes: () => MatchedRecipe[];
  getFilteredRecipes: () => MatchedRecipe[];
  getExcludedRecipes: () => ExcludedRecipe[];
  getRecipeExcludedReasons: (recipe: Recipe) => string[];
}

const today = () => new Date().toISOString().split('T')[0];

const daysBetween = (dateStr1: string, dateStr2: string): number => {
  const d1 = new Date(dateStr1);
  const d2 = new Date(dateStr2);
  const diff = d2.getTime() - d1.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
};

const getExpiryStatus = (remainingDays: number): ExpiryStatus => {
  if (remainingDays < 0) return 'expired';
  if (remainingDays <= 3) return 'urgent';
  if (remainingDays <= 7) return 'warning';
  return 'fresh';
};

const initialPreferences: UserPreferences = {
  onePot: false,
  quickMeal: false,
  lessDishes: false,
  vegetarian: false,
};

const getDietTypeIngredientIds = (dietType: DietType): string[] => {
  switch (dietType) {
    case 'vegetarian':
      return ['p-beef', 'p-pork', 'p-chicken', 'p-fish', 'p-shrimp', 'p-bacon', 'p-sausage'];
    case 'vegan':
      return ['p-egg', 'p-milk', 'p-cheese', 'p-beef', 'p-pork', 'p-chicken', 'p-fish', 'p-shrimp', 'p-bacon', 'p-sausage', 'p-tofu'];
    case 'lowCarb':
      return ['s-rice', 's-noodle', 's-bread', 's-bun', 's-dumpling', 's-instant-noodle', 's-oat', 's-sweet-potato', 'v-potato'];
    case 'lowFat':
      return ['p-bacon', 'p-sausage', 'p-pork', 'se-oil', 'p-cheese'];
    case 'highProtein':
      return [];
    case 'glutenFree':
      return ['s-noodle', 's-bread', 's-bun', 's-dumpling', 's-instant-noodle', 'se-soy', 'se-sauce'];
    default:
      return [];
  }
};

const getDietTypeLabel = (dietType: DietType): string => {
  const info = DIET_TYPE_LIST.find(d => d.key === dietType);
  return info?.label || dietType;
};

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      stockIngredients: [],
      preferences: initialPreferences,
      customIngredients: [],
      dietarySettings: initialDietarySettings,

      addStockIngredient: (ingredientId, purchaseDate) => {
        const base = INGREDIENT_MAP[ingredientId] ||
          get().customIngredients.find(i => i.id === ingredientId);
        if (!base) return;
        if (get().isInStock(ingredientId)) return;

        const stock: StockIngredient = {
          ...base,
          purchaseDate: purchaseDate || today(),
        };
        set({ stockIngredients: [...get().stockIngredients, stock] });
      },

      removeStockIngredient: (ingredientId) => {
        set({
          stockIngredients: get().stockIngredients.filter(
            (s) => s.id !== ingredientId
          ),
        });
      },

      isInStock: (ingredientId) => {
        return get().stockIngredients.some((s) => s.id === ingredientId);
      },

      updatePurchaseDate: (ingredientId, purchaseDate) => {
        set({
          stockIngredients: get().stockIngredients.map((s) =>
            s.id === ingredientId ? { ...s, purchaseDate } : s
          ),
        });
      },

      togglePreference: (key) => {
        set({
          preferences: {
            ...get().preferences,
            [key]: !get().preferences[key],
          },
        });
      },

      addCustomIngredient: (ingredient) => {
        set({ customIngredients: [...get().customIngredients, ingredient] });
      },

      toggleAvoidedIngredient: (ingredientId) => {
        const { avoidedIngredients } = get().dietarySettings;
        const isAvoided = avoidedIngredients.includes(ingredientId);
        set({
          dietarySettings: {
            ...get().dietarySettings,
            avoidedIngredients: isAvoided
              ? avoidedIngredients.filter(id => id !== ingredientId)
              : [...avoidedIngredients, ingredientId],
          },
        });
      },

      toggleDietType: (dietType) => {
        const { dietTypes } = get().dietarySettings;
        const hasType = dietTypes.includes(dietType);
        set({
          dietarySettings: {
            ...get().dietarySettings,
            dietTypes: hasType
              ? dietTypes.filter(d => d !== dietType)
              : [...dietTypes, dietType],
          },
        });
      },

      isIngredientAvoided: (ingredientId) => {
        const { avoidedIngredients, dietTypes } = get().dietarySettings;
        if (avoidedIngredients.includes(ingredientId)) return true;
        for (const dt of dietTypes) {
          if (getDietTypeIngredientIds(dt).includes(ingredientId)) return true;
        }
        return false;
      },

      hasDietType: (dietType) => {
        return get().dietarySettings.dietTypes.includes(dietType);
      },

      getAvoidedIngredients: () => {
        const allIngredients = get().getAllIngredients();
        const { avoidedIngredients } = get().dietarySettings;
        return allIngredients.filter(i => avoidedIngredients.includes(i.id));
      },

      getCommonAvoidCategories: () => COMMON_AVOID_CATEGORIES,

      getAllIngredients: () => {
        return [...INGREDIENTS, ...get().customIngredients];
      },

      getIngredientsByCategory: (category) => {
        return get().getAllIngredients().filter((i) => i.category === category);
      },

      getStockWithStatus: () => {
        const now = today();
        return get().stockIngredients
          .map((s) => {
            const expiryDate = new Date(s.purchaseDate);
            expiryDate.setDate(expiryDate.getDate() + s.shelfLifeDays);
            const expiryStr = expiryDate.toISOString().split('T')[0];
            const remainingDays = daysBetween(now, expiryStr);
            return {
              ...s,
              remainingDays,
              status: getExpiryStatus(remainingDays),
            };
          })
          .sort((a, b) => a.remainingDays - b.remainingDays);
      },

      getStockByStatus: () => {
        const withStatus = get().getStockWithStatus();
        return {
          urgent: withStatus.filter((s) => s.status === 'urgent'),
          warning: withStatus.filter((s) => s.status === 'warning'),
          fresh: withStatus.filter((s) => s.status === 'fresh'),
          expired: withStatus.filter((s) => s.status === 'expired'),
        };
      },

      getStockIds: () => {
        return get().stockIngredients.map((s) => s.id);
      },

      getRecipeExcludedReasons: (recipe) => {
        const reasons: string[] = [];
        const { avoidedIngredients, dietTypes } = get().dietarySettings;
        const allIngredients = get().getAllIngredients();

        for (const ingId of recipe.requiredIngredients) {
          if (avoidedIngredients.includes(ingId)) {
            const ing = allIngredients.find(i => i.id === ingId);
            if (ing) {
              reasons.push(`含忌口食材：${ing.name}`);
            }
          }
        }

        for (const dt of dietTypes) {
          const restrictedIds = getDietTypeIngredientIds(dt);
          const hasRestricted = recipe.requiredIngredients.some(id => restrictedIds.includes(id));
          if (hasRestricted) {
            reasons.push(`不符合${getDietTypeLabel(dt)}饮食`);
          }
        }

        return [...new Set(reasons)];
      },

      getMatchedRecipes: () => {
        const stockIds = get().getStockIds();
        const matched: MatchedRecipe[] = [];

        for (const recipe of RECIPES) {
          const matchedIds = recipe.requiredIngredients.filter((id) =>
            stockIds.includes(id)
          );
          if (matchedIds.length === 0) continue;

          const matchPercentage = Math.round(
            (matchedIds.length / recipe.requiredIngredients.length) * 100
          );
          const missingIds = recipe.requiredIngredients.filter(
            (id) => !stockIds.includes(id)
          );

          matched.push({
            ...recipe,
            matchPercentage,
            matchedIngredients: matchedIds,
            missingIngredients: missingIds,
          });
        }

        return matched.sort((a, b) => {
          if (b.matchPercentage !== a.matchPercentage) {
            return b.matchPercentage - a.matchPercentage;
          }
          return a.cookTimeMinutes - b.cookTimeMinutes;
        });
      },

      getFilteredRecipes: () => {
        const { preferences, dietarySettings } = get();
        let recipes = get().getMatchedRecipes();

        const prefEntries = Object.entries(preferences) as [keyof UserPreferences, boolean][];
        const activePrefs = prefEntries.filter(([, v]) => v);

        if (activePrefs.length > 0) {
          recipes = recipes.filter((r) =>
            activePrefs.every(([key]) => {
              switch (key) {
                case 'onePot':
                  return r.tags.onePot;
                case 'quickMeal':
                  return r.tags.quickMeal;
                case 'lessDishes':
                  return r.tags.lessDishes;
                case 'vegetarian':
                  return r.tags.vegetarian;
                default:
                  return true;
              }
            })
          );
        }

        const hasDietaryRestrictions = dietarySettings.avoidedIngredients.length > 0
          || dietarySettings.dietTypes.length > 0;

        if (!hasDietaryRestrictions) return recipes;

        return recipes.filter(recipe => {
          const reasons = get().getRecipeExcludedReasons(recipe);
          return reasons.length === 0;
        });
      },

      getExcludedRecipes: () => {
        const { dietarySettings } = get();
        const hasDietaryRestrictions = dietarySettings.avoidedIngredients.length > 0
          || dietarySettings.dietTypes.length > 0;

        if (!hasDietaryRestrictions) return [];

        const matched = get().getMatchedRecipes();
        const excluded: ExcludedRecipe[] = [];

        for (const recipe of matched) {
          const reasons = get().getRecipeExcludedReasons(recipe);
          if (reasons.length > 0) {
            excluded.push({
              ...recipe,
              excludedReasons: reasons,
            });
          }
        }

        return excluded.sort((a, b) => b.matchPercentage - a.matchPercentage);
      },
    }),
    {
      name: 'kitchen-rescue-storage',
      partialize: (state) => ({
        stockIngredients: state.stockIngredients,
        preferences: state.preferences,
        customIngredients: state.customIngredients,
        dietarySettings: state.dietarySettings,
      }),
    }
  )
);

export { RECIPES as RECIPE_DATA };
export const getIngredientById = (id: string): Ingredient | undefined => {
  return INGREDIENT_MAP[id];
};
