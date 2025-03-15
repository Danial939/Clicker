import React, { useState, useEffect, useRef } from 'react';
import { Coins, Sword, Shield, Crown, Sparkles, Zap, Star, Timer, Rocket, Award, Gift, Settings, XCircle, Play, Pause, Moon, BarChart2 } from 'lucide-react';

interface Upgrade {
  id: string;
  name: string;
  cost: number;
  multiplier: number;
  owned: number;
  icon: React.ReactNode;
  description: string;
  color: string;
}

interface Achievement {
  id: string | null;
  name: string | null;
  description: string;
  requirement: number | string;
  type: 'clicks' | 'score' | 'upgrades';
  unlocked: boolean;
  icon: React.ReactNode;
}

function App() {
  // Основные состояния игры
  const [score, setScore] = useState(() => {
    const saved = localStorage.getItem('gameScore');
    return saved ? parseFloat(saved) : 0;
  });
  
  const [clickPower, setClickPower] = useState(() => {
    const saved = localStorage.getItem('gameClickPower');
    return saved ? parseInt(saved) : 1;
  });
  
  const [totalClicks, setTotalClicks] = useState(() => {
    const saved = localStorage.getItem('gameTotalClicks');
    return saved ? parseInt(saved) : 0;
  });
  
  const [passiveIncome, setPassiveIncome] = useState(() => {
    const saved = localStorage.getItem('gamePassiveIncome');
    return saved ? parseFloat(saved) : 0;
  });

  // Новые функции
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('gameDarkMode');
    return saved ? saved === 'true' : true;
  });
  
  const [isPaused, setIsPaused] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showAchievements, setShowAchievements] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);
  const [clickParticles, setClickParticles] = useState<{id: number, x: number, y: number, color: string}[]>([]);
  const [lastMultiplier, setLastMultiplier] = useState<{value: number, time: number} | null>(null);
  const [bonusActive, setBonusActive] = useState(false);
  const [bonusMultiplier, setBonusMultiplier] = useState(1);
  const [bonusTimeLeft, setBonusTimeLeft] = useState(0);
  const [nextBonusTime, setNextBonusTime] = useState(() => {
    return Math.floor(Math.random() * 60) + 30;
  });
  
  const clickAreaRef = useRef<HTMLButtonElement>(null);
  let particleId = 0;

  
  const [upgrades, setUpgrades] = useState<Upgrade[]>(() => {
    const saved = localStorage.getItem('gameUpgrades');
    return saved ? JSON.parse(saved) : [
      { 
        id: 'sword', 
        name: 'Острый меч', 
        cost: 10, 
        multiplier: 1, 
        owned: 0, 
        icon: <Sword className="w-6 h-6" />,
        description: 'Увеличивает силу клика на 1',
        color: 'from-blue-400 to-blue-600'
      },
      { 
        id: 'shield', 
        name: 'Щит героя', 
        cost: 50, 
        multiplier: 5, 
        owned: 0, 
        icon: <Shield className="w-6 h-6" />,
        description: 'Увеличивает силу клика на 5',
        color: 'from-green-400 to-green-600'
      },
      { 
        id: 'crown', 
        name: 'Корона силы', 
        cost: 200, 
        multiplier: 10, 
        owned: 0, 
        icon: <Crown className="w-6 h-6" />,
        description: 'Увеличивает силу клика на 10',
        color: 'from-yellow-400 to-yellow-600'
      },
      { 
        id: 'star', 
        name: 'Звезда удачи', 
        cost: 500, 
        multiplier: 2, 
        owned: 0, 
        icon: <Star className="w-6 h-6" />,
        description: 'Добавляет пассивный доход: +2/сек',
        color: 'from-purple-400 to-purple-600'
      },
      { 
        id: 'rocket', 
        name: 'Космическая ракета', 
        cost: 1500, 
        multiplier: 8, 
        owned: 0, 
        icon: <Rocket className="w-6 h-6" />,
        description: 'Добавляет пассивный доход: +8/сек',
        color: 'from-red-400 to-red-600'
      },
      { 
        id: 'gift', 
        name: 'Волшебный подарок', 
        cost: 3000, 
        multiplier: 2, 
        owned: 0, 
        icon: <Gift className="w-6 h-6" />,
        description: 'Удваивает шанс появления бонусов',
        color: 'from-pink-400 to-pink-600'
      },
    ];
  });

  // Достижения
  const [achievements, setAchievements] = useState<Achievement[]>(() => {
    const saved = localStorage.getItem('gameAchievements');
    return saved ? JSON.parse(saved) : [
      {
        id: 'first-click',
        name: 'Первый шаг',
        description: 'Сделайте первый клик',
        requirement: 1,
        type: 'clicks',
        unlocked: false,
        icon: <Sparkles className="w-5 h-5" />
      },
      {
        id: 'hundred-clicks',
        name: 'Сотня кликов',
        description: 'Сделайте 100 кликов',
        requirement: 100,
        type: 'clicks',
        unlocked: false,
        icon: <Zap className="w-5 h-5" />
      },
      {
        id: 'thousand-clicks',
        name: 'Тысяча кликов',
        description: 'Сделайте 1000 кликов',
        requirement: 1000,
        type: 'clicks',
        unlocked: false,
        icon: <Zap className="w-5 h-5" />
      },
      {
        id: 'first-upgrade',
        name: 'Первое улучшение',
        description: 'Купите первое улучшение',
        requirement: 1,
        type: 'upgrades',
        unlocked: false,
        icon: <Shield className="w-5 h-5" />
      },
      {
        id: 'rich',
        name: 'Богатство',
        description: 'Наберите 1000 монет',
        requirement: 1000,
        type: 'score',
        unlocked: false,
        icon: <Coins className="w-5 h-5" />
      },
      {
        id: 'very-rich',
        name: 'Настоящее богатство',
        description: 'Наберите 10000 монет',
        requirement: 10000,
        type: 'score',
        unlocked: false,
        icon: <Coins className="w-5 h-5" />
      },
    ];
  });

  // Статистика
  const [stats, setStats] = useState(() => {
    const saved = localStorage.getItem('gameStats');
    return saved ? JSON.parse(saved) : {
      totalMoneyEarned: 0,
      totalMoneySpent: 0,
      maxClickPower: 1,
      maxPassiveIncome: 0,
      bonusesCollected: 0,
      sessionsPlayed: 1,
      timeSpentPlaying: 0,
      lastPlayedDate: new Date().toISOString()
    };
  });

  const [playTime, setPlayTime] = useState(() => {
    const saved = localStorage.getItem('gamePlayTime');
    return saved ? parseInt(saved) : 0;
  });

  // localStorage
  useEffect(() => {
    localStorage.setItem('gameScore', score.toString());
    localStorage.setItem('gameClickPower', clickPower.toString());
    localStorage.setItem('gameTotalClicks', totalClicks.toString());
    localStorage.setItem('gamePassiveIncome', passiveIncome.toString());
    localStorage.setItem('gameDarkMode', darkMode.toString());
    localStorage.setItem('gamePlayTime', playTime.toString());
    
    
    localStorage.setItem('gameUpgrades', JSON.stringify(upgrades.map(upgrade => ({
      ...upgrade,
      icon: null
    }))));
    
    // Сохранение достижений
    localStorage.setItem('gameAchievements', JSON.stringify(achievements.map(achievement => ({
      ...achievement,
      icon: null
    }))));
    
    // Сохранение статистики
    localStorage.setItem('gameStats', JSON.stringify({
      ...stats,
      timeSpentPlaying: stats.timeSpentPlaying + 1,
      lastPlayedDate: new Date().toISOString()
    }));
  }, [score, clickPower, totalClicks, passiveIncome, upgrades, achievements, stats, darkMode, playTime]);

  
  useEffect(() => {
    setUpgrades(prevUpgrades => prevUpgrades.map(upgrade => ({
      ...upgrade,
      icon: upgrade.id === 'sword' ? <Sword className="w-6 h-6" /> :
            upgrade.id === 'shield' ? <Shield className="w-6 h-6" /> :
            upgrade.id === 'crown' ? <Crown className="w-6 h-6" /> :
            upgrade.id === 'star' ? <Star className="w-6 h-6" /> :
            upgrade.id === 'rocket' ? <Rocket className="w-6 h-6" /> :
            <Gift className="w-6 h-6" />
    })));
    
    
    setAchievements(prevAchievements => prevAchievements.map(achievement => ({
      ...achievement,
      icon: achievement.id === 'first-click' || achievement.id === 'hundred-clicks' || achievement.id === 'thousand-clicks' 
        ? <Zap className="w-5 h-5" /> 
        : achievement.id === 'first-upgrade' 
          ? <Shield className="w-5 h-5" /> 
          : <Coins className="w-5 h-5" />
    })));
  }, []);

  // Пассивный доход
  useEffect(() => {
    if (isPaused) return;
    
    const timer = setInterval(() => {
      if (passiveIncome > 0) {
        const amount = passiveIncome / 10;
        setScore(prev => {
          const newScore = prev + amount;
          setStats(prevStats => ({
            ...prevStats,
            totalMoneyEarned: prevStats.totalMoneyEarned + amount
          }));
          return newScore;
        });
      }
    }, 100);

    return () => clearInterval(timer);
  }, [passiveIncome, isPaused]);

  // Проверка достижений
  useEffect(() => {
    const checkAchievements = () => {
      let newAchievementsUnlocked = false;
      
      setAchievements(prevAchievements => {
        return prevAchievements.map(achievement => {
          if (achievement.unlocked) return achievement;
          
          let requirementMet = false;
          
          if (achievement.type === 'clicks' && totalClicks >= achievement.requirement) {
            requirementMet = true;
          } else if (achievement.type === 'score' && score >= achievement.requirement) {
            requirementMet = true;
          } else if (achievement.type === 'upgrades') {
            const totalUpgrades = upgrades.reduce((sum, upgrade) => sum + upgrade.owned, 0);
            if (totalUpgrades >= achievement.requirement) {
              requirementMet = true;
            }
          }
          
          if (requirementMet && !achievement.unlocked) {
            newAchievementsUnlocked = true;
            setNotification(`Достижение разблокировано: ${achievement.name}!`);
            return { ...achievement, unlocked: true };
          }
          
          return achievement;
        });
      });
      
      if (newAchievementsUnlocked) {
        // Бонус за разблокирование достижения
        setScore(prev => prev + 50);
        setStats(prevStats => ({
          ...prevStats,
          totalMoneyEarned: prevStats.totalMoneyEarned + 50
        }));
      }
    };
    
    checkAchievements();
  }, [totalClicks, score, upgrades]);

  // Обработка уведомлений
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // Бонусы
  useEffect(() => {
    if (isPaused) return;
    
    const timer = setInterval(() => {
      if (bonusActive) {
        setBonusTimeLeft(prev => {
          if (prev <= 1) {
            setBonusActive(false);
            setBonusMultiplier(1);
            return 0;
          }
          return prev - 1;
        });
      } else {
        setNextBonusTime(prev => {
          if (prev <= 1) {
            // Шанс появления бонуса зависит от количества улучшений "Волшебный подарок"
            const giftUpgrade = upgrades.find(u => u.id === 'gift');
            const bonusChance = giftUpgrade ? 0.5 + (giftUpgrade.owned * 0.5) : 0.5;
            
            if (Math.random() < bonusChance) {
              const multiplier = Math.random() < 0.3 ? 10 : Math.random() < 0.6 ? 5 : 2;
              setBonusMultiplier(multiplier);
              setBonusActive(true);
              setBonusTimeLeft(20);
              setNotification(`Бонус x${multiplier} активирован на 20 секунд!`);
              setStats(prevStats => ({
                ...prevStats,
                bonusesCollected: prevStats.bonusesCollected + 1
              }));
            }
            
            return Math.floor(Math.random() * 60) + 30;
          }
          return prev - 1;
        });
      }
    }, 1000);
    
    return () => clearInterval(timer);
  }, [isPaused, upgrades, bonusActive]);

  useEffect(() => {
    if (isPaused) return;
    
    const timer = setInterval(() => {
      setPlayTime(prev => prev + 1);
    }, 1000);
    
    return () => clearInterval(timer);
  }, [isPaused]);
  
  // Обработка клика
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (isPaused) return;
    
    // Добавляем очки с учетом бонуса
    const pointsToAdd = clickPower * bonusMultiplier;
    setScore(prev => {
      const newScore = prev + pointsToAdd;
      setStats(prevStats => ({
        ...prevStats,
        totalMoneyEarned: prevStats.totalMoneyEarned + pointsToAdd
      }));
      return newScore;
    });
    
    setTotalClicks(prev => prev + 1);
    setLastMultiplier({value: pointsToAdd, time: Date.now()});
    
    if (clickAreaRef.current) {
      const rect = clickAreaRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      
      const particles = [];
      const colors = ['#ff6b6b', '#ff9e4f', '#ffdc54', '#75daad', '#75c0ff'];
      
      for (let i = 0; i < 8; i++) {
        particles.push({
          id: particleId++,
          x: x + (Math.random() * 20 - 10),
          y: y + (Math.random() * 20 - 10),
          color: colors[Math.floor(Math.random() * colors.length)]
        });
      }
      
      setClickParticles(prev => [...prev, ...particles]);
      setTimeout(() => {
        setClickParticles(prev => prev.filter(p => !particles.some(np => np.id === p.id)));
      }, 1000);
    }
  };

  // Покупка улучшения
  const purchaseUpgrade = (upgradeId: string) => {
    if (isPaused) return;
    
    setUpgrades(prevUpgrades => {
      const newUpgrades = prevUpgrades.map(upgrade => {
        if (upgrade.id === upgradeId && score >= upgrade.cost) {
          setScore(prev => prev - upgrade.cost);
          setStats(prevStats => ({
            ...prevStats,
            totalMoneySpent: prevStats.totalMoneySpent + upgrade.cost
          }));
          
          if (upgrade.id === 'star' || upgrade.id === 'rocket') {
            const newPassiveIncome = passiveIncome + upgrade.multiplier;
            setPassiveIncome(newPassiveIncome);
            setStats(prevStats => ({
              ...prevStats,
              maxPassiveIncome: Math.max(prevStats.maxPassiveIncome, newPassiveIncome)
            }));
          } else if (upgrade.id !== 'gift') {
            const newClickPower = clickPower + upgrade.multiplier;
            setClickPower(newClickPower);
            setStats(prevStats => ({
              ...prevStats,
              maxClickPower: Math.max(prevStats.maxClickPower, newClickPower)
            }));
          }
          
          return {
            ...upgrade,
            owned: upgrade.owned + 1,
            cost: Math.floor(upgrade.cost * 1.5),
          };
        }
        return upgrade;
      });
      return newUpgrades;
    });
  };

  // Переключение темы
  const toggleDarkMode = () => {
    setDarkMode(prev => !prev);
  };

  // Сброс игры
  const resetGame = () => {
    if (window.confirm('Вы уверены, что хотите сбросить прогресс? Это действие нельзя отменить.')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  // Определение основных цветов в зависимости от темы
  const bgGradient = darkMode 
    ? 'from-purple-900 via-violet-800 to-indigo-900'
    : 'from-violet-300 via-purple-200 to-indigo-300';
  
  const cardBg = darkMode 
    ? 'bg-purple-800/20'
    : 'bg-white/20';
  
  const statBg = darkMode 
    ? 'bg-purple-800/30'
    : 'bg-white/30';

  return (
    <div className={`min-h-screen bg-gradient-to-br ${bgGradient} text-${darkMode ? 'white' : 'gray-800'} transition-colors duration-500`}>
      <div className="container mx-auto px-4 py-4 sm:py-8 min-h-screen flex flex-col">
        {/* Верхняя панель */}
        <div className="text-center mb-4 sm:mb-8 relative">
          <div className="absolute top-0 right-0 flex space-x-2">
            <button 
              onClick={() => setShowSettings(!showSettings)} 
              className="p-2 rounded-full bg-gray-800/30 hover:bg-gray-700/30 transition-colors"
            >
              <Settings className="w-5 h-5" />
            </button>
            <button 
              onClick={() => setShowAchievements(!showAchievements)} 
              className="p-2 rounded-full bg-gray-800/30 hover:bg-gray-700/30 transition-colors"
            >
              <Award className="w-5 h-5" />
            </button>
            <button 
              onClick={() => setShowStats(!showStats)} 
              className="p-2 rounded-full bg-gray-800/30 hover:bg-gray-700/30 transition-colors"
            >
              <BarChart2 className="w-5 h-5" />
            </button>
            <button 
              onClick={() => setIsPaused(!isPaused)} 
              className="p-2 rounded-full bg-gray-800/30 hover:bg-gray-700/30 transition-colors"
            >
              {isPaused ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
            </button>
          </div>

          <h1 className={`text-3xl sm:text-4xl md:text-5xl font-bold mb-4 flex items-center justify-center gap-2 text-transparent bg-clip-text bg-gradient-to-r ${darkMode ? 'from-purple-300 to-pink-300' : 'from-purple-600 to-pink-600'}`}>
            <Sparkles className={`w-8 h-8 sm:w-10 sm:h-10 ${darkMode ? 'text-purple-300' : 'text-purple-600'}`} />
            Космический Кликер
          </h1>
          
          {/* Статистика игры */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 max-w-2xl mx-auto mb-4 sm:mb-8">
            <div className={`${statBg} backdrop-blur-sm rounded-lg p-2 sm:p-4 flex flex-col items-center`}>
              <Coins className="w-5 h-5 sm:w-6 sm:h-6 mb-1 sm:mb-2 text-yellow-400" />
              <div className="text-lg sm:text-xl font-bold">{Math.floor(score).toLocaleString()}</div>
              <div className="text-[10px] sm:text-xs text-purple-300">Монет</div>
            </div>
            
            <div className={`${statBg} backdrop-blur-sm rounded-lg p-2 sm:p-4 flex flex-col items-center`}>
              <Zap className="w-5 h-5 sm:w-6 sm:h-6 mb-1 sm:mb-2 text-blue-400" />
              <div className="text-lg sm:text-xl font-bold">{clickPower}</div>
              <div className="text-[10px] sm:text-xs text-purple-300">Сила клика</div>
            </div>
            
            <div className={`${statBg} backdrop-blur-sm rounded-lg p-2 sm:p-4 flex flex-col items-center`}>
              <Timer className="w-5 h-5 sm:w-6 sm:h-6 mb-1 sm:mb-2 text-green-400" />
              <div className="text-lg sm:text-xl font-bold">{passiveIncome}/сек</div>
              <div className="text-[10px] sm:text-xs text-purple-300">Пассивный доход</div>
            </div>
            
            <div className={`${statBg} backdrop-blur-sm rounded-lg p-2 sm:p-4 flex flex-col items-center`}>
              <Star className="w-5 h-5 sm:w-6 sm:h-6 mb-1 sm:mb-2 text-yellow-300" />
              <div className="text-lg sm:text-xl font-bold">{totalClicks.toLocaleString()}</div>
              <div className="text-[10px] sm:text-xs text-purple-300">Всего кликов</div>
            </div>
          </div>
        </div>

        {/* Основной контент */}
        <div className="flex-1 flex flex-col lg:flex-row gap-4 lg:gap-8 max-w-4xl mx-auto w-full">
          {/* Область для клика */}
          <div className="flex-1 flex items-center justify-center">
            <button
              ref={clickAreaRef}
              onClick={handleClick}
              className={`w-full max-w-[300px] lg:max-w-none aspect-square rounded-2xl bg-gradient-to-br ${
                bonusActive 
                  ? 'from-yellow-400 to-orange-500 animate-pulse' 
                  : 'from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700'
              } transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center relative overflow-hidden group`}
              disabled={isPaused}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-purple-400/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              
              {/* Частицы при клике */}
              {clickParticles.map(particle => (
                <div 
                  key={particle.id} 
                  className="absolute w-3 h-3 rounded-full animate-float"
                  style={{
                    left: `${particle.x}px`,
                    top: `${particle.y}px`,
                    backgroundColor: particle.color,
                    transform: 'translate(-50%, -50%)'
                  }}
                />
              ))}
              
              {/* Анимация последнего мультипликатора */}
              {lastMultiplier && Date.now() - lastMultiplier.time < 1000 && (
                <div 
                  className="absolute text-xl font-bold text-yellow-300 animate-float-up"
                  style={{top: '40%', opacity: 1 - ((Date.now() - lastMultiplier.time) / 1000)}}
                >
                  +{lastMultiplier.value}
                </div>
              )}
              
              <div className="text-center relative z-10">
                <Sparkles className={`w-16 h-16 sm:w-20 sm:h-20 mb-2 mx-auto ${bonusActive ? 'animate-spin-slow' : 'animate-pulse'} text-purple-200`} />
                <span className="text-xl sm:text-2xl font-bold text-purple-100">
                  {bonusActive ? `БОНУС x${bonusMultiplier}!` : 'КЛИК!'}
                </span>
                {bonusActive && (
                  <div className="mt-2 text-sm font-medium">Осталось: {bonusTimeLeft}с</div>
                )}
                {!bonusActive && nextBonusTime < 10 && (
                  <div className="mt-2 text-sm font-medium animate-pulse">Бонус скоро!</div>
                )}
              </div>
            </button>
          </div>
          <div className="flex-1">
            <div className={`${cardBg} backdrop-blur-lg rounded-lg p-4 sm:p-6 shadow-xl h-full`}>
              <h2 className={`text-xl sm:text-2xl font-bold mb-3 sm:mb-4 ${darkMode ? 'text-purple-200' : 'text-purple-700'}`}>Улучшения</h2>
              <div className="space-y-2 sm:space-y-3 overflow-y-auto max-h-[300px] lg:max-h-[400px] pr-2 scrollbar-thin scrollbar-thumb-purple-500 scrollbar-track-purple-200/20">
                {upgrades.map((upgrade) => (
                  <button
                    key={upgrade.id}
                    onClick={() => purchaseUpgrade(upgrade.id)}
                    disabled={score < upgrade.cost || isPaused}
                    className={`w-full p-3 sm:p-4 rounded-lg flex items-center justify-between ${
                      score >= upgrade.cost && !isPaused
                        ? `bg-gradient-to-r ${upgrade.color} opacity-80 hover:opacity-100`
                        : 'bg-gray-800/50 cursor-not-allowed opacity-50'
                    } transition-all duration-200 group`}
                  >
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="p-1.5 sm:p-2 bg-white/10 rounded-lg group-hover:bg-white/20 transition-colors">
                        {upgrade.icon}
                      </div>
                      <div className="text-left">
                        <div className="font-semibold text-sm sm:text-base text-white">{upgrade.name}</div>
                        <div className="text-[10px] sm:text-xs text-white/80">
                          {upgrade.description}
                        </div>
                        <div className="text-[10px] sm:text-xs text-white/70">
                          Куплено: {upgrade.owned}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 bg-black/20 px-2 sm:px-3 py-1 rounded-full text-sm sm:text-base">
                      <Coins className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400" />
                      {upgrade.cost.toLocaleString()}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        {/* Уведомления */}
        {notification && (
          <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-lg shadow-lg animate-fade-in-up">
            {notification}
          </div>
        )}

        {/* Модальные окна */}
        {showSettings && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className={`${cardBg} backdrop-blur-lg rounded-lg p-6 max-w-md w-full relative`}>
              <button 
                onClick={() => setShowSettings(false)}
                className="absolute top-2 right-2 p-1"
              >
                <XCircle className="w-6 h-6" />
              </button>
              <h2 className="text-2xl font-bold mb-4">Настройки</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Тёмная тема</span>
                  <button 
                    onClick={toggleDarkMode}
                    className="p-2 rounded-full bg-gray-800/30 hover:bg-gray-700/30"
                  >
                    <Moon className="w-5 h-5" />
                  </button>
                </div>
                <button 
                  onClick={resetGame}
                  className="w-full py-2 px-4 bg-red-500 hover:bg-red-600 rounded-lg text-white"
                >
                  Сбросить прогресс
                </button>
              </div>
            </div>
          </div>
        )}

        {showAchievements && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className={`${cardBg} backdrop-blur-lg rounded-lg p-6 max-w-md w-full relative`}>
              <button 
                onClick={() => setShowAchievements(false)}
                className="absolute top-2 right-2 p-1"
              >
                <XCircle className="w-6 h-6" />
              </button>
              <h2 className="text-2xl font-bold mb-4">Достижения</h2>
              <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-2">
                {achievements.map((achievement) => (
                  <div 
                    key={achievement.id}
                    className={`p-3 rounded-lg ${
                      achievement.unlocked 
                        ? 'bg-green-500/20' 
                        : 'bg-gray-800/20'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-full ${
                        achievement.unlocked 
                          ? 'bg-green-500/30' 
                          : 'bg-gray-700/30'
                      }`}>
                        {achievement.icon}
                      </div>
                      <div>
                        <div className="font-semibold">{achievement.name}</div>
                        <div className="text-sm opacity-80">{achievement.description}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {showStats && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className={`${cardBg} backdrop-blur-lg rounded-lg p-6 max-w-md w-full relative`}>
              <button 
                onClick={() => setShowStats(false)}
                className="absolute top-2 right-2 p-1"
              >
                <XCircle className="w-6 h-6" />
              </button>
              <h2 className="text-2xl font-bold mb-4">Статистика</h2>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Всего заработано:</span>
                  <span>{Math.floor(stats.totalMoneyEarned).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Всего потрачено:</span>
                  <span>{Math.floor(stats.totalMoneySpent).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Максимальная сила клика:</span>
                  <span>{stats.maxClickPower}</span>
                </div>
                <div className="flex justify-between">
                  <span>Максимальный пассивный доход:</span>
                  <span>{stats.maxPassiveIncome}/сек</span>
                </div>
                <div className="flex justify-between">
                  <span>Собрано бонусов:</span>
                  <span>{stats.bonusesCollected}</span>
                </div>
                <div className="flex justify-between">
                  <span>Игровых сессий:</span>
                  <span>{stats.sessionsPlayed}</span>
                </div>
                <div className="flex justify-between">
                  <span>Время в игре:</span>
                  <span>
                    {Math.floor(playTime / 3600)}ч {Math.floor((playTime % 3600) / 60)}м {playTime % 60}с
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;