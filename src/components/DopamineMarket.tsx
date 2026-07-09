import { useState, useEffect } from 'react';
import { ShoppingBag, Plus, Trash2, Coins } from 'lucide-react';
import type { UserStats } from '../types';

interface Reward {
  id: string;
  title: string;
  cost: number;
  icon: string;
}

const DEFAULT_REWARDS: Reward[] = [
  { id: '1', title: 'Watch 1 Anime Episode', cost: 100, icon: '📺' },
  { id: '2', title: 'Premium Coffee Break', cost: 150, icon: '☕' },
  { id: '3', title: '30 Mins Video Games', cost: 200, icon: '🎮' },
];

interface DopamineMarketProps {
  userStats: UserStats;
  onPurchase: (cost: number, rewardTitle: string) => void;
}

export default function DopamineMarket({ userStats, onPurchase }: DopamineMarketProps) {
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  
  const [newTitle, setNewTitle] = useState('');
  const [newCost, setNewCost] = useState('');
  const [newIcon, setNewIcon] = useState('🎁');

  useEffect(() => {
    try {
      const stored = localStorage.getItem('taskdo_rewards');
      if (stored) {
        setRewards(JSON.parse(stored));
      } else {
        setRewards(DEFAULT_REWARDS);
      }
    } catch {
      setRewards(DEFAULT_REWARDS);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('taskdo_rewards', JSON.stringify(rewards));
  }, [rewards]);

  const handleAddReward = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newCost) return;
    
    const newReward: Reward = {
      id: crypto.randomUUID(),
      title: newTitle,
      cost: parseInt(newCost) || 50,
      icon: newIcon,
    };
    
    setRewards([...rewards, newReward]);
    setNewTitle('');
    setNewCost('');
    setNewIcon('🎁');
    setIsAdding(false);
  };

  const handleDelete = (id: string) => {
    setRewards(rewards.filter(r => r.id !== id));
  };

  return (
    <div className="animate-fade-in space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/50 dark:bg-surface-dark-card/80 backdrop-blur-xl rounded-3xl p-6 border border-gray-100 dark:border-white/5 shadow-xl">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-gray-900 dark:text-white flex items-center gap-3">
            <ShoppingBag className="text-amber-500" /> Dopamine Market
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Spend your hard-earned productivity coins on real-life rewards.
          </p>
        </div>
        <div className="flex items-center gap-3 bg-amber-500/10 dark:bg-amber-500/15 px-4 py-2.5 rounded-2xl border border-amber-500/20">
          <Coins className="text-amber-500" />
          <div>
            <div className="text-[10px] font-bold tracking-widest text-amber-600 dark:text-amber-400 uppercase">Balance</div>
            <div className="text-xl font-black tabular-nums text-amber-500 leading-none">{userStats.coins}</div>
          </div>
        </div>
      </div>

      {/* Action Row */}
      <div className="flex justify-between items-center px-2">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Available Rewards</h3>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center gap-2 px-3 py-1.5 text-sm font-semibold text-brand-600 bg-brand-50 hover:bg-brand-100 dark:text-brand-400 dark:bg-brand-500/10 dark:hover:bg-brand-500/20 rounded-xl transition-colors"
        >
          <Plus size={16} /> New Reward
        </button>
      </div>

      {/* Add Form */}
      {isAdding && (
        <form onSubmit={handleAddReward} className="bg-white/50 dark:bg-surface-dark-card/80 backdrop-blur-xl rounded-2xl p-4 border border-gray-100 dark:border-white/5 shadow-lg flex gap-3 items-end animate-slide-up">
          <div className="flex-1">
            <label className="block text-[11px] font-bold text-gray-500 dark:text-gray-400 mb-1">REWARD TITLE</label>
            <input 
              type="text" 
              value={newTitle}
              onChange={e => setNewTitle(e.target.value)}
              placeholder="e.g. Order Pizza"
              className="w-full px-3 py-2 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-sm dark:text-white outline-none focus:border-brand-500"
              required
            />
          </div>
          <div className="w-24">
            <label className="block text-[11px] font-bold text-gray-500 dark:text-gray-400 mb-1">COST</label>
            <input 
              type="number" 
              value={newCost}
              onChange={e => setNewCost(e.target.value)}
              min="1"
              placeholder="100"
              className="w-full px-3 py-2 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-sm dark:text-white outline-none focus:border-brand-500"
              required
            />
          </div>
          <div className="w-16">
            <label className="block text-[11px] font-bold text-gray-500 dark:text-gray-400 mb-1">ICON</label>
            <input 
              type="text" 
              value={newIcon}
              onChange={e => setNewIcon(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-sm dark:text-white text-center outline-none focus:border-brand-500"
              required
            />
          </div>
          <button type="submit" className="px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white font-semibold rounded-xl transition-colors h-[38px]">
            Add
          </button>
        </form>
      )}

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {rewards.map(reward => {
          const canAfford = userStats.coins >= reward.cost;
          return (
            <div 
              key={reward.id} 
              className={`relative flex flex-col justify-between bg-white/50 dark:bg-surface-dark-card/80 backdrop-blur-xl rounded-2xl p-5 border shadow-xl transition-all
                ${canAfford ? 'border-gray-100 dark:border-white/5 hover:scale-[1.02] hover:shadow-2xl' : 'border-gray-200 dark:border-white/5 grayscale opacity-70'}
              `}
            >
              <button 
                onClick={() => handleDelete(reward.id)}
                className="absolute top-3 right-3 p-1.5 text-gray-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-colors opacity-0 hover:opacity-100 focus:opacity-100"
              >
                <Trash2 size={14} />
              </button>

              <div>
                <div className="text-4xl mb-4">{reward.icon}</div>
                <h4 className="font-bold text-gray-900 dark:text-white leading-tight mb-2">{reward.title}</h4>
              </div>
              
              <button 
                disabled={!canAfford}
                onClick={() => {
                  if (canAfford) {
                    onPurchase(reward.cost, reward.title);
                  }
                }}
                className={`w-full mt-4 flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold transition-all
                  ${canAfford 
                    ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/30 hover:bg-amber-400 hover:shadow-amber-500/50 hover:-translate-y-0.5'
                    : 'bg-gray-100 dark:bg-white/5 text-gray-400 cursor-not-allowed'
                  }
                `}
              >
                Buy for {reward.cost} <Coins size={16} />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
