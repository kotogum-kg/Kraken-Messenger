import React, { useState } from 'react';
import { View, TextInput, Button, KeyboardAvoidingView, FlatList } from 'react-native';
import EmojiPicker from 'react-native-emoji-picker';

const ChatScreen = ({ navigation }) => {
    const [messages, setMessages] = useState([]);
    const [inputMessage, setInputMessage] = useState('');
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);

    const toggleEmojiPicker = () => {
        setShowEmojiPicker(!showEmojiPicker);
    };

    const renderMessage = ({ item }) => {
        return (<View><Text>{item.text}</Text></View>);
    };

    const sendMessage = () => {
        if (inputMessage.trim()) {
            setMessages([...messages, { text: inputMessage }]);
            setInputMessage('');
        }
    };

    return (
        <KeyboardAvoidingView behavior="padding" style={{ flex: 1 }}>
            <FlatList
                data={messages}
                renderItem={renderMessage}
                keyExtractor={(item, index) => index.toString()}
            />
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Button title='😊' onPress={toggleEmojiPicker} />
                <TextInput
                    value={inputMessage}
                    onChangeText={setInputMessage}
                    style={{ flex: 1 }}
                />
                <Button title='Send' onPress={sendMessage} />
            </View>
            {showEmojiPicker && <EmojiPicker onEmojiSelected={(emoji) => { setInputMessage(inputMessage + emoji); toggleEmojiPicker(); }} />}
        </KeyboardAvoidingView>
    );
};

export default ChatScreen;