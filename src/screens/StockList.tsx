import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  StyleSheet, 
  ActivityIndicator, 
  Image,
  Dimensions,
  RefreshControl
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import { stockImage } from './stockImage';

const API_KEY = 'PKVI8AK9C3LE8VRM6RA4'; // Replace with your Alpaca API key
const API_SECRET = 'lnymfV2GNvpNtuDLmg10wYxrKM0GzQgXdQvkhLRZ'; // Replace with your Alpaca API secret

const { width } = Dimensions.get('window');
const numColumns = 2;
const cardWidth = (width - 30) / numColumns;

const StockList = () => {
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
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

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    fetchStocks().finally(() => setRefreshing(false));
  }, []);

  useEffect(() => {
    fetchStocks();
  }, []);

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.stockItem}
      onPress={() => navigation.navigate('StockDetailScreen', { stock: item })}
    >
      <View style={styles.stockContent}>
        <Image
          source={{ uri: stockImage[item.symbol]?.imageUrl }}
          style={styles.stockImage}
        />
        <View style={styles.stockDetails}>
          <Text style={styles.stockName}>{item.name}</Text>
          <Text style={styles.stockPrice}>${parseFloat(item.price).toFixed(2)}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading stocks...</Text>
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
        numColumns={numColumns}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#007AFF']}
            tintColor="#007AFF"
          />
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  listContainer: {
    padding: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
  },
  errorText: {
    fontSize: 16,
    color: '#FF3B30',
    textAlign: 'center',
    padding: 20,
  },
  stockItem: {
    width: cardWidth,
    margin: 3,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    overflow: 'hidden',
  },
  stockContent: {
    padding: 5,
    alignItems: 'center',
  },
  stockImage: {
    width: cardWidth * 0.4,
    height: cardWidth * 0.4,
    resizeMode: 'contain',
    marginBottom: 8,
  },
  stockDetails: {
    alignItems: 'center',
    width: '100%',
  },
  stockName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  stockPrice: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
  },
});

export default StockList;
