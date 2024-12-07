import React, { useState } from 'react';

const PhysicsCalculator = () => {
  const [isSummer, setIsSummer] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const [isEnglish, setIsEnglish] = useState(false);

  const t = {
    en: {
      title: "SUP Power Analysis",
      season: {
        winter: "Winter",
        summer: "August"
      },
      quality: {
        budget: "Budget",
        premium: "Premium"
      },
      powerFlow: "Power Flow",
      powerMetrics: {
        ratedPower: "Rated Panel Power",
        seasonalOutput: "Seasonal Output",
        afterController: "After Controller",
        afterWiring: "After Wiring",
        tempAdjusted: "Temperature Adjusted",
        finalAvailable: "Final Available"
      },
      performance: "Performance",
      performanceMetrics: {
        motorEff: "Motor Efficiency",
        mechPower: "Mechanical Power",
        hullSpeed: "Hull Speed Limit",
        achievedSpeed: "Achieved Speed",
        powerRatio: "Power Available",
        motorWeight: "Motor Weight",
        pumpTime: "Pump Inflation Time",
        min: "min"
      },
      components: "Components",
      analysis: "Analysis",
      constants: "Physical Constants",
      conditions: "Conditions"
    },
    ru: {
      title: "Анализ мощности САП",
      season: {
        winter: "Зима",
        summer: "Август"
      },
      quality: {
        budget: "Бюджет",
        premium: "Премиум"
      },
      powerFlow: "Поток мощности",
      powerMetrics: {
        ratedPower: "Номинальная мощность",
        seasonalOutput: "Сезонная мощность",
        afterController: "После контроллера",
        afterWiring: "После проводки",
        tempAdjusted: "С учётом температуры",
        finalAvailable: "Итоговая мощность"
      },
      performance: "Производительность",
      performanceMetrics: {
        motorEff: "КПД мотора",
        mechPower: "Механическая мощность",
        hullSpeed: "Предельная скорость",
        achievedSpeed: "Достижимая скорость",
        powerRatio: "Доступная мощность",
        motorWeight: "Вес мотора",
        pumpTime: "Время накачки",
        min: "мин"
      },
      components: "Компоненты",
      analysis: "Анализ",
      constants: "Физические константы",
      conditions: "Условия"
    }
  };

  const CONSTANTS = {
    SUP_LENGTH_FT: 11.6,
    TOTAL_MASS_KG: 80,
    HULL_COEFFICIENT: 15,
    WATER_DENSITY: 1025,
    BASE_INFLATION_TIME: 2.5,
    PROP_EFFICIENCY_BUDGET: 0.55,
    PROP_EFFICIENCY_PREMIUM: 0.70,
    FULL_POWER_CONSUMPTION: 450,  // Matched to Bixpy
    MPH_TO_KNOTS: 0.868976
  };

  const hardware = {
    budget: {
      panels: {
        name: "ECO-WORTHY 150W",
        price: 180,
        efficiency: 0.15,
        area_m2: 1.2
      },
      controller: {
        name: "PWM 20A",
        price: 40,
        efficiency: 0.75
      },
      motor: {
        name: "Generic SUP Motor",
        price: 400,
        efficiency: 0.60,
        thrust_lbs: 30,
        max_speed: 2.8,
        weight_kg: 2.5
      },
      pump: {
        name: "OutdoorMaster Shark",
        price: 90,
        power_draw: 150
      },
      wiring: {
        name: isEnglish ? "Basic Marine Kit" : "Базовый морской комплект",
        price: 30,
        efficiency: 0.93
      }
    },
    premium: {
      panels: {
        name: "Twin High-Efficiency 80W",
        price: 600,
        efficiency: 0.22,
        area_m2: 0.67 * 2
      },
      controller: {
        name: "MPPT Marine",
        price: 120,
        efficiency: 0.95
      },
      motor: {
        name: "Bixpy J-2 Outboard",
        price: 800,
        efficiency: 0.85,
        thrust_lbs: 33,
        max_speed: 3.3,
        weight_kg: 1.6
      },
      pump: {
        name: "iROCKER",
        price: 140,
        power_draw: 150
      },
      wiring: {
        name: isEnglish ? "Premium Marine Kit" : "Премиум морской комплект",
        price: 60,
        efficiency: 0.97
      }
    }
  };

  const solarConditions = {
    winter: {
      sunlight_factor: 0.7,
      temperature_efficiency: 0.9,
      description: isEnglish ? "~4.5 peak sun hours" : "~4.5 пиковых солнечных часов"
    },
    summer: {
      sunlight_factor: 0.9,
      temperature_efficiency: 0.8,
      description: isEnglish ? "~6.5 peak sun hours" : "~6.5 пиковых солнечных часов"
    }
  };

  const calculatePowerStages = () => {
    const config = isPremium ? hardware.premium : hardware.budget;
    const season = isSummer ? 'summer' : 'winter';
    const conditions = solarConditions[season];
    const propEfficiency = isPremium ? CONSTANTS.PROP_EFFICIENCY_PREMIUM : CONSTANTS.PROP_EFFICIENCY_BUDGET;
    
    const stages = {
      rated: 150 * config.panels.efficiency / 0.15,
      seasonal: 150 * config.panels.efficiency / 0.15 * conditions.sunlight_factor,
      controller: 150 * config.panels.efficiency / 0.15 * conditions.sunlight_factor * config.controller.efficiency,
      wire: 150 * config.panels.efficiency / 0.15 * conditions.sunlight_factor * config.controller.efficiency * config.wiring.efficiency,
      temperature: 150 * config.panels.efficiency / 0.15 * conditions.sunlight_factor * config.controller.efficiency * 
                  config.wiring.efficiency * conditions.temperature_efficiency,
      final: 150 * config.panels.efficiency / 0.15 * conditions.sunlight_factor * config.controller.efficiency * 
             config.wiring.efficiency * conditions.temperature_efficiency * 0.9
    };

    const hull_speed_knots = 1.34 * Math.sqrt(CONSTANTS.SUP_LENGTH_FT);
    const available_mechanical_power = stages.final * config.motor.efficiency * propEfficiency;
    
    const power_ratio = Math.min(1, available_mechanical_power / CONSTANTS.FULL_POWER_CONSUMPTION);
    const speed_knots = config.motor.max_speed * Math.pow(power_ratio, 0.33);
    
    const inflation_time = (config.pump.power_draw / stages.final) * CONSTANTS.BASE_INFLATION_TIME;

    return {
      ...stages,
      hull_speed_knots,
      achieved_speed_knots: speed_knots,
      mechanical_power: available_mechanical_power,
      inflation_time,
      motor_efficiency: config.motor.efficiency * 100,
      thrust_lbs: config.motor.thrust_lbs,
      power_ratio: power_ratio * 100,
      weight_kg: config.motor.weight_kg
    };
  };

  const results = calculatePowerStages();
  const config = isPremium ? hardware.premium : hardware.budget;
  const totalCost = Object.values(config).reduce((sum, item) => sum + item.price, 0);
  const lang = isEnglish ? t.en : t.ru;

  return (
    <div className="p-4 w-full max-w-3xl">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">{lang.title}</h2>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setIsEnglish(!isEnglish)}
            className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300"
          >
            {isEnglish ? 'RU' : 'EN'}
          </button>
          <button 
            onClick={() => setIsSummer(!isSummer)}
            className={`px-4 py-2 rounded-lg transition-colors ${
              isSummer ? 'bg-orange-500 text-white' : 'bg-blue-500 text-white'
            }`}
          >
            {isSummer ? lang.season.summer : lang.season.winter}
          </button>
          <button 
            onClick={() => setIsPremium(!isPremium)}
            className={`px-4 py-2 rounded-lg transition-colors ${
              isPremium ? 'bg-purple-500 text-white' : 'bg-gray-500 text-white'
            }`}
          >
            {isPremium ? lang.quality.premium : lang.quality.budget}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded">
          <h3 className="font-bold mb-2">{lang.powerFlow}</h3>
          <ul className="space-y-2">
            <li>{lang.powerMetrics.ratedPower}: {results.rated.toFixed(1)}W</li>
            <li>{lang.powerMetrics.seasonalOutput}: {results.seasonal.toFixed(1)}W</li>
            <li>{lang.powerMetrics.afterController}: {results.controller.toFixed(1)}W</li>
            <li>{lang.powerMetrics.afterWiring}: {results.wire.toFixed(1)}W</li>
            <li>{lang.powerMetrics.tempAdjusted}: {results.temperature.toFixed(1)}W</li>
            <li>{lang.powerMetrics.finalAvailable}: {results.final.toFixed(1)}W</li>
          </ul>
        </div>

        <div className="bg-green-50 p-4 rounded">
          <h3 className="font-bold mb-2">{lang.performance}</h3>
          <ul className="space-y-2">
            <li>{lang.performanceMetrics.motorEff}: {results.motor_efficiency.toFixed(1)}%</li>
            <li>{lang.performanceMetrics.mechPower}: {results.mechanical_power.toFixed(1)}W</li>
            <li>{lang.performanceMetrics.powerRatio}: {results.power_ratio.toFixed(1)}%</li>
            <li>{lang.performanceMetrics.hullSpeed}: {results.hull_speed_knots.toFixed(1)} {isEnglish ? 'knots' : 'узлов'}</li>
            <li>{lang.performanceMetrics.achievedSpeed}: {results.achieved_speed_knots.toFixed(2)} {isEnglish ? 'knots' : 'узлов'} ({(results.achieved_speed_knots * 1.852).toFixed(2)} км/ч)</li>
            <li>{lang.performanceMetrics.motorWeight}: {results.weight_kg} kg</li>
            <li>{lang.performanceMetrics.pumpTime}: {results.inflation_time.toFixed(1)} {lang.performanceMetrics.min}</li>
          </ul>
        </div>
      </div>

      <div className="bg-yellow-50 p-4 rounded mb-6">
        <h3 className="font-bold mb-2">{lang.components} ({isPremium ? lang.quality.premium : lang.quality.budget})</h3>
        <ul className="space-y-2">
          {Object.entries(config).map(([key, item]) => (
            <li key={key}>{item.name} - ${item.price}</li>
          ))}
          <li className="font-bold pt-2 border-t">{isEnglish ? 'Total Cost' : 'Общая стоимость'}: ${totalCost}</li>
        </ul>
      </div>

      <div className="bg-gray-50 p-4 rounded mb-6">
        <h3 className="font-bold mb-2">{lang.constants}</h3>
        <ul className="space-y-2 text-sm">
          <li>SUP: {CONSTANTS.SUP_LENGTH_FT}', {CONSTANTS.TOTAL_MASS_KG}kg</li>
          <li>{isEnglish ? 'Panel Area' : 'Площадь панелей'}: {config.panels.area_m2.toFixed(2)} m²</li>
          <li>{isEnglish ? 'Max Power Draw' : 'Макс. потребление'}: {CONSTANTS.FULL_POWER_CONSUMPTION}W</li>
          <li>{isEnglish ? 'Propeller Efficiency' : 'КПД винта'}: {(isPremium ? CONSTANTS.PROP_EFFICIENCY_PREMIUM : CONSTANTS.PROP_EFFICIENCY_BUDGET) * 100}%</li>
        </ul>
      </div>

      <div className="bg-orange-50 p-4 rounded">
        <h3 className="font-bold mb-2">{lang.conditions}</h3>
        <p>{solarConditions[isSummer ? 'summer' : 'winter'].description}</p>
      </div>
    </div>
  );
};

export default PhysicsCalculator;
