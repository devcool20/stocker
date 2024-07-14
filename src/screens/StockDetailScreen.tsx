import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import axios from 'axios';
import Sentiment from 'sentiment';

const sentiment = new Sentiment();

const API_KEY = 'PKVI8AK9C3LE8VRM6RA4';
const API_SECRET = 'lnymfV2GNvpNtuDLmg10wYxrKM0GzQgXdQvkhLRZ';
const NEWS_API_KEY = 'a4d7c5b96122443eb989726dd0c2fe13';  // Replace with your news API key

const StockDetailScreen = ({ route, navigation }) => {
  const { stock } = route.params;
  const [stockDetails, setStockDetails] = useState(null);
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStockDetails = async () => {
      try {
        const response = await axios.get(`https://data.alpaca.markets/v2/stocks/${stock.symbol}/quotes/latest`, {
          headers: {
            'APCA-API-KEY-ID': API_KEY,
            'APCA-API-SECRET-KEY': API_SECRET,
          },
        });

        if (response.data && response.data.quote) {
          setStockDetails({
            lastPrice: response.data.quote.ap,  // Adjust as needed based on the API response structure
            volume: response.data.quote.as,     // Adjust as needed based on the API response structure
            marketCap: 'N/A',                   // Placeholder value
          });
        }
      } catch (error) {
        console.error('Error fetching stock details:', error);
      }
    };

    const fetchNews = async () => {
      try {
        const response = await axios.get(`https://newsapi.org/v2/everything?q=${stock.symbol}&apiKey=${NEWS_API_KEY}`);
        if (response.data && response.data.articles) {
          setNews(response.data.articles);
        }
      } catch (error) {
        console.error('Error fetching news:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStockDetails();
    fetchNews();
  }, [stock.symbol]);

  const analyzeSentiment = (text) => {
    const result = sentiment.analyze(text);
    return result.score;
  };

  const averageSentiment = news.reduce((acc, article) => acc + analyzeSentiment(article.description || article.content || ''), 0) / news.length;
  const recommendation = averageSentiment > 0 ? 'Buy' : 'Sell';

  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  if (!stockDetails) {
    return <Text>Error loading stock details.</Text>;
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>{stock.name}</Text>
      <Text style={styles.stockDetail}>Last Traded Price: ${stockDetails.lastPrice}</Text>
      <Text style={styles.stockDetail}>Volume: {stockDetails.volume}</Text>
      <Text style={styles.stockDetail}>Market Cap: {stockDetails.marketCap}</Text>
      <Text style={styles.newsTitle}>News related to {stock.name}</Text>
      {news.length > 0 ? (
        <View style={styles.newsContainer}>
          {news.map((article, index) => {
            const sentimentScore = analyzeSentiment(article.description || article.content || '');
            return (
              <TouchableOpacity key={index} onPress={() => navigation.navigate('NewsDetail', { article })}>
                <View style={styles.newsArticle}>
                  <Text style={styles.newsArticleTitle}>{article.title}</Text>
                  <Text style={styles.sentimentScore}>Sentiment Score: {sentimentScore}</Text>
                  {index < news.length - 1 && <View style={styles.separator} />}
                </View>
              </TouchableOpacity>
            );
          })}
          <Text style={styles.recommendation}>Average Sentiment: {averageSentiment.toFixed(2)}</Text>
          <Text style={styles.recommendation}>Recommendation: {recommendation}</Text>
        </View>
      ) : (
        <Text>No news available for this stock.</Text>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#8395A7'
  },
  stockDetail: {
    fontSize: 18,
    marginBottom: 10,
    textAlign: 'center',
    color: '#8395A7',
  },
  newsTitle: {
    fontSize: 20,
    textAlign: 'center',
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#8395A7',
  },
  newsContainer: {
    marginTop: 20,
  },
  newsArticle: {
    marginBottom: 15,
  },
  newsArticleTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#8395A7',
    marginBottom: 10
  },
  sentimentScore: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#99AAAB'
  },
  recommendation: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'black',
    marginTop: 10,
  },
  separator: {
    height: 1,
    backgroundColor: '#ccc',
    marginVertical: 20,
  },
});

export default StockDetailScreen;
