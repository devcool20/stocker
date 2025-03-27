import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, ActivityIndicator, Dimensions, SafeAreaView } from 'react-native';
import axios from 'axios';
import { LineChart } from 'react-native-chart-kit';
import Sentiment from 'sentiment';
import { stockImage } from './stockImage';
const sentiment = new Sentiment();

const API_KEY = 'PKVI8AK9C3LE8VRM6RA4';
const API_SECRET = 'lnymfV2GNvpNtuDLmg10wYxrKM0GzQgXdQvkhLRZ';
const NEWS_API_KEY = 'a4d7c5b96122443eb989726dd0c2fe13'; // Replace with your news API key

const StockDetailScreen = ({ route, navigation }) => {
  const { stock } = route.params;
  const [stockDetails, setStockDetails] = useState(null);
  const [chartData, setChartData] = useState(null);
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);

  const last7DaysData = chartData ? chartData.prices.slice(-7) : [];
  const last7DaysLabels = chartData ? chartData.labels.slice(-7) : [];
  

 // Corresponding labels
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
            lastPrice: response.data.quote.ap, // Adjust as needed based on the API response structure
            volume: response.data.quote.as, // Adjust as needed based on the API response structure
            marketCap: 'N/A', // Placeholder value
          });
        }
      } catch (error) {
        console.error('Error fetching stock details:', error);
      }
    };

    const fetchHistoricalData = async () => {
      try {
        const response = await axios.get(`https://data.alpaca.markets/v2/stocks/${stock.symbol}/bars`, {
          params: {
            start: '2023-01-01T09:30:00Z',
            timeframe: '1Day',
          },
          headers: {
            'APCA-API-KEY-ID': API_KEY,
            'APCA-API-SECRET-KEY': API_SECRET,
          },
        });

        if (response.data && response.data.bars) {
          const labels = response.data.bars.map((bar) => new Date(bar.t).toLocaleDateString());
          const prices = response.data.bars.map((bar) => bar.c);
          setChartData({ labels, prices });
        }
      } catch (error) {
        console.error('Error fetching historical data:', error);
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
    fetchHistoricalData();
    fetchNews();
  }, [stock.symbol]);

  const analyzeSentiment = (text) => {
    const result = sentiment.analyze(text);
    return result.score;
  };

  const averageSentiment = news.reduce((acc, article) => acc + analyzeSentiment(article.description || article.content || ''), 0) / news.length;
  const recommendation = averageSentiment > 0 ? 'Buy' : 'Sell';

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading stock details...</Text>
      </View>
    );
  }

  //if (!stockDetails || !chartData) {
    //return <Text style={styles.loading}>Wait while the details load!</Text>;
  //}

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Image 
            source={{ uri: stockImage[stock.symbol]?.imageUrl }}
            style={styles.stockImage}
          />
          <Text style={styles.name}>{stock.name}</Text>
        </View>

        <View style={styles.priceCard}>
          <Text style={styles.priceLabel}>Current Price</Text>
          <Text style={styles.priceValue}>${stockDetails?.lastPrice}</Text>
          <View style={styles.priceDetails}>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Volume</Text>
              <Text style={styles.detailValue}>{stockDetails?.volume}</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Market Cap</Text>
              <Text style={styles.detailValue}>{stockDetails?.marketCap}</Text>
            </View>
          </View>
        </View>

        <View style={styles.sentimentCard}>
          <Text style={styles.sentimentLabel}>Market Sentiment</Text>
          <View style={styles.sentimentValueContainer}>
            <Text style={[
              styles.sentimentValue,
              { color: averageSentiment > 0 ? '#34C759' : '#FF3B30' }
            ]}>
              {averageSentiment > 0 ? 'Positive' : 'Negative'}
            </Text>
            <Text style={styles.sentimentScore}>{averageSentiment.toFixed(2)}</Text>
          </View>
          <Text style={styles.recommendation}>
            Recommendation: {averageSentiment > 0 ? 'Buy' : 'Sell'}
          </Text>
        </View>

        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>Price History</Text>
          {chartData ? (
            <LineChart
              data={{
                labels: last7DaysLabels,
                datasets: [
                  {
                    data: last7DaysData,
                    color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
                    strokeWidth: 2,
                  },
                ],
              }}
              width={Dimensions.get('window').width - 40}
              height={250}
              yAxisLabel="$"
              chartConfig={{
                backgroundGradientFrom: '#ffffff',
                backgroundGradientTo: '#ffffff',
                decimalPlaces: 0,
                color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(66, 66, 66, ${opacity})`,
                propsForDots: {
                  r: '4',
                  strokeWidth: '2',
                  stroke: '#007AFF',
                },
                propsForBackgroundLines: {
                  strokeDasharray: '4',
                  stroke: '#e0e0e0',
                },
              }}
              style={styles.chart}
              bezier
              verticalLabelRotation={45}
            />
          ) : (
            <Text style={styles.chartLoading}>Loading chart data...</Text>
          )}
        </View>

        <View style={styles.newsSection}>
          <Text style={styles.newsTitle}>Latest News</Text>
          {news.length > 0 ? (
            news.map((article, index) => (
              <TouchableOpacity 
                key={index} 
                onPress={() => navigation.navigate('NewsDetail', { article })}
                style={styles.newsCard}
              >
                <Text style={styles.newsArticleTitle}>{article.title}</Text>
                <View style={styles.newsFooter}>
                  <Text style={styles.sentimentScore}>
                    Sentiment: {analyzeSentiment(article.description || article.content || '').toFixed(2)}
                  </Text>
                  <Text style={styles.newsDate}>
                    {new Date(article.publishedAt).toLocaleDateString()}
                  </Text>
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <Text style={styles.noNews}>No news available for this stock.</Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    marginBottom: 20,
    alignItems: 'center',
  },
  stockImage: {
    width: 100,
    height:20,
    borderRadius: 1,
    //marginBottom: 12,
  },
  symbol: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#000',
  },
  name: {
    fontSize: 18,
    color: '#666',
    marginTop: 4,
  },
  priceCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  priceLabel: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  priceValue: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 16,
  },
  priceDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
    paddingTop: 16,
  },
  detailItem: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  sentimentCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  sentimentLabel: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  sentimentValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  sentimentValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginRight: 8,
  },
  sentimentScore: {
    fontSize: 18,
    color: '#666',
  },
  recommendation: {
    fontSize: 16,
    color: '#000',
    fontWeight: '600',
  },
  chartCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 16,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  chartLoading: {
    textAlign: 'center',
    color: '#666',
    marginTop: 20,
  },
  newsSection: {
    marginBottom: 20,
  },
  newsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 16,
  },
  newsCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  newsArticleTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 8,
  },
  newsFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sentimentScore: {
    fontSize: 14,
    color: '#666',
  },
  newsDate: {
    fontSize: 14,
    color: '#666',
  },
  noNews: {
    textAlign: 'center',
    color: '#666',
    marginTop: 20,
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
});

export default StockDetailScreen;
