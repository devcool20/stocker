import React from 'react';
import { View, Text, StyleSheet, Image, ScrollView } from 'react-native';
import { newsData } from './newsData';
import Sentiment from 'sentiment';

const sentiment = new Sentiment();

const StockDetailScreen = ({ route }) => {
  const { stock } = route.params;
  const news = newsData[stock.symbol] || [];

  const analyzeSentiment = (text) => {
    const result = sentiment.analyze(text);
    return result.score;
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>{stock.name}</Text>
      {news.length > 0 ? (
        <View style={styles.newsContainer}>
          {news.map((article, index) => {
            const sentimentScore = analyzeSentiment(article.summary);
            const recommendation = sentimentScore > 0 ? 'Buy' : 'Sell';
            return (
              <View key={index} style={styles.newsArticle}>
                <Image
                  source={{ uri: article.imageUrl }}
                  style={styles.newsImage}
                />
                <Text style={styles.newsTitle}>Latest News</Text>
                <Text style={styles.newsArticleTitle}>{article.title}</Text>
                <Text style={styles.newsArticleDescription}>{article.summary}</Text>
                <Text style={styles.newsArticleSource}>Source: {article.source}</Text>
                <Text style={styles.newsArticleDate}>{new Date(article.datetime).toLocaleString()}</Text>
                <Text style={styles.sentimentScore}>Sentiment Score: {sentimentScore}</Text>
                <Text style={styles.recommendation}>Recommendation: {recommendation}</Text>
              </View>
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
  imageContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  image: {
    width: 100,
    height: 100,
    resizeMode: 'contain',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  detail: {
    fontSize: 18,
    marginBottom: 10,
    textAlign: 'center',
  },
  newsContainer: {
    marginTop: 20,
  },
  newsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  newsArticle: {
    marginBottom: 15,
  },
  newsImage: {
    width: '100%',
    height: 120,
    resizeMode: 'cover',
    marginBottom: 10,
  },
  newsArticleTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  newsArticleDescription: {
    fontSize: 16,
  },
  newsArticleSource: {
    fontSize: 14,
    color: 'gray',
  },
  newsArticleDate: {
    fontSize: 14,
    color: 'gray',
  },
  sentimentScore: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 10,
  },
  recommendation: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'green',
    marginTop: 10,
  },
});

export default StockDetailScreen;
