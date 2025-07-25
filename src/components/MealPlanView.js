import React, { useState, useContext } from 'react';
import { Clock } from 'lucide-react';
import AuthContext from './AuthContext';

const MealPlanView = () => {
  const { mealPlan } = React.useContext(AuthContext);
  const [currentWeek, setCurrentWeek] = useState(new Date());

  const getWeekDates = (date) => {
    const week = [];
    const startDate = new Date(date);
    const day = startDate.getDay();
    const diff = startDate.getDate() - day;
    startDate.setDate(diff);

    for (let i = 0; i < 7; i++) {
      const weekDate = new Date(startDate);
      weekDate.setDate(startDate.getDate() + i);
      week.push(weekDate);
    }
    return week;
  };

  const formatDate = (date) => {
    return date.toISOString().split('T')[0];
  };

  const formatDisplayDate = (date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const weekDates = getWeekDates(currentWeek);
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  const navigateWeek = (direction) => {
    const newWeek = new Date(currentWeek);
    newWeek.setDate(currentWeek.getDate() + (direction * 7));
    setCurrentWeek(newWeek);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800">Weekly Meal Plan</h2>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigateWeek(-1)}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            ← Previous Week
          </button>
          <span className="text-lg font-medium text-gray-700">
            {formatDisplayDate(weekDates[0])} - {formatDisplayDate(weekDates[6])}
          </span>
          <button
            onClick={() => navigateWeek(1)}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Next Week →
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-4">
        {weekDates.map((date, index) => {
          const dateKey = formatDate(date);
          const dayMeals = mealPlan[dateKey] || [];
          const isToday = formatDate(new Date()) === dateKey;

          return (
            <div
              key={dateKey}
              className={`bg-white rounded-lg shadow-md p-4 min-h-[200px] ${
                isToday ? 'ring-2 ring-orange-500' : ''
              }`}
            >
              <div className={`text-center mb-4 ${isToday ? 'text-orange-600' : 'text-gray-700'}`}>
                <h3 className="font-semibold">{dayNames[index]}</h3>
                <p className="text-sm">{formatDisplayDate(date)}</p>
                {isToday && <span className="text-xs bg-orange-100 text-orange-600 px-2 py-1 rounded-full">Today</span>}
              </div>

              <div className="space-y-2">
                {dayMeals.length === 0 ? (
                  <p className="text-gray-400 text-sm text-center mt-8">No meals planned</p>
                ) : (
                  dayMeals.map((meal, mealIndex) => (
                    <div key={mealIndex} className="bg-gray-50 rounded-lg p-3">
                      <img
                        src={meal.strMealThumb}
                        alt={meal.strMeal}
                        className="w-full h-20 object-cover rounded mb-2"
                      />
                      <p className="text-sm font-medium text-gray-800 line-clamp-2">
                        {meal.strMeal}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {Object.keys(mealPlan).length === 0 && (
        <div className="text-center py-12 mt-8">
          <Clock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 mb-2">No meal plans yet</h3>
          <p className="text-gray-500">Start planning your meals by adding recipes from the search page.</p>
        </div>
      )}
    </div>
  );
};


export default MealPlanView;
