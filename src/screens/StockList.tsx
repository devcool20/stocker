import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  StyleSheet, 
  ActivityIndicator, 
  Image 
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import { stockImage } from './stockImage';

const API_KEY = 'PKVI8AK9C3LE8VRM6RA4'; // Replace with your Alpaca API key
const API_SECRET = 'lnymfV2GNvpNtuDLmg10wYxrKM0GzQgXdQvkhLRZ'; // Replace with your Alpaca API secret

const StockList = () => {
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigation = useNavigation();

  const stockSymbols = [
    'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'META', 'TSLA', 'NFLX', 'NVDA', 'ORCL'
  ];

  const fetchStocks = async () => {
    setLoading(true);
    try {
      const headers = {
        'APCA-API-KEY-ID': API_KEY,
        'APCA-API-SECRET-KEY': API_SECRET,
      };

      const promises = stockSymbols.map(symbol =>
        axios.get(`https://data.alpaca.markets/v2/stocks/${symbol}/quotes/latest`, { headers })
      );

      const responses = await Promise.all(promises);

      const fetchedStocks = responses.map(response => {
        const quote = response.data.quote;
        return {
          symbol: response.config.url.split('/')[5],
          name: response.config.url.split('/')[5],
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
    fetchStocks();
    const intervalId = setInterval(fetchStocks, 60000);
    return () => clearInterval(intervalId);
  }, []);

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.stockItem}
      onPress={() => navigation.navigate('StockDetailScreen', { stock: item })}
    >
      <View style={styles.stockContent}>
        <View style={styles.stockDetails}>
          <Text style={styles.stockName}>{item.name}</Text>
          <Text style={styles.stockPrice}>${parseFloat(item.price).toFixed(2)}</Text>
        </View>
        <Image
          source={{ uri: stockImage[item.symbol]?.imageUrl }}
          style={styles.stockImage}
        />
      </View>
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
        key={'list-view'} // Force re-rendering to ensure no remnants of grid layout
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
  stockItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    marginVertical: 8,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    elevation: 1,
  },
  stockContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'space-between',
  },
  stockDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  stockName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  stockPrice: {
    fontSize: 16,
    color: '#555',
    marginTop: 4,
  },
  stockImage: {
    width: 60,
    height: 60,
    resizeMode: 'contain',
  },
});

export default StockList;
