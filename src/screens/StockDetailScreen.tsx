import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import axios from 'axios';

const API_KEY = 'PKVI8AK9C3LE8VRM6RA4';  // Replace with your Alpaca API key
const API_SECRET = 'lnymfV2GNvpNtuDLmg10wYxrKM0GzQgXdQvkhLRZ';  // Replace with your Alpaca API secret

const StockDetailScreen = ({ route }) => {
  const { stock } = route.params;
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStockDetails = async () => {
      try {
        const headers = {
          'APCA-API-KEY-ID': API_KEY,
          'APCA-API-SECRET-KEY': API_SECRET
        };

        const response = await axios.get(`https://data.alpaca.markets/v2/stocks/${stock.symbol}/quotes/latest`, {
          headers: headers
        });

        const quote = response.data.quote;
        if (!quote) {
          throw new Error('Unexpected API response format');
        }

        setDetails(quote);
      } catch (error) {
        console.error('Error fetching stock details:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStockDetails();
  }, [stock.symbol]);

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
      <Text style={styles.title}>{stock.name} ({stock.symbol})</Text>
      <Text style={styles.detail}>Ask Price: ${details.ap}</Text>
      <Text style={styles.detail}>Bid Price: ${details.bp}</Text>
      <Text style={styles.detail}>Last Trade Price: ${details.lp}</Text>
      <Text style={styles.detail}>Volume: {stock.volume}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  detail: {
    fontSize: 18,
    marginBottom: 10,
  },
});

export default StockDetailScreen;
