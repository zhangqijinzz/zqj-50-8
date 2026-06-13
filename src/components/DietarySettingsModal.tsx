import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react';
import { useStore, DIET_TYPE_LIST } from '@/store/useStore';
import { CATEGORY_LABELS } from '@/data/ingredients';
import type { IngredientCategory, DietType } from '@/types';

const categories: IngredientCategory[] = ['vegetable', 'protein', 'staple', 'seasoning'];

interface DietarySettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DietarySettingsModal({ isOpen, onClose }: DietarySettingsModalProps) {
  const {
    dietarySettings,
    toggleAvoidedIngredient,
    toggleDietType,
    isIngredientAvoided,
    getIngredientsByCategory,
    getCommonAvoidCategories,
    getAvoidedIngredients,
    getAllIngredients,
  } = useStore();

  const [activeTab, setActiveTab] = useState<'dietTypes' | 'avoid'>('dietTypes');
  const [expandedCategory, setExpandedCategory] = useState<IngredientCategory | null>(null);
  const commonAvoidCategories = getCommonAvoidCategories();
  const allAvoidedCount = dietarySettings.avoidedIngredients.length + dietarySettings.dietTypes.length;

  const handleQuickSelect = (ingredientIds: string[]) => {
    const allSelected = ingredientIds.every(id => isIngredientAvoided(id));
    ingredientIds.forEach(id => {
      if (allSelected && isIngredientAvoided(id)) {
        toggleAvoidedIngredient(id);
      } else if (!allSelected && !isIngredientAvoided(id)) {
        toggleAvoidedIngredient(id);
      }
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[70] bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="bg-white rounded-t-3xl sm:rounded-3xl w-full max-w-lg max-h-[85vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-5 border-b border-cream-200 flex-shrink-0">
              <div>
                <h3 className="font-display text-xl text-gray-800 flex items-center gap-2">
                  🥗 饮食偏好设置
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  设置你的忌口和饮食类型，菜谱会自动过滤
                  {allAvoidedCount > 0 && (
                    <span className="ml-2 chip-red !py-0.5">
                      {allAvoidedCount}项忌口
                    </span>
                  )}
                </p>
              </div>
              <button
                onClick={onClose}
                className="w-9 h-9 rounded-full bg-cream-100 hover:bg-cream-200 flex items-center justify-center text-gray-500 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex border-b border-cream-200 flex-shrink-0">
              <button
                onClick={() => setActiveTab('dietTypes')}
                className={`flex-1 py-3 text-sm font-medium transition-all relative ${
                  activeTab === 'dietTypes'
                    ? 'text-brand-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                饮食类型
                {dietarySettings.dietTypes.length > 0 && (
                  <span className="ml-1 text-xs bg-brand-100 text-brand-600 px-1.5 py-0.5 rounded-full">
                    {dietarySettings.dietTypes.length}
                  </span>
                )}
                {activeTab === 'dietTypes' && (
                  <motion.div
                    layoutId="diet-tab-indicator"
                    className="absolute bottom-0 left-1/4 right-1/4 h-0.5 bg-gradient-to-r from-brand-500 to-brand-400 rounded-full"
                  />
                )}
              </button>
              <button
                onClick={() => setActiveTab('avoid')}
                className={`flex-1 py-3 text-sm font-medium transition-all relative ${
                  activeTab === 'avoid'
                    ? 'text-brand-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                忌口食材
                {dietarySettings.avoidedIngredients.length > 0 && (
                  <span className="ml-1 text-xs bg-danger/10 text-danger px-1.5 py-0.5 rounded-full">
                    {dietarySettings.avoidedIngredients.length}
                  </span>
                )}
                {activeTab === 'avoid' && (
                  <motion.div
                    layoutId="diet-tab-indicator"
                    className="absolute bottom-0 left-1/4 right-1/4 h-0.5 bg-gradient-to-r from-brand-500 to-brand-400 rounded-full"
                  />
                )}
              </button>
            </div>

            <div className="flex-1 overflow-y-auto scrollbar-thin p-5">
              <AnimatePresence mode="wait">
                {activeTab === 'dietTypes' ? (
                  <motion.div
                    key="dietTypes"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-3"
                  >
                    {DIET_TYPE_LIST.map((diet) => {
                      const selected = dietarySettings.dietTypes.includes(diet.key);
                      return (
                        <motion.button
                          key={diet.key}
                          onClick={() => toggleDietType(diet.key as DietType)}
                          whileTap={{ scale: 0.98 }}
                          className={`w-full p-4 rounded-2xl text-left transition-all border-2 ${
                            selected
                              ? 'bg-gradient-to-r from-brand-50 to-amber-50 border-brand-400 shadow-soft'
                              : 'bg-white border-cream-200 hover:border-brand-300'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className="text-3xl flex-shrink-0">{diet.emoji}</div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-2">
                                <span className="font-medium text-gray-800">{diet.label}</span>
                                <div
                                  className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
                                    selected
                                      ? 'bg-gradient-to-r from-brand-500 to-brand-400'
                                      : 'bg-gray-100 border border-gray-200'
                                  }`}
                                >
                                  {selected && <Check size={12} className="text-white" strokeWidth={3} />}
                                </div>
                              </div>
                              <p className="text-xs text-gray-500 mt-1">{diet.description}</p>
                            </div>
                          </div>
                        </motion.button>
                      );
                    })}
                  </motion.div>
                ) : (
                  <motion.div
                    key="avoid"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-4"
                  >
                    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
                      <div className="flex items-start gap-2">
                        <AlertCircle size={18} className="text-amber-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-amber-800">快速选择</p>
                          <p className="text-xs text-amber-600 mt-1">
                            一键勾选常见忌口类别
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-3">
                        {commonAvoidCategories.map((cat) => {
                          const allSelected = cat.ingredientIds.every(id => isIngredientAvoided(id));
                          const someSelected = cat.ingredientIds.some(id => isIngredientAvoided(id));
                          return (
                            <button
                              key={cat.category}
                              onClick={() => handleQuickSelect(cat.ingredientIds)}
                              className={`px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1 transition-all ${
                                allSelected
                                  ? 'bg-danger text-white shadow-sm'
                                  : someSelected
                                  ? 'bg-danger/20 text-danger border border-danger/30'
                                  : 'bg-white text-gray-600 border border-gray-200 hover:border-danger/30'
                              }`}
                            >
                              <span>{cat.emoji}</span>
                              {cat.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="space-y-2">
                      {categories.map((cat) => {
                        const ingredients = getIngredientsByCategory(cat);
                        const catInfo = CATEGORY_LABELS[cat];
                        const isExpanded = expandedCategory === cat;
                        const avoidedCount = ingredients.filter(i => isIngredientAvoided(i.id)).length;

                        return (
                          <div key={cat} className="border border-cream-200 rounded-2xl overflow-hidden">
                            <button
                              onClick={() => setExpandedCategory(isExpanded ? null : cat)}
                              className="w-full px-4 py-3 flex items-center justify-between bg-cream-50/50 hover:bg-cream-100/50 transition-colors"
                            >
                              <div className="flex items-center gap-2">
                                <span className="text-xl">{catInfo.emoji}</span>
                                <span className="font-medium text-gray-700">{catInfo.label}</span>
                                {avoidedCount > 0 && (
                                  <span className="text-xs bg-danger/10 text-danger px-1.5 py-0.5 rounded-full">
                                    {avoidedCount}种忌口
                                  </span>
                                )}
                              </div>
                              <motion.div animate={{ rotate: isExpanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
                                <ChevronDown size={18} className="text-gray-400" />
                              </motion.div>
                            </button>
                            <AnimatePresence>
                              {isExpanded && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: 'auto', opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  transition={{ duration: 0.2 }}
                                  className="overflow-hidden"
                                >
                                  <div className="p-3 grid grid-cols-4 gap-2 border-t border-cream-100">
                                    {ingredients.map((ing) => {
                                      const avoided = isIngredientAvoided(ing.id);
                                      return (
                                        <motion.button
                                          key={ing.id}
                                          onClick={() => toggleAvoidedIngredient(ing.id)}
                                          whileTap={{ scale: 0.95 }}
                                          className={`aspect-square rounded-xl p-1.5 flex flex-col items-center justify-center gap-0.5 transition-all relative ${
                                            avoided
                                              ? 'bg-danger/10 border-2 border-danger text-danger'
                                              : 'bg-white border border-cream-200 hover:border-brand-300 text-gray-600'
                                          }`}
                                        >
                                          <span className="text-2xl">{ing.emoji}</span>
                                          <span className="text-[10px] font-medium truncate w-full text-center">
                                            {ing.name}
                                          </span>
                                          {avoided && (
                                            <div className="absolute top-0.5 right-0.5 w-4 h-4 bg-danger rounded-full flex items-center justify-center">
                                              <X size={10} className="text-white" strokeWidth={3} />
                                            </div>
                                          )}
                                        </motion.button>
                                      );
                                    })}
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        );
                      })}
                    </div>

                    {getAvoidedIngredients().length > 0 && (
                      <div className="bg-danger/5 border border-danger/20 rounded-2xl p-4">
                        <p className="text-sm font-medium text-danger mb-3">
                          已选忌口食材 ({getAvoidedIngredients().length})
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {getAvoidedIngredients().map((ing) => (
                            <span
                              key={ing.id}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white border border-danger/30 text-xs text-gray-700"
                            >
                              <span>{ing.emoji}</span>
                              {ing.name}
                              <button
                                onClick={() => toggleAvoidedIngredient(ing.id)}
                                className="w-4 h-4 rounded-full bg-danger/10 hover:bg-danger/20 text-danger flex items-center justify-center ml-0.5"
                              >
                                <X size={10} strokeWidth={3} />
                              </button>
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="p-5 border-t border-cream-200 flex-shrink-0">
              <button
                onClick={onClose}
                className="w-full btn-primary"
              >
                <Check size={18} /> 完成设置
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
