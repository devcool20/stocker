// NewsList.js

import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, ActivityIndicator, StyleSheet } from 'react-native';
import axios from 'axios';

const NewsList = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await axios.get('https://newsapi.org/v2/everything?q=stocks&apiKey=a4d7c5b96122443eb989726dd0c2fe13');
        const articles = response.data.articles;

        // Fetch sentiment for each article
        const articlesWithSentiment = await Promise.all(
          articles.map(async (article) => {
            const sentiment = await fetchSentiment(article.description || article.title);
            return { ...article, sentiment };
          })
        );

        setNews(articlesWithSentiment);
      } catch (error) {
        console.error('Error fetching news:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  const fetchSentiment = async (text) => {
    try {
      const response = await axios.post(
        'https://api.textrazor.com',
        `extractors=entities,topics,sentiment&text=${encodeURIComponent(text)}`,
        {
          headers: {
            'x-textrazor-key': '3bb48beee087d9d8916905f3f1ee6b862a0df6da0bc6fb72f032f41a',
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );

      const sentimentData = response.data.response;
      if (sentimentData && sentimentData.sentiment) {
        const sentimentScore = sentimentData.sentiment.score;
        return sentimentScore > 0 ? 'Positive' : sentimentScore < 0 ? 'Negative' : 'Neutral';
      } else {
        console.error('Sentiment data missing in response:', sentimentData);
        return 'Neutral';
      }
    } catch (error) {
      console.error('Error fetching sentiment:', error);
      return 'Neutral'; // Default sentiment
    }
  };

  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={news}
        keyExtractor={(item) => item.url}
        renderItem={({ item }) => (
          <View style={styles.newsItem}>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.description}>{item.description}</Text>
            <Text style={styles.sentiment}>Sentiment: {item.sentiment}</Text>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  newsItem: {
    marginBottom: 16,
    padding: 16,
    backgroundColor: '#7f8c8d',
    borderRadius: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  description: {
    fontSize: 14,
    marginTop: 8,
  },
  sentiment: {
    marginTop: 8,
    fontSize: 14,
    fontStyle: 'italic',
  },
});

export default NewsList;
