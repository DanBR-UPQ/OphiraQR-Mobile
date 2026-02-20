import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';

export default function ListActivosScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.tituloActivo}>List Activos Screen</Text>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#101622',
    alignItems: 'center',
    justifyContent: 'center',
  },








  tituloActivo: {
    color: 'white',
    fontWeight: 'bold'
  }
});
