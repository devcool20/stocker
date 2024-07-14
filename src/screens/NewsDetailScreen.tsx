import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

const NewsDetailScreen = ({ route }) => {
  const { article } = route.params;

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>{article.title}</Text>
      <Text style={styles.source}>Source: {article.source.name}</Text>
      <Text style={styles.date}>Published at: {new Date(article.publishedAt).toLocaleString()}</Text>
      <Text style={styles.content}>{article.content || 'No content available'}</Text>
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
  source: {
    fontSize: 14,
    color: 'gray',
    marginBottom: 10,
    textAlign: 'center',
  },
  date: {
    fontSize: 14,
    color: 'gray',
    marginBottom: 20,
    textAlign: 'center',
  },
  content: {
    fontSize: 16,
    color: '#8395A7',
  },
});

export default NewsDetailScreen;
