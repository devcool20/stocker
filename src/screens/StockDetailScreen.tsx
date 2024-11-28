import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Dimensions } from 'react-native';
import axios from 'axios';
import { LineChart } from 'react-native-chart-kit';
import Sentiment from 'sentiment';

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
    return( <View style={styles.ai}>
      <ActivityIndicator size="large" color="#0000ff" />
    </View>)
  }

  //if (!stockDetails || !chartData) {
    //return <Text style={styles.loading}>Wait while the details load!</Text>;
  //}

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>{stock.name}</Text>
      <Text style={styles.stockDetail}>Last Traded Price: ${stockDetails.lastPrice}</Text>
      <Text style={styles.stockDetail}>Volume: {stockDetails.volume}</Text>
      <Text style={styles.stockDetail}>Market Cap: {stockDetails.marketCap}</Text>
      <Text style={styles.recommendation}>Average Sentiment: {averageSentiment.toFixed(2)}</Text>
      <View style={styles.recContainer}>
        <Text style={styles.stockRec}>What you should do: </Text>
        {averageSentiment > 0 ? (
          <Text style={styles.buy}>Buy</Text>
        ) : (
          <Text style={styles.sell}>Sell</Text>
        )}
      </View> 





      {/* Render Stock Chart */}

<Text style={styles.chartTitle}>Price Chart</Text>
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
    width={Dimensions.get('window').width - 50}
    //width={100}
    height={350}
    yAxisLabel="$"
    chartConfig={{
      backgroundGradientFrom: '#f1f8ff',
      backgroundGradientTo: '#ffffff',
      decimalPlaces: 0,
      color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
      labelColor: (opacity = 1) => `rgba(66, 66, 66, ${opacity})`,
      propsForDots: {
        r: '2',
        strokeWidth: '1',
        stroke: '#2196f3',
      },
      propsForBackgroundLines: {
        strokeDasharray: '4',
        stroke: '#e0e0e0',
      },
    }}
    style={{
      marginVertical: 20,
      marginHorizontal: 1,
      paddingHorizontal: 0,
      borderRadius: 10,
      paddingRight: 40, // Prevents overflow on the right
    }}
    verticalLabelRotation={45} // Rotates x-axis labels to prevent overlap
    horizontalLabelRotation={0} // Keeps y-axis labels upright
    bezier
  />
) : (
  <Text style={{ textAlign: 'center', marginTop: 20 }}>Loading chart data...</Text>
)}









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
    color: '#8395A7',
  },
  stockDetail: {
    fontSize: 18,
    marginBottom: 10,
    textAlign: 'center',
    color: '#8395A7',
  },
  chartTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 10,
    textAlign: 'center',
  },
  recContainer: {
    marginVertical: 20,
    padding: 10,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3, // For Android shadow
  },
  stockRec: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#333',
  },
  buy: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'green',
    textAlign: 'center',
  },
  sell: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'red',
    textAlign: 'center',
  },
  newsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 20,
    textAlign: 'center',
    color: '#333'
  },
  newsContainer: {
    marginVertical: 10,
  },
  newsArticle: {
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  newsArticleTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007BFF',
  },
  sentimentScore: {
    fontSize: 14,
    color: '#666',
  },
  separator: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 10,
  },
  loading: {
    flex: 1, // This makes the View take up the full height of the screen
    justifyContent: 'center', // Centers content vertically
    alignItems: '', // Centers content horizontally
    color: '#333', // Optional: background color for visibility
  },
  ai: {
    flex: 1, // This allows the view to take up the full height of the screen
    justifyContent: 'center', // Centers content vertically
    alignItems: 'center', // Centers content horizontally
    backgroundColor: '#fff', 
  }
  // Add other styles as needed
});

export default StockDetailScreen;
