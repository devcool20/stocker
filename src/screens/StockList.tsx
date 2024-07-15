import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Dimensions, ActivityIndicator, Image} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import { newsData } from './newsData';
import { stockImage } from './stockImage';

const API_KEY = 'PKVI8AK9C3LE8VRM6RA4';  // Replace with your Alpaca API key
const API_SECRET = 'lnymfV2GNvpNtuDLmg10wYxrKM0GzQgXdQvkhLRZ';  // Replace with your Alpaca API secret

const StockList = () => {
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigation = useNavigation();
  const { width } = Dimensions.get('window');
  const itemSize = width / 2 - 20;

  const stockSymbols = [
    'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'META', 'TSLA', 'NFLX', 'NVDA', 'ORCL'
  ];

  const fetchStocks = async () => {
    setLoading(true); // Set loading to true at the beginning of fetch
    try {
      const headers = {
        'APCA-API-KEY-ID': API_KEY,
        'APCA-API-SECRET-KEY': API_SECRET
      };

      const promises = stockSymbols.map(symbol =>
        axios.get(`https://data.alpaca.markets/v2/stocks/${symbol}/quotes/latest`, {
          headers: headers
        })
      );

      const responses = await Promise.all(promises);

      const fetchedStocks = responses.map(response => {
        console.log('Response data:', response.data); // Log the response data for debugging
        const quote = response.data.quote;
        if (!quote) {
          throw new Error('Unexpected API response format');
        }
        return {
          symbol: response.config.url.split('/')[5],
          name: response.config.url.split('/')[5],  // Replace with actual name if available
          price: quote.ap,
        };
      });

      setStocks(fetchedStocks);
    } catch (error) {
      console.error('Error fetching stock data:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStocks(); // Initial fetch
    const intervalId = setInterval(fetchStocks, 60000); // Auto-refresh every 30 seconds
    return () => clearInterval(intervalId); // Clear interval on component unmount
  }, []);

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.stockItem, { width: itemSize, height: itemSize }]}
      onPress={() => navigation.navigate('StockDetailScreen', { stock: item })}>
      <Image
        source={{ uri: stockImage[item.symbol]?.imageUrl }}  // Get image from newsData.js
        style={styles.stockImage}
      />
      <Text style={styles.stockName}>{item.name}</Text>
      <Text style={styles.stockPrice}>${parseFloat(item.price).toFixed(2)}</Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Error: {error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={stocks}
        renderItem={renderItem}
        keyExtractor={(item) => item.symbol}
        numColumns={2}
        columnWrapperStyle={styles.row}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 18,
    color: 'red',
  },
  row: {
    flex: 1,
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  stockImage: {
    width: 50,
    height: 50,
    resizeMode: 'contain',
    marginBottom: 10,
  },
  stockItem: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#f5f5f5',
  },
  stockName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#616C6F'
  },
  stockPrice: {
    fontSize: 16,
    marginTop: 5,
    color: '#333945'
  },
});

export default StockList;
