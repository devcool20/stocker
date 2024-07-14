// App.js
// <Stack.Screen name="NewsList" component={NewsList} />

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import Login from './src/components/Login';
import NewsList from './src/components/NewsList';
import StockList from './src/screens/StockList';
import StockDetailScreen from './src/screens/StockDetailScreen';
import NewsDetailScreen from './src/screens/NewsDetailScreen';
const Stack = createStackNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">

        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="StockList" component={StockList} options={{ title: 'Stocks' }}/>
        <Stack.Screen name="StockDetailScreen" component={StockDetailScreen} options={{ title: 'Stock Details' }}/>
        <Stack.Screen name="NewsDetail" component={NewsDetailScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
