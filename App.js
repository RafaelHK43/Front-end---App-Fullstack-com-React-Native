import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TextInput, 
  TouchableOpacity, 
  FlatList, 
  Alert, 
  SafeAreaView 
} from 'react-native';
import axios from 'axios';

// ATENÇÃO: Se testar no celular físico, mude localhost para o IP do seu PC
const API_URL = 'http://192.168.100.100.3:3000/api/books';

export default function App() {
  const [books, setBooks] = useState([]);
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [year, setYear] = useState('');
  const [editingId, setEditingId] = useState(null);

  // Carregar livros ao iniciar
  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    try {
      const response = await axios.get(API_URL);
      setBooks(response.data);
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível carregar os livros.');
    }
  };

  const handleSave = async () => {
    if (!title || !author || !year) {
      Alert.alert('Aviso', 'Preencha todos os campos!');
      return;
    }

    try {
      if (editingId) {
        // Atualizar livro existente (PUT)
        await axios.put(`${API_URL}/${editingId}`, { title, author, year });
        Alert.alert('Sucesso', 'Livro atualizado!');
      } else {
        // Criar novo livro (POST)
        await axios.post(API_URL, { title, author, year });
        Alert.alert('Sucesso', 'Livro cadastrado!');
      }
      
      // Limpar campos e atualizar lista
      clearForm();
      fetchBooks();
    } catch (error) {
      Alert.alert('Erro', 'Ocorreu um erro ao salvar o registro.');
    }
  };

  const handleEdit = (book) => {
    setEditingId(book.id);
    setTitle(book.title);
    setAuthor(book.author);
    setYear(book.year);
  };

  const handleDelete = async (id) => {
    Alert.alert(
      'Confirmar Exclusão',
      'Tem certeza que deseja remover este livro?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Excluir', 
          style: 'destructive', 
          onPress: async () => {
            try {
              await axios.delete(`${API_URL}/${id}`);
              fetchBooks();
            } catch (error) {
              Alert.alert('Erro', 'Não foi possível deletar o livro.');
            }
          } 
        }
      ]
    );
  };

  const clearForm = () => {
    setTitle('');
    setAuthor('');
    setYear('');
    setEditingId(null);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>📚 Biblioteca Digital</Text>

      {/* Formulário de Cadastro / Edição */}
      <View style={styles.form}>
        <TextInput 
          style={styles.input} 
          placeholder="Título do Livro" 
          value={title} 
          onChangeText={setTitle} 
        />
        <TextInput 
          style={styles.input} 
          placeholder="Autor" 
          value={author} 
          onChangeText={setAuthor} 
        />
        <TextInput 
          style={styles.input} 
          placeholder="Ano de Publicação" 
          value={year} 
          onChangeText={setYear} 
          keyboardType="numeric"
        />

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={[styles.button, styles.saveButton]} onPress={handleSave}>
            <Text style={styles.buttonText}>{editingId ? 'Atualizar' : 'Cadastrar'}</Text>
          </TouchableOpacity>
          
          {editingId && (
            <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={clearForm}>
              <Text style={styles.buttonText}>Cancelar</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Listagem de Registros */}
      <FlatList
        data={books}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardInfo}>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.cardAuthor}>Autor: {item.author}</Text>
              <Text style={styles.cardYear}>Ano: {item.year}</Text>
            </View>
            <View style={styles.cardActions}>
              <TouchableOpacity style={styles.editButton} onPress={() => handleEdit(item)}>
                <Text style={styles.actionText}>Editar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.deleteButton} onPress={() => handleDelete(item.id)}>
                <Text style={styles.actionText}>Excluir</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  header: {
    fontSize: 26,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  form: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    padding: 10,
    marginBottom: 10,
    fontSize: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  button: {
    flex: 1,
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  saveButton: {
    backgroundColor: '#4CAF50',
  },
  cancelButton: {
    backgroundColor: '#f44336',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  card: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderLeftWidth: 5,
    borderLeftColor: '#2196F3',
  },
  cardInfo: {
    flex: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  cardAuthor: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  cardYear: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  cardActions: {
    flex: 1,
    flexDirection: 'column',
    gap: 5,
    alignItems: 'flex-end',
  },
  editButton: {
    backgroundColor: '#FFC107',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4,
    width: 70,
    alignItems: 'center',
  },
  deleteButton: {
    backgroundColor: '#e91e63',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4,
    width: 70,
    alignItems: 'center',
  },
  actionText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
});