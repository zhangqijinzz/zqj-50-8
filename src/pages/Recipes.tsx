import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore, getIngredientById } from '@/store/useStore';
import { Link } from 'react-router-dom';
import { Clock, ChefHat, X, ChevronDown, ChevronUp, Filter, Sparkles, UtensilsCrossed, AlertCircle, Carrot, Settings, Ban, Info } from 'lucide-react';
import type { MatchedRecipe, FilterKey, ExcludedRecipe } from '@/types';
import { DietarySettingsModal } from '@/components/DietarySettingsModal';

const FILTERS: { key: FilterKey; label: string; emoji: string }[] = [
  { key: 'onePot', label: '一锅优先', emoji: '🍲' },
  { key: 'quickMeal', label: '十分钟内', emoji: '⚡' },
  { key: 'lessDishes', label: '少洗碗', emoji: '🧽' },
  { key: 'vegetarian', label: '素食', emoji: '🥗' },
];

export function Recipes() {
  const {
    getFilteredRecipes,
    getMatchedRecipes,
    getExcludedRecipes,
    preferences,
    togglePreference,
    stockIngredients,
    dietarySettings,
  } = useStore();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [excludedExpandedId, setExcludedExpandedId] = useState<string | null>(null);
  const [shuffleSeed, setShuffleSeed] = useState(0);
  const [showDietaryModal, setShowDietaryModal] = useState(false);
  const [showExcluded, setShowExcluded] = useState(false);

  const filtered = getFilteredRecipes();
  const allMatched = getMatchedRecipes();
  const excluded = getExcludedRecipes();

  const displayRecipes = useMemo(() => {
    if (shuffleSeed === 0) return filtered;
    const shuffled = [...filtered].sort(() => Math.random() - 0.5);
    return shuffled;
  }, [filtered, shuffleSeed]);

  const activeFilters = Object.values(preferences).filter(Boolean).length;
  const dietaryRestrictionsCount = dietarySettings.avoidedIngredients.length + dietarySettings.dietTypes.length;

  return (
    <div className="min-h-screen pb-36">
      <div className="max-w-lg mx-auto px-4 pt-8">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h1 className="font-display text-3xl mb-1">
            🍳 <span className="text-gradient">菜谱拼配</span>
          </h1>
          <p className="text-sm text-gray-500">
            基于你冰箱里的 <span className="text-brand-500 font-medium">{stockIngredients.length}</span> 种食材，
            找到了 <span className="text-brand-500 font-medium">{allMatched.length}</span> 道菜谱
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="mb-5"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <Filter size={16} className="text-brand-500" />
              做饭偏好
              {activeFilters > 0 && (
                <span className="chip-blue !py-0.5">{activeFilters}项生效中</span>
              )}
            </div>
            {allMatched.length > 2 && (
              <button
                onClick={() => setShuffleSeed(Date.now())}
                className="text-xs text-brand-500 font-medium flex items-center gap-1 hover:text-brand-600 transition-colors"
              >
                <Sparkles size={14} />
                随机一下
              </button>
            )}
          </div>
          <div className="flex gap-2 flex-wrap">
            {FILTERS.map(({ key, label, emoji }) => {
              const active = preferences[key];
              return (
                <motion.button
                  key={key}
                  onClick={() => togglePreference(key)}
                  whileTap={{ scale: 0.95 }}
                  className={`px-4 py-2 rounded-full text-sm font-medium flex items-center gap-1.5 transition-all ${
                    active
                      ? 'bg-gradient-to-r from-brand-500 to-brand-400 text-white shadow-soft'
                      : 'bg-white text-gray-600 border border-cream-200 hover:border-brand-300'
                  }`}
                >
                  <span>{emoji}</span>
                  {label}
                </motion.button>
              );
            })}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          className="mb-5"
        >
          <button
            onClick={() => setShowDietaryModal(true)}
            className="w-full card p-4 flex items-center justify-between hover:shadow-float transition-all duration-300 group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
                <span className="text-2xl">🥗</span>
              </div>
              <div className="text-left">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-800">饮食偏好与忌口</span>
                  {dietaryRestrictionsCount > 0 && (
                    <span className="chip-red !py-0.5">
                      {dietaryRestrictionsCount}项
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-0.5">
                  {dietaryRestrictionsCount > 0
                    ? '已设置忌口食材和饮食类型'
                    : '设置你的忌口和饮食类型，智能过滤菜谱'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1 text-brand-500 text-sm font-medium group-hover:text-brand-600 transition-colors">
              <Settings size={16} />
              设置
            </div>
          </button>
        </motion.div>

        {displayRecipes.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="card p-8 text-center"
          >
            {stockIngredients.length === 0 ? (
              <>
                <div className="text-6xl mb-4">🧊</div>
                <h3 className="font-display text-xl text-gray-800 mb-2">还没有食材哦</h3>
                <p className="text-sm text-gray-500 mb-5">先去盘点冰箱里的食材，我才能帮你拼菜谱～</p>
                <Link to="/ingredients">
                  <button className="btn-primary">
                    <Carrot size={18} /> 去盘点食材
                  </button>
                </Link>
              </>
            ) : dietaryRestrictionsCount > 0 ? (
              <>
                <div className="text-6xl mb-4">🚫</div>
                <h3 className="font-display text-xl text-gray-800 mb-2">暂无符合忌口的菜谱</h3>
                <p className="text-sm text-gray-500 mb-5">
                  当前有 {dietaryRestrictionsCount} 项饮食限制，试试调整忌口设置
                </p>
                <div className="flex gap-2 justify-center">
                  <button
                    onClick={() => setShowDietaryModal(true)}
                    className="btn-primary"
                  >
                    <Settings size={16} /> 调整忌口
                  </button>
                </div>
              </>
            ) : activeFilters > 0 ? (
              <>
                <div className="text-6xl mb-4">🤔</div>
                <h3 className="font-display text-xl text-gray-800 mb-2">暂无符合条件的菜谱</h3>
                <p className="text-sm text-gray-500 mb-5">试试减少一些筛选条件，或者添加更多食材</p>
                <div className="flex gap-2 justify-center">
                  {FILTERS.filter((f) => preferences[f.key]).map(({ key, label }) => (
                    <button
                      key={key}
                      onClick={() => togglePreference(key)}
                      className="chip-red hover:bg-danger/20 transition-colors"
                    >
                      {label} <X size={12} />
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <>
                <div className="text-6xl mb-4">🥲</div>
                <h3 className="font-display text-xl text-gray-800 mb-2">食材太少啦</h3>
                <p className="text-sm text-gray-500 mb-5">再多添加几种食材，会有更多菜谱选择哦</p>
                <Link to="/ingredients">
                  <button className="btn-primary">
                    <Plus size={18} /> 添加更多
                  </button>
                </Link>
              </>
            )}
          </motion.div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence mode="popLayout">
              {displayRecipes.map((recipe, idx) => (
                <RecipeCard
                  key={recipe.id}
                  recipe={recipe}
                  index={idx}
                  expanded={expandedId === recipe.id}
                  onToggle={() =>
                    setExpandedId(expandedId === recipe.id ? null : recipe.id)
                  }
                />
              ))}
            </AnimatePresence>
          </div>
        )}

        {excluded.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-6"
          >
            <button
              onClick={() => setShowExcluded(!showExcluded)}
              className="w-full flex items-center justify-between mb-3 group"
            >
              <div className="flex items-center gap-2 text-sm font-medium text-gray-500">
                <Ban size={16} className="text-gray-400" />
                已排除 {excluded.length} 道菜谱
                <span className="text-xs text-gray-400 font-normal">
                  （因饮食限制）
                </span>
              </div>
              <motion.div
                animate={{ rotate: showExcluded ? 180 : 0 }}
                transition={{ duration: 0.2 }}
                className="text-gray-400"
              >
                <ChevronDown size={18} />
              </motion.div>
            </button>
            <AnimatePresence>
              {showExcluded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="space-y-3">
                    {excluded.map((recipe, idx) => (
                      <ExcludedRecipeCard
                        key={recipe.id}
                        recipe={recipe}
                        index={idx}
                        expanded={excludedExpandedId === recipe.id}
                        onToggle={() =>
                          setExcludedExpandedId(
                            excludedExpandedId === recipe.id ? null : recipe.id
                          )
                        }
                      />
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      <DietarySettingsModal
        isOpen={showDietaryModal}
        onClose={() => setShowDietaryModal(false)}
      />
    </div>
  );
}

function RecipeCard({
  recipe,
  index,
  expanded,
  onToggle,
}: {
  recipe: MatchedRecipe;
  index: number;
  expanded: boolean;
  onToggle: () => void;
}) {
  const { matchPercentage, tags, cookTimeMinutes, potCount, coverEmoji, name, description, requiredIngredients, matchedIngredients, missingIngredients, steps } = recipe;

  const matchColor =
    matchPercentage >= 80
      ? 'text-fresh-dark stroke-fresh'
      : matchPercentage >= 50
      ? 'text-warn-dark stroke-warn'
      : 'text-brand-600 stroke-brand-500';

  const bgColor =
    matchPercentage >= 80
      ? 'stroke-fresh'
      : matchPercentage >= 50
      ? 'stroke-warn'
      : 'stroke-brand-400';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ delay: index * 0.04 }}
    >
      <div className="card overflow-hidden hover:shadow-float transition-all duration-300">
        <button onClick={onToggle} className="w-full text-left p-5">
          <div className="flex gap-4">
            <div className="relative flex-shrink-0">
              <motion.div
                className="w-20 h-20 rounded-2xl bg-gradient-to-br from-cream-100 to-cream-200 flex items-center justify-center text-5xl overflow-hidden"
                whileHover={{ rotate: [0, -5, 5, 0], scale: 1.05 }}
                transition={{ duration: 0.4 }}
              >
                {coverEmoji}
              </motion.div>
              <div className="absolute -bottom-1 -right-1 w-12 h-12">
                <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                  <circle
                    cx="18"
                    cy="18"
                    r="15"
                    fill="none"
                    stroke="#FFE8D1"
                    strokeWidth="3"
                  />
                  <motion.circle
                    cx="18"
                    cy="18"
                    r="15"
                    fill="none"
                    className={bgColor}
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeDasharray={`${(matchPercentage / 100) * 94.2} 94.2`}
                    initial={{ strokeDasharray: '0 94.2' }}
                    animate={{ strokeDasharray: `${(matchPercentage / 100) * 94.2} 94.2` }}
                    transition={{ duration: 0.8, delay: 0.2 + index * 0.05, ease: 'easeOut' }}
                  />
                </svg>
                <div className={`absolute inset-0 flex items-center justify-center text-xs font-bold ${matchColor}`}>
                  {matchPercentage}%
                </div>
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-1">
                <h3 className="font-display text-xl text-gray-800 truncate">{name}</h3>
                <motion.div animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
                  <ChevronDown size={20} className="text-gray-400 flex-shrink-0" />
                </motion.div>
              </div>
              {description && (
                <p className="text-xs text-gray-500 mb-3 line-clamp-1">{description}</p>
              )}
              <div className="flex flex-wrap gap-1.5 mb-3">
                <span className="chip-blue">
                  <Clock size={11} /> {cookTimeMinutes}分钟
                </span>
                <span className="chip-yellow">
                  <UtensilsCrossed size={11} /> {potCount}口锅
                </span>
                {tags.onePot && <span className="chip-green">🍲 一锅出</span>}
                {tags.quickMeal && <span className="chip-green">⚡ 快手</span>}
                {tags.lessDishes && <span className="chip-green">🧽 少洗</span>}
                {tags.vegetarian && <span className="chip-green">🥗 素</span>}
              </div>
              <div className="flex flex-wrap gap-1">
                {requiredIngredients.slice(0, 5).map((id) => {
                  const ing = getIngredientById(id);
                  const matched = matchedIngredients.includes(id);
                  if (!ing) return null;
                  return (
                    <span
                      key={id}
                      className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] ${
                        matched
                          ? 'bg-fresh/10 text-fresh-dark'
                          : 'bg-gray-100 text-gray-400 line-through'
                      }`}
                    >
                      <span>{ing.emoji}</span>
                      {ing.name}
                    </span>
                  );
                })}
                {requiredIngredients.length > 5 && (
                  <span className="text-[10px] text-gray-400">
                    +{requiredIngredients.length - 5}
                  </span>
                )}
              </div>
            </div>
          </div>
        </button>

        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden border-t border-cream-200"
            >
              <div className="p-5 pt-4 space-y-5">
                {missingIngredients.length > 0 && (
                  <div className="bg-warn/5 border border-warn/20 rounded-2xl p-4">
                    <div className="flex items-center gap-2 text-warn-dark text-xs font-medium mb-2">
                      <AlertCircle size={14} />
                      还需要这些食材
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {missingIngredients.map((id) => {
                        const ing = getIngredientById(id);
                        if (!ing) return null;
                        return (
                          <span
                            key={id}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white border border-warn/30 text-xs text-gray-600"
                          >
                            <span>{ing.emoji}</span>
                            {ing.name}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div>
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
                    <ChefHat size={16} className="text-brand-500" />
                    烹饪步骤
                  </div>
                  <ol className="space-y-3">
                    {steps.map((step, i) => (
                      <motion.li
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="flex gap-3"
                      >
                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-br from-brand-500 to-brand-400 text-white text-xs font-bold flex items-center justify-center shadow-soft">
                          {i + 1}
                        </div>
                        <p className="text-sm text-gray-600 pt-0.5 flex-1">{step}</p>
                      </motion.li>
                    ))}
                  </ol>
                </div>

                <div className="bg-gradient-to-r from-brand-50 to-amber-50 rounded-2xl p-4">
                  <div className="text-xs text-gray-500 mb-1">你已拥有的食材</div>
                  <div className="flex flex-wrap gap-2">
                    {matchedIngredients.map((id) => {
                      const ing = getIngredientById(id);
                      if (!ing) return null;
                      return (
                        <span
                          key={id}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white shadow-sm text-xs font-medium text-gray-700"
                        >
                          <span className="text-base">{ing.emoji}</span>
                          {ing.name}
                          <span className="text-fresh-dark">✓</span>
                        </span>
                      );
                    })}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

function ExcludedRecipeCard({
  recipe,
  index,
  expanded,
  onToggle,
}: {
  recipe: ExcludedRecipe;
  index: number;
  expanded: boolean;
  onToggle: () => void;
}) {
  const { matchPercentage, coverEmoji, name, description, requiredIngredients, excludedReasons, matchedIngredients, steps } = recipe;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ delay: index * 0.03 }}
    >
      <div className="card overflow-hidden bg-gray-50 border border-gray-200 opacity-80">
        <button onClick={onToggle} className="w-full text-left p-4">
          <div className="flex gap-3">
            <div className="relative flex-shrink-0">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-3xl grayscale">
                {coverEmoji}
              </div>
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-danger rounded-full flex items-center justify-center">
                <Ban size={10} className="text-white" />
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-1">
                <h3 className="font-medium text-gray-600 truncate line-through">
                  {name}
                </h3>
                <motion.div animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
                  <ChevronDown size={16} className="text-gray-400 flex-shrink-0" />
                </motion.div>
              </div>
              {description && (
                <p className="text-xs text-gray-400 mb-2 line-clamp-1">{description}</p>
              )}
              <div className="flex flex-wrap gap-1">
                {excludedReasons.slice(0, 2).map((reason, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] bg-danger/10 text-danger"
                  >
                    <Info size={10} />
                    {reason}
                  </span>
                ))}
                {excludedReasons.length > 2 && (
                  <span className="text-[10px] text-gray-400">
                    +{excludedReasons.length - 2}
                  </span>
                )}
              </div>
            </div>
          </div>
        </button>

        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden border-t border-gray-200"
            >
              <div className="p-4 pt-3 space-y-4">
                <div className="bg-danger/5 border border-danger/20 rounded-xl p-3">
                  <div className="flex items-center gap-1.5 text-danger text-xs font-medium mb-2">
                    <AlertCircle size={12} />
                    排除原因
                  </div>
                  <ul className="space-y-1">
                    {excludedReasons.map((reason, i) => (
                      <li key={i} className="text-xs text-gray-600 flex items-start gap-1.5">
                        <span className="text-danger mt-0.5">•</span>
                        {reason}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <div className="flex items-center gap-2 text-xs font-medium text-gray-500 mb-2">
                    <ChefHat size={14} />
                    烹饪步骤
                  </div>
                  <ol className="space-y-2">
                    {steps.map((step, i) => (
                      <li key={i} className="flex gap-2">
                        <div className="flex-shrink-0 w-5 h-5 rounded-full bg-gray-200 text-gray-500 text-[10px] font-bold flex items-center justify-center">
                          {i + 1}
                        </div>
                        <p className="text-xs text-gray-500 pt-0.5 flex-1">{step}</p>
                      </li>
                    ))}
                  </ol>
                </div>

                <div className="bg-gray-100 rounded-xl p-3">
                  <div className="text-[10px] text-gray-400 mb-1">所需食材</div>
                  <div className="flex flex-wrap gap-1">
                    {requiredIngredients.map((id) => {
                      const ing = getIngredientById(id);
                      const matched = matchedIngredients.includes(id);
                      const isAvoided = useStore.getState().isIngredientAvoided(id);
                      if (!ing) return null;
                      return (
                        <span
                          key={id}
                          className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] ${
                            isAvoided
                              ? 'bg-danger/10 text-danger line-through'
                              : matched
                              ? 'bg-fresh/10 text-fresh-dark'
                              : 'bg-gray-200 text-gray-400 line-through'
                          }`}
                        >
                          <span>{ing.emoji}</span>
                          {ing.name}
                        </span>
                      );
                    })}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

function Plus({ size }: { size: number }) {
  return <span style={{ width: size, height: size }} className="inline-flex items-center justify-center">+</span>;
}
